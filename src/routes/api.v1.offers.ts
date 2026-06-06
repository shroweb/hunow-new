import { createFileRoute } from "@tanstack/react-router";
import type { Offer, Listing } from "@/types";

export const Route = createFileRoute("/api/v1/offers")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { getPool, ensureSchema } = await import("@/lib/db.server");
          await ensureSchema();
          const pool = getPool();

          const result = await pool.query<{ data: Offer; listing_data: Listing | null }>(
            `select o.data,
                    l.data as listing_data
             from offers o
             left join listings l on l.id = o.listing_id
             where o.status = 'active'
             order by (o.data->>'isFeatured')::boolean desc, o.created_at desc`,
          );

          const offers = result.rows.map((row) => formatOffer(row.data, row.listing_data));
          return Response.json(offers);
        } catch (err) {
          console.error("[app/offers]", err);
          return Response.json({ error: "Server error" }, { status: 500 });
        }
      },
    },
  },
});

export function formatOffer(offer: Offer, listing: Listing | null) {
  return {
    id: offer.id,
    title: offer.title,
    description: offer.description ?? "",
    terms: offer.terms ?? "",
    code: offer.code ?? null,
    startDate: offer.startDate ?? null,
    endDate: offer.endDate ?? null,
    isFeatured: Boolean(offer.isFeatured),
    category: offer.category ?? null,
    listing: listing
      ? {
          id: listing.id,
          name: listing.name,
          slug: listing.slug,
          category: listing.category,
          area: listing.area ?? null,
          featuredImage: listing.featuredImage ?? null,
          lat: listing.latitude ?? null,
          lng: listing.longitude ?? null,
          address: listing.address ?? null,
          openingHours: listing.openingHours ?? null,
          hours: listing.hours ?? null,
        }
      : null,
  };
}
