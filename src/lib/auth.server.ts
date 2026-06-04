import crypto from "node:crypto";
import process from "node:process";
import pg from "pg";
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";

export type AuthRole = "user" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: AuthRole;
}

export interface AdminUserRow extends AuthUser {
  createdAt: string;
  updatedAt: string;
}

const { Pool } = pg;
const SESSION_COOKIE = "hunow_session";
const SESSION_DAYS = 30;

let pool: pg.Pool | undefined;
let authSchemaReady: Promise<void> | undefined;

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and start Docker Postgres.",
    );
  }
  return databaseUrl;
}

function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString: getDatabaseUrl() });
  }
  return pool;
}

async function ensureAuthSchema() {
  if (!authSchemaReady) {
    authSchemaReady = getPool()
      .query(
        `
        create table if not exists users (
          id text primary key,
          email text not null unique,
          name text not null,
          password_hash text not null,
          role text not null default 'user' check (role in ('user', 'admin')),
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now()
        );

        create table if not exists sessions (
          id text primary key,
          user_id text not null references users(id) on delete cascade,
          expires_at timestamptz not null,
          created_at timestamptz not null default now()
        );

        create index if not exists users_email_idx on users (email);
        create index if not exists sessions_user_id_idx on sessions (user_id);
        create index if not exists sessions_expires_at_idx on sessions (expires_at);
        `,
      )
      .then(() => undefined);
  }
  await authSchemaReady;
}

export async function createAccount(input: { name: string; email: string; password: string }) {
  await ensureAuthSchema();
  const email = normaliseEmail(input.email);
  const existing = await getPool().query("select id from users where email = $1", [email]);
  if (existing.rowCount && existing.rowCount > 0) {
    throw new Error("An account already exists for that email.");
  }

  const count = await getPool().query<{ count: string }>(
    "select count(*)::text as count from users",
  );
  const role: AuthRole =
    Number(count.rows[0]?.count ?? 0) === 0 || isConfiguredAdmin(email) ? "admin" : "user";
  const user: AuthUser = {
    id: crypto.randomUUID(),
    email,
    name: input.name.trim(),
    role,
  };

  await getPool().query(
    "insert into users (id, email, name, password_hash, role) values ($1, $2, $3, $4, $5)",
    [user.id, user.email, user.name, await hashPassword(input.password), user.role],
  );
  await createSession(user.id);
  return user;
}

export async function signIn(input: { email: string; password: string }) {
  await ensureAuthSchema();
  const result = await getPool().query<{
    id: string;
    email: string;
    name: string;
    password_hash: string;
    role: AuthRole;
  }>("select id, email, name, password_hash, role from users where email = $1", [
    normaliseEmail(input.email),
  ]);
  const row = result.rows[0];
  if (!row || !(await verifyPassword(input.password, row.password_hash))) {
    throw new Error("Email or password is incorrect.");
  }
  await createSession(row.id);
  return { id: row.id, email: row.email, name: row.name, role: row.role };
}

export async function signOut() {
  await ensureAuthSchema();
  const sessionId = getCookie(SESSION_COOKIE);
  if (sessionId) {
    await getPool().query("delete from sessions where id = $1", [sessionId]);
  }
  deleteCookie(SESSION_COOKIE, { path: "/" });
}

export async function currentUser(): Promise<AuthUser | null> {
  await ensureAuthSchema();
  const sessionId = getCookie(SESSION_COOKIE);
  if (!sessionId) return null;
  const result = await getPool().query<AuthUser>(
    `
    select users.id, users.email, users.name, users.role
    from sessions
    join users on users.id = sessions.user_id
    where sessions.id = $1 and sessions.expires_at > now()
    `,
    [sessionId],
  );
  const user = result.rows[0] ?? null;
  if (!user) {
    deleteCookie(SESSION_COOKIE, { path: "/" });
  }
  return user;
}

export async function requireAdmin() {
  const user = await currentUser();
  if (!user || user.role !== "admin") {
    throw new Error("Admin access required.");
  }
  return user;
}

