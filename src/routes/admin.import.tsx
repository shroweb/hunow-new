import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { AdminHeader, adminBtn, adminBtnOutline, adminInput } from "@/components/admin/AdminLayout";
import {
  syncEntertainmentFn,
  syncCivicFn,
  syncFoodDirectoryFn,
  syncCommunityFn,
  syncAllSourcesFn,
  type SyncReport,
} from "@/lib/importers/importer.functions";

const importSchema = z.object({
  events: z.array(
    z.object({
      title: z.string(),
      description: z.string().optional(),
      startDate: z.string(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      locationName: z.string().optional(),
      address: z.string().optional(),
      category: z.string().optional(),
      price: z.string().optional(),
      ticketUrl: z.string().optional(),
      featuredImage: z.string().optional(),
    }),
  ),
});

const importEvents = createServerFn({ method: "POST" })
  .inputValidator(importSchema)
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/auth.server");
    const { getPool, ensureSchema } = await import("@/lib/db.server");
    const { upsertEventDeduplicated, slugify } = await import("@/lib/importers/dedupe.server");
    await requireAdmin();
    await ensureSchema();
    const pool = getPool();
    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const e of data.events) {
      try {
        const id = `manual-${slugify(e.title)}-${e.startDate}`;
        const event = {
          id,
          title: e.title,
          slug: slugify(`${e.title}-${e.startDate}`),
          description: e.description || "",
          category: e.category || "Community",
          startDate: e.startDate,
          startTime: e.startTime || "19:00",
          endTime: e.endTime,
          locationName: e.locationName || "Hull",
          address: e.address || "Hull",
          price: e.price || "Free",
          isFree: !e.price || e.price.toLowerCase() === "free",
          ticketUrl: e.ticketUrl,
          featuredImage: e.featuredImage || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&h=800&q=80",
          status: "published" as const,
          isFeatured: false,
          isSponsored: false,
        };
        const res = await upsertEventDeduplicated(pool, event);
        if (res === "created") created++;
        else skipped++;
      } catch (err) {
        errors.push(`${e.title}: ${String(err)}`);
      }
    }
    return { ok: true, created, skipped, errors };
  });

export const Route = createFileRoute("/admin/import")({
  component: AdminImport,
});

type PreviewEvent = z.infer<typeof importSchema>["events"][number];

