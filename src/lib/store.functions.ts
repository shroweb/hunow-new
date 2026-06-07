import { createServerFn } from "@tanstack/react-start";
import process from "node:process";
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
    Array.isArray(store.collections) &&
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
    if (
      process.env.NODE_ENV === "production" &&
      process.env.HUNOW_ALLOW_FULL_STORE_SAVE !== "true"
    ) {
      throw new Error(
        "Full-store saves are disabled in production. Use targeted admin writes instead.",
      );
    }
    await saveDatabaseStore(data);
    return { ok: true };
  });
