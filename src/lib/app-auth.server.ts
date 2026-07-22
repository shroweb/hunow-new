import crypto from "node:crypto";
import process from "node:process";
import { getPool } from "./db.server";

const TOKEN_DAYS = 90;
const POINTS_PER_REDEMPTION = 35;

export const TIER_THRESHOLDS = {
  gold: 1400,
  silver: 600,
  bronze: 200,
} as const;

function getSecret() {
  const s = process.env.APP_JWT_SECRET;
  if (!s) throw new Error("APP_JWT_SECRET is not configured");
  return s;
}

export function issueAppToken(userId: string): string {
  const exp = Math.floor(Date.now() / 1000) + TOKEN_DAYS * 24 * 60 * 60;
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ sub: userId, exp })).toString("base64url");
  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(`${header}.${payload}`)
    .digest("base64url");
  return `${header}.${payload}.${sig}`;
}

export function verifyAppToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, payload, sig] = parts as [string, string, string];
  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(`${header}.${payload}`)
    .digest("base64url");
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig, "base64url"), Buffer.from(expected, "base64url")))
      return null;
  } catch {
    return null;
  }
  const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
    sub?: string;
    exp?: number;
  };
  if (typeof data.exp === "number" && data.exp < Math.floor(Date.now() / 1000)) return null;
  if (typeof data.sub !== "string") return null;
  return data.sub;
}

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: string;
  app_role: string;
}

export async function getAppUser(request: Request): Promise<AppUser | null> {
  // 1. JWT Bearer token (native / API clients)
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    const userId = verifyAppToken(auth.slice(7));
    if (!userId) return null;
    const result = await getPool().query<AppUser>(
      "select id, email, name, role, app_role from users where id = $1",
      [userId],
    );
    return result.rows[0] ?? null;
  }

  // 2. Session cookie (web portal)
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(/(?:^|;\s*)hunow_session=([^;]+)/);
  const sessionId = match?.[1];
  if (!sessionId) return null;
  const result = await getPool().query<AppUser & { expires_at: Date }>(
    `select u.id, u.email, u.name, u.role, u.app_role
     from sessions s
     join users u on u.id = s.user_id
     where s.id = $1 and s.expires_at > now()
     limit 1`,
    [sessionId],
  );
  return result.rows[0] ?? null;
}

export function computeTier(points: number): string {
  if (points >= TIER_THRESHOLDS.gold) return "gold";
  if (points >= TIER_THRESHOLDS.silver) return "silver";
  if (points >= TIER_THRESHOLDS.bronze) return "bronze";
  return "standard";
}

export async function hashAppPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("base64url");
  const derived = await scrypt(password, salt);
  return `scrypt:${salt}:${derived.toString("base64url")}`;
}

export async function verifyAppPassword(password: string, stored: string) {
  const [scheme, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const derived = await scrypt(password, salt);
  const expected = Buffer.from(hash, "base64url");
  return expected.length === derived.length && crypto.timingSafeEqual(expected, derived);
}

function scrypt(password: string, salt: string) {
  return new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
}

export async function getUserLoyaltyData(userId: string) {
  const pool = getPool();
  const [pointsResult, cardResult] = await Promise.all([
    pool.query<{ total: string }>(
      "select coalesce(sum(points), 0)::text as total from loyalty_points where user_id = $1",
      [userId],
    ),
    pool.query<{ qr_token: string; created_at: string }>(
      "select qr_token, created_at from loyalty_cards where user_id = $1",
      [userId],
    ),
  ]);
  const points = Number(pointsResult.rows[0]?.total ?? 0);
  const card = cardResult.rows[0] ?? null;
  return {
    points,
    tier: computeTier(points),
    card_token: card?.qr_token ?? null,
    card_created: card?.created_at ?? null,
  };
}

export async function createLoyaltyCard(userId: string) {
  const id = crypto.randomUUID();
  const qrToken = crypto.randomUUID();
  await getPool().query(
    "insert into loyalty_cards (id, user_id, qr_token) values ($1, $2, $3) on conflict (user_id) do nothing",
    [id, userId, qrToken],
  );
  const result = await getPool().query<{ qr_token: string; created_at: string }>(
    "select qr_token, created_at from loyalty_cards where user_id = $1",
    [userId],
  );
  return result.rows[0]!;
}

export { POINTS_PER_REDEMPTION };
