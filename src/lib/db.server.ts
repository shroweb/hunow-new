import process from "node:process";
import crypto from "node:crypto";
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
let seedReady: Promise<void> | undefined;

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and start Docker Postgres.",
    );
  }
  return databaseUrl;
}

export function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString: getDatabaseUrl() });
  }
  return pool;
}

const SCHEMA_SQL = `
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists articles (
  id text primary key,
  data jsonb not null,
  status text generated always as (data->>'status') stored,
  slug text generated always as (data->>'slug') stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists events (
  id text primary key,
  data jsonb not null,
  status text generated always as (data->>'status') stored,
  slug text generated always as (data->>'slug') stored,
  start_date text generated always as (data->>'startDate') stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists listings (
  id text primary key,
  data jsonb not null,
  slug text generated always as (data->>'slug') stored,
  category text generated always as (data->>'category') stored,
  area text generated always as (data->>'area') stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists offers (
  id text primary key,
  data jsonb not null,
  listing_id text generated always as (data->>'listingId') stored,
  status text generated always as (data->>'status') stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists submissions (
  id text primary key,
  data jsonb not null,
  status text generated always as (data->>'status') stored,
  submission_type text generated always as (data->>'type') stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists ads (
  id text primary key,
  data jsonb not null,
  status text generated always as (data->>'status') stored,
  placement text generated always as (data->>'placement') stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists media (
  id text primary key,
  data jsonb not null,
  url text generated always as (data->>'url') stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists newsletter_subscribers (
  email text primary key,
  created_at timestamptz not null default now()
);
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
create table if not exists reviews (
  id text primary key,
  listing_id text not null,
  user_id text not null references users(id) on delete cascade,
  user_name text not null,
  rating integer not null check (rating between 1 and 5),
  body text,
  created_at timestamptz not null default now(),
  unique(listing_id, user_id)
);
create table if not exists password_reset_tokens (
  token text primary key,
  user_id text not null references users(id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists ad_events (
  id bigserial primary key,
  ad_id text not null references ads(id) on delete cascade,
  event_type text not null check (event_type in ('impression', 'click')),
  occurred_at timestamptz not null default now()
);
create table if not exists app_records (
  collection text not null,
  id text not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (collection, id)
);
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
create index if not exists articles_slug_idx on articles (slug);
create index if not exists articles_status_idx on articles (status);
create index if not exists events_slug_idx on events (slug);
create index if not exists events_status_idx on events (status);
create index if not exists listings_slug_idx on listings (slug);
create index if not exists offers_listing_id_idx on offers (listing_id);
create index if not exists offers_status_idx on offers (status);
create index if not exists submissions_status_idx on submissions (status);
create index if not exists ads_status_idx on ads (status);
create index if not exists media_url_idx on media (url);
create index if not exists users_email_idx on users (email);
create index if not exists sessions_user_id_idx on sessions (user_id);
create index if not exists sessions_expires_at_idx on sessions (expires_at);
create index if not exists ad_events_ad_id_idx on ad_events (ad_id);
create index if not exists app_records_collection_idx on app_records (collection);
create index if not exists saved_items_user_id_idx on saved_items (user_id);
create index if not exists password_reset_tokens_user_id_idx on password_reset_tokens (user_id);
drop trigger if exists articles_set_updated_at on articles;
create trigger articles_set_updated_at before update on articles for each row execute function set_updated_at();
drop trigger if exists events_set_updated_at on events;
create trigger events_set_updated_at before update on events for each row execute function set_updated_at();
drop trigger if exists listings_set_updated_at on listings;
create trigger listings_set_updated_at before update on listings for each row execute function set_updated_at();
drop trigger if exists offers_set_updated_at on offers;
create trigger offers_set_updated_at before update on offers for each row execute function set_updated_at();
drop trigger if exists submissions_set_updated_at on submissions;
create trigger submissions_set_updated_at before update on submissions for each row execute function set_updated_at();
drop trigger if exists ads_set_updated_at on ads;
create trigger ads_set_updated_at before update on ads for each row execute function set_updated_at();
drop trigger if exists media_set_updated_at on media;
create trigger media_set_updated_at before update on media for each row execute function set_updated_at();
drop trigger if exists users_set_updated_at on users;
create trigger users_set_updated_at before update on users for each row execute function set_updated_at();
drop trigger if exists app_records_set_updated_at on app_records;
create trigger app_records_set_updated_at before update on app_records for each row execute function set_updated_at();

create table if not exists redirects (
  id text primary key,
  from_path text not null unique,
  to_path text not null,
  permanent boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists redirects_from_path_idx on redirects (from_path);

create table if not exists taxonomy (
  key text primary key,
  items jsonb not null default '[]'
);

create table if not exists article_comments (
  id text primary key,
  article_id text not null,
  author_name text not null,
  author_email text not null,
  body text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists article_comments_article_id_idx on article_comments (article_id);
create index if not exists article_comments_approved_idx on article_comments (approved);

create table if not exists site_settings (
  key text primary key,
  value text not null default ''
);

create table if not exists listing_claims (
  id text primary key,
  listing_id text not null,
  user_id text not null references users(id) on delete cascade,
  message text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists listing_claims_status_idx on listing_claims (status);
create index if not exists listing_claims_listing_id_idx on listing_claims (listing_id);

create table if not exists site_analytics (
  id bigserial primary key,
  event_type text not null,
  path text,
  label text,
  created_at timestamptz not null default now()
);
create index if not exists site_analytics_event_type_idx on site_analytics (event_type);
create index if not exists site_analytics_created_at_idx on site_analytics (created_at);
`;

