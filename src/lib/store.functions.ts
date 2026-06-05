import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { AppStore } from "./store";

const storeSchema = z.custom<AppStore>((value) => {
  if (!value || typeof value !== "object") return false;
  const store = value as Partial<Record<keyof AppStore, unknown>>;
  return (
    Array.isArray(store.articles) &&
    Array.isArray(store.events) &&
    Array.isArray(store.listings) &&
    Array.isArray(store.offers) &&
    Array.isArray(store.submissions) &&
    Array.isArray(store.ads) &&
    Array.isArray(store.media) &&
    Array.isArray(store.newsletter) &&
    store.newsletter.every((email) => typeof email === "string")
  );
});

export const getStoreFromDatabase = createServerFn({ method: "GET" }).handler(async () => {
  const { getDatabaseStore } = await import("./db.server");
  return getDatabaseStore();
});

export const saveStoreToDatabase = createServerFn({ method: "POST" })
  .inputValidator(storeSchema)
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    const { saveDatabaseStore } = await import("./db.server");
    await requireAdmin();
    await saveDatabaseStore(data);
    return { ok: true };
  });

export const resetStoreToEmpty = createServerFn({ method: "POST" }).handler(async () => {
  const { requireAdmin } = await import("./auth.server");
  const { resetDatabaseToEmpty } = await import("./db.server");
  await requireAdmin();
  await resetDatabaseToEmpty();
  return { ok: true };
});

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

export const trackAdEvent = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      adId: z.string().min(1),
      eventType: z.enum(["impression", "click"]),
    }),
  )
  .handler(async ({ data }) => {
    const { recordAdEvent } = await import("./db.server");
    const ad = await recordAdEvent(data.adId, data.eventType);
    return { ok: true, ad };
  });