export async function requestPasswordReset(email: string) {
  await ensureAuthSchema();
  const normalised = normaliseEmail(email);
  const userResult = await getPool().query<{ id: string }>(
    "select id from users where email = $1",
    [normalised],
  );
  const userId = userResult.rows[0]?.id;
  if (!userId) return { ok: true }; // Don't reveal whether email exists

  const token = crypto.randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await getPool().query(
    "insert into password_reset_tokens (token, user_id, expires_at) values ($1, $2, $3)",
    [token, userId, expires.toISOString()],
  );

  const resetUrl = `${(process.env.SITE_URL ?? "http://localhost:8080").replace(/\/$/, "")}/reset-password?token=${token}`;
  console.info(`[Password Reset] ${normalised} → ${resetUrl}`);
  return { ok: true, _devResetUrl: process.env.NODE_ENV !== "production" ? resetUrl : undefined };
}

export async function resetPassword(token: string, newPassword: string) {
  await ensureAuthSchema();
  const result = await getPool().query<{
    user_id: string;
    expires_at: string;
    used_at: string | null;
  }>("select user_id, expires_at, used_at from password_reset_tokens where token = $1", [token]);
  const row = result.rows[0];
  if (!row) throw new Error("Invalid or expired reset link.");
  if (row.used_at) throw new Error("This reset link has already been used.");
  if (new Date(row.expires_at) < new Date()) throw new Error("This reset link has expired.");

  const hash = await hashPassword(newPassword);
  await getPool().query("update users set password_hash = $1 where id = $2", [hash, row.user_id]);
  await getPool().query("update password_reset_tokens set used_at = now() where token = $1", [
    token,
  ]);
  await getPool().query("delete from sessions where user_id = $1", [row.user_id]);
  return { ok: true };
}

export interface AdminUserRow {
  id: string;
  email: string;
  name: string;
  role: AuthRole;
  createdAt: string;
  updatedAt: string;
}

export async function listUsersForAdmin(): Promise<AdminUserRow[]> {
  await requireAdmin();
  const result = await getPool().query<{
    id: string;
    email: string;
    name: string;
    role: AuthRole;
    created_at: Date;
    updated_at: Date;
  }>(
    `
    select id, email, name, role, created_at, updated_at
    from users
    order by created_at asc
    `,
  );
  return result.rows.map((row) => ({
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  }));
}

export async function updateUserRoleForAdmin(input: { userId: string; role: AuthRole }) {
  const admin = await requireAdmin();
  await ensureAuthSchema();

  if (admin.id === input.userId && input.role !== "admin") {
    const adminCount = await getPool().query<{ count: string }>(
      "select count(*)::text as count from users where role = 'admin'",
    );
    if (Number(adminCount.rows[0]?.count ?? 0) <= 1) {
      throw new Error("You cannot remove the final admin account.");
    }
  }

  const result = await getPool().query<{
    id: string;
    email: string;
    name: string;
    role: AuthRole;
    created_at: Date;
    updated_at: Date;
  }>(
    `
    update users
    set role = $2, updated_at = now()
    where id = $1
    returning id, email, name, role, created_at, updated_at
    `,
    [input.userId, input.role],
  );
  const row = result.rows[0];
  if (!row) throw new Error("User not found.");
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

function normaliseEmail(email: string) {
  return email.trim().toLowerCase();
}

function isConfiguredAdmin(email: string) {
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email);
}

async function createSession(userId: string) {
  const id = crypto.randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await getPool().query("insert into sessions (id, user_id, expires_at) values ($1, $2, $3)", [
    id,
    userId,
    expires.toISOString(),
  ]);
  setCookie(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("base64url");
  const derived = await scrypt(password, salt);
  return `scrypt:${salt}:${derived.toString("base64url")}`;
}

async function verifyPassword(password: string, stored: string) {
  const [scheme, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const derived = await scrypt(password, salt);
  const expected = Buffer.from(hash, "base64url");
  return expected.length === derived.length && crypto.timingSafeEqual(expected, derived);
}

function scrypt(password: string, salt: string) {
  return new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}
