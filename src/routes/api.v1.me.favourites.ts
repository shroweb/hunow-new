import { createFileRoute } from "@tanstack/react-router";
import crypto from "node:crypto";
import type { Offer, Listing } from "@/types";

export const Route = createFileRoute("/api/v1/me/favourites")({
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
            item_id: string;
            title: string;
            slug: string;
            offer_data: Offer | null;
            listing_data: Listing | null;
          }>(
            `select si.item_id, si.title, si.slug,
                    o.data as offer_data,
                    l.data as listing_data
             from saved_items si
             left join offers o on o.id = si.item_id and si.kind = 'offer'
             left join listings l on l.id = o.listing_id
             where si.user_id = $1 and si.kind = 'offer'
             order by si.saved_at desc`,
            [user.id],
          );

          return Response.json(
            result.rows.map((row) => ({
              id: row.item_id,
              title: row.title,
              slug: row.slug,
              offer: row.offer_data
                ? {
                    id: row.offer_data.id,
                    title: row.offer_data.title,
                    isFeatured: Boolean(row.offer_data.isFeatured),
                  }
                : null,
              listing: row.listing_data
                ? {
                    id: row.listing_data.id,
                    name: row.listing_data.name,
                    featuredImage: row.listing_data.featuredImage ?? null,
                    lat: row.listing_data.latitude ?? null,
                    lng: row.listing_data.longitude ?? null,
                  }
                : null,
            })),
          );
        } catch (err) {
          console.error("[app/me/favourites GET]", err);
          return Response.json({ error: "Server error" }, { status: 500 });
        }
      },

      POST: async ({ request }) => {
        const body = await request.json().catch(() => null) as {
          offer_id?: string;
          action?: "save" | "unsave";
        } | null;
        if (!body?.offer_id) {
          return Response.json({ error: "offer_id is required" }, { status: 400 });
        }

        try {
          const { getAppUser } = await import("@/lib/app-auth.server");
          const { getPool, ensureSchema } = await import("@/lib/db.server");
          await ensureSchema();

          const user = await getAppUser(request);
          if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

          const pool = getPool();

          if (body.action === "unsave") {
            await pool.query(
              "delete from saved_items where user_id = $1 and kind = 'offer' and item_id = $2",
              [user.id, body.offer_id],
            );
            return Response.json({ saved: false });
          }

          // Get offer title for the saved_items row
          const offerResult = await pool.query<{ data: Offer }>(
            "select data from offers where id = $1 limit 1",
            [body.offer_id],
          );
          const offer = offerResult.rows[0]?.data;
          if (!offer) return Response.json({ error: "Offer not found" }, { status: 404 });

          await pool.query(
            `insert into saved_items (id, user_id, kind, item_id, slug, title)
             values ($1, $2, 'offer', $3, $4, $5)
             on conflict (user_id, kind, item_id) do nothing`,
            [crypto.randomUUID(), user.id, offer.id, offer.id, offer.title],
          );

          return Response.json({ saved: true });
        } catch (err) {
          console.error("[app/me/favourites POST]", err);
          return Response.json({ error: "Server error" }, { status: 500 });
        }
      },
    },
  },
});
