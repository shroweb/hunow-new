import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import pg from "pg";
import process from "node:process";
import type { SavedItem } from "@/lib/bookmarks";

const { Pool } = pg;
let pool: pg.Pool | undefined;
function getPool() {
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return pool;
}

async function ensureTable() {
  await getPool().query(`
    create table if not exists saved_items (
      id text primary key,
      user_id text not null references users(id) on delete cascade,
      kind text not null,
      item_id text not null,
      slug text not null,
      title text not null,
      subcategory text,
      saved_at timestamptz not null default now(),
      unique(user_id, kind, item_id)
    );
    create index if not exists saved_items_user_id_idx on saved_items (user_id);
  `).catch(() => {});
}

export const getServerSavedItems = createServerFn({ method: "GET" }).handler(async () => {
  const { currentUser } = await import("./auth.server");
  const user = await currentUser().catch(() => null);
  if (!user) return [] as SavedItem[];

  await ensureTable();
  const result = await getPool().query<{
    id: string; kind: string; item_id: string; slug: string; title: string;
    subcategory: string | null; saved_at: Date;
  }>(
    "select id, kind, item_id, slug, title, subcategory, saved_at from saved_items where user_id = $1 order by saved_at desc",
    [user.id],
  );

  return result.rows.map((r) => ({
    kind: r.kind as SavedItem["kind"],
    id: r.item_id,
    slug: r.slug,
    title: r.title,
    subcategory: r.subcategory ?? undefined,
    savedAt: r.saved_at.toISOString(),
  })) as SavedItem[];
});

export const syncSavedItem = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    kind: z.enum(["event", "place", "story", "offer"]),
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    subcategory: z.string().optional(),
    action: z.enum(["save", "remove"]),
  }))
  .handler(async ({ data }) => {
    const { currentUser } = await import("./auth.server");
    const user = await currentUser().catch(() => null);
    if (!user) return { ok: false };

    await ensureTable();
    if (data.action === "remove") {
      await getPool().query(
        "delete from saved_items where user_id = $1 and kind = $2 and item_id = $3",
        [user.id, data.kind, data.id],
      );
    } else {
      const itemId = crypto.randomUUID();
      await getPool().query(
        `insert into saved_items (id, user_id, kind, item_id, slug, title, subcategory)
         values ($1, $2, $3, $4, $5, $6, $7)
         on conflict (user_id, kind, item_id) do nothing`,
        [itemId, user.id, data.kind, data.id, data.slug, data.title, data.subcategory ?? null],
      );
    }
    return { ok: true };
  });
