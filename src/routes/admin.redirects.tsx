import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  AdminField,
  AdminFormPanel,
  AdminHeader,
  AdminTable,
  adminBtn,
  adminBtnOutline,
  adminInput,
} from "@/components/admin/AdminLayout";
import { ValidationErrors } from "@/components/admin/ValidationErrors";
import { getRedirects, saveRedirect, removeRedirect } from "@/lib/redirects.functions";
import type { Redirect } from "@/types";

export const Route = createFileRoute("/admin/redirects")({
  component: AdminRedirects,
  loader: async () => {
    const redirects = await getRedirects();
    return { redirects };
  },
});

function AdminRedirects() {
  const { redirects: initial } = Route.useLoaderData();
  const [redirects, setRedirects] = useState<Redirect[]>(initial);
  const [editing, setEditing] = useState<Redirect | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    const updated = await getRedirects();
    setRedirects(updated);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const from = String(fd.get("from") || "").trim();
    const to = String(fd.get("to") || "").trim();
    const nextErrors: string[] = [];
    if (!from.startsWith("/")) nextErrors.push("From path must start with /");
    if (!to) nextErrors.push("Destination is required");
    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    try {
      await saveRedirect({
        data: {
          id: editing?.id ?? crypto.randomUUID(),
          from,
          to,
          permanent: fd.get("permanent") !== "off",
        },
      });
      await refresh();
      setShowForm(false);
      setEditing(null);
      setErrors([]);
    } catch {
      setErrors(["Failed to save redirect."]);
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this redirect?")) return;
    await removeRedirect({ data: { id } });
    await refresh();
  };

  return (
    <div>
      <AdminHeader
        title="Redirects"
        subtitle={`${redirects.length} total`}
        action={
          <button
            onClick={() => {
              setEditing(null);
              setErrors([]);
              setShowForm(true);
            }}
            className={adminBtn}
          >
            + Add redirect
          </button>
        }
      />
      <div className="p-6 md:p-10">
        {showForm && (
          <AdminFormPanel title={editing ? "Edit redirect" : "New redirect"}>
            <ValidationErrors errors={errors} />
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <AdminField label="From path">
                  <input
                    name="from"
                    defaultValue={editing?.from}
                    required
                    placeholder="/old-wordpress-url"
                    className={adminInput}
                  />
                </AdminField>
                <AdminField label="Destination">
                  <input
                    name="to"
                    defaultValue={editing?.to}
                    required
                    placeholder="/new-path or https://..."
                    className={adminInput}
                  />
                </AdminField>
              </div>
              <label className="flex items-center gap-2 text-xs font-mono uppercase">
                <input
                  type="checkbox"
                  name="permanent"
                  defaultChecked={editing?.permanent ?? true}
                />
                301 permanent (checked) vs 302 temporary
              </label>
              <div className="flex flex-wrap gap-3 pt-2">
                <button className={adminBtn} disabled={saving}>
                  {saving ? "Saving…" : editing ? "Save" : "Add redirect"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditing(null);
                    setErrors([]);
                  }}
                  className={adminBtnOutline}
                >
                  Cancel
                </button>
              </div>
            </form>
          </AdminFormPanel>
        )}

        {redirects.length === 0 ? (
          <div className="border border-dashed border-foreground/30 p-12 text-center text-sm text-muted-foreground">
            No redirects yet. Add one to forward old URLs to new pages.
          </div>
        ) : (
          <AdminTable
            headers={["From", "To", "Type", "Actions"]}
            rows={redirects.map((r) => [
              <span className="font-mono text-xs">{r.from}</span>,
              <span className="font-mono text-xs text-accent">{r.to}</span>,
              <span className="font-mono text-[10px] uppercase">
                {r.permanent ? "301" : "302"}
              </span>,
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEditing(r);
                    setErrors([]);
                    setShowForm(true);
                  }}
                  className="text-[10px] font-bold uppercase underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => del(r.id)}
                  className="text-[10px] font-bold uppercase text-red-600 underline"
                >
                  Delete
                </button>
              </div>,
            ])}
          />
        )}
      </div>
    </div>
  );
}
