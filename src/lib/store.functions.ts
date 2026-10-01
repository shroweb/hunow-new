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
  .handler(async () => {
    throw new Error(
      "Full-store saves are disabled. Use targeted database writes instead.",
    );
  });
