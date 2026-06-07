import { createFileRoute } from "@tanstack/react-router";
import type { Listing, Offer } from "@/types";
import { ACTIVE_OFFER_SQL } from "@/lib/api-offers";

export const Route = createFileRoute("/api/v1/me/listing")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const { getAppUser } = await import("@/lib/app-auth.server");
          const { getPool, ensureSchema } = await import("@/lib/db.server");
          await ensureSchema();

          const user = await getAppUser(request);
          if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
          if (user.app_role !== "business") {
            return Response.json({ error: "Business account required" }, { status: 403 });
          }

          const pool = getPool();

          const listingResult = await pool.query<{ data: Listing }>(
            "select data from listings where data->>'ownerUserId' = $1 limit 1",
            [user.id],
          );
          const listing = listingResult.rows[0]?.data;
          if (!listing) {
            return Response.json({ error: "No listing found for this account" }, { status: 404 });
          }

          const offersResult = await pool.query<{ data: Offer }>(
            `select data from offers o
             where listing_id = $1 and ${ACTIVE_OFFER_SQL}
             order by created_at desc`,
            [listing.id],
          );
          const offers = offersResult.rows.map((row) => ({
            id: row.data.id,
            title: row.data.title,
            description: row.data.description ?? "",
            terms: row.data.terms ?? "",
            isFeatured: Boolean(row.data.isFeatured),
            category: row.data.category ?? null,
          }));

          return Response.json({
            listing: {
              id: listing.id,
              name: listing.name,
              slug: listing.slug,
              category: listing.category,
              area: listing.area ?? null,
              featuredImage: listing.featuredImage ?? null,
              address: listing.address ?? null,
            },
            offers,
          });
        } catch (err) {
          console.error("[app/me/listing]", err);
          return Response.json({ error: "Server error" }, { status: 500 });
        }
      },
    },
  },
});
