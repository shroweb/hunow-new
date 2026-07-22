# HU NOW Launch Guide

This guide covers the parts that must be completed outside code before HU NOW is truly production-ready.

## 1. Real Hull Content

Replace demo content through `/admin`.

Minimum launch content:

- 20-40 real listings with names, descriptions, categories, areas, addresses, contact details, opening hours, map coordinates, website/social links and at least one good image.
- 10-20 real events with confirmed dates, venues, ticket links and hero images.
- 8-12 real stories/articles with local editorial copy and real images.
- 5-10 real offers from businesses that have agreed to be listed.
- Real area guide intros and images for the areas you want live.

Use the admin dashboard Content QA panel to find demo references, missing images and expired active offers.

## 2. Seed Content Decision

Production no longer seeds demo content by default.

Use:

- `HUNOW_ENABLE_DEMO_SEED=false` for production.
- `HUNOW_ENABLE_DEMO_SEED=true` only for local/dev/demo databases where placeholder content is useful.

If a production database has already been seeded with demo content, remove or replace it in `/admin` before launch.

## 3. Resend Domain

In Resend:

1. Add the sending domain, for example `hunow.co.uk`.
2. Add the DNS records Resend gives you.
3. Wait until the domain shows as verified.
4. Create an API key.
5. Use verified sender addresses:
   - `NEWSLETTER_FROM=HU NOW <newsletter@hunow.co.uk>`
   - `EMAIL_FROM=HU NOW <hello@hunow.co.uk>`

Send a test newsletter from `/admin/newsletter` before sending a real campaign.

## 4. Vercel Environment Variables

Set these in Vercel Project Settings -> Environment Variables:

- `DATABASE_URL`
- `SITE_URL=https://your-production-domain`
- `ADMIN_EMAILS=your-admin@email.com`
- `APP_JWT_SECRET`
- `RESEND_API_KEY`
- `NEWSLETTER_FROM=HU NOW <newsletter@your-domain>`
- `EMAIL_FROM=HU NOW <hello@your-domain>`
- `CRON_SECRET`
- `HUNOW_ENABLE_DEMO_SEED=false`
- `HUNOW_ALLOW_FULL_STORE_SAVE=false`

If uploads are enabled through Vercel Blob:

- `BLOB_READ_WRITE_TOKEN`

Optional:

- `ERROR_WEBHOOK_URL` or `SENTRY_WEBHOOK_URL`
- `DISABLE_SELF_REGISTRATION=true`

## 5. Monitoring

Current code supports webhook-style server error reporting with:

- `ERROR_WEBHOOK_URL`, or
- `SENTRY_WEBHOOK_URL`

Recommended launch options:

- Quickest: use a private Slack/Discord/webhook endpoint.
- Better: configure Sentry or Vercel Observability and point error reporting there.
- Best: use Sentry for application errors plus Vercel Observability for runtime/deployment metrics.

## 6. Production Postgres

Use a managed Postgres database for production. Vercel Postgres/Neon is a good fit.

Before launch:

1. Create the database.
2. Set `DATABASE_URL` in Vercel.
3. Deploy once so `ensureSchema()` creates the schema.
4. Open `/admin` and confirm content loads.
5. Confirm production does not auto-fill demo content unless `HUNOW_ENABLE_DEMO_SEED=true`.

## 7. Human QA

Check these manually:

- Does every main nav page have real content?
- Do hero images and listing images feel local and credible?
- Are addresses, maps, opening hours and contact details correct?
- Are offers agreed with the business and not expired?
- Does the tone sound like HU NOW, not generic filler?
- Are privacy/contact/legal pages acceptable?
- Does mobile layout work on home, listing detail, event detail, offers, account and admin basics?
- Can a normal user sign up, save content and redeem an offer?
- Can an admin assign roles and approve claims/offers?
- Can a business owner claim a listing and submit an offer?

## 8. Deploy And Smoke Test

After deployment:

```sh
SMOKE_BASE_URL=https://your-production-domain npm run smoke:launch
```

Then manually test:

1. Sign up as a normal user.
2. Promote that user to admin from an existing admin account.
3. Submit a listing claim as a business user.
4. Approve the claim in `/admin/claims`.
5. Submit an owner offer from `/business/listings`.
6. Approve/reject it in `/admin/offers`.
7. Send a newsletter test email.
8. Trigger or wait for cron and check logs.
