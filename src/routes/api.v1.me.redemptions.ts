import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/v1/me/redemptions")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const { getAppUser } = await import("@/lib/app-auth.server");
          const { getPool, ensureSchema } = await import("@/lib/db.server");
          await ensureSchema();

          const user = await getAppUser(request);
          if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

          const pool = getPool();

          const result = await pool.query<{
            id: string;
            offer_id: string;
            listing_id: string | null;
            redeemed_at: string;
            offer_title: string | null;
            listing_name: string | null;
            listing_image: string | null;
          }>(
            `select
               ar.id,
               ar.offer_id,
               ar.listing_id,
               ar.redeemed_at,
               o.data->>'title' as offer_title,
               l.data->>'name' as listing_name,
               l.data->>'featuredImage' as listing_image
             from app_redemptions ar
             join loyalty_cards lc on lc.id = ar.card_id
             left join offers o on o.id = ar.offer_id
             left join listings l on l.id = ar.listing_id
             where lc.user_id = $1
             order by ar.redeemed_at desc
             limit 50`,
            [user.id],
          );

          return Response.json(
            result.rows.map((row) => ({
              id: row.id,
              offer_id: row.offer_id,
              listing_id: row.listing_id,
              redeemed_at: new Date(row.redeemed_at).toISOString(),
              offer_title: row.offer_title ?? "Unknown offer",
              listing_name: row.listing_name ?? null,
              listing_image: row.listing_image ?? null,
            })),
          );
        } catch (err) {
          console.error("[app/me/redemptions]", err);
          return Response.json({ error: "Server error" }, { status: 500 });
        }
      },
    },
  },
});
