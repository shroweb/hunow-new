import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const fetchArticleBySlug = createServerFn({ method: "GET" })
  .inputValidator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    const { getArticleBySlug } = await import("./db.server");
    return getArticleBySlug(data.slug);
  });

export const fetchEventBySlug = createServerFn({ method: "GET" })
  .inputValidator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    const { getEventBySlug } = await import("./db.server");
    return getEventBySlug(data.slug);
  });

export const fetchListingBySlug = createServerFn({ method: "GET" })
  .inputValidator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    const { getListingBySlug } = await import("./db.server");
    return getListingBySlug(data.slug);
  });

export const fetchPagedListings = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      category: z.string().optional(),
      area: z.string().optional(),
      q: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { getPagedListings } = await import("./db.server");
    return getPagedListings(data);
  });

export const fetchPagedEvents = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      category: z.string().optional(),
      freeOnly: z.boolean().optional(),
      when: z.enum(["today", "weekend", "all"]).optional(),
      q: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
      status: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { getPagedEvents } = await import("./db.server");
    return getPagedEvents(data);
  });

export const fetchPagedArticles = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      category: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
      status: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { getPagedArticles } = await import("./db.server");
    return getPagedArticles(data);
  });

export const fetchRelatedForListing = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      listingId: z.string(),
      category: z.string(),
      area: z.string(),
      name: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const { getRelatedForListing } = await import("./db.server");
    return getRelatedForListing(data.listingId, data.category, data.area, data.name);
  });

export const fetchRelatedForEvent = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      eventId: z.string(),
      category: z.string(),
      locationName: z.string(),
      address: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const { getRelatedForEvent } = await import("./db.server");
    return getRelatedForEvent(data.eventId, data.category, data.locationName, data.address);
  });

export const fetchRelatedForArticle = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      articleId: z.string(),
      category: z.string(),
      subcategory: z.string(),
      title: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const { getRelatedForArticle } = await import("./db.server");
    return getRelatedForArticle(data.articleId, data.category, data.subcategory, data.title);
  });

export const fetchOfferById = createServerFn({ method: "GET" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { getOfferById } = await import("./db.server");
    return getOfferById(data.id);
  });

export const fetchActiveOffers = createServerFn({ method: "GET" })
  .inputValidator(z.object({ excludeListingId: z.string().optional(), limit: z.number().optional() }))
  .handler(async ({ data }) => {
    const { getActiveOffers } = await import("./db.server");
    return getActiveOffers(data.excludeListingId, data.limit);
  });
