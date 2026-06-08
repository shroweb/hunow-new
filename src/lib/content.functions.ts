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
