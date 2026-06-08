import { createFileRoute } from "@tanstack/react-router";
import crypto from "node:crypto";
import type { Offer } from "@/types";
import { ACTIVE_OFFER_SQL } from "@/lib/api-offers";

const POINTS_PER_REDEMPTION = 35;

export const Route = createFileRoute("/api/v1/redeem")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => null)) as {
          // QR path
          qr_token?: string;
          offer_id?: string;
          // Code path
          code?: string;
        } | null;

        const isCodePath = Boolean(body?.code);
        const isQrPath = Boolean(body?.qr_token && body?.offer_id);

        if (!isCodePath && !isQrPath) {
          return Response.json(
            { error: "Provide either code or (qr_token + offer_id)" },
            { status: 400 },
          );
        }

        try {
          const { getAppUser } = await import("@/lib/app-auth.server");
          const { getPool, ensureSchema } = await import("@/lib/db.server");
          await ensureSchema();
          const pool = getPool();

          const businessUser = await getAppUser(request);
          if (!businessUser) return Response.json({ error: "Unauthorized" }, { status: 401 });
          if (businessUser.app_role !== "business") {
            return Response.json(
              { error: "Only business accounts can redeem offers" },
              { status: 403 },
            );
          }

          // ── Resolve card + offer ──────────────────────────────────────────
          let cardId: string;
          let cardUserId: string;
          let offerId: string;
          let listingId: string | null;
          let method: "qr" | "code";
          let codeRowId: string | null = null;

          if (isCodePath) {
            // Look up the one-time code
            const codeResult = await pool.query<{
              id: string;
              card_id: string;
              offer_id: string;
              listing_id: string | null;
            }>(
              `select id, card_id, offer_id, listing_id
               from redemption_codes
               where code = $1 and used_at is null and expires_at > now()
               limit 1`,
              [body!.code],
            );
            const codeRow = codeResult.rows[0];
            if (!codeRow) {
              return Response.json(
                { error: "Code not found, already used, or expired" },
                { status: 404 },
              );
            }

            // Resolve card owner
            const cardResult = await pool.query<{ id: string; user_id: string }>(
              "select id, user_id from loyalty_cards where id = $1 limit 1",
              [codeRow.card_id],
            );
            if (!cardResult.rows[0]) {
              return Response.json({ error: "Card not found" }, { status: 404 });
            }

            cardId = codeRow.card_id;
            cardUserId = cardResult.rows[0].user_id;
            offerId = codeRow.offer_id;
            listingId = codeRow.listing_id;
            method = "code";
            codeRowId = codeRow.id;
          } else {
            // QR path — original flow
            const cardResult = await pool.query<{ id: string; user_id: string }>(
              "select id, user_id from loyalty_cards where qr_token = $1 limit 1",
              [body!.qr_token],
            );
            if (!cardResult.rows[0]) {
              return Response.json({ error: "Card not found" }, { status: 404 });
            }
            cardId = cardResult.rows[0].id;
            cardUserId = cardResult.rows[0].user_id;
            offerId = body!.offer_id!;
            listingId = null;
            method = "qr";
          }

          // ── Look up offer ─────────────────────────────────────────────────
          const offerResult = await pool.query<{ data: Offer }>(
            `select data from offers where id = $1 and ${ACTIVE_OFFER_SQL} limit 1`,
            [offerId],
          );
          const offer = offerResult.rows[0]?.data;
          if (!offer) {
            return Response.json({ error: "Offer not found or inactive" }, { status: 404 });
          }
          if (!listingId) listingId = offer.listingId ?? null;

          // ── Verify business owns the listing ──────────────────────────────
          if (listingId) {
            const ownerResult = await pool.query<{ owner: string | null }>(
              "select data->>'ownerUserId' as owner from listings where id = $1 limit 1",
              [listingId],
            );
            const ownerId = ownerResult.rows[0]?.owner;
            if (ownerId && ownerId !== businessUser.id) {
              return Response.json(
                { error: "Not authorised to redeem offers for this listing" },
                { status: 403 },
              );
            }
          }

          // ── Usage limit check ─────────────────────────────────────────────
          const usageLimit = offer.usageLimit ?? 0;
          if (usageLimit > 0) {
            const usageResult = await pool.query<{ count: string }>(
              "select count(*)::text as count from app_redemptions where card_id = $1 and offer_id = $2",
              [cardId, offerId],
            );
            const used = Number(usageResult.rows[0]?.count ?? 0);
            if (used >= usageLimit) {
              return Response.json(
                {
                  error:
                    usageLimit === 1
                      ? "This offer can only be redeemed once per customer"
                      : `This offer can only be redeemed ${usageLimit} times per customer`,
                },
                { status: 409 },
              );
            }
          } else {
            // Default: once per day per card
            const dupResult = await pool.query<{ id: string }>(
              `select id from app_redemptions
               where card_id = $1 and offer_id = $2
                 and redeemed_at >= date_trunc('day', now())
               limit 1`,
              [cardId, offerId],
            );
            if (dupResult.rows[0]) {
              return Response.json(
                { error: "This offer has already been redeemed today on this card" },
                { status: 409 },
              );
            }
          }

          // ── Fetch customer name for history display ───────────────────────
          const customerResult = await pool.query<{ name: string }>(
            "select name from users where id = $1 limit 1",
            [cardUserId],
          );
          const customerName = customerResult.rows[0]?.name ?? "Customer";

          // ── Transactional write ───────────────────────────────────────────
          const client = await pool.connect();
          try {
            await client.query("begin");

            await client.query(
              `insert into app_redemptions
                 (id, card_id, offer_id, listing_id, redeemed_by, method, customer_name)
               values ($1, $2, $3, $4, $5, $6, $7)`,
              [
                crypto.randomUUID(),
                cardId,
                offerId,
                listingId,
                businessUser.id,
                method,
                customerName,
              ],
            );

            await client.query(
              `insert into loyalty_points (id, user_id, offer_id, listing_id, points, note)
               values ($1, $2, $3, $4, $5, $6)`,
              [
                crypto.randomUUID(),
                cardUserId,
                offerId,
                listingId,
                POINTS_PER_REDEMPTION,
                `Redeemed: ${offer.title}`,
              ],
            );

            await client.query(
              `update offers
               set data = jsonb_set(data, '{redemptionCount}',
                 to_jsonb(coalesce((data->>'redemptionCount')::int, 0) + 1), true)
               where id = $1`,
              [offerId],
            );
            await client.query(
              `update app_records
               set data = jsonb_set(data, '{redemptionCount}',
                 to_jsonb(coalesce((data->>'redemptionCount')::int, 0) + 1), true)
               where collection = 'offers' and id = $1`,
              [offerId],
            );

            // Mark code as used if code path
            if (codeRowId) {
              await client.query("update redemption_codes set used_at = now() where id = $1", [
                codeRowId,
              ]);
            }

            await client.query("commit");
          } catch (err) {
            await client.query("rollback");
            throw err;
          } finally {
            client.release();
          }

          // ── Points total ──────────────────────────────────────────────────
          const totalsResult = await pool.query<{ total: string }>(
            "select coalesce(sum(points), 0)::text as total from loyalty_points where user_id = $1",
            [cardUserId],
          );
          const newPoints = Number(totalsResult.rows[0]?.total ?? 0);
          const { computeTier } = await import("@/lib/app-auth.server");
          const newTier = computeTier(newPoints);

          // ── Push notification to customer ─────────────────────────────────
          try {
            const subResult = await pool.query<{
              endpoint: string;
              p256dh: string;
              auth: string;
            }>(
              "select endpoint, p256dh, auth from web_push_subscriptions where user_id = $1 limit 1",
              [cardUserId],
            );
            const sub = subResult.rows[0];
            if (sub) {
              const { sendPushNotification } = await import("@/lib/web-push.server");
              await sendPushNotification(
                { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                {
                  title: "Offer redeemed!",
                  body: `${offer.title} at ${offer.businessName} — +${POINTS_PER_REDEMPTION} points`,
                  url: "/account",
                },
              ).catch(() => {}); // fire-and-forget, don't fail the redemption
            }
          } catch {
            // push failure must never fail the redemption
          }

          return Response.json({
            success: true,
            method,
            customer_name: customerName,
            points_awarded: POINTS_PER_REDEMPTION,
            customer_points: newPoints,
            customer_tier: newTier,
          });
        } catch (err) {
          console.error("[app/redeem]", err);
          return Response.json({ error: "Server error" }, { status: 500 });
        }
      },
    },
  },
});