function AdminImport() {
  const [json, setJson] = useState("");
  const [preview, setPreview] = useState<PreviewEvent[]>([]);
  const [parseError, setParseError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  // Scraper status state
  const [syncing, setSyncing] = useState<string | null>(null);
  const [lastReport, setLastReport] = useState<any | null>(null);

  async function handleSingleSync(key: string, fn: () => Promise<SyncReport>) {
    setSyncing(key);
    setStatus("");
    try {
      const report = await fn();
      setLastReport(report);
      setStatus(`✓ ${report.summary}`);
    } catch (err) {
      setStatus(`Sync failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSyncing(null);
    }
  }

  async function handleSyncAll() {
    setSyncing("all");
    setStatus("");
    try {
      const res = await syncAllSourcesFn();
      setLastReport(res);
      setStatus(
        `✓ Finished all sources: ${res.totalScanned} scanned, ${res.totalCreated} new items, ${res.totalUpdated} enriched, ${res.totalSkipped} duplicates prevented!`,
      );
    } catch (err) {
      setStatus(`Master sync failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSyncing(null);
    }
  }

  function parseJson() {
    setParseError("");
    try {
      const parsed = JSON.parse(json);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      setPreview(arr as PreviewEvent[]);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Invalid JSON");
    }
  }

  async function doImport() {
    if (preview.length === 0) return;
    setBusy(true);
    setStatus("");
    try {
      const result = await importEvents({ data: { events: preview } });
      setStatus(
        `✓ Created ${result.created} event(s) (Skipped ${result.skipped} duplicates).${result.errors.length > 0 ? ` ${result.errors.length} error(s): ${result.errors.join("; ")}` : ""}`,
      );
      setPreview([]);
      setJson("");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Import failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <AdminHeader
        title="Automated Scrapers & Ingestion Hub"
        subtitle="One-click sync for live Hull events, shows, and places with guaranteed zero duplicates."
      />

      <div className="p-6 md:p-10 space-y-10 max-w-6xl">
        {/* Status banner */}
        {status && (
          <div className="border-2 border-accent bg-accent/10 px-5 py-4 text-sm font-bold flex items-center justify-between gap-4">
            <span>{status}</span>
            <button
              onClick={() => setStatus("")}
              className="text-xs font-mono uppercase underline hover:opacity-75"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Master Action Header */}
        <div className="p-6 border-2 border-foreground bg-accent/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent bg-foreground px-2 py-0.5 inline-block mb-1">
              Zero-Duplicate Architecture
            </span>
            <h2 className="text-xl font-display uppercase tracking-wide">
              Continuous Hull Content Feeds
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Automatically crawls official sources, verifies existence in PostgreSQL, enriches missing fields, and skips duplicates.
            </p>
          </div>
          <button
            type="button"
            disabled={Boolean(syncing)}
            onClick={handleSyncAll}
            className="px-5 py-3 bg-accent text-foreground font-display text-sm tracking-wider uppercase hover:bg-accent/80 transition-colors disabled:opacity-50 shrink-0 flex items-center gap-2"
          >
            {syncing === "all" ? (
              <>
                <span className="animate-spin text-lg">⚙</span> Crawling All Sources…
              </>
            ) : (
              <>⚡ Sync All 4 Free Sources</>
            )}
          </button>
        </div>

        {/* 4 Scraper Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Card 1: Entertainment */}
          <div className="border-2 border-foreground p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase text-accent font-bold">Source 1</span>
                <span className="text-[10px] font-mono bg-stone-200 px-1.5 py-0.5">Free Web Schema</span>
              </div>
              <h3 className="font-display text-lg uppercase">🎭 Entertainment & Arena Shows</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Scrapes upcoming arena tours, comedy headliners, boxing, and stage productions from <strong>Connexin Live Hull</strong> and <strong>Hull Theatres</strong> (Hull New Theatre & Hull City Hall).
              </p>
            </div>
            <button
              type="button"
              disabled={Boolean(syncing)}
              onClick={() => handleSingleSync("entertainment", () => syncEntertainmentFn())}
              className="w-full py-2 bg-foreground text-background text-xs font-bold uppercase tracking-wider hover:bg-foreground/80 transition-colors disabled:opacity-50"
            >
              {syncing === "entertainment" ? "Syncing Shows…" : "Sync Arena & Theatres"}
            </button>
          </div>

          {/* Card 2: Civic Tourism */}
          <div className="border-2 border-foreground p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase text-accent font-bold">Source 2</span>
                <span className="text-[10px] font-mono bg-stone-200 px-1.5 py-0.5">Public JSON-LD</span>
              </div>
              <h3 className="font-display text-lg uppercase">🏛️ Visit Hull & Civic Festivals</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Crawls official tourism listings from <strong>visithull.org</strong> including civic street festivals, Trinity Market pop-ups, museum exhibitions, and family heritage trails.
              </p>
            </div>
            <button
              type="button"
              disabled={Boolean(syncing)}
              onClick={() => handleSingleSync("civic", () => syncCivicFn({ data: { limit: 25 } }))}
              className="w-full py-2 bg-foreground text-background text-xs font-bold uppercase tracking-wider hover:bg-foreground/80 transition-colors disabled:opacity-50"
            >
              {syncing === "civic" ? "Crawling Visit Hull…" : "Sync Visit Hull Events"}
            </button>
          </div>

          {/* Card 3: Food & Drink */}
          <div className="border-2 border-foreground p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase text-accent font-bold">Source 3</span>
                <span className="text-[10px] font-mono bg-stone-200 px-1.5 py-0.5">Gov UK Open API</span>
              </div>
              <h3 className="font-display text-lg uppercase">🍽️ Food Hygiene Agency (FSA)</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Connects directly to the UK Food Standards Agency for <strong>Hull City Council (ID 405)</strong>. Pulls verified restaurants, pubs, and cafes with official hygiene scores and GPS coordinates.
              </p>
            </div>
            <button
              type="button"
              disabled={Boolean(syncing)}
              onClick={() => handleSingleSync("food", () => syncFoodDirectoryFn({ data: { limit: 40 } }))}
              className="w-full py-2 bg-foreground text-background text-xs font-bold uppercase tracking-wider hover:bg-foreground/80 transition-colors disabled:opacity-50"
            >
              {syncing === "food" ? "Querying FSA API…" : "Sync Food & Drink Places"}
            </button>
          </div>

          {/* Card 4: Community & Parkruns */}
          <div className="border-2 border-foreground p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase text-accent font-bold">Source 4</span>
                <span className="text-[10px] font-mono bg-stone-200 px-1.5 py-0.5">Weekly Recurring</span>
              </div>
              <h3 className="font-display text-lg uppercase">🏃 Parkrun & Community Weekends</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Ingests weekly recurring 5k Saturday morning community events for <strong>East Park</strong>, <strong>Peter Pan Park</strong>, and <strong>Humber Bridge Country Park</strong>, plus Trinity Market street food dates.
              </p>
            </div>
            <button
              type="button"
              disabled={Boolean(syncing)}
              onClick={() => handleSingleSync("community", () => syncCommunityFn())}
              className="w-full py-2 bg-foreground text-background text-xs font-bold uppercase tracking-wider hover:bg-foreground/80 transition-colors disabled:opacity-50"
            >
              {syncing === "community" ? "Generating Dates…" : "Sync Community & Parkruns"}
            </button>
          </div>
        </div>

        {/* Deduplication Summary Table if available */}
        {lastReport && (
          <div className="border-2 border-foreground p-6 bg-background space-y-4">
            <h3 className="font-display text-base uppercase">Last Sync Deduplication Report</h3>
            {lastReport.reports ? (
              <div className="divide-y divide-foreground/10 text-xs">
                {lastReport.reports.map((r: any, idx: number) => (
                  <div key={idx} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-bold">{r.source}</span>
                    <span className="font-mono text-muted-foreground">{r.summary}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs font-mono">{lastReport.summary}</p>
            )}
          </div>
        )}

        {/* Custom JSON Batch Import (Collapsible / Secondary) */}
        <div className="border-t-2 border-foreground pt-8 space-y-4">
          <div>
            <h2 className="font-display text-xl uppercase">Manual JSON Event Import</h2>
            <p className="text-xs text-muted-foreground">
              Paste a custom JSON array of events for manual bulk uploads. Duplicates will be automatically detected and skipped.
            </p>
          </div>
          <textarea
            className={adminInput}
            rows={6}
            value={json}
            onChange={(e) => setJson(e.target.value)}
            placeholder={
              '[{"title":"Hull Jazz Fest","startDate":"2026-07-12","locationName":"Hull Marina","category":"Music"}]'
            }
          />
          {parseError && <p className="text-sm text-red-600 font-mono">{parseError}</p>}
          <button type="button" className={adminBtnOutline} onClick={parseJson}>
            Preview Custom JSON
          </button>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg uppercase">
                  {preview.length} event{preview.length !== 1 ? "s" : ""} to import
                </h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={doImport}
                    className={`${adminBtn} disabled:opacity-40`}
                  >
                    {busy ? "Importing…" : `Import ${preview.length} Items`}
                  </button>
                  <button type="button" className={adminBtnOutline} onClick={() => setPreview([])}>
                    Clear
                  </button>
                </div>
              </div>
              <div className="border-2 border-foreground divide-y divide-foreground/10 max-h-60 overflow-y-auto">
                {preview.map((e, i) => (
                  <div key={i} className="px-4 py-2.5">
                    <div className="font-bold text-sm">{e.title}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">
                      {e.startDate} {e.startTime ?? ""} · {e.locationName ?? ""} · {e.category ?? ""}{" "}
                      · {e.price ?? "Free"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
