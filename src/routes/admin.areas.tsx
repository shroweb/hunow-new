import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  AdminHeader,
  adminBtn,
  adminInput,
} from "@/components/admin/AdminLayout";
import { getAllAreaGuidesAdmin, upsertAreaGuideAdmin } from "@/lib/area-guides.functions";
import type { AreaGuideRow } from "@/lib/db.server";

type AreaEntry = { area: string; slug: string; guide: AreaGuideRow | null };

export const Route = createFileRoute("/admin/areas")({
  loader: async () => ({ entries: await getAllAreaGuidesAdmin() }),
  component: AdminAreas,
});

function AdminAreas() {
  const { entries: initial } = Route.useLoaderData();
  const [entries, setEntries] = useState<AreaEntry[]>(initial);
  const [selected, setSelected] = useState<AreaEntry | null>(null);
  const [intro, setIntro] = useState("");
  const [image, setImage] = useState("");
  const [status, setStatus] = useState("");

  function select(entry: AreaEntry) {
    setSelected(entry);
    setIntro(entry.guide?.intro ?? "");
    setImage(entry.guide?.featuredImage ?? "");
    setStatus("");
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setStatus("Saving…");
    try {
      await upsertAreaGuideAdmin({ data: { areaKey: selected.slug, intro, featuredImage: image } });
      setEntries((prev) =>
        prev.map((entry) =>
          entry.slug === selected.slug
            ? {
                ...entry,
                guide: {
                  areaKey: selected.slug,
                  intro,
                  featuredImage: image,
                  updatedAt: new Date().toISOString(),
                },
              }
            : entry,
        ),
      );
      setStatus("Saved");
    } catch {
      setStatus("Error saving.");
    }
  }

  return (
    <>
      <AdminHeader
        title="Area Guides"
        subtitle="Add editorial introductions and header images to each Hull area guide page."
      />

      <div className="px-6 md:px-10 py-8 grid lg:grid-cols-[280px_1fr] gap-8">
        <aside className="space-y-2">
          {entries.map((entry) => (
            <button
              key={entry.slug}
              type="button"
              onClick={() => select(entry)}
              className={`w-full text-left border-2 p-4 transition-colors ${
                selected?.slug === entry.slug
                  ? "border-accent bg-accent/10"
                  : "border-foreground bg-white hover:bg-foreground/5"
              }`}
            >
              <span className="block font-bold">{entry.area}</span>
              <span className="font-mono text-[10px] uppercase text-muted-foreground">
                {entry.guide?.intro ? "Has intro" : "No intro yet"}
              </span>
            </button>
          ))}
        </aside>

        {selected ? (
          <form onSubmit={handleSave} className="border-2 border-foreground bg-white p-6 space-y-5 max-w-2xl">
            <h2 className="font-display text-4xl uppercase">{selected.area}</h2>

            <label className="block space-y-1">
              <span className="font-mono text-[10px] uppercase text-muted-foreground">
                Editorial Introduction
              </span>
              <textarea
                className={adminInput}
                rows={5}
                value={intro}
                onChange={(e) => setIntro(e.target.value)}
                placeholder="A short intro shown at the top of the area guide page…"
              />
            </label>

            <label className="block space-y-1">
              <span className="font-mono text-[10px] uppercase text-muted-foreground">
                Featured Image URL
              </span>
              <input
                className={adminInput}
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://…"
              />
              {image && (
                <img
                  src={image}
                  alt="Preview"
                  className="mt-2 h-32 w-full object-cover border border-foreground/20"
                />
              )}
            </label>

            <div className="flex items-center gap-4">
              <button type="submit" className={adminBtn}>
                Save
              </button>
              {status && <span className="text-sm font-bold">{status}</span>}
            </div>
          </form>
        ) : (
          <div className="border-2 border-dashed border-foreground/20 p-10 text-sm text-muted-foreground">
            Select an area to edit its guide content.
          </div>
        )}
      </div>
    </>
  );
}
