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
