// Separate module to avoid circular imports with db.server.ts
import pg from "pg";
import process from "node:process";

const { Pool } = pg;

let pool: pg.Pool | undefined;
let ready: Promise<void> | undefined;

export function getPool() {
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return pool;
}

export async function ensureSchemaOnce() {
  if (!ready) {
    ready = getPool()
      .query(
        `
        create table if not exists reviews (
          id text primary key,
          listing_id text not null,
          user_id text not null,
          user_name text not null,
          rating integer not null check (rating between 1 and 5),
          body text,
          status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
          created_at timestamptz not null default now(),
          unique(listing_id, user_id)
        );
        create index if not exists reviews_listing_id_idx on reviews (listing_id);
        create index if not exists reviews_status_idx on reviews (status);
        -- Migrate existing reviews to approved so they stay visible
        alter table reviews add column if not exists status text not null default 'approved' check (status in ('pending', 'approved', 'rejected'));
        `,
      )
      .then(() => undefined);
  }
  await ready;
}
