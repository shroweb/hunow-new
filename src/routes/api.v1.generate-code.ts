import { createFileRoute } from "@tanstack/react-router";
import crypto from "node:crypto";

export const Route = createFileRoute("/api/v1/generate-code")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => null)) as {
          offer_id: string;
          listing_id?: string;
        } | null;
        if (!body?.offer_id) {
          return Response.json({ error: "offer_id is required" }, { status: 400 });
        }

        try {
          const { currentUser } = await import("@/lib/auth.server");
          const { getPool, ensureSchema } = await import("@/lib/db.server");
          await ensureSchema();
          const pool = getPool();

          const appUser = await currentUser();
          if (!appUser) return Response.json({ error: "Unauthorized" }, { status: 401 });

          // Get the user's loyalty card
          const cardResult = await pool.query<{ id: string }>(
            "select id from loyalty_cards where user_id = $1 limit 1",
            [appUser.id],
          );
          const card = cardResult.rows[0];
          if (!card) return Response.json({ error: "No loyalty card found" }, { status: 404 });

          // Verify the offer exists and is active
          const { ACTIVE_OFFER_SQL } = await import("@/lib/api-offers");
          const offerResult = await pool.query<{ listing_id: string | null }>(
            `select o.data->>'listingId' as listing_id from offers o where o.id = $1 and ${ACTIVE_OFFER_SQL} limit 1`,
            [body.offer_id],
          );
          if (!offerResult.rows[0]) {
            return Response.json({ error: "Offer not found or inactive" }, { status: 404 });
          }

          // Generate a unique 6-digit numeric code (retry on collision)
          let code = "";
          for (let attempt = 0; attempt < 5; attempt++) {
            const candidate = Math.floor(100000 + Math.random() * 900000).toString();
            const conflict = await pool.query(
              "select id from redemption_codes where code = $1 and used_at is null and expires_at > now() limit 1",
              [candidate],
            );
            if (!conflict.rows[0]) { code = candidate; break; }
          }
          if (!code) return Response.json({ error: "Could not generate code, try again" }, { status: 500 });

          const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

          await pool.query(
            "insert into redemption_codes (id, code, card_id, offer_id, listing_id, expires_at) values ($1, $2, $3, $4, $5, $6)",
            [
              crypto.randomUUID(),
              code,
              card.id,
              body.offer_id,
              body.listing_id ?? offerResult.rows[0].listing_id ?? null,
              expiresAt.toISOString(),
            ],
          );

          return Response.json({ code, expires_at: expiresAt.toISOString() });
        } catch (err) {
          console.error("[api/generate-code]", err);
          return Response.json({ error: "Server error" }, { status: 500 });
        }
      },
    },
  },
});
