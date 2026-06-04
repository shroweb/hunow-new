import { useSyncExternalStore } from "react";

export type SavedKind = "event" | "place" | "story" | "offer";
export interface SavedItem {
  kind: SavedKind;
  id: string;
  slug: string;
  title: string;
  savedAt: string;
  subcategory?: string; // for stories — used to build canonical URL
}

const KEY = "hunow:bookmarks:v1";
const listeners = new Set<() => void>();

function read(): SavedItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as SavedItem[];
  } catch {
    return [];
  }
}
let cache: SavedItem[] = read();

function write(next: SavedItem[]) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* quota */
  }
  for (const l of listeners) l();
}

export function isSaved(kind: SavedKind, id: string) {
  return cache.some((s) => s.kind === kind && s.id === id);
}

export function toggleSaved(item: Omit<SavedItem, "savedAt">) {
  const exists = cache.some((s) => s.kind === item.kind && s.id === item.id);
  write(
    exists
      ? cache.filter((s) => !(s.kind === item.kind && s.id === item.id))
      : [{ ...item, savedAt: new Date().toISOString() }, ...cache],
  );
}

export function useBookmarks(): SavedItem[] {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => cache,
    () => [],
  );
}

/** Merge server-side saved items into local cache (union, server items take priority) */
export function syncWithServer(serverItems: SavedItem[]) {
  const local = cache.filter(
    (l) => !serverItems.some((s) => s.kind === l.kind && s.id === l.id),
  );
  write([...serverItems, ...local]);
}

export function useIsSaved(kind: SavedKind, id: string): boolean {
  const all = useBookmarks();
  return all.some((s) => s.kind === kind && s.id === id);
}
