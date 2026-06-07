import process from "node:process";

const DEFAULT_NEWSLETTER_FROM = "HU NOW <newsletter@hunow.co.uk>";

export function getNewsletterSendConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set. Add it in Vercel/env before sending newsletters.");
  }

  const from = process.env.NEWSLETTER_FROM || DEFAULT_NEWSLETTER_FROM;
  if (process.env.NODE_ENV === "production" && from === DEFAULT_NEWSLETTER_FROM) {
    throw new Error(
      "NEWSLETTER_FROM is using the default address. Set it to a verified Resend domain before sending.",
    );
  }

  return { apiKey, from };
}
