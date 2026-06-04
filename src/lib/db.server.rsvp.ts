import pg from "pg";
import process from "node:process";

const { Pool } = pg;
let pool: pg.Pool | undefined;
let ready: Promise<void> | undefined;

export function getPool() {
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return pool;
}

export async function ensureSchema() {
  if (!ready) {
    ready = getPool()
      .query(
        `
        create table if not exists event_rsvps (
          id text primary key,
          event_id text not null,
          user_id text not null,
          created_at timestamptz not null default now(),
          unique(event_id, user_id)
        );
        create index if not exists event_rsvps_event_id_idx on event_rsvps (event_id);
        `,
      )
      .then(() => undefined);
  }
  await ready;
}
