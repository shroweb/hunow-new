import crypto from "node:crypto";

const CSRF_SECRET = process.env.APP_JWT_SECRET ?? "csrf-fallback-secret";
const CSRF_COOKIE = "hunow_csrf";
const CSRF_HEADER = "x-csrf-token";

/**
 * Generate a CSRF token tied to the session.
 * The token is a signed HMAC of a random nonce + timestamp.
 */
export function generateCsrfToken(sessionId: string): string {
  const nonce = crypto.randomBytes(16).toString("base64url");
  const ts = Date.now();
  const payload = `${nonce}:${ts}`;
  const sig = crypto
    .createHmac("sha256", CSRF_SECRET)
    .update(`${sessionId}:${payload}`)
    .digest("base64url");
  return `${payload}:${sig}`;
}

/**
 * Validate a CSRF token. Returns true if valid and not expired (1 hour window).
 */
export function validateCsrfToken(sessionId: string, token: string): boolean {
  const parts = token.split(":");
  if (parts.length !== 3) return false;
  const [nonce, tsStr, sig] = parts;
  const ts = Number(tsStr);
  if (isNaN(ts) || Date.now() - ts > 60 * 60 * 1000) return false;

  const expected = crypto
    .createHmac("sha256", CSRF_SECRET)
    .update(`${sessionId}:${nonce}:${tsStr}`)
    .digest("base64url");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(sig, "base64url"),
      Buffer.from(expected, "base64url"),
    );
  } catch {
    return false;
  }
}

export { CSRF_COOKIE, CSRF_HEADER };
