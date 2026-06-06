/**
 * Targeted server functions for admin content writes.
 * Each call does a single SQL upsert/delete rather than replacing the full store.
 * Routes use setState({ persist: false }) for optimistic UI after these return.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Article, EventItem, Listing, Offer } from "@/types";

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
