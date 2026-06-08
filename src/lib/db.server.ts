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
  collections: "collections",
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
  collections: [],
  newsletter: [],
};

const emptyFallbackStore: AppStore = {
  articles: [],
  events: [],
  listings: [],
  offers: [],
  submissions: [],
  ads: [],
  media: [],
  collections: [],
  newsletter: [],
};

let pool: pg.Pool | undefined;
let schemaReady: Promise<void> | undefined;
let seedReady: Promise<void> | undefined;

function shouldSeedDemoContent() {
  if (process.env.HUNOW_ENABLE_DEMO_SEED === "true") return true;
  if (process.env.HUNOW_ENABLE_DEMO_SEED === "false") return false;
  return process.env.NODE_ENV !== "production" && process.env.VERCEL_ENV !== "production";
}

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
create table if not exists collections (
  id text primary key,
  data jsonb not null,
  slug text generated always as (data->>'slug') stored,
  status text generated always as (data->>'status') stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists newsletter_subscribers (
  email text primary key,
  created_at timestamptz not null default now()
);
alter table newsletter_subscribers add column if not exists unsubscribe_token text;
alter table newsletter_subscribers add column if not exists segments jsonb not null default '["all"]'::jsonb;
create unique index if not exists newsletter_unsubscribe_token_idx on newsletter_subscribers (unsubscribe_token) where unsubscribe_token is not null;
create table if not exists newsletter_campaigns (
  id text primary key,
  subject text not null,
  intro text not null,
  segment text not null default 'all',
  selected jsonb not null,
  html text not null,
  plain_text text not null,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'sent', 'failed')),
  scheduled_for timestamptz,
  recipient_count integer not null default 0,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists newsletter_campaigns_status_idx on newsletter_campaigns (status);
create index if not exists newsletter_campaigns_created_at_idx on newsletter_campaigns (created_at);
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
create index if not exists articles_search_idx on articles using gin (
  to_tsvector('english',
    coalesce(data->>'title', '') || ' ' ||
    coalesce(data->>'excerpt', '') || ' ' ||
    coalesce(data->>'category', '') || ' ' ||
    coalesce(data->>'subcategory', '') || ' ' ||
    coalesce(data->>'tags', '')
  )
);
create index if not exists events_slug_idx on events (slug);
create index if not exists events_status_idx on events (status);
create index if not exists events_search_idx on events using gin (
  to_tsvector('english',
    coalesce(data->>'title', '') || ' ' ||
    coalesce(data->>'description', '') || ' ' ||
    coalesce(data->>'category', '') || ' ' ||
    coalesce(data->>'locationName', '') || ' ' ||
    coalesce(data->>'address', '')
  )
);
create index if not exists listings_slug_idx on listings (slug);
create index if not exists listings_search_idx on listings using gin (
  to_tsvector('english',
    coalesce(data->>'name', '') || ' ' ||
    coalesce(data->>'description', '') || ' ' ||
    coalesce(data->>'category', '') || ' ' ||
    coalesce(data->>'area', '') || ' ' ||
    coalesce(data->>'tags', '')
  )
);
create index if not exists offers_listing_id_idx on offers (listing_id);
create index if not exists offers_status_idx on offers (status);
create index if not exists offers_search_idx on offers using gin (
  to_tsvector('english',
    coalesce(data->>'title', '') || ' ' ||
    coalesce(data->>'businessName', '') || ' ' ||
    coalesce(data->>'description', '') || ' ' ||
    coalesce(data->>'category', '')
  )
);
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
create index if not exists collections_slug_idx on collections (slug);
create index if not exists collections_status_idx on collections (status);
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
drop trigger if exists collections_set_updated_at on collections;
create trigger collections_set_updated_at before update on collections for each row execute function set_updated_at();
drop trigger if exists users_set_updated_at on users;
create trigger users_set_updated_at before update on users for each row execute function set_updated_at();
drop trigger if exists app_records_set_updated_at on app_records;
create trigger app_records_set_updated_at before update on app_records for each row execute function set_updated_at();
drop trigger if exists newsletter_campaigns_set_updated_at on newsletter_campaigns;
create trigger newsletter_campaigns_set_updated_at before update on newsletter_campaigns for each row execute function set_updated_at();

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
  proof_url text,
  admin_note text,
  decided_at timestamptz,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table listing_claims add column if not exists proof_url text;
