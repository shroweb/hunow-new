import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

/**
 * Vercel Cron endpoint — runs every 15 minutes.
 * Handles:
 *  1. Publishing scheduled articles and events whose scheduledFor has passed
 *  2. Archiving published events whose startDate has passed
 *  3. Sending scheduled newsletter campaigns
 *
 * Protected by CRON_SECRET env var (set this in Vercel and vercel.json).
 */

export const Route = createFileRoute("/api/cron/publish")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // Verify secret — Vercel also sends its own Authorization header in production
        const secret = process.env.CRON_SECRET;
        if (secret) {
          const auth = request.headers.get("authorization");
          if (auth !== `Bearer ${secret}`) {
            return new Response("Unauthorized", { status: 401 });
          }
        }

        const results: string[] = [];
        const now = new Date();
        const todayIso = now.toISOString().slice(0, 10);

        try {
          const { getPool, ensureSchema } = await import("@/lib/db.server");
          await ensureSchema();
          const pool = getPool();

          // 1. Publish scheduled articles
          const articles = await pool.query<{ id: string; data: { scheduledFor?: string } }>(
            "select id, data from articles where status = 'scheduled'",
          );
          let publishedArticles = 0;
          for (const row of articles.rows) {
            const sf = row.data.scheduledFor;
            if (sf && new Date(sf) <= now) {
              const updated = { ...row.data, status: "published", publishedAt: sf };
              await pool.query("update articles set data = $2 where id = $1", [
                row.id,
                JSON.stringify(updated),
              ]);
              publishedArticles++;
            }
          }
          if (publishedArticles > 0) results.push(`Published ${publishedArticles} article(s)`);

          // 2. Publish scheduled events
          const events = await pool.query<{ id: string; data: { scheduledFor?: string } }>(
            "select id, data from events where status = 'scheduled'",
          );
          let publishedEvents = 0;
          for (const row of events.rows) {
            const sf = row.data.scheduledFor;
            if (sf && new Date(sf) <= now) {
              const updated = { ...row.data, status: "published" };
              await pool.query("update events set data = $2 where id = $1", [
                row.id,
                JSON.stringify(updated),
              ]);
              publishedEvents++;
            }
          }
          if (publishedEvents > 0) results.push(`Published ${publishedEvents} event(s)`);

          // 3. Archive past events (startDate + any endDate in the past)
          const pastEvents = await pool.query<{
            id: string;
            data: { startDate: string; endDate?: string };
          }>("select id, data from events where status = 'published' and data->>'startDate' < $1", [
            todayIso,
          ]);
          let archived = 0;
          for (const row of pastEvents.rows) {
            const endDate = row.data.endDate ?? row.data.startDate;
            if (endDate < todayIso) {
              const updated = { ...row.data, status: "archived" };
              await pool.query("update events set data = $2 where id = $1", [
                row.id,
                JSON.stringify(updated),
              ]);
              archived++;
            }
          }
          if (archived > 0) results.push(`Archived ${archived} past event(s)`);

          // 4. Send scheduled newsletter campaigns
          const client = await pool.connect();
          try {
            await client.query("begin");
            const campaigns = await client.query<{
              id: string;
              subject: string;
              segment: "all" | "events" | "offers" | "businesses";
              html: string;
              plain_text: string;
            }>(
              `select id, subject, segment, html, plain_text
               from newsletter_campaigns
               where status = 'scheduled' and scheduled_for <= now()
               order by scheduled_for asc
               for update skip locked`,
            );

            for (const campaign of campaigns.rows) {
              try {
                const apiKey = process.env.RESEND_API_KEY;
                if (!apiKey) {
                  throw new Error("RESEND_API_KEY is not configured.");
                }

                const { getNewsletterRecipients } = await import("@/lib/db.server");
                const recipients = await getNewsletterRecipients(campaign.segment);
                const siteUrl = (process.env.SITE_URL ?? "https://hunow.co.uk").replace(/\/$/, "");
                let sent = 0;

                for (const recipient of recipients) {
                  const unsubUrl = `${siteUrl}/unsubscribe?token=${recipient.unsubscribeToken}`;
                  const html = campaign.html.replaceAll("{{unsubscribeUrl}}", unsubUrl);
                  const text = campaign.plain_text.replaceAll("{{unsubscribeUrl}}", unsubUrl);
                  const response = await fetch("https://api.resend.com/emails", {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${apiKey}`,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      from: process.env.NEWSLETTER_FROM ?? "HU NOW <newsletter@hunow.co.uk>",
                      to: recipient.email,
                      subject: campaign.subject,
                      html,
                      text,
                    }),
                  });

                  if (!response.ok) {
                    const body = await response.text();
                    throw new Error(`Resend failed: ${response.status} ${body}`);
                  }
                  sent++;
                }

                await client.query(
                  `update newsletter_campaigns
                   set status = 'sent', recipient_count = $2, sent_at = now(), updated_at = now()
                   where id = $1`,
                  [campaign.id, sent],
                );
                results.push(
                  `Sent newsletter campaign "${campaign.subject}" to ${sent} recipients`,
                );
              } catch (err) {
                await client.query(
                  "update newsletter_campaigns set status = 'failed', updated_at = now() where id = $1",
                  [campaign.id],
                );
                results.push(`Failed campaign ${campaign.id}: ${String(err)}`);
              }
            }
            await client.query("commit");
          } catch (err) {
            await client.query("rollback");
            throw err;
          } finally {
            client.release();
          }

          // 5. Clean up old rate limit entries (keep last 24h)
          await pool
            .query("delete from rate_limits where window_start < now() - interval '24 hours'")
            .catch(() => {});
        } catch (err) {
          return Response.json({ ok: false, error: String(err) }, { status: 500 });
        }

        const summary = results.length > 0 ? results.join("; ") : "Nothing to process";
        console.info(`[cron/publish] ${new Date().toISOString()} — ${summary}`);
        return Response.json({ ok: true, ran: new Date().toISOString(), results });
      },
    },
  },
});
