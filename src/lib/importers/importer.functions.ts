import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth.server";
import { getPool, ensureSchema } from "@/lib/db.server";
import { upsertEventDeduplicated, upsertListingDeduplicated } from "./dedupe.server";
import { fetchConnexinLiveEvents, fetchHullTheatresEvents } from "./entertainment.server";
import { fetchVisitHullEvents } from "./civic.server";
import { fetchHullFoodEstablishments } from "./food-hygiene.server";
import { generateHullCommunityEvents } from "./community.server";

export interface SyncReport {
  ok: boolean;
  source: string;
  scanned: number;
  created: number;
  updated: number;
  skipped: number;
  summary: string;
}

// 1. Entertainment (Connexin Live & Hull Theatres)
export const syncEntertainmentFn = createServerFn({ method: "POST" })
  .handler(async (): Promise<SyncReport> => {
    await requireAdmin();
    await ensureSchema();
    const pool = getPool();

    const [connexin, theatres] = await Promise.all([
      fetchConnexinLiveEvents(),
      fetchHullTheatresEvents(),
    ]);
    const all = [...connexin, ...theatres];

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const ev of all) {
      const res = await upsertEventDeduplicated(pool, ev);
      if (res === "created") created++;
      else if (res === "updated") updated++;
      else skipped++;
    }

    return {
      ok: true,
      source: "Entertainment & Theatres",
      scanned: all.length,
      created,
      updated,
      skipped,
      summary: `Scanned ${all.length} arena & theatre shows: ${created} new, ${updated} enriched, ${skipped} already up to date.`,
    };
  });

// 2. Tourism & Civic (Visit Hull)
export const syncCivicFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ limit: z.number().optional() }).optional())
  .handler(async ({ data }): Promise<SyncReport> => {
    await requireAdmin();
    await ensureSchema();
    const pool = getPool();

    const events = await fetchVisitHullEvents(data?.limit ?? 25);
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const ev of events) {
      const res = await upsertEventDeduplicated(pool, ev);
      if (res === "created") created++;
      else if (res === "updated") updated++;
      else skipped++;
    }

    return {
      ok: true,
      source: "Visit Hull & Civic",
      scanned: events.length,
      created,
      updated,
      skipped,
      summary: `Scanned ${events.length} civic & festival events: ${created} new, ${updated} enriched, ${skipped} already up to date.`,
    };
  });

// 3. Food & Drink Directory (UK Food Standards Agency)
export const syncFoodDirectoryFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ limit: z.number().optional() }).optional())
  .handler(async ({ data }): Promise<SyncReport> => {
    await requireAdmin();
    await ensureSchema();
    const pool = getPool();

    const listings = await fetchHullFoodEstablishments(data?.limit ?? 40);
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const l of listings) {
      const res = await upsertListingDeduplicated(pool, l);
      if (res === "created") created++;
      else if (res === "updated") updated++;
      else skipped++;
    }

    return {
      ok: true,
      source: "FSA Food & Drink Directory",
      scanned: listings.length,
      created,
      updated,
      skipped,
      summary: `Processed ${listings.length} verified Hull food establishments: ${created} new places, ${updated} updated, ${skipped} already present.`,
    };
  });

// 4. Community & Parkruns
export const syncCommunityFn = createServerFn({ method: "POST" })
  .handler(async (): Promise<SyncReport> => {
    await requireAdmin();
    await ensureSchema();
    const pool = getPool();

    const events = await generateHullCommunityEvents();
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const ev of events) {
      const res = await upsertEventDeduplicated(pool, ev);
      if (res === "created") created++;
      else if (res === "updated") updated++;
      else skipped++;
    }

    return {
      ok: true,
      source: "Community & Active",
      scanned: events.length,
      created,
      updated,
      skipped,
      summary: `Generated ${events.length} parkruns & market dates: ${created} new, ${updated} enriched, ${skipped} already up to date.`,
    };
  });

// 5. Master Batch: Sync All
export const syncAllSourcesFn = createServerFn({ method: "POST" })
  .handler(async () => {
    await requireAdmin();
    const [ent, civ, food, com] = await Promise.all([
      syncEntertainmentFn(),
      syncCivicFn({ data: { limit: 25 } }),
      syncFoodDirectoryFn({ data: { limit: 40 } }),
      syncCommunityFn(),
    ]);

    const totalScanned = ent.scanned + civ.scanned + food.scanned + com.scanned;
    const totalCreated = ent.created + civ.created + food.created + com.created;
    const totalUpdated = ent.updated + civ.updated + food.updated + com.updated;
    const totalSkipped = ent.skipped + civ.skipped + food.skipped + com.skipped;

    return {
      ok: true,
      totalScanned,
      totalCreated,
      totalUpdated,
      totalSkipped,
      reports: [ent, civ, food, com],
    };
  });
