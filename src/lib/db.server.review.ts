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

export async function getListingReviewsAdmin(listingId: string) {
  await ensureSchemaOnce();
  const result = await getPool().query<{
    id: string;
    listing_id: string;
    user_id: string;
    user_name: string;
    rating: number;
    body: string | null;
    status: string;
    created_at: Date;
  }>(
    "select id, listing_id, user_id, user_name, rating, body, status, created_at from reviews where listing_id = $1 order by created_at desc",
    [listingId],
  );
  return result.rows.map((r) => ({
    id: r.id,
    listingId: r.listing_id,
    userId: r.user_id,
    userName: r.user_name,
    rating: r.rating,
    body: r.body,
    status: r.status as "pending" | "approved" | "rejected",
    createdAt: r.created_at.toISOString(),
  }));
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
