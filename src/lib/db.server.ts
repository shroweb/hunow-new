import process from "node:process";
import pg from "pg";

import {
  seedAds,
  seedArticles,
  seedEvents,
  seedListings,
  seedMedia,
  seedOffers,
  seedSubmissions,
} from "@/data/seed";
import type { AdPlacement, Submission } from "@/types";
import type { AppStore } from "./store";

type CollectionName = Exclude<keyof AppStore, "newsletter">;
type StoredRecord = { id: string };

const { Pool } = pg;

const tables = {
  articles: "articles",
  events: "events",
  listings: "listings",
  offers: "offers",
  submissions: "submissions",
  ads: "ads",
  media: "media",
} as const satisfies Record<CollectionName, string>;

const collections = Object.keys(tables) as CollectionName[];

const fallbackStore: AppStore = {
  articles: seedArticles,
  events: seedEvents,
  listings: seedListings,
  offers: seedOffers,
  submissions: seedSubmissions,
  ads: seedAds,
  media: seedMedia,
  newsletter: [],
};

let pool: pg.Pool | undefined;
let schemaReady: Promise<void> | undefined;

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

async function ensureSchema() {
  if (!schemaReady) {
    const schemaPath = resolve(process.cwd(), "db/schema.sql");
    schemaReady = readFile(schemaPath, "utf8").then((sql) =>
      getPool()
        .query(sql)
        .then(() => undefined),
    );
  }
  await schemaReady;
}

function emptyStore(): AppStore {
  return {
    articles: [],
    events: [],
    listings: [],
    offers: [],
    submissions: [],
    ads: [],
    media: [],
    newsletter: [],
  };
}

async function typedRecordCount() {
  const result = await getPool().query<{ count: string }>(
    collections
      .map((collection) => `select count(*)::text as count from ${tables[collection]}`)
      .join(" union all "),
  );
  return result.rows.reduce((sum, row) => sum + Number(row.count ?? 0), 0);
}

async function legacyStore(): Promise<AppStore | undefined> {
  const result = await getPool().query<{
    collection: keyof AppStore;
    data: unknown;
  }>("select collection, data from app_records order by created_at desc");

  if (result.rows.length === 0) return undefined;

  const store = emptyStore();
  for (const row of result.rows) {
    if (row.collection === "newsletter") {
      const email = (row.data as { email?: unknown }).email;
      if (typeof email === "string") store.newsletter.push(email);
      continue;
    }
    if (collections.includes(row.collection as CollectionName)) {
      const collection = row.collection as CollectionName;
      store[collection].push(row.data as never);
    }
  }
  return store;
}

async function seedIfEmpty() {
  // Never auto-seed in production — use admin to create real content
  if (process.env.NODE_ENV === "production") return;

  const count = await typedRecordCount();
  if (count === 0) {
    // First run — full seed (including legacy migration)
    await saveDatabaseStore((await legacyStore()) ?? fallbackStore);
    return;
  }
  // DB already has data — upsert all seed records so field additions (e.g. lat/lng) are reflected.
  // Admin-created records have random IDs so they're never affected by seed upserts.
  for (const collection of collections) {
    const records = fallbackStore[collection] as StoredRecord[];
    for (const record of records) {
      await getPool().query(
        `insert into ${tables[collection]} (id, data) values ($1, $2)
         on conflict (id) do update set data = excluded.data`,
        [record.id, JSON.stringify(record)],
      );
    }
  }
}

export async function getDatabaseStore(): Promise<AppStore> {
  await ensureSchema();
  await seedIfEmpty();

  const store = emptyStore();

  for (const collection of collections) {
    const result = await getPool().query<{ data: unknown }>(
      `select data from ${tables[collection]} order by created_at desc`,
    );
    store[collection] = result.rows.map((row) => row.data) as never;
  }

  const subscribers = await getPool().query<{ email: string }>(
    "select email from newsletter_subscribers order by created_at desc",
  );
  store.newsletter = subscribers.rows.map((row) => row.email);

  return store;
}