async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = getPool()
      .query(SCHEMA_SQL)
      .then(() => undefined);
  }
  await schemaReady;
}

async function ensureSeeded() {
  await ensureSchema();
  // Seed once per function instance so any entry point (article, event, place page)
  // gets seed data without requiring a store hydration first.
  if (!seedReady) {
    seedReady = seedIfEmpty();
  }
  await seedReady;
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
  const count = await typedRecordCount();
  if (count === 0) {
    // First run — full seed (including legacy migration)
    await saveDatabaseStore((await legacyStore()) ?? fallbackStore);
    return;
  }
  // DB already has data — insert any seed records that don't exist yet (new additions).
  // DO NOTHING on conflict so admin edits to existing records are never overwritten.
  const editorialCollections = ["articles", "events", "listings", "media"] as const;
  for (const collection of editorialCollections) {
    const records = fallbackStore[collection] as StoredRecord[];
    for (const record of records) {
      await getPool().query(
        `insert into ${tables[collection]} (id, data) values ($1, $2) on conflict (id) do nothing`,
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

export async function resetDatabaseToEmpty() {
  await ensureSchema();
  const client = await getPool().connect();
  try {
    await client.query("begin");
    for (const table of Object.values(tables)) {
      await client.query(`delete from ${table}`);
    }
    await client.query("delete from app_records");
    await client.query("delete from newsletter_subscribers");
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function getArticleBySlug(slug: string) {
  await ensureSeeded();
  const result = await getPool().query<{ data: unknown }>(
    "select data from articles where slug = $1 limit 1",
    [slug],
  );
  return result.rows[0]?.data as import("@/types").Article | undefined;
}

export async function getEventBySlug(slug: string) {
  await ensureSeeded();
  const result = await getPool().query<{ data: unknown }>(
    "select data from events where slug = $1 limit 1",
    [slug],
  );
  return result.rows[0]?.data as import("@/types").EventItem | undefined;
}

export async function getListingBySlug(slug: string) {
  await ensureSeeded();
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

export async function getAllRedirects() {
  await ensureSchema();
  const result = await getPool().query<{
    id: string;
    from_path: string;
    to_path: string;
    permanent: boolean;
    created_at: string;
  }>(
    "select id, from_path, to_path, permanent, created_at from redirects order by created_at desc",
  );
  return result.rows.map((r) => ({
    id: r.id,
    from: r.from_path,
    to: r.to_path,
    permanent: r.permanent,
    createdAt: r.created_at,
  }));
}

export async function upsertRedirect(id: string, from: string, to: string, permanent: boolean) {
  await ensureSchema();
  const normalFrom = from.startsWith("/") ? from : `/${from}`;
  await getPool().query(
    `insert into redirects (id, from_path, to_path, permanent)
     values ($1, $2, $3, $4)
     on conflict (id) do update set from_path = $2, to_path = $3, permanent = $4`,
    [id, normalFrom, to, permanent],
  );
}

export async function deleteRedirect(id: string) {
  await ensureSchema();
  await getPool().query("delete from redirects where id = $1", [id]);
}

export async function checkRedirect(path: string) {
  await ensureSchema();
  const result = await getPool().query<{ to_path: string; permanent: boolean }>(
    "select to_path, permanent from redirects where from_path = $1 limit 1",
    [path],
  );
  return result.rows[0] ?? null;
}

const TAXONOMY_DEFAULTS: Record<string, string[]> = {
  event_categories: [
    "Music",
    "Food & Drink",
    "Arts",
    "Comedy",
    "Family",
    "Theatre",
    "Nightlife",
    "Sport",
    "Markets",
    "Community",
    "Talks & Lectures",
    "Exhibitions",
  ],
  listing_categories: [
    "Restaurants",
    "Bars & Pubs",
    "Cafes",
    "Takeaways",
    "Shopping",
    "Entertainment",
    "Health & Beauty",
    "Hotels",
    "Attractions",
    "Services",
  ],
  areas: [
    "Old Town",
    "Fruit Market",
    "City Centre",
    "Avenues",
    "Hessle Road",
    "Marina",
    "East Hull",
    "Bransholme",
    "Kingswood",
    "Beverley Road",
    "Anlaby Road",
    "Spring Bank",
  ],
};

export async function getTaxonomyKey(key: string): Promise<string[]> {
  await ensureSchema();
  const result = await getPool().query<{ items: string[] }>(
    "select items from taxonomy where key = $1",
    [key],
  );
  if (result.rows[0]) return result.rows[0].items;
  // Seed defaults on first access
  const defaults = TAXONOMY_DEFAULTS[key] ?? [];
  await getPool().query(
    "insert into taxonomy (key, items) values ($1, $2) on conflict (key) do nothing",
    [key, JSON.stringify(defaults)],
  );
  return defaults;
}

export async function getAllTaxonomy(): Promise<Record<string, string[]>> {
  await ensureSchema();
  // Ensure all default keys exist
  for (const [key, defaults] of Object.entries(TAXONOMY_DEFAULTS)) {
    await getPool().query(
      "insert into taxonomy (key, items) values ($1, $2) on conflict (key) do nothing",
      [key, JSON.stringify(defaults)],
    );
  }
  const result = await getPool().query<{ key: string; items: string[] }>(
    "select key, items from taxonomy order by key",
  );
  return Object.fromEntries(result.rows.map((r) => [r.key, r.items]));
}

export async function setTaxonomyKey(key: string, items: string[]) {
  await ensureSchema();
  await getPool().query(
    "insert into taxonomy (key, items) values ($1, $2) on conflict (key) do update set items = $2",
    [key, JSON.stringify(items)],
  );
}

// ---- Article comments ----

export interface ArticleComment {
  id: string;
  articleId: string;
  authorName: string;
  authorEmail: string;
  body: string;
  approved: boolean;
  createdAt: string;
}

export async function getApprovedComments(articleId: string): Promise<ArticleComment[]> {
  await ensureSchema();
  const r = await getPool().query<{
    id: string;
    article_id: string;
    author_name: string;
    author_email: string;
    body: string;
    approved: boolean;
    created_at: string;
  }>(
    "select * from article_comments where article_id = $1 and approved = true order by created_at asc",
    [articleId],
  );
  return r.rows.map((row) => ({
    id: row.id,
    articleId: row.article_id,
    authorName: row.author_name,
    authorEmail: row.author_email,
    body: row.body,
    approved: row.approved,
    createdAt: row.created_at,
  }));
}

export async function getAllComments(): Promise<ArticleComment[]> {
  await ensureSchema();
  const r = await getPool().query<{
    id: string;
    article_id: string;
    author_name: string;
    author_email: string;
    body: string;
    approved: boolean;
    created_at: string;
  }>("select * from article_comments order by created_at desc");
  return r.rows.map((row) => ({
    id: row.id,
    articleId: row.article_id,
    authorName: row.author_name,
    authorEmail: row.author_email,
    body: row.body,
    approved: row.approved,
    createdAt: row.created_at,
  }));
}

export async function insertComment(c: ArticleComment) {
  await ensureSchema();
  await getPool().query(
    "insert into article_comments (id, article_id, author_name, author_email, body, approved) values ($1, $2, $3, $4, $5, $6)",
    [c.id, c.articleId, c.authorName, c.authorEmail, c.body, c.approved],
  );
}

export async function setCommentApproved(id: string, approved: boolean) {
  await ensureSchema();
  await getPool().query("update article_comments set approved = $2 where id = $1", [id, approved]);
}

export async function deleteComment(id: string) {
  await ensureSchema();
  await getPool().query("delete from article_comments where id = $1", [id]);
}

// ---- Site settings ----

const SETTING_DEFAULTS: Record<string, string> = {
  // Site identity
  site_name: "HU NOW",
  site_tagline: "Hull's Independent City Guide",
  // SEO / metadata
  meta_description: "Events, places, stories and independent businesses across Hull.",
  meta_description_og: "Find what's on, where to eat and what to explore in Hull.",
  og_image: "",
  ga_id: "",
  // Contact
  contact_email: "hello@hunow.co.uk",
  contact_phone: "",
  privacy_url: "",
  // Social
  social_facebook: "",
  social_instagram: "",
  social_twitter: "",
  social_tiktok: "",
  social_youtube: "",
};

export async function getSiteSettings(): Promise<Record<string, string>> {
  await ensureSchema();
  for (const [key, value] of Object.entries(SETTING_DEFAULTS)) {
    await getPool().query(
      "insert into site_settings (key, value) values ($1, $2) on conflict (key) do nothing",
      [key, value],
    );
  }
  const r = await getPool().query<{ key: string; value: string }>(
    "select key, value from site_settings",
  );
  return Object.fromEntries(r.rows.map((row) => [row.key, row.value]));
}

export async function setSiteSetting(key: string, value: string) {
  await ensureSchema();
  await getPool().query(
    "insert into site_settings (key, value) values ($1, $2) on conflict (key) do update set value = $2",
    [key, value],
  );
}

export interface ListingClaimRow {
  id: string;
  listingId: string;
  listingName: string;
  userId: string;
  userName: string;
  userEmail: string;
  message: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export async function createListingClaim(input: {
  listingId: string;
  userId: string;
  message: string;
}) {
  await ensureSchema();
  const existing = await getPool().query<{ id: string }>(
    "select id from listing_claims where listing_id = $1 and user_id = $2 and status = 'pending' limit 1",
    [input.listingId, input.userId],
  );
  if (existing.rows[0]) return { ok: true, id: existing.rows[0].id };
  const id = crypto.randomUUID();
  await getPool().query(
    "insert into listing_claims (id, listing_id, user_id, message) values ($1, $2, $3, $4)",
    [id, input.listingId, input.userId, input.message],
  );
  return { ok: true, id };
}

export async function getListingClaims(status = "pending"): Promise<ListingClaimRow[]> {
  await ensureSchema();
  const result = await getPool().query<{
    id: string;
    listing_id: string;
    listing_name: string | null;
    user_id: string;
    user_name: string;
    user_email: string;
    message: string | null;
    status: ListingClaimRow["status"];
    created_at: Date;
  }>(
    `
    select
      listing_claims.id,
      listing_claims.listing_id,
      listings.data->>'name' as listing_name,
      listing_claims.user_id,
      users.name as user_name,
      users.email as user_email,
      listing_claims.message,
      listing_claims.status,
      listing_claims.created_at
    from listing_claims
    join users on users.id = listing_claims.user_id
    left join listings on listings.id = listing_claims.listing_id
    where ($1 = 'all' or listing_claims.status = $1)
    order by listing_claims.created_at desc
    `,
    [status],
  );
  return result.rows.map((row) => ({
    id: row.id,
    listingId: row.listing_id,
    listingName: row.listing_name ?? "Unknown listing",
    userId: row.user_id,
    userName: row.user_name,
    userEmail: row.user_email,
    message: row.message ?? "",
    status: row.status,
    createdAt: row.created_at.toISOString(),
  }));
}

export async function moderateListingClaim(claimId: string, action: "approve" | "reject") {
  await ensureSchema();
  const claim = await getPool().query<{ listing_id: string; user_id: string }>(
    "select listing_id, user_id from listing_claims where id = $1",
    [claimId],
  );
  const row = claim.rows[0];
  if (!row) throw new Error("Claim not found.");
  const status = action === "approve" ? "approved" : "rejected";
  await getPool().query("update listing_claims set status = $2, updated_at = now() where id = $1", [
    claimId,
    status,
  ]);
  if (action === "approve") {
    await getPool().query(
      `
      update listings
      set data = jsonb_set(
        jsonb_set(data, '{ownerUserId}', to_jsonb($2::text), true),
        '{isVerified}', 'true'::jsonb,
        true
      )
      where id = $1
      `,
      [row.listing_id, row.user_id],
    );
  }
  return { ok: true };
}

export async function getOwnedListings(userId: string) {
  await ensureSeeded();
  const result = await getPool().query<{ data: unknown }>(
    "select data from listings where data->>'ownerUserId' = $1 order by data->>'name'",
    [userId],
  );
  return result.rows.map((row) => row.data) as import("@/types").Listing[];
}

export async function updateOwnedListing(
  userId: string,
  listingId: string,
  patch: Pick<
    import("@/types").Listing,
    "description" | "openingHours" | "website" | "phone" | "email" | "hours"
  >,
) {
  await ensureSchema();
  const result = await getPool().query<{ data: import("@/types").Listing }>(
    "select data from listings where id = $1 and data->>'ownerUserId' = $2",
    [listingId, userId],
  );
  const listing = result.rows[0]?.data;
  if (!listing) throw new Error("Listing not found or not owned by this account.");
  const next = { ...listing, ...patch };
  await getPool().query("update listings set data = $2 where id = $1", [
    listingId,
    JSON.stringify(next),
  ]);
  return next;
}

export async function recordAnalyticsEvent(input: {
  eventType: string;
  path?: string;
  label?: string;
}) {
  await ensureSchema();
  await getPool().query(
    "insert into site_analytics (event_type, path, label) values ($1, $2, $3)",
    [input.eventType, input.path ?? null, input.label ?? null],
  );
  return { ok: true };
}

export async function getAnalyticsSummary() {
  await ensureSchema();
  const [eventsByType, popularPaths, searches, adEvents, totals] = await Promise.all([
    getPool().query<{ event_type: string; count: string }>(
      "select event_type, count(*)::text as count from site_analytics group by event_type order by count(*) desc",
    ),
    getPool().query<{ path: string; count: string }>(
      "select path, count(*)::text as count from site_analytics where path is not null group by path order by count(*) desc limit 10",
    ),
    getPool().query<{ label: string; count: string }>(
      "select label, count(*)::text as count from site_analytics where event_type = 'search' and label is not null group by label order by count(*) desc limit 10",
    ),
    getPool().query<{ event_type: string; count: string }>(
      "select event_type, count(*)::text as count from ad_events group by event_type",
    ),
    getPool().query<{
      users: string;
      subscribers: string;
      claims: string;
    }>(
      `
      select
        (select count(*)::text from users) as users,
        (select count(*)::text from newsletter_subscribers) as subscribers,
        (select count(*)::text from listing_claims where status = 'pending') as claims
      `,
    ),
  ]);
  return {
    eventsByType: eventsByType.rows.map((row) => ({
      label: row.event_type,
      count: Number(row.count),
    })),
    popularPaths: popularPaths.rows.map((row) => ({ label: row.path, count: Number(row.count) })),
    searches: searches.rows.map((row) => ({ label: row.label, count: Number(row.count) })),
    adEvents: adEvents.rows.map((row) => ({ label: row.event_type, count: Number(row.count) })),
    totals: {
      users: Number(totals.rows[0]?.users ?? 0),
      subscribers: Number(totals.rows[0]?.subscribers ?? 0),
      pendingClaims: Number(totals.rows[0]?.claims ?? 0),
    },
  };
}

export async function getNewsletterBuilderData() {
  await ensureSeeded();
  const store = await getDatabaseStore();
  return {
    subscribers: store.newsletter.length,
    articles: store.articles
      .filter((article) => article.status === "published")
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .slice(0, 8),
    events: store.events
      .filter((event) => event.status === "published")
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
      .slice(0, 8),
    offers: store.offers.filter((offer) => offer.status === "active").slice(0, 8),
    listings: store.listings
      .filter((listing) => listing.isFeatured || listing.isHiddenGem)
      .slice(0, 8),
  };
}
