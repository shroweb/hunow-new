import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getAreaPageData = createServerFn({ method: "GET" })
  .inputValidator(z.object({ areaSlug: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { getAreaGuide, getTaxonomyKey, getPool, getListingBySlug } = await import("./db.server");

    const areas = await getTaxonomyKey("areas");
    const area = areas.find((a) => a.toLowerCase().replace(/\s+/g, "-") === data.areaSlug);
    if (!area) return null;

    const pool = getPool();

    const [guide, listingRows, eventRows, articleRows] = await Promise.all([
      getAreaGuide(data.areaSlug),
      pool.query<{ data: unknown }>(
        "select data from listings where area = $1 order by created_at desc",
        [area],
      ),
      pool.query<{ data: unknown }>(
        "select data from events where status = 'published' and (data->>'locationName' ilike $1 or data->>'address' ilike $1) order by start_date asc limit 6",
        [`%${area}%`],
      ),
      pool.query<{ data: unknown }>(
        `select data from articles where status = 'published'
         and (data->>'title' ilike $1 or data->>'content' ilike $1 or data->'tags' ? $2)
         order by data->>'publishedAt' desc limit 3`,
        [`%${area}%`, area.toLowerCase()],
      ),
    ]);

    return {
      area,
      guide: guide ?? { areaKey: data.areaSlug, intro: "", featuredImage: "", updatedAt: "" },
      listings: listingRows.rows.map((r) => r.data) as import("@/types").Listing[],
      events: eventRows.rows.map((r) => r.data) as import("@/types").EventItem[],
      articles: articleRows.rows.map((r) => r.data) as import("@/types").Article[],
    };
  });

export const getAreasIndexData = createServerFn({ method: "GET" }).handler(async () => {
  const { getTaxonomyKey, getAllAreaGuides, getPool } = await import("./db.server");

  const [areas, guides, countResult] = await Promise.all([
    getTaxonomyKey("areas"),
    getAllAreaGuides(),
    getPool().query<{ area: string; count: string }>(
      "select area, count(*)::text as count from listings group by area",
    ),
  ]);

  const guideMap = Object.fromEntries(guides.map((g) => [g.areaKey, g]));
  const countMap = Object.fromEntries(countResult.rows.map((r) => [r.area, Number(r.count)]));

  return areas.map((area) => {
    const slug = area.toLowerCase().replace(/\s+/g, "-");
    return {
      area,
      slug,
      listingCount: countMap[area] ?? 0,
      intro: guideMap[slug]?.intro ?? "",
      featuredImage: guideMap[slug]?.featuredImage ?? "",
    };
  });
});

export const getAllAreaGuidesAdmin = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdmin } = await import("./auth.server");
  const { getTaxonomyKey, getAllAreaGuides } = await import("./db.server");
  await requireAdmin();
  const [areas, guides] = await Promise.all([getTaxonomyKey("areas"), getAllAreaGuides()]);
  const guideMap = Object.fromEntries(guides.map((g) => [g.areaKey, g]));
  return areas.map((area) => {
    const slug = area.toLowerCase().replace(/\s+/g, "-");
    return { area, slug, guide: guideMap[slug] ?? null };
  });
});

export const upsertAreaGuideAdmin = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      areaKey: z.string().min(1),
      intro: z.string(),
      featuredImage: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    const { upsertAreaGuide } = await import("./db.server");
    await requireAdmin();
    await upsertAreaGuide(data.areaKey, data.intro, data.featuredImage);
    return { ok: true };
  });
