import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Plus, Trash2, Edit2 } from "lucide-react";
import {
  AdminField,
  AdminFormPanel,
  AdminHeader,
  adminBtn,
  adminBtnOutline,
  adminInput,
} from "@/components/admin/AdminLayout";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { getAuthorsFn, upsertAuthorFn, deleteAuthorFn } from "@/lib/authors.functions";
import type { Author } from "@/lib/authors";

export const Route = createFileRoute("/admin/authors")({
  loader: async () => ({ authors: await getAuthorsFn() }),
  component: AdminAuthors,
});

function AdminAuthors() {
  const { authors: initial } = Route.useLoaderData();
  const [authors, setAuthors] = useState<Author[]>(initial);
  const [editing, setEditing] = useState<Author | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState("");

  const openForm = (author: Author | null) => {
    setEditing(author);
    setAvatarUrl(author?.avatarUrl ?? "");
    setError("");
    setShowForm(true);
  };

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "").trim();
    if (!name) {
      setError("Author name is required");
      return;
    }
    const role = String(fd.get("role") || "Writer").trim();
    const bio = String(fd.get("bio") || "").trim();
    const locationNote = String(fd.get("locationNote") || "").trim();
    const socialHandle = String(fd.get("socialHandle") || "").trim();

    const authorData: Author = {
      id: editing?.id || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name,
      role,
      bio,
      avatarUrl: avatarUrl || undefined,
      locationNote: locationNote || undefined,
      socialHandle: socialHandle || undefined,
    };

    setSaving(true);
    setError("");
    try {
      await upsertAuthorFn({ data: authorData });
      setAuthors((prev) => {
        const idx = prev.findIndex((a) => (a.id && a.id === authorData.id) || a.name === authorData.name);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = authorData;
          return next;
        }
        return [...prev, authorData];
      });
      setShowForm(false);
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save author");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (author: Author) => {
    if (!confirm(`Delete author "${author.name}"?`)) return;
    const id = author.id || author.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    try {
      await deleteAuthorFn({ data: { id } });
      setAuthors((prev) => prev.filter((a) => (a.id && a.id !== id) && a.name !== author.name));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  return (
    <div>
      <AdminHeader
        title="Authors & Bylines"
        subtitle={`${authors.length} writers · Manage genuine local voices and editorial bios`}
        action={
          <button onClick={() => openForm(null)} className={adminBtn}>
            <Plus className="w-3.5 h-3.5" /> Add Author
          </button>
        }
      />

      <div className="p-6 md:p-10 space-y-6">
        {showForm && (
          <AdminFormPanel title={editing ? `Edit ${editing.name}` : "New Author Profile"}>
            {error && <div className="p-3 bg-red-500/10 border border-red-500 text-red-500 text-xs font-bold mb-4">{error}</div>}
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <AdminField label="Full Name">
                  <input
                    name="name"
                    defaultValue={editing?.name ?? ""}
                    required
                    placeholder="e.g. Callum MacInnes"
                    className={adminInput}
                  />
                </AdminField>
                <AdminField label="Editorial Role">
                  <input
                    name="role"
                    defaultValue={editing?.role ?? "Writer"}
                    placeholder="e.g. Founder & Editor, Food Writer"
                    className={adminInput}
                  />
                </AdminField>
              </div>

              <AdminField label="Local Connection / Location Tag (Proven Local Identity)">
                <input
                  name="locationNote"
                  defaultValue={editing?.locationNote ?? ""}
                  placeholder="e.g. Hull native · Hessle Road · Avenues regular"
                  className={adminInput}
                />
              </AdminField>

              <AdminField label="Bio (Authentic, personal voice)">
                <textarea
                  name="bio"
                  rows={3}
                  defaultValue={editing?.bio ?? ""}
                  placeholder="Write a brief, honest bio with local grounding..."
                  className={adminInput}
                />
              </AdminField>

              <div className="grid md:grid-cols-2 gap-4">
                <AdminField label="Social / Contact Handle">
                  <input
                    name="socialHandle"
                    defaultValue={editing?.socialHandle ?? ""}
                    placeholder="e.g. @callum_hull or hello@hunow.co.uk"
                    className={adminInput}
                  />
                </AdminField>
                <AdminField label="Author Photo / Avatar">
                  <ImageUpload value={avatarUrl} onChange={setAvatarUrl} />
                </AdminField>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className={adminBtnOutline}
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} className={adminBtn}>
                  {saving ? "Saving..." : editing ? "Update Author" : "Create Author"}
                </button>
              </div>
            </form>
          </AdminFormPanel>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {authors.map((author) => (
            <div
              key={author.name}
              className="border border-border bg-card p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-3 mb-3">
                  {author.avatarUrl ? (
                    <img
                      src={author.avatarUrl}
                      alt={author.name}
                      className="w-12 h-12 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center font-bold text-accent text-lg">
                      {author.name[0]}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-foreground text-base leading-tight">
                      {author.name}
                    </h3>
                    <div className="text-xs text-accent font-medium">{author.role}</div>
                    {author.locationNote && (
                      <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                        📍 {author.locationNote}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                  {author.bio || "No bio entered yet."}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border text-xs">
                <span className="text-[10px] font-mono text-muted-foreground">
                  {author.socialHandle ?? ""}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => openForm(author)}
                    className="p-1 hover:text-accent transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(author)}
                    className="p-1 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
