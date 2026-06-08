/**
 * Web Push via the VAPID standard.
 * Requires: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT env vars.
 *
 * Generate keys once with:
 *   npx web-push generate-vapid-keys
 */
import webpush from "web-push";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:hello@hunow.co.uk";
  if (!pub || !priv) throw new Error("VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY must be set");
  webpush.setVapidDetails(subject, pub, priv);
  configured = true;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

export async function sendPushNotification(
  subscription: PushSubscriptionData,
  payload: PushPayload,
): Promise<void> {
  ensureConfigured();
  await webpush.sendNotification(
    {
      endpoint: subscription.endpoint,
      keys: subscription.keys,
    },
    JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url ?? "/",
      icon: payload.icon ?? "/Frame 4.png",
      badge: "/Frame 4.png",
    }),
  );
}

export async function sendPushToSegment(
  segment: "all" | "events" | "offers" | "businesses",
  payload: PushPayload,
): Promise<{ sent: number; failed: number }> {
  ensureConfigured();
  const { getPool } = await import("@/lib/db.server");
  const pool = getPool();

  const rows = await pool.query<{
    endpoint: string;
    p256dh: string;
    auth: string;
  }>(
    `select endpoint, p256dh, auth from push_subscriptions
     where $1 = 'all' or $1 = any(segments)`,
    [segment],
  );

  let sent = 0;
  let failed = 0;

  for (const row of rows.rows) {
    try {
      await sendPushNotification(
        { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
        payload,
      );
      sent++;
    } catch {
      failed++;
    }
  }

  return { sent, failed };
}

export function getVapidPublicKey(): string {
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key) throw new Error("VAPID_PUBLIC_KEY is not set");
  return key;
}
