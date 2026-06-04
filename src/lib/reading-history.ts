import { useSyncExternalStore } from "react";

export interface HistoryItem {
  kind: "article" | "event" | "place";
  id: string;
  slug: string;
  title: string;
  subcategory?: string;
  viewedAt: string;
}

const KEY = "hunow:history:v1";
const MAX = 10;
const listeners = new Set<() => void>();

function read(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]") as HistoryItem[]; }
  catch { return []; }
}

let cache: HistoryItem[] = read();

function write(next: HistoryItem[]) {
  cache = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* quota */ }
  for (const l of listeners) l();
}

export function addToHistory(item: Omit<HistoryItem, "viewedAt">) {
  const deduped = cache.filter((h) => !(h.kind === item.kind && h.id === item.id));
  write([{ ...item, viewedAt: new Date().toISOString() }, ...deduped].slice(0, MAX));
}

export function useHistory(): HistoryItem[] {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => cache,
    () => [],
  );
}
