import { createFileRoute } from "@tanstack/react-router";
import crypto from "node:crypto";
import type { Offer } from "@/types";

const POINTS_PER_REDEMPTION = 35;

export const Route = createFileRoute("/api/v1/redeem")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json().catch(() => null) as {
          qr_token?: string;
          offer_id?: string;
        } | null;
        if (!body?.qr_token || !body?.offer_id) {
          return Response.json({ error: "qr_token and offer_id are required" }, { status: 400 });
        }

        try {
          const { getAppUser } = await import("@/lib/app-auth.server");
          const { getPool, ensureSchema } = await import("@/lib/db.server");
          await ensureSchema();
          const pool = getPool();

          const businessUser = await getAppUser(request);
          if (!businessUser) return Response.json({ error: "Unauthorized" }, { status: 401 });
          if (businessUser.app_role !== "business") {
            return Response.json({ error: "Only business accounts can redeem offers" }, { status: 403 });
          }

          // Look up the offer
          const offerResult = await pool.query<{ data: Offer }>(
            "select data from offers where id = $1 and status = 'active' limit 1",
            [body.offer_id],
          );
          const offer = offerResult.rows[0]?.data;
          if (!offer) return Response.json({ error: "Offer not found or inactive" }, { status: 404 });

          // Verify business user owns the listing this offer belongs to
          if (offer.listingId) {
            const ownerResult = await pool.query<{ owner: string | null }>(
              "select data->>'ownerUserId' as owner from listings where id = $1 limit 1",
              [offer.listingId],
            );
            const ownerId = ownerResult.rows[0]?.owner;
            if (ownerId && ownerId !== businessUser.id) {
              return Response.json(
                { error: "Not authorised to redeem offers for this listing" },
                { status: 403 },
              );
            }
          }

          // Look up customer card by QR token
          const cardResult = await pool.query<{ id: string; user_id: string }>(
            "select id, user_id from loyalty_cards where qr_token = $1 limit 1",
            [body.qr_token],
          );
          const card = cardResult.rows[0];
          if (!card) return Response.json({ error: "Card not found" }, { status: 404 });

          // Prevent same offer being redeemed more than once today per card
          const dupResult = await pool.query<{ id: string }>(
            `select id from app_redemptions
             where card_id = $1
               and offer_id = $2
               and redeemed_at >= date_trunc('day', now())
             limit 1`,
            [card.id, body.offer_id],
          );
          if (dupResult.rows[0]) {
            return Response.json(
              { error: "This offer has already been redeemed today on this card" },
              { status: 409 },
            );
          }

          const client = await pool.connect();
          try {
            await client.query("begin");

            await client.query(
              "insert into app_redemptions (id, card_id, offer_id, listing_id, redeemed_by) values ($1, $2, $3, $4, $5)",
              [crypto.randomUUID(), card.id, body.offer_id, offer.listingId ?? null, businessUser.id],
            );

            await client.query(
              "insert into loyalty_points (id, user_id, offer_id, listing_id, points, note) values ($1, $2, $3, $4, $5, $6)",
              [
                crypto.randomUUID(),
                card.user_id,
                body.offer_id,
                offer.listingId ?? null,
                POINTS_PER_REDEMPTION,
                `Redeemed: ${offer.title}`,
              ],
            );

            await client.query("commit");
          } catch (err) {
            await client.query("rollback");
            throw err;
          } finally {
            client.release();
          }

          // Return updated points total
          const totalsResult = await pool.query<{ total: string }>(
            "select coalesce(sum(points), 0)::text as total from loyalty_points where user_id = $1",
            [card.user_id],
          );
          const newPoints = Number(totalsResult.rows[0]?.total ?? 0);

          const { computeTier } = await import("@/lib/app-auth.server");
          return Response.json({
            success: true,
            points_awarded: POINTS_PER_REDEMPTION,
            customer_points: newPoints,
            customer_tier: computeTier(newPoints),
          });
        } catch (err) {
          console.error("[app/redeem]", err);
          return Response.json({ error: "Server error" }, { status: 500 });
        }
      },
    },
  },
});
