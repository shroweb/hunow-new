import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  AdminField,
  AdminFormPanel,
  AdminHeader,
  adminBtn,
  adminBtnOutline,
  adminInput,
} from "@/components/admin/AdminLayout";
import { getTaxonomy, updateTaxonomyKey } from "@/lib/taxonomy-config.functions";

export const Route = createFileRoute("/admin/taxonomy")({
  component: AdminTaxonomy,
  loader: async () => {
    const taxonomy = await getTaxonomy();
    return { taxonomy };
  },
});

const KEY_LABELS: Record<string, string> = {
  event_categories: "Event categories",
  listing_categories: "Listing / place categories",
  areas: "Areas of Hull",
};

function AdminTaxonomy() {
  const { taxonomy: initial } = Route.useLoaderData();
  const [taxonomy, setTaxonomy] = useState(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const startEdit = (key: string) => {
    setEditing(key);
    setDraft((taxonomy[key] ?? []).join("\n"));
  };

  const save = async (key: string) => {
    setSaving(true);
    const items = draft.split("\n").map((s) => s.trim()).filter(Boolean);
    try {
      await updateTaxonomyKey({ data: { key, items } });
      setTaxonomy((t: Record<string, string[]>) => ({ ...t, [key]: items }));
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const keys = Object.keys(KEY_LABELS);

  return (
    <div>
      <AdminHeader
        title="Taxonomy"
        subtitle="Categories and areas used across forms and filters"
      />
      <div className="p-6 md:p-10 space-y-6">
        {keys.map((key) => {
          const items = taxonomy[key] ?? [];
          const isEditing = editing === key;
          return (
            <div key={key} className="border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-bold text-sm uppercase tracking-wide">{KEY_LABELS[key]}</div>
                  <div className="text-xs text-muted-foreground font-mono mt-0.5">{key}</div>
                </div>
                {!isEditing && (
                  <button onClick={() => startEdit(key)} className={adminBtn}>
                    Edit
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <AdminField label="One item per line">
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      rows={Math.max(6, draft.split("\n").length + 2)}
                      className={`${adminInput} font-mono text-sm`}
                    />
                  </AdminField>
                  <div className="flex gap-3">
                    <button
                      onClick={() => save(key)}
                      disabled={saving}
                      className={adminBtn}
                    >
                      {saving ? "Saving…" : "Save"}
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className={adminBtnOutline}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {items.map((item: string) => (
                    <span
                      key={item}
                      className="px-3 py-1 bg-foreground/5 border border-foreground/10 text-xs font-mono"
                    >
                      {item}
                    </span>
                  ))}
                  {items.length === 0 && (
                    <span className="text-xs text-muted-foreground">No items yet</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