export async function saveDatabaseStore(store: AppStore) {
  await ensureSchema();

  const client = await getPool().connect();
  try {
    await client.query("begin");

    for (const collection of collections) {
      const records = store[collection] as StoredRecord[];
      const ids = records.map((record) => record.id);
      if (ids.length > 0) {
        await client.query(`delete from ${tables[collection]} where not (id = any($1::text[]))`, [
          ids,
        ]);
      } else {
        await client.query(`delete from ${tables[collection]}`);
      }
      for (const record of records) {
        await client.query(
          `insert into ${tables[collection]} (id, data) values ($1, $2)
           on conflict (id) do update set data = excluded.data`,
          [record.id, JSON.stringify(record)],
        );
      }
    }

    if (store.newsletter.length > 0) {
      await client.query("delete from newsletter_subscribers where not (email = any($1::text[]))", [
        store.newsletter,
      ]);
    } else {
      await client.query("delete from newsletter_subscribers");
    }
    for (const email of store.newsletter) {
      await client.query(
        "insert into newsletter_subscribers (email) values ($1) on conflict do nothing",
        [email],
      );
    }

    await client.query("delete from app_records");
    for (const collection of collections) {
      for (const record of store[collection] as StoredRecord[]) {
        await client.query("insert into app_records (collection, id, data) values ($1, $2, $3)", [
          collection,
          record.id,
          JSON.stringify(record),
        ]);
      }
    }
    for (const email of store.newsletter) {
      await client.query(
        "insert into app_records (collection, id, data) values ($1, $2, $3) on conflict do nothing",
        ["newsletter", email, JSON.stringify({ email })],
      );
    }

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function getArticleBySlug(slug: string) {
  await ensureSchema();
  const result = await getPool().query<{ data: unknown }>(
    "select data from articles where slug = $1 limit 1",
    [slug],
  );
  return result.rows[0]?.data as import("@/types").Article | undefined;
}

export async function getEventBySlug(slug: string) {
  await ensureSchema();
  const result = await getPool().query<{ data: unknown }>(
    "select data from events where slug = $1 limit 1",
    [slug],
  );
  return result.rows[0]?.data as import("@/types").EventItem | undefined;
}

export async function getListingBySlug(slug: string) {
  await ensureSchema();
  const result = await getPool().query<{ data: unknown }>(
    "select data from listings where slug = $1 limit 1",
    [slug],
  );
  return result.rows[0]?.data as import("@/types").Listing | undefined;
}

export async function recordAdEvent(adId: string, eventType: "impression" | "click") {
  await ensureSchema();
  await seedIfEmpty();

  const client = await getPool().connect();
  try {
    await client.query("begin");
    const adResult = await client.query<{ data: AdPlacement }>(
      "select data from ads where id = $1 for update",
      [adId],
    );
    const ad = adResult.rows[0]?.data;
    if (!ad || ad.status !== "active") {
      await client.query("rollback");
      return ad;
    }

    const next: AdPlacement = {
      ...ad,
      impressions: ad.impressions + (eventType === "impression" ? 1 : 0),
      clicks: ad.clicks + (eventType === "click" ? 1 : 0),
    };

    await client.query("insert into ad_events (ad_id, event_type) values ($1, $2)", [
      adId,
      eventType,
    ]);
    await client.query("update ads set data = $2 where id = $1", [adId, JSON.stringify(next)]);
    await client.query("commit");
    return next;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function addNewsletterSubscriber(email: string) {
  await ensureSchema();
  const normalised = email.trim().toLowerCase();
  await getPool().query(
    "insert into newsletter_subscribers (email) values ($1) on conflict do nothing",
    [normalised],
  );
  await getPool().query(
    "insert into app_records (collection, id, data) values ($1, $2, $3) on conflict do nothing",
    ["newsletter", normalised, JSON.stringify({ email: normalised })],
  );
}

export async function addPublicSubmission(submission: Submission) {
  await ensureSchema();
  await getPool().query("insert into submissions (id, data) values ($1, $2)", [
    submission.id,
    JSON.stringify(submission),
  ]);
  await getPool().query("insert into app_records (collection, id, data) values ($1, $2, $3)", [
    "submissions",
    submission.id,
    JSON.stringify(submission),
  ]);
}

export async function incrementOfferRedemption(offerId: string) {
  await ensureSchema();
  const result = await getPool().query<{ data: unknown }>("select data from offers where id = $1", [
    offerId,
  ]);
  const current = result.rows[0]?.data as { redemptionCount?: number } | undefined;
  if (!current) throw new Error("Offer not found.");
  const next = {
    ...current,
    redemptionCount: Number(current.redemptionCount ?? 0) + 1,
  };
  await getPool().query("update offers set data = $2 where id = $1", [
    offerId,
    JSON.stringify(next),
  ]);
  await getPool().query(
    "insert into app_records (collection, id, data) values ($1, $2, $3) on conflict (collection, id) do update set data = excluded.data",
    ["offers", offerId, JSON.stringify(next)],
  );
  return next;
}