alter table listing_claims add column if not exists admin_note text;
alter table listing_claims add column if not exists decided_at timestamptz;
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

create table if not exists db_initialized (
  initialized_at timestamptz not null default now()
);

create table if not exists polls (
  id text primary key,
  question text not null,
  options jsonb not null default '[]',
  status text not null default 'active' check (status in ('active', 'closed')),
  created_at timestamptz not null default now()
);
create index if not exists polls_status_idx on polls (status);

create table if not exists area_guides (
  area_key text primary key,
  intro text not null default '',
  featured_image text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists listing_updates (
  id text primary key,
  listing_id text not null,
  user_id text not null,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists listing_updates_listing_id_idx on listing_updates (listing_id);

alter table users add column if not exists avatar_url text;
alter table users add column if not exists bio text not null default '';

create table if not exists rate_limits (
  key text not null,
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (key, window_start)
);
create index if not exists rate_limits_window_start_idx on rate_limits (window_start);

alter table users add column if not exists app_role text not null default 'customer' check (app_role in ('customer', 'business'));

create table if not exists loyalty_cards (
  id text primary key,
  user_id text not null unique references users(id) on delete cascade,
  qr_token text not null unique,
  created_at timestamptz not null default now()
);
create index if not exists loyalty_cards_user_id_idx on loyalty_cards (user_id);
create index if not exists loyalty_cards_qr_token_idx on loyalty_cards (qr_token);

create table if not exists loyalty_points (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  offer_id text,
  listing_id text,
  points integer not null,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists loyalty_points_user_id_idx on loyalty_points (user_id);
create index if not exists loyalty_points_created_at_idx on loyalty_points (created_at desc);

create table if not exists app_redemptions (
  id text primary key,
  card_id text not null references loyalty_cards(id) on delete cascade,
  offer_id text not null,
  listing_id text,
  redeemed_by text not null references users(id),
  redeemed_at timestamptz not null default now()
);
create index if not exists app_redemptions_card_id_idx on app_redemptions (card_id);
create index if not exists app_redemptions_offer_id_idx on app_redemptions (offer_id);
create index if not exists app_redemptions_redeemed_at_idx on app_redemptions (redeemed_at desc);

create table if not exists app_push_subscriptions (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  token text not null unique,
  platform text,
  permission_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists app_push_subscriptions_user_id_idx on app_push_subscriptions (user_id);

create table if not exists web_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  segments text[] not null default '{all}',
  created_at timestamptz not null default now()
);
create index if not exists web_push_subscriptions_user_id_idx on web_push_subscriptions (user_id);
`;

export async function ensureSchema() {
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
    collections: [],
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
  const marker = await getPool().query("select 1 from db_initialized limit 1");
  if (marker.rowCount && marker.rowCount > 0) return;

  // Second guard: if the marker was accidentally removed but real content exists,
  // just restore the marker — never overwrite live data with seed data.
  const hasContent = await getPool().query(
    "select 1 from articles limit 1",
  );
  if (hasContent.rowCount && hasContent.rowCount > 0) {
    await getPool().query("insert into db_initialized default values");
    return;
  }

  await saveDatabaseStore(
    (await legacyStore()) ?? (shouldSeedDemoContent() ? fallbackStore : emptyFallbackStore),
  );
  await getPool().query("insert into db_initialized default values");
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

    // newsletter_subscribers is managed exclusively by addNewsletterSubscriber /
    // removeNewsletterSubscriber. Never touch it from a full-store save — the
    // in-memory store snapshot can be stale relative to direct DB writes and
    // would silently delete subscribers that signed up since the last hydration.

    await client.query("delete from app_records where collection != 'newsletter'");
    for (const collection of collections) {
      for (const record of store[collection] as StoredRecord[]) {
        await client.query("insert into app_records (collection, id, data) values ($1, $2, $3)", [
          collection,
          record.id,
          JSON.stringify(record),
        ]);
      }
    }

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

// ---- Targeted single-record writes (avoids full-store replace) ----

type UpsertTable = "articles" | "events" | "listings" | "offers" | "ads" | "media" | "collections";

async function upsertRecord(table: UpsertTable, id: string, data: unknown) {
  await ensureSchema();
  await getPool().query(
    `insert into ${table} (id, data) values ($1, $2)
     on conflict (id) do update set data = $2`,
    [id, JSON.stringify(data)],
  );
}

async function deleteRecord(table: UpsertTable, id: string) {
  await ensureSchema();
  await getPool().query(`delete from ${table} where id = $1`, [id]);
}

export async function upsertArticle(article: import("@/types").Article) {
  await upsertRecord("articles", article.id, article);
}
export async function deleteArticle(id: string) {
  await deleteRecord("articles", id);
}

export async function upsertEvent(event: import("@/types").EventItem) {
  await upsertRecord("events", event.id, event);
}
export async function deleteEvent(id: string) {
  await deleteRecord("events", id);
}
export async function bulkArchiveEvents(beforeDate: string) {
  await ensureSchema();
  const result = await getPool().query<{ id: string; data: import("@/types").EventItem }>(
    "select id, data from events where status = 'published' and start_date < $1",
    [beforeDate],
  );
  for (const row of result.rows) {
    const updated = { ...row.data, status: "expired" as const };
    await getPool().query("update events set data = $2 where id = $1", [
      row.id,
      JSON.stringify(updated),
    ]);
  }
  return result.rowCount ?? 0;
}

export async function upsertListing(listing: import("@/types").Listing) {
  await upsertRecord("listings", listing.id, listing);
}
export async function deleteListing(id: string) {
  await deleteRecord("listings", id);
}

export async function upsertOffer(offer: import("@/types").Offer) {
  await upsertRecord("offers", offer.id, offer);
}
export async function deleteOffer(id: string) {
  await deleteRecord("offers", id);
}

export async function searchContent(term: string) {
  await ensureSeeded();
  const query = term.trim();
  if (query.length < 2) {
    return { articles: [], events: [], listings: [], offers: [] };
  }
  const pool = getPool();
  const [articles, events, listings, offers] = await Promise.all([
    pool.query<{ data: import("@/types").Article }>(
      `
      select data
      from articles, websearch_to_tsquery('english', $1) q
      where status = 'published'
        and to_tsvector('english',
          coalesce(data->>'title', '') || ' ' ||
          coalesce(data->>'excerpt', '') || ' ' ||
          coalesce(data->>'category', '') || ' ' ||
          coalesce(data->>'subcategory', '') || ' ' ||
          coalesce(data->>'tags', '')
        ) @@ q
      order by ts_rank_cd(
        to_tsvector('english',
          coalesce(data->>'title', '') || ' ' ||
          coalesce(data->>'excerpt', '') || ' ' ||
          coalesce(data->>'category', '') || ' ' ||
          coalesce(data->>'subcategory', '') || ' ' ||
          coalesce(data->>'tags', '')
        ),
        q
      ) desc, data->>'publishedAt' desc
      limit 20
      `,
      [query],
    ),
    pool.query<{ data: import("@/types").EventItem }>(
      `
      select data
      from events, websearch_to_tsquery('english', $1) q
      where status = 'published'
        and to_tsvector('english',
          coalesce(data->>'title', '') || ' ' ||
          coalesce(data->>'description', '') || ' ' ||
          coalesce(data->>'category', '') || ' ' ||
          coalesce(data->>'locationName', '') || ' ' ||
          coalesce(data->>'address', '')
        ) @@ q
      order by data->>'startDate' asc
      limit 20
      `,
      [query],
    ),
    pool.query<{ data: import("@/types").Listing }>(
      `
      select data
      from listings, websearch_to_tsquery('english', $1) q
      where to_tsvector('english',
          coalesce(data->>'name', '') || ' ' ||
          coalesce(data->>'description', '') || ' ' ||
          coalesce(data->>'category', '') || ' ' ||
          coalesce(data->>'area', '') || ' ' ||
          coalesce(data->>'tags', '')
        ) @@ q
      order by (data->>'isFeatured')::boolean desc, data->>'name' asc
      limit 20
      `,
      [query],
    ),
    pool.query<{ data: import("@/types").Offer }>(
      `
      select data
      from offers, websearch_to_tsquery('english', $1) q
      where status = 'active'
        and coalesce(nullif(data->>'startDate', '')::date, date '0001-01-01') <= current_date
        and coalesce(nullif(data->>'endDate', '')::date, date '9999-12-31') >= current_date
        and to_tsvector('english',
          coalesce(data->>'title', '') || ' ' ||
          coalesce(data->>'businessName', '') || ' ' ||
          coalesce(data->>'description', '') || ' ' ||
          coalesce(data->>'category', '')
        ) @@ q
      order by (data->>'isFeatured')::boolean desc, data->>'endDate' asc
      limit 20
      `,
      [query],
    ),
  ]);
  return {
    articles: articles.rows.map((row) => row.data),
    events: events.rows.map((row) => row.data),
    listings: listings.rows.map((row) => row.data),
    offers: offers.rows.map((row) => row.data),
  };
}

export async function upsertAd(ad: import("@/types").AdPlacement) {
  await upsertRecord("ads", ad.id, ad);
}
export async function deleteAd(id: string) {
  await deleteRecord("ads", id);
}

export async function upsertMedia(asset: import("@/types").MediaAsset) {
  await upsertRecord("media", asset.id, asset);
}
export async function deleteMedia(id: string) {
  await deleteRecord("media", id);
}

export async function upsertCollection(collection: import("@/types").EditorialCollection) {
  await upsertRecord("collections", collection.id, collection);
}
export async function deleteCollection(id: string) {
  await deleteRecord("collections", id);
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
  seedReady = undefined;
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

export async function addNewsletterSubscriber(
  email: string,
  segments: ("events" | "offers" | "businesses")[] = [],
) {
  await ensureSchema();
  const normalised = email.trim().toLowerCase();
  const token = await makeUniqueUnsubscribeToken();
  const uniqueSegments = ["all", ...Array.from(new Set(segments))];
  await getPool().query(
    `insert into newsletter_subscribers (email, unsubscribe_token, segments)
     values ($1, $2, $3::jsonb)
     on conflict (email) do update set
       unsubscribe_token = coalesce(newsletter_subscribers.unsubscribe_token, excluded.unsubscribe_token),
       segments = excluded.segments`,
    [normalised, token, JSON.stringify(uniqueSegments)],
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
  proofUrl: string;
  adminNote: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  decidedAt: string | null;
}

export async function createListingClaim(input: {
  listingId: string;
  userId: string;
  message: string;
  proofUrl?: string;
}) {
  await ensureSchema();
  const existing = await getPool().query<{ id: string }>(
    "select id from listing_claims where listing_id = $1 and user_id = $2 and status = 'pending' limit 1",
    [input.listingId, input.userId],
  );
  if (existing.rows[0]) return { ok: true, id: existing.rows[0].id };
  const id = crypto.randomUUID();
  await getPool().query(
    "insert into listing_claims (id, listing_id, user_id, message, proof_url) values ($1, $2, $3, $4, $5)",
    [id, input.listingId, input.userId, input.message, input.proofUrl ?? ""],
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
    proof_url: string | null;
    admin_note: string | null;
    status: ListingClaimRow["status"];
    created_at: Date;
    updated_at: Date;
    decided_at: Date | null;
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
      listing_claims.proof_url,
      listing_claims.admin_note,
      listing_claims.status,
      listing_claims.created_at,
      listing_claims.updated_at,
      listing_claims.decided_at
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
    proofUrl: row.proof_url ?? "",
    adminNote: row.admin_note ?? "",
    status: row.status,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    decidedAt: row.decided_at?.toISOString() ?? null,
  }));
}

export async function moderateListingClaim(
  claimId: string,
  action: "approve" | "reject",
  adminNote = "",
) {
  await ensureSchema();
  const claim = await getPool().query<{ listing_id: string; user_id: string }>(
    "select listing_id, user_id from listing_claims where id = $1",
    [claimId],
  );
  const row = claim.rows[0];
  if (!row) throw new Error("Claim not found.");
  const status = action === "approve" ? "approved" : "rejected";
  await getPool().query(
    "update listing_claims set status = $2, admin_note = $3, decided_at = now(), updated_at = now() where id = $1",
    [claimId, status, adminNote],
  );
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

export async function getOwnedOffers(userId: string) {
  await ensureSeeded();
  const result = await getPool().query<{ data: unknown }>(
    `
    select offers.data
    from offers
    join listings on listings.id = offers.listing_id
    where listings.data->>'ownerUserId' = $1
    order by offers.updated_at desc
    `,
    [userId],
  );
  return result.rows.map((row) => row.data) as import("@/types").Offer[];
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

export async function getAnalyticsSummary(days?: number) {
  await ensureSchema();
  const dateClause = days ? `and created_at > now() - interval '${Number(days)} days'` : "";
  const adDateClause = days ? `where occurred_at > now() - interval '${Number(days)} days'` : "";
  const [eventsByType, popularPaths, searches, adEvents, totals] = await Promise.all([
    getPool().query<{ event_type: string; count: string }>(
      `select event_type, count(*)::text as count from site_analytics where true ${dateClause} group by event_type order by count(*) desc`,
    ),
    getPool().query<{ path: string; count: string }>(
      `select path, count(*)::text as count from site_analytics where path is not null ${dateClause} group by path order by count(*) desc limit 10`,
    ),
    getPool().query<{ label: string; count: string }>(
      `select label, count(*)::text as count from site_analytics where event_type = 'search' and label is not null ${dateClause} group by label order by count(*) desc limit 10`,
    ),
    getPool().query<{ event_type: string; count: string }>(
      `select event_type, count(*)::text as count from ad_events ${adDateClause} group by event_type`,
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

export type NewsletterSegment = "all" | "events" | "offers" | "businesses";
export type NewsletterCampaignStatus = "draft" | "scheduled" | "sent" | "failed";

export interface NewsletterCampaignInput {
  subject: string;
  intro: string;
  segment: NewsletterSegment;
  selected: {
    articles: string[];
    events: string[];
    offers: string[];
    listings: string[];
  };
  html: string;
  text: string;
  status: NewsletterCampaignStatus;
  scheduledFor?: string | null;
  recipientCount?: number;
  sentAt?: string | null;
}

export async function getNewsletterCampaignHistory() {
  await ensureSchema();
  const result = await getPool().query<{
    id: string;
    subject: string;
    intro: string;
    segment: NewsletterSegment;
    status: NewsletterCampaignStatus;
    scheduled_for: string | null;
    recipient_count: number;
    sent_at: string | null;
    created_at: string;
  }>(
    `select id, subject, intro, segment, status, scheduled_for, recipient_count, sent_at, created_at
     from newsletter_campaigns
     order by created_at desc
     limit 20`,
  );

  return result.rows.map((row) => ({
    id: row.id,
    subject: row.subject,
    intro: row.intro,
    segment: row.segment,
    status: row.status,
    scheduledFor: row.scheduled_for,
    recipientCount: Number(row.recipient_count),
    sentAt: row.sent_at,
    createdAt: row.created_at,
  }));
}

export async function saveNewsletterCampaign(
  input: NewsletterCampaignInput,
  id = crypto.randomUUID(),
) {
  await ensureSchema();
  await getPool().query(
    `insert into newsletter_campaigns (
      id, subject, intro, segment, selected, html, plain_text, status, scheduled_for, recipient_count, sent_at
    ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    on conflict (id) do update set
      subject = excluded.subject,
      intro = excluded.intro,
      segment = excluded.segment,
      selected = excluded.selected,
      html = excluded.html,
      plain_text = excluded.plain_text,
      status = excluded.status,
      scheduled_for = excluded.scheduled_for,
      recipient_count = excluded.recipient_count,
      sent_at = excluded.sent_at`,
    [
      id,
      input.subject,
      input.intro,
      input.segment,
      JSON.stringify(input.selected),
      input.html,
      input.text,
      input.status,
      input.scheduledFor || null,
      input.recipientCount ?? 0,
      input.sentAt || null,
    ],
  );
  return id;
}

async function makeUniqueUnsubscribeToken() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const token = crypto.randomBytes(24).toString("hex");
    const existing = await getPool().query<{ email: string }>(
      "select email from newsletter_subscribers where unsubscribe_token = $1",
      [token],
    );
    if (existing.rowCount === 0) return token;
  }
  return crypto.randomUUID().replaceAll("-", "");
}

export async function getNewsletterRecipients(segment: NewsletterSegment) {
  await ensureSchema();
  const result = await getPool().query<{
    email: string;
    unsubscribe_token: string | null;
  }>(
    `select email, unsubscribe_token
     from newsletter_subscribers
     where $1 = 'all' or segments ? $1
     order by created_at desc`,
    [segment],
  );

  const recipients = [];
  for (const row of result.rows) {
    const token = row.unsubscribe_token ?? (await makeUniqueUnsubscribeToken());
    if (!row.unsubscribe_token) {
      await getPool().query(
        "update newsletter_subscribers set unsubscribe_token = $2 where email = $1",
        [row.email, token],
      );
    }
    recipients.push({ email: row.email, unsubscribeToken: token });
  }

  return recipients;
}

export async function getNewsletterSubscriberSummary() {
  await ensureSchema();
  const result = await getPool().query<{
    email: string;
    unsubscribe_token: string | null;
    segments: string[];
    created_at: string;
  }>(
    `select email, unsubscribe_token, segments, created_at
     from newsletter_subscribers
     order by created_at desc`,
  );

  const subscribers = result.rows.map((row) => ({
    email: row.email,
    hasUnsubscribeToken: Boolean(row.unsubscribe_token),
    segments: Array.isArray(row.segments) ? row.segments : ["all"],
    createdAt: row.created_at,
  }));

  return {
    total: subscribers.length,
    segments: {
      all: subscribers.length,
      events: subscribers.filter((subscriber) => subscriber.segments.includes("events")).length,
      offers: subscribers.filter((subscriber) => subscriber.segments.includes("offers")).length,
      businesses: subscribers.filter((subscriber) => subscriber.segments.includes("businesses"))
        .length,
    },
    subscribers,
  };
}

export async function unsubscribeNewsletterToken(token: string) {
  await ensureSchema();
  const result = await getPool().query<{ email: string }>(
    "delete from newsletter_subscribers where unsubscribe_token = $1 returning email",
    [token],
  );
  if (result.rows[0]?.email) {
    await getPool().query("delete from app_records where collection = 'newsletter' and id = $1", [
      result.rows[0].email,
    ]);
  }
  return result.rows[0]?.email;
}

// ---- Polls ----

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface PollRow {
  id: string;
  question: string;
  options: PollOption[];
  status: "active" | "closed";
  createdAt: string;
}

function mapPollRow(row: {
  id: string;
  question: string;
  options: PollOption[];
  status: string;
  created_at: string;
}): PollRow {
  return {
    id: row.id,
    question: row.question,
    options: row.options,
    status: row.status as PollRow["status"],
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function getActivePolls(): Promise<PollRow[]> {
  await ensureSchema();
  const r = await getPool().query<{
    id: string;
    question: string;
    options: PollOption[];
    status: string;
    created_at: string;
  }>(
    "select id, question, options, status, created_at from polls where status = 'active' order by created_at desc",
  );
  return r.rows.map(mapPollRow);
}

export async function getAllPolls(): Promise<PollRow[]> {
  await ensureSchema();
  const r = await getPool().query<{
    id: string;
    question: string;
    options: PollOption[];
    status: string;
    created_at: string;
  }>("select id, question, options, status, created_at from polls order by created_at desc");
  return r.rows.map(mapPollRow);
}

export async function getPollById(id: string): Promise<PollRow | undefined> {
  await ensureSchema();
  const r = await getPool().query<{
    id: string;
    question: string;
    options: PollOption[];
    status: string;
    created_at: string;
  }>("select id, question, options, status, created_at from polls where id = $1 limit 1", [id]);
  return r.rows[0] ? mapPollRow(r.rows[0]) : undefined;
}

export async function createPoll(
  id: string,
  question: string,
  optionTexts: string[],
): Promise<void> {
  await ensureSchema();
  const options: PollOption[] = optionTexts.map((text, i) => ({
    id: String(i + 1),
    text,
    votes: 0,
  }));
  await getPool().query("insert into polls (id, question, options) values ($1, $2, $3)", [
    id,
    question,
    JSON.stringify(options),
  ]);
}

export async function voteOnPoll(pollId: string, optionId: string): Promise<PollRow | undefined> {
  await ensureSchema();
  const r = await getPool().query<{
    id: string;
    question: string;
    options: PollOption[];
    status: string;
    created_at: string;
  }>(
    `update polls
     set options = (
       select jsonb_agg(
         case when opt->>'id' = $2
         then jsonb_set(opt, '{votes}', to_jsonb((opt->>'votes')::int + 1))
         else opt end
       )
       from jsonb_array_elements(options) opt
     )
     where id = $1 and status = 'active'
     returning id, question, options, status, created_at`,
    [pollId, optionId],
  );
  return r.rows[0] ? mapPollRow(r.rows[0]) : undefined;
}

export async function setPollStatus(pollId: string, status: "active" | "closed"): Promise<void> {
  await ensureSchema();
  await getPool().query("update polls set status = $2 where id = $1", [pollId, status]);
}

export async function deletePoll(pollId: string): Promise<void> {
  await ensureSchema();
  await getPool().query("delete from polls where id = $1", [pollId]);
}

// ---- Area Guides ----

export interface AreaGuideRow {
  areaKey: string;
  intro: string;
  featuredImage: string;
  updatedAt: string;
}

export async function getAreaGuide(areaKey: string): Promise<AreaGuideRow | undefined> {
  await ensureSchema();
  const r = await getPool().query<{
    area_key: string;
    intro: string;
    featured_image: string;
    updated_at: string;
  }>("select area_key, intro, featured_image, updated_at from area_guides where area_key = $1", [
    areaKey,
  ]);
  const row = r.rows[0];
  if (!row) return undefined;
  return {
    areaKey: row.area_key,
    intro: row.intro,
    featuredImage: row.featured_image,
    updatedAt: row.updated_at,
  };
}

export async function getAllAreaGuides(): Promise<AreaGuideRow[]> {
  await ensureSchema();
  const r = await getPool().query<{
    area_key: string;
    intro: string;
    featured_image: string;
    updated_at: string;
  }>("select area_key, intro, featured_image, updated_at from area_guides order by area_key");
  return r.rows.map((row) => ({
    areaKey: row.area_key,
    intro: row.intro,
    featuredImage: row.featured_image,
    updatedAt: row.updated_at,
  }));
}

export async function upsertAreaGuide(
  areaKey: string,
  intro: string,
  featuredImage: string,
): Promise<void> {
  await ensureSchema();
  await getPool().query(
    `insert into area_guides (area_key, intro, featured_image)
     values ($1, $2, $3)
     on conflict (area_key) do update set intro = $2, featured_image = $3, updated_at = now()`,
    [areaKey, intro, featuredImage],
  );
}

// ---- Listing Updates ----

export interface ListingUpdateRow {
  id: string;
  listingId: string;
  userId: string;
  body: string;
  createdAt: string;
}

export async function getListingUpdates(listingId: string): Promise<ListingUpdateRow[]> {
  await ensureSchema();
  const r = await getPool().query<{
    id: string;
    listing_id: string;
    user_id: string;
    body: string;
    created_at: string;
  }>(
    "select id, listing_id, user_id, body, created_at from listing_updates where listing_id = $1 order by created_at desc",
    [listingId],
  );
  return r.rows.map((row) => ({
    id: row.id,
    listingId: row.listing_id,
    userId: row.user_id,
    body: row.body,
    createdAt: new Date(row.created_at).toISOString(),
  }));
}

export async function postListingUpdate(
  id: string,
  listingId: string,
  userId: string,
  body: string,
): Promise<void> {
  await ensureSchema();
  await getPool().query(
    "insert into listing_updates (id, listing_id, user_id, body) values ($1, $2, $3, $4)",
    [id, listingId, userId, body],
  );
}

export async function deleteListingUpdate(id: string, userId: string): Promise<void> {
  await ensureSchema();
  await getPool().query("delete from listing_updates where id = $1 and user_id = $2", [id, userId]);
}

// ---- Web Push subscriptions ----

export async function saveWebPushSubscription(input: {
  userId: string | null;
  endpoint: string;
  p256dh: string;
  auth: string;
  segments?: string[];
}): Promise<void> {
  await ensureSchema();
  await getPool().query(
    `insert into web_push_subscriptions (user_id, endpoint, p256dh, auth, segments)
     values ($1, $2, $3, $4, $5)
     on conflict (endpoint) do update set
       user_id = coalesce(excluded.user_id, web_push_subscriptions.user_id),
       p256dh = excluded.p256dh,
       auth = excluded.auth,
       segments = excluded.segments`,
    [input.userId, input.endpoint, input.p256dh, input.auth, input.segments ?? ["all"]],
  );
}

export async function deleteWebPushSubscription(endpoint: string): Promise<void> {
  await ensureSchema();
  await getPool().query("delete from web_push_subscriptions where endpoint = $1", [endpoint]);
}

// ---- Admin: assign listing owner ----

export async function assignListingOwner(listingId: string, userId: string): Promise<void> {
  await ensureSchema();
  const pool = getPool();
  // Set ownerUserId on the listing JSON
  await pool.query(
    `update listings set data = jsonb_set(data, '{ownerUserId}', to_jsonb($2::text)), updated_at = now() where id = $1`,
    [listingId, userId],
  );
  // Promote user to business role
  await pool.query(
    `update users set app_role = 'business', updated_at = now() where id = $1`,
    [userId],
  );
}

export async function findUserByEmail(email: string): Promise<{ id: string; name: string; email: string } | null> {
  await ensureSchema();
  const result = await getPool().query<{ id: string; name: string; email: string }>(
    "select id, name, email from users where lower(email) = lower($1) limit 1",
    [email],
  );
  return result.rows[0] ?? null;
}
