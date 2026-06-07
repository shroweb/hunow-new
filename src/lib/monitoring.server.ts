import process from "node:process";

type ErrorContext = Record<string, string | number | boolean | null | undefined>;

export async function reportServerError(error: unknown, context: ErrorContext = {}) {
  const webhookUrl = process.env.ERROR_WEBHOOK_URL || process.env.SENTRY_WEBHOOK_URL;
  if (!webhookUrl) return;

  const err = error instanceof Error ? error : new Error(String(error));
  const payload = {
    message: err.message,
    name: err.name,
    stack: err.stack,
    context,
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  };

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {});
}
