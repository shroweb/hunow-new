import { createServerFn } from "@tanstack/react-start";
import { HULL_FAIR_POIS, type FairPOI } from "@/data/hull-fair-map-data";

const SETTING_KEY = "hull_fair_map_pois_v3";

export const getHullFairPoisFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { getSiteSettings } = await import("./db.server");
    const settings = await getSiteSettings();
    if (settings[SETTING_KEY]) {
      const parsed = JSON.parse(settings[SETTING_KEY]) as FairPOI[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { pois: parsed };
      }
    }
  } catch (err) {
    console.error("Failed to load saved hull fair POIs from DB, falling back to static data:", err);
  }
  return { pois: HULL_FAIR_POIS };
});

export const saveHullFairPoisFn = createServerFn({ method: "POST" })
  .inputValidator((d: { pois: FairPOI[] }) => d)
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    await requireAdmin();

    const { pois } = data;
    const jsonStr = JSON.stringify(pois);

    // 1. Save to DB site_settings
    try {
      const { setSiteSetting } = await import("./db.server");
      await setSiteSetting(SETTING_KEY, jsonStr);
    } catch (err) {
      console.error("Failed to save POIs to DB:", err);
    }

    // 2. In local dev environment, also write to src/data/hull-fair-map-data.ts
    try {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const filePath = path.resolve(process.cwd(), "src/data/hull-fair-map-data.ts");
      if (fs.existsSync(filePath)) {
        const fileContent = `// Hull Fair 2026 Interactive Digital Map Dataset
// Automatically mapped and calibrated via Admin Map Tool

export type FairCategory =
  | 'all'
  | 'rollercoaster'
  | 'thrill'
  | 'family'
  | 'funhouse'
  | 'ghost_train'
  | 'kids'
  | 'food_games'
  | 'wc'
  | 'accessible';

export interface FairPOI {
  id: string;
  name: string;
  operator: string;
  category: FairCategory;
  iconKey: string;
  x: number; // percentage from left (0..100)
  y: number; // percentage from top (0..100)
  locationArea: string;
  thrillLevel?: number;
  heightMin?: string;
  description: string;
}

export interface CategoryMeta {
  key: FairCategory;
  label: string;
  shortLabel: string;
  badgeColor: string;
  iconEmoji: string;
}

export const FAIR_CATEGORIES: CategoryMeta[] = [
  { key: 'all', label: 'All Attractions', shortLabel: 'All', badgeColor: 'bg-zinc-900 text-white', iconEmoji: '🎪' },
  { key: 'thrill', label: 'Thrill Rides', shortLabel: 'Thrill', badgeColor: 'bg-cyan-500 text-white', iconEmoji: '⚡' },
  { key: 'rollercoaster', label: 'Roller Coasters', shortLabel: 'Coasters', badgeColor: 'bg-amber-400 text-zinc-950', iconEmoji: '🎢' },
  { key: 'family', label: 'Family Rides', shortLabel: 'Family', badgeColor: 'bg-emerald-500 text-white', iconEmoji: '🎡' },
  { key: 'funhouse', label: 'Funhouses & Mazes', shortLabel: 'Funhouses', badgeColor: 'bg-pink-500 text-white', iconEmoji: '🏰' },
  { key: 'ghost_train', label: 'Ghost Trains', shortLabel: 'Ghost Trains', badgeColor: 'bg-purple-600 text-white', iconEmoji: '👻' },
  { key: 'kids', label: 'Kids Rides', shortLabel: 'Kids', badgeColor: 'bg-rose-500 text-white', iconEmoji: '🎠' },
  { key: 'food_games', label: 'Food & Stalls', shortLabel: 'Food & Stalls', badgeColor: 'bg-orange-500 text-white', iconEmoji: '🍟' },
  { key: 'wc', label: 'Toilets & Facilities', shortLabel: 'Toilets', badgeColor: 'bg-zinc-700 text-white', iconEmoji: '🚻' },
];

export const HULL_FAIR_POIS: FairPOI[] = ${JSON.stringify(pois, null, 2)};
`;
        fs.writeFileSync(filePath, fileContent, "utf-8");
      }
    } catch (err) {
      console.warn("Could not write POIs to filesystem (likely production read-only container):", err);
    }

    return { ok: true, count: pois.length };
  });
