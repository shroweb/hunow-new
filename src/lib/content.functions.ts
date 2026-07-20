/**
 * Targeted server functions for admin content writes.
 * Each call does a single SQL upsert/delete rather than replacing the full store.
 * Routes use setState({ persist: false }) for optimistic UI after these return.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type {
  AdPlacement,
  Article,
  EditorialCollection,
  EventItem,
  Listing,
  MediaAsset,
  Offer,
} from "@/types";

// ---- Zod schemas for admin content validation ----

const seoMetaSchema = z.object({
  title: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  ogImage: z.string().optional(),
  canonicalUrl: z.string().optional(),
  noIndex: z.boolean().optional(),
});

const articleSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(300),
  slug: z.string().min(1).max(200),
  excerpt: z.string().max(500),
  content: z.string().max(100000),
  category: z.string().min(1).max(100),
  tags: z.array(z.string().max(50)),
  featuredImage: z.string().max(500),
  author: z.string().min(1).max(200),
  status: z.enum(["draft", "published", "pending", "expired", "scheduled", "archived"]),
  isFeatured: z.boolean(),
  isSponsored: z.boolean(),
  sponsorName: z.string().max(200).optional(),
  readingMinutes: z.number().min(0).max(120),
  publishedAt: z.string(),
  scheduledFor: z.string().optional(),
  section: z.string().max(100).optional(),
  subcategory: z.string().max(100).optional(),
  series: z.string().max(100).optional(),
  seriesOrder: z.number().optional(),
  pollId: z.string().optional(),
  seo: seoMetaSchema.optional(),
});

const eventSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(300),
  slug: z.string().min(1).max(200),
  description: z.string().max(2000),
  content: z.string().max(100000).optional(),
  category: z.string().min(1).max(100),
  startDate: z.string(),
  endDate: z.string().optional(),
  startTime: z.string(),
  endTime: z.string().optional(),
  locationName: z.string().min(1).max(200),
  address: z.string().min(1).max(300),
  price: z.string().max(50),
  isFree: z.boolean(),
  ticketUrl: z.string().url().optional(),
  featuredImage: z.string().max(500),
  gallery: z.array(z.string().max(500)).optional(),
  status: z.enum(["draft", "published", "pending", "expired", "scheduled", "archived"]),
  isFeatured: z.boolean(),
  isSponsored: z.boolean(),
  scheduledFor: z.string().optional(),
  recurrence: z
    .object({
      type: z.enum(["weekly", "biweekly", "monthly"]),
      until: z.string().optional(),
    })
    .optional(),
  seo: seoMetaSchema.optional(),
});

const listingSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(300),
  slug: z.string().min(1).max(200),
  description: z.string().max(5000),
  category: z.string().min(1).max(100),
  area: z.string().min(1).max(100),
  address: z.string().min(1).max(300),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  mapUrl: z.string().optional(),
  openingHours: z.string().max(200),
  website: z.string().url().optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email().optional(),
  featuredImage: z.string().max(500),
  gallery: z.array(z.string().max(500)).optional(),
  hours: z.any().optional(),
  tags: z.array(z.string().max(50)).optional(),
  isFeatured: z.boolean(),
  isHiddenGem: z.boolean(),
  isIndependent: z.boolean(),
  isVerified: z.boolean().optional(),
  ownerUserId: z.string().optional(),
  activeOfferId: z.string().optional(),
  seo: seoMetaSchema.optional(),
});

const offerSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  listingId: z.string().min(1),
  businessName: z.string().min(1).max(200),
  description: z.string().max(2000),
  terms: z.string().max(1000),
  code: z.string().max(50).optional(),
  startDate: z.string(),
  endDate: z.string(),
  redemptionCount: z.number().min(0),
  usageLimit: z.number().min(0).optional(),
  category: z.string().min(1).max(100),
  status: z.enum(["pending", "active", "expired", "rejected"]),
  isFeatured: z.boolean().optional(),
  submittedByUserId: z.string().optional(),
  adminNote: z.string().max(1000).optional(),
  seo: seoMetaSchema.optional(),
});

const adSchema = z.object({
  id: z.string().min(1),
  advertiserName: z.string().min(1).max(200),
  placement: z.string().min(1).max(50),
  image: z.string().max(500),
  url: z.string().url(),
  startDate: z.string(),
  endDate: z.string(),
  impressions: z.number().min(0),
  clicks: z.number().min(0),
  status: z.enum(["active", "paused", "expired"]),
});

const mediaSchema = z.object({
  id: z.string().min(1),
  url: z.string().max(500),
  fileName: z.string().max(200),
  alt: z.string().max(300),
  credit: z.string().max(200).optional(),
  focalPoint: z.string().optional(),
  createdAt: z.string(),
});

const collectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  description: z.string().max(1000),
  status: z.enum(["draft", "published"]),
  featuredImage: z.string().max(500).optional(),
  items: z.array(
    z.object({
      kind: z.enum(["article", "event", "listing", "offer"]),
      id: z.string(),
    }),
  ),
  updatedAt: z.string(),
});

// ---- Articles ----

export const upsertArticleFn = createServerFn({ method: "POST" })
  .inputValidator(articleSchema)
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    const { upsertArticle } = await import("./db.server");
    await requireAdmin();
    await upsertArticle(data);
    return { ok: true };
  });

export const deleteArticleFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    const { deleteArticle } = await import("./db.server");
    await requireAdmin();
    await deleteArticle(data.id);
    return { ok: true };
  });

// ---- Events ----

export const upsertEventFn = createServerFn({ method: "POST" })
  .inputValidator(eventSchema)
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    const { upsertEvent } = await import("./db.server");
    await requireAdmin();
    await upsertEvent(data);
    return { ok: true };
  });

export const deleteEventFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    const { deleteEvent } = await import("./db.server");
    await requireAdmin();
    await deleteEvent(data.id);
    return { ok: true };
  });

export const bulkArchiveEventsFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ beforeDate: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    const { bulkArchiveEvents } = await import("./db.server");
    await requireAdmin();
    const count = await bulkArchiveEvents(data.beforeDate);
    return { ok: true, count };
  });

// ---- Listings ----

export const upsertListingFn = createServerFn({ method: "POST" })
  .inputValidator(listingSchema)
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    const { upsertListing } = await import("./db.server");
    await requireAdmin();
    await upsertListing(data);
    return { ok: true };
  });

export const deleteListingFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    const { deleteListing } = await import("./db.server");
    await requireAdmin();
    await deleteListing(data.id);
    return { ok: true };
  });

// ---- Offers ----

export const upsertOfferFn = createServerFn({ method: "POST" })
  .inputValidator(offerSchema)
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    const { upsertOffer } = await import("./db.server");
    await requireAdmin();
    await upsertOffer(data);
    return { ok: true };
  });

export const deleteOfferFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    const { deleteOffer } = await import("./db.server");
    await requireAdmin();
    await deleteOffer(data.id);
    return { ok: true };
  });

// ---- Ads ----

export const upsertAdFn = createServerFn({ method: "POST" })
  .inputValidator(adSchema)
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    const { upsertAd } = await import("./db.server");
    await requireAdmin();
    await upsertAd(data);
    return { ok: true };
  });

export const deleteAdFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    const { deleteAd } = await import("./db.server");
    await requireAdmin();
    await deleteAd(data.id);
    return { ok: true };
  });

// ---- Media ----

export const upsertMediaFn = createServerFn({ method: "POST" })
  .inputValidator(mediaSchema)
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    const { upsertMedia } = await import("./db.server");
    await requireAdmin();
    await upsertMedia(data);
    return { ok: true };
  });

export const deleteMediaFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    const { deleteMedia } = await import("./db.server");
    await requireAdmin();
    await deleteMedia(data.id);
    return { ok: true };
  });

// ---- Collections ----

export const upsertCollectionFn = createServerFn({ method: "POST" })
  .inputValidator(collectionSchema)
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    const { upsertCollection } = await import("./db.server");
    await requireAdmin();
    await upsertCollection(data);
    return { ok: true };
  });

export const deleteCollectionFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    const { deleteCollection } = await import("./db.server");
    await requireAdmin();
    await deleteCollection(data.id);
    return { ok: true };
  });

// ---- Search ----

export const searchContentFn = createServerFn({ method: "GET" })
  .inputValidator(z.object({ query: z.string().max(100) }))
  .handler(async ({ data }) => {
    const { searchContent } = await import("./db.server");
    return searchContent(data.query);
  });

// ---- Eventbrite import ----

export const importEventbriteUrlFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ urlOrId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    await requireAdmin();
    const { importEventbriteUrl } = await import("./eventbrite.server");
    return importEventbriteUrl(data.urlOrId);
  });

// ---- Hull City AFC fixtures ----

export const syncHullCityFixturesFn = createServerFn({ method: "POST" }).handler(async () => {
  const { requireAdmin } = await import("./auth.server");
  await requireAdmin();
  const { syncHullCityFixtures } = await import("./hull-city.server");
  return syncHullCityFixtures();
});

// ---- Web Push ----

export const getVapidPublicKeyFn = createServerFn({ method: "GET" }).handler(async () => {
  const { getVapidPublicKey } = await import("./web-push.server");
  return { publicKey: getVapidPublicKey() };
});

export const saveWebPushSubscriptionFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      endpoint: z.string().url(),
      p256dh: z.string(),
      auth: z.string(),
      segments: z.array(z.string()).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { currentUser } = await import("./auth.server");
    const { saveWebPushSubscription } = await import("./db.server");
    const user = await currentUser();
    await saveWebPushSubscription({ userId: user?.id ?? null, ...data });
    return { ok: true };
  });

// ---- Admin: assign listing owner ----

export const assignListingOwnerFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ listingId: z.string(), email: z.string().email() }))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    await requireAdmin();
    const { findUserByEmail, assignListingOwner } = await import("./db.server");
    const user = await findUserByEmail(data.email);
    if (!user) throw new Error(`No account found for ${data.email}`);
    await assignListingOwner(data.listingId, user.id);
    return { ok: true, userName: user.name };
  });

export const createBusinessOwnerFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      listingId: z.string(),
      email: z.string().email(),
      name: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    await requireAdmin();
    const { findUserByEmail, assignListingOwner, getPool, ensureSchema } =
      await import("./db.server");
    await ensureSchema();
    const pool = getPool();

    let user = await findUserByEmail(data.email);
    let created = false;

    if (!user) {
      // Create the account with a random password — they'll set their own via the reset link
      const crypto = await import("node:crypto");
      const userId = crypto.randomUUID();
      const randomPassword = crypto.randomBytes(24).toString("base64url");
      const { hashPassword, requestPasswordReset } = await import("./auth.server");
      const hash = await hashPassword(randomPassword);
      await pool.query(
        "insert into users (id, email, name, password_hash, role, app_role) values ($1, $2, $3, $4, 'user', 'customer')",
        [userId, data.email.toLowerCase().trim(), data.name.trim(), hash],
      );
      user = { id: userId, name: data.name.trim(), email: data.email.toLowerCase().trim() };
      created = true;

      // Send a "set your password" email — non-fatal if it fails
      try {
        await requestPasswordReset(data.email);
      } catch {
        // Admin can resend from the users page
      }
    }

    await assignListingOwner(data.listingId, user.id);
    return { ok: true, userName: user.name, created };
  });

export const sendPushToSegmentFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      segment: z.enum(["all", "events", "offers", "businesses"]),
      title: z.string().min(1),
      body: z.string().min(1),
      url: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    await requireAdmin();
    const { sendPushToSegment } = await import("./web-push.server");
    return sendPushToSegment(data.segment, { title: data.title, body: data.body, url: data.url });
  });

// ---- Google Places ----

export const searchGooglePlacesFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ query: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    await requireAdmin();
    const { searchPlaces } = await import("./google-places.server");
    return searchPlaces(data.query);
  });

export const getGooglePlaceDetailsFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ placeId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    await requireAdmin();
    const { getPlaceDetails } = await import("./google-places.server");
    return getPlaceDetails(data.placeId);
  });
