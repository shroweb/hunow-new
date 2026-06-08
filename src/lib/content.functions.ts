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

// ---- Articles ----

export const upsertArticleFn = createServerFn({ method: "POST" })
  .inputValidator(z.custom<Article>())
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
  .inputValidator(z.custom<EventItem>())
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
  .inputValidator(z.custom<Listing>())
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
  .inputValidator(z.custom<Offer>())
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
  .inputValidator(z.custom<AdPlacement>())
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
  .inputValidator(z.custom<MediaAsset>())
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
  .inputValidator(z.custom<EditorialCollection>())
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

// ---- Ticketmaster import ----

export const importTicketmasterUrlFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ urlOrId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    await requireAdmin();
    const { importTicketmasterUrl } = await import("./ticketmaster.server");
    return importTicketmasterUrl(data.urlOrId);
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
    const { findUserByEmail, assignListingOwner, getPool, ensureSchema } = await import("./db.server");
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
