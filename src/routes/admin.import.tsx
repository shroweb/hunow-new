import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { AdminHeader, adminBtn, adminBtnOutline, adminInput } from "@/components/admin/AdminLayout";

const importSchema = z.object({
  events: z.array(
    z.object({
      title: z.string(),
      description: z.string().optional(),
      startDate: z.string(), // YYYY-MM-DD
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
    await requireAdmin();
    await ensureSchema();
    const pool = getPool();
    let created = 0;
    const errors: string[] = [];

    for (const e of data.events) {
      try {
        const base = e.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        // Find unique slug
        let slug = base;
        for (let i = 1; i < 10; i++) {
          const existing = await pool.query("select 1 from events where slug = $1 limit 1", [slug]);
          if (existing.rowCount === 0) break;
          slug = `${base}-${i}`;
        }
        const id = crypto.randomUUID();
        const event = {
          id,
          title: e.title,
          slug,
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
          featuredImage: e.featuredImage || "photo-1492684223066-81342ee5ff30",
          status: "draft" as const,
          isFeatured: false,
          isSponsored: false,
        };
        await pool.query(
          "insert into events (id, data) values ($1, $2) on conflict (id) do nothing",
          [id, JSON.stringify(event)],
        );
        created++;
      } catch (err) {
        errors.push(`${e.title}: ${String(err)}`);
      }
    }
    return { ok: true, created, errors };
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
        `✓ Created ${result.created} draft event(s) — edit and publish them in Events.${result.errors.length > 0 ? ` ${result.errors.length} error(s): ${result.errors.join("; ")}` : ""}`,
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
        title="Import Events"
        subtitle="Paste a JSON array of events. All imports create drafts."
      />
      <div className="p-6 md:p-10 space-y-8 max-w-3xl">
        {status && (
          <div className="border-2 border-accent bg-accent/5 px-5 py-3 text-sm font-bold">
            {status}
          </div>
        )}

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Paste a JSON array of events. Required fields:{" "}
            <code className="font-mono text-xs bg-foreground/5 px-1">title</code>,{" "}
            <code className="font-mono text-xs bg-foreground/5 px-1">startDate</code> (YYYY-MM-DD).
            Optional: description, startTime, endTime, locationName, address, category, price,
            ticketUrl, featuredImage.
          </p>
          <textarea
            className={adminInput}
            rows={10}
            value={json}
            onChange={(e) => setJson(e.target.value)}
            placeholder={
              '[{"title":"Hull Jazz Fest","startDate":"2026-07-12","locationName":"Hull Marina","category":"Music"}]'
            }
          />
          {parseError && <p className="text-sm text-red-600 font-mono">{parseError}</p>}
          <button type="button" className={adminBtnOutline} onClick={parseJson}>
            Preview
          </button>
        </div>

        {/* Preview */}
        {preview.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl uppercase">
                {preview.length} event{preview.length !== 1 ? "s" : ""} to import
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={doImport}
                  className={`${adminBtn} disabled:opacity-40`}
                >
                  {busy ? "Importing…" : `Import ${preview.length} as drafts`}
                </button>
                <button type="button" className={adminBtnOutline} onClick={() => setPreview([])}>
                  Clear
                </button>
              </div>
            </div>
            <div className="border-2 border-foreground divide-y divide-foreground/10 max-h-96 overflow-y-auto">
              {preview.map((e, i) => (
                <div key={i} className="px-4 py-3">
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
    </>
  );
}
