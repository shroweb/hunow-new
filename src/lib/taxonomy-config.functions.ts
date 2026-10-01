import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getTaxonomy = createServerFn({ method: "GET" }).handler(async () => {
  const { getAllTaxonomy } = await import("./db.server");
  return getAllTaxonomy();
});

export const updateTaxonomyKey = createServerFn({ method: "POST" })
  .inputValidator(z.object({ key: z.string().min(1), items: z.array(z.string()) }))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    const { setTaxonomyKey } = await import("./db.server");
    await requireAdmin();
    await setTaxonomyKey(data.key, data.items.map((s) => s.trim()).filter(Boolean));
    return { ok: true };
  });
