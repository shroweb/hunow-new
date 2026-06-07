import { createFileRoute } from "@tanstack/react-router";
import type { Listing, Offer } from "@/types";
import { ACTIVE_OFFER_SQL } from "@/lib/api-offers";

export const Route = createFileRoute("/api/v1/listings")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { getPool, ensureSchema } = await import("@/lib/db.server");
          await ensureSchema();
          const pool = getPool();

          const result = await pool.query<{ data: Listing; offer_data: Offer | null }>(
            `select l.data,
                    o.data as offer_data
             from listings l
             left join offers o
               on o.listing_id = l.id and ${ACTIVE_OFFER_SQL}
             order by (l.data->>'isFeatured')::boolean desc, l.data->>'name' asc`,
          );

          const listings = result.rows.map((row) => formatListing(row.data, row.offer_data));
          return Response.json(listings);
        } catch (err) {
          console.error("[app/listings]", err);
          return Response.json({ error: "Server error" }, { status: 500 });
        }
      },
    },
  },
});

export function formatListing(listing: Listing, activeOffer: Offer | null) {
  return {
    id: listing.id,
    name: listing.name,
    slug: listing.slug,
    category: listing.category,
    area: listing.area ?? null,
    address: listing.address ?? null,
    featuredImage: listing.featuredImage ?? null,
    lat: listing.latitude ?? null,
    lng: listing.longitude ?? null,
    openingHours: listing.openingHours ?? null,
    hours: listing.hours ?? null,
    website: listing.website ?? null,
    phone: listing.phone ?? null,
    tags: listing.tags ?? [],
    isFeatured: Boolean(listing.isFeatured),
    isHiddenGem: Boolean(listing.isHiddenGem),
    isIndependent: Boolean(listing.isIndependent),
    isVerified: Boolean(listing.isVerified),
    activeOffer: activeOffer
      ? {
          id: activeOffer.id,
          title: activeOffer.title,
          description: activeOffer.description ?? "",
          terms: activeOffer.terms ?? "",
          isFeatured: Boolean(activeOffer.isFeatured),
        }
      : null,
  };
}
