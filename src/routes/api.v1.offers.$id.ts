import { createFileRoute } from "@tanstack/react-router";
import type { Offer, Listing } from "@/types";
import { formatOffer } from "./api.v1.offers";

export const Route = createFileRoute("/api/v1/offers/$id")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const id = (params as { id?: string }).id ?? new URL(request.url).pathname.split("/").pop();
        if (!id) return Response.json({ error: "Not found" }, { status: 404 });

        try {
          const { getPool, ensureSchema } = await import("@/lib/db.server");
          await ensureSchema();
          const pool = getPool();

          const result = await pool.query<{ data: Offer; listing_data: Listing | null }>(
            `select o.data, l.data as listing_data
             from offers o
             left join listings l on l.id = o.listing_id
             where o.id = $1 and o.status = 'active'
             limit 1`,
            [id],
          );
          const row = result.rows[0];
          if (!row) return Response.json({ error: "Not found" }, { status: 404 });

          return Response.json(formatOffer(row.data, row.listing_data));
        } catch (err) {
          console.error("[app/offers/:id]", err);
          return Response.json({ error: "Server error" }, { status: 500 });
        }
      },
    },
  },
});
