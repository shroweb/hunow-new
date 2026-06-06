import { createFileRoute } from "@tanstack/react-router";
import type { Listing, Offer } from "@/types";
import { formatListing } from "./api.v1.listings";

export const Route = createFileRoute("/api/v1/listings/$id")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const id = (params as { id?: string }).id ?? new URL(request.url).pathname.split("/").pop();
        if (!id) return Response.json({ error: "Not found" }, { status: 404 });

        try {
          const { getPool, ensureSchema } = await import("@/lib/db.server");
          await ensureSchema();
          const pool = getPool();

          const result = await pool.query<{ data: Listing; offer_data: Offer | null }>(
            `select l.data,
                    o.data as offer_data
             from listings l
             left join offers o
               on o.listing_id = l.id and o.status = 'active'
             where l.id = $1
             limit 1`,
            [id],
          );
          const row = result.rows[0];
          if (!row) return Response.json({ error: "Not found" }, { status: 404 });

          return Response.json(formatListing(row.data, row.offer_data));
        } catch (err) {
          console.error("[app/listings/:id]", err);
          return Response.json({ error: "Server error" }, { status: 500 });
        }
      },
    },
  },
});
