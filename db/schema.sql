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

create index if not exists reviews_listing_id_idx on reviews (listing_id);

create table if not exists password_reset_tokens (
  token text primary key,
  user_id text not null references users(id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists password_reset_tokens_user_id_idx on password_reset_tokens (user_id);

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
create index if not exists collections_slug_idx on collections (slug);
create index if not exists collections_status_idx on collections (status);
create index if not exists users_email_idx on users (email);
create index if not exists sessions_user_id_idx on sessions (user_id);
create index if not exists sessions_expires_at_idx on sessions (expires_at);
create index if not exists ad_events_ad_id_idx on ad_events (ad_id);
create index if not exists app_records_collection_idx on app_records (collection);

drop trigger if exists articles_set_updated_at on articles;
create trigger articles_set_updated_at
before update on articles
for each row execute function set_updated_at();

drop trigger if exists events_set_updated_at on events;
create trigger events_set_updated_at
before update on events
for each row execute function set_updated_at();

drop trigger if exists listings_set_updated_at on listings;
create trigger listings_set_updated_at
before update on listings
for each row execute function set_updated_at();

drop trigger if exists offers_set_updated_at on offers;
create trigger offers_set_updated_at
before update on offers
for each row execute function set_updated_at();

drop trigger if exists submissions_set_updated_at on submissions;
create trigger submissions_set_updated_at
before update on submissions
for each row execute function set_updated_at();

drop trigger if exists ads_set_updated_at on ads;
create trigger ads_set_updated_at
before update on ads
for each row execute function set_updated_at();

drop trigger if exists media_set_updated_at on media;
create trigger media_set_updated_at
before update on media
for each row execute function set_updated_at();

drop trigger if exists users_set_updated_at on users;
create trigger users_set_updated_at
before update on users
for each row execute function set_updated_at();

drop trigger if exists app_records_set_updated_at on app_records;
create trigger app_records_set_updated_at
before update on app_records
for each row execute function set_updated_at();

drop trigger if exists newsletter_campaigns_set_updated_at on newsletter_campaigns;
create trigger newsletter_campaigns_set_updated_at
before update on newsletter_campaigns
for each row execute function set_updated_at();

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

-- ── App / loyalty ──────────────────────────────────────────────────────────

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
