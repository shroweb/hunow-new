import { useSyncExternalStore } from "react";
import { seedArticles, seedEvents, seedListings, seedMedia } from "@/data/seed";
import type {
  AdPlacement,
  Article,
  EventItem,
  Listing,
  MediaAsset,
  Offer,
  Submission,
} from "@/types";

// Backend integration point: replace this in-memory + localStorage layer
// with calls to your real API (Supabase, Lovable Cloud, REST, etc.).

interface Store {
  articles: Article[];
  events: EventItem[];
  listings: Listing[];
  offers: Offer[];
  submissions: Submission[];
  ads: AdPlacement[];
  media: MediaAsset[];
  newsletter: string[];
}

export type AppStore = Store;

const STORAGE_KEY = "hunow:store:v3";

const initial: Store = {
  articles: seedArticles,
  events: seedEvents,
  listings: seedListings,
  offers: [],
  submissions: [],
  ads: [],
  media: seedMedia,
  newsletter: [],
};

let state: Store = (() => {
  if (typeof window === "undefined") return initial;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initial;
    return { ...initial, ...(JSON.parse(raw) as Partial<Store>) } as Store;
  } catch {
    return initial;
  }
})();

const listeners = new Set<() => void>();
let hydratedFromDatabase = false;
let hydratePromise: Promise<void> | undefined;
const pendingHydrationUpdaters: Array<(s: Store) => Store> = [];

function persist() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota */
  }
}

function emit() {
  for (const l of listeners) l();
}

async function hydrateFromDatabase() {
  if (typeof window === "undefined" || hydratedFromDatabase) return;
  if (!hydratePromise) {
    hydratePromise = import("./store.functions")
      .then(({ getStoreFromDatabase }) => getStoreFromDatabase())
      .then((remoteState) => {
        // If DB returned empty collections, seed it and fall back to initial data
        const hasContent =
          remoteState.articles.length > 0 ||
          remoteState.events.length > 0 ||
          remoteState.listings.length > 0;
        const effective = hasContent ? remoteState : initial;
        const hadPending = pendingHydrationUpdaters.length > 0;
        state = pendingHydrationUpdaters.reduce((next, updater) => updater(next), effective);
        pendingHydrationUpdaters.length = 0;
        hydratedFromDatabase = true;
        // Only persist if we got real data, to avoid caching empty state
        if (hasContent) persist();
        emit();
        // If there were pre-hydration state changes (e.g. an image upload that
        // completed before the DB fetch), save the merged result to the DB now.
        if (hadPending) persistToDatabase();
        // If DB was empty, trigger a background seed
        if (!hasContent) {
          void import("./store.functions")
            .then(({ saveStoreToDatabase }) => saveStoreToDatabase({ data: initial }))
            .catch(() => {});
        }
      })
      .catch((error) => {
        console.error("Unable to load database-backed store", error);
      });
  }
  await hydratePromise;
}

function persistToDatabase() {
  if (typeof window === "undefined" || !hydratedFromDatabase) return;
  const snapshot = state;
  void import("./store.functions")
    .then(({ saveStoreToDatabase }) => saveStoreToDatabase({ data: snapshot }))
    .catch((error) => {
      console.error("Unable to persist database-backed store", error);
    });
}

export function getState(): Store {
  return state;
}

export function setState(updater: (s: Store) => Store, options: { persist?: boolean } = {}) {
  if (typeof window !== "undefined" && !hydratedFromDatabase) {
    pendingHydrationUpdaters.push(updater);
  }
  state = updater(state);
  persist();
  if (options.persist !== false) persistToDatabase();
  emit();
}

export function resetStore() {
  state = initial;
  persist();
  persistToDatabase();
  emit();
}

function subscribe(l: () => void) {
  void hydrateFromDatabase();
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useStore<T>(selector: (s: Store) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(initial),
  );
}

// Helpers
export const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const uid = () => crypto.randomUUID();
