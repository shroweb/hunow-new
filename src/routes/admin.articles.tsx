import { createFileRoute, Link } from "@tanstack/react-router";
import { articlePath } from "@/lib/taxonomy";
import { useState, useEffect, type FormEvent } from "react";
import { Plus } from "lucide-react";
import {
  AdminField,
  AdminFormPanel,
  AdminHeader,
  AdminStatus,
  AdminTable,
  adminBtn,
  adminBtnOutline,
  adminInput,
} from "@/components/admin/AdminLayout";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { PublishWorkflow } from "@/components/admin/PublishWorkflow";
import { SeoFields } from "@/components/admin/SeoFields";
import { ValidationErrors } from "@/components/admin/ValidationErrors";
import { validateUniqueSlug } from "@/components/admin/validation-utils";
import { readSeo } from "@/components/admin/seo-utils";
import { TiptapEditor } from "@/components/admin/TiptapEditor";
import { NAV_SECTIONS, findSection } from "@/lib/nav";
import { setState, slugify, uid, useStore } from "@/lib/store";
import { upsertArticleFn, deleteArticleFn } from "@/lib/content.functions";
import { getAuthorsFn } from "@/lib/authors.functions";
import type { Article } from "@/types";
import type { PollRow } from "@/lib/db.server";
import type { Author } from "@/lib/authors";

export const Route = createFileRoute("/admin/articles")({
  loader: async () => ({
    polls: await getAdminPolls(),
    authors: await getAuthorsFn(),
  }),
  component: AdminArticles,
});

const ARTICLE_CATEGORIES = [
  "Culture",
  "Eat & Drink",
  "Events",
  "Guides",
  "Hidden Gems",
  "Independent Business",
  "Interviews",
  "Outdoors",
  "Shopping",
  "Sport",
];

function AdminArticles() {
  const { polls, authors } = Route.useLoaderData() as { polls: PollRow[]; authors: Author[] };
  const articles = useStore((s) => s.articles);
  const [editing, setEditing] = useState<Article | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [section, setSection] = useState(editing?.section ?? "whats-on");
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [slugDraft, setSlugDraft] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const selectedSection = findSection(section) ?? NAV_SECTIONS[0];
  const published = articles.filter((a) => a.status === "published").length;
  const drafts = articles.filter((a) => a.status === "draft").length;
  const today = new Date().toISOString().slice(0, 10);

  // Reset slug state when the form opens for a different article
  useEffect(() => {
    setSlugDraft(editing?.slug ?? "");
    setSlugManual(!!editing?.slug);
  }, [editing?.id, showForm]);

  const filtered = articles.filter((a) => {
    const q = query.toLowerCase();
    return (
      (statusFilter === "all" || a.status === statusFilter) &&
      (!q || a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q))
    );
  });

  const openForm = (article: Article | null) => {
    setEditing(article);
    setSection(article?.section ?? "whats-on");
    setErrors([]);
    setShowForm(true);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get("title"));
    const slug = String(fd.get("slug") || slugify(title));
    const status = fd.get("status") as Article["status"];
    const featuredImage = String(fd.get("featuredImage") || "");
    const nextErrors = [
      validateUniqueSlug(
        slug,
        articles.map((article) => article.slug),
        editing?.slug,
      ),
      status === "published" && !featuredImage
        ? "Published posts need a featured image."
        : undefined,
      status === "scheduled" && !String(fd.get("scheduledFor") || "")
        ? "Scheduled posts need a scheduled date and time."
        : undefined,
    ].filter(Boolean) as string[];
    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      return;
    }
    const theGood = String(fd.get("theGood") || "").trim();
    const theCatch = String(fd.get("theCatch") || "").trim();
    const proTip = String(fd.get("proTip") || "").trim();
    const honestVerdict = theGood || theCatch || proTip ? { theGood, theCatch, proTip } : undefined;

    const a: Article = {
      id: editing?.id ?? uid(),
      title,
      slug,
      excerpt: String(fd.get("excerpt")),
      content: String(fd.get("content")),
      category: String(fd.get("category")),
      tags: String(fd.get("tags") || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      featuredImage: featuredImage || "photo-1554118811-1e0d58224f24",
      author: String(fd.get("author") || "HU NOW"),
      status,
      isFeatured: fd.get("isFeatured") === "on",
      isSponsored: fd.get("isSponsored") === "on",
      sponsorName: String(fd.get("sponsorName") || "") || undefined,
      readingMinutes: Number(fd.get("readingMinutes") || 5),
      publishedAt: String(fd.get("publishedAt") || new Date().toISOString().slice(0, 10)),
      scheduledFor: String(fd.get("scheduledFor") || "") || undefined,
      section: String(fd.get("section") || "") || undefined,
      subcategory: String(fd.get("subcategory") || "") || undefined,
      series: String(fd.get("series") || "") || undefined,
      seriesOrder: Number(fd.get("seriesOrder") || 0) || undefined,
      pollId: String(fd.get("pollId") || "") || undefined,
      seo: readSeo(fd),
      editorialBadge: String(fd.get("editorialBadge") || "") || undefined,
      verifiedDate: String(fd.get("verifiedDate") || "") || undefined,
      verifiedNote: String(fd.get("verifiedNote") || "") || undefined,
      honestVerdict,
      priceCheck: String(fd.get("priceCheck") || "") || undefined,
    };
    setSaving(true);
    try {
      await upsertArticleFn({ data: a });
      setState(
        (s) => ({
          ...s,
          articles: editing ? s.articles.map((x) => (x.id === a.id ? a : x)) : [a, ...s.articles],
        }),
        { persist: false },
      );
      setEditing(null);
      setErrors([]);
      setShowForm(false);
    } catch (err) {
      setErrors([err instanceof Error ? err.message : "Save failed. Please try again."]);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await deleteArticleFn({ data: { id } });
    setState((s) => ({ ...s, articles: s.articles.filter((a) => a.id !== id) }), {
      persist: false,
    });
  };

  const toggle = async (id: string, key: "isFeatured" | "isSponsored") => {
    const article = articles.find((a) => a.id === id);
    if (!article) return;
    const updated = { ...article, [key]: !article[key] };
    await upsertArticleFn({ data: updated });
    setState((s) => ({ ...s, articles: s.articles.map((a) => (a.id === id ? updated : a)) }), {
      persist: false,
    });
  };

  const toggleStatus = async (id: string) => {
    const article = articles.find((a) => a.id === id);
    if (!article) return;
    const updated = {
      ...article,
      status: article.status === "published" ? ("draft" as const) : ("published" as const),
    };
    await upsertArticleFn({ data: updated });
    setState((s) => ({ ...s, articles: s.articles.map((a) => (a.id === id ? updated : a)) }), {
      persist: false,
    });
  };

  return (
    <div>
      <AdminHeader
        title="Posts"
        subtitle={`${articles.length} posts · ${published} published · ${drafts} drafts`}
        action={
          <button onClick={() => openForm(null)} className={adminBtn}>
            <Plus className="w-3 h-3" /> New Post
          </button>
        }
      />
      <div className="p-6 md:p-10">
        {showForm && (
          <AdminFormPanel title={editing ? "Edit Post" : "New Post"}>
            <ValidationErrors errors={errors} />
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid lg:grid-cols-[1fr_320px] gap-6">
                <div className="space-y-4">
                  <AdminField label="Title">
                    <input
                      name="title"
                      defaultValue={editing?.title}
                      required
                      placeholder="Story headline"
                      className={adminInput}
                      onChange={(e) => {
                        if (!slugManual) setSlugDraft(slugify(e.target.value));
                      }}
                    />
                  </AdminField>
                  <AdminField label="Excerpt">
                    <textarea
                      name="excerpt"
                      defaultValue={editing?.excerpt}
                      required
                      rows={3}
                      placeholder="Short summary for cards and metadata"
                      className={adminInput}
                    />
                  </AdminField>
                  <AdminField label="Body">
                    <TiptapEditor
                      key={editing?.id ?? "new"}
                      name="content"
                      defaultValue={editing?.content}
                    />
                  </AdminField>

                  {/* Human Proof & Review Stamp */}
                  <div className="border-2 border-dashed border-amber-500/40 bg-amber-500/5 p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🛡️</span>
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                          Human Proof & Editorial Verification
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        Anti-AI signals: verified visits, honest caveats, price check
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <AdminField label="Editorial Stamp / Pick">
                        <select
                          name="editorialBadge"
                          defaultValue={editing?.editorialBadge ?? ""}
                          className={adminInput}
                        >
                          <option value="">None</option>
                          <option value="Proper Hull Institution">⭐ Proper Hull Institution</option>
                          <option value="HU NOW Certified Pint">🍺 HU NOW Certified Pint</option>
                          <option value="Hidden Gem">💎 Hidden Gem</option>
                          <option value="Worth the Queue">⏱️ Worth the Queue</option>
                          <option value="Best for Sundays">🍗 Best for Sundays</option>
                          <option value="Late Night Essential">🌙 Late Night Essential</option>
                        </select>
                      </AdminField>
                      <AdminField label="Verified In-Person Date">
                        <input
                          type="date"
                          name="verifiedDate"
                          defaultValue={editing?.verifiedDate}
                          className={adminInput}
                        />
                      </AdminField>
                    </div>

                    <AdminField
                      label="In-Person Visit Notes"
                      hint="e.g. Visited on a Tuesday lunchtime; outdoor seating open, cash & cards accepted"
                    >
                      <input
                        name="verifiedNote"
                        defaultValue={editing?.verifiedNote}
                        placeholder="Candid observation from actual visit"
                        className={adminInput}
                      />
                    </AdminField>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <AdminField
                        label="The Good (What Genuinely Shines)"
                        hint="e.g. Crisp golden batter, generous with the chip spice, pints under £4"
                      >
                        <input
                          name="theGood"
                          defaultValue={editing?.honestVerdict?.theGood}
                          placeholder="Authentic highlight"
                          className={adminInput}
                        />
                      </AdminField>
                      <AdminField
                        label="The Catch (Honest Caveats / What to Skip)"
                        hint="e.g. 25-minute wait after 12:30pm; street parking is permit-only"
                      >
                        <input
                          name="theCatch"
                          defaultValue={editing?.honestVerdict?.theCatch}
                          placeholder="Honest criticism or caveat"
                          className={adminInput}
                        />
                      </AdminField>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <AdminField
                        label="Local Pro-Tip"
                        hint="e.g. RingGo code 24510 for parking; cut down the alley by the church"
                      >
                        <input
                          name="proTip"
                          defaultValue={editing?.honestVerdict?.proTip}
                          placeholder="Practical insider tip"
                          className={adminInput}
                        />
                      </AdminField>
                      <AdminField
                        label="Price Check (Exact Pounds & Pence)"
                        hint="e.g. Pint of Bitter £3.90 · Patty Butty with Chips £4.50 · Flat White £3.10"
                      >
                        <input
                          name="priceCheck"
                          defaultValue={editing?.priceCheck}
                          placeholder="Exact pricing evidence"
                          className={adminInput}
                        />
                      </AdminField>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <AdminField label="Slug">
                    <input
                      name="slug"
                      value={slugDraft}
                      onChange={(e) => {
                        setSlugDraft(e.target.value);
                        setSlugManual(true);
                      }}
                      placeholder="auto-generated-from-title"
                      className={adminInput}
                    />
                  </AdminField>
                  <PublishWorkflow
                    status={editing?.status}
                    dateName="publishedAt"
                    dateLabel="Publish date"
                    dateValue={editing?.publishedAt ?? today}
                    scheduledFor={editing?.scheduledFor}
                    previewHref={articlePath({
                      subcategory: editing?.subcategory,
                      slug: editing?.slug ?? "preview",
                    })}
                  />
                  <AdminField
                    label="Author"
                    hint={
                      <Link to="/admin/authors" className="text-accent underline hover:text-accent/80">
                        Manage authors →
                      </Link>
                    }
                  >
                    <input
                      name="author"
                      list="admin-authors-list"
                      defaultValue={editing?.author ?? "Callum MacInnes"}
                      required
                      placeholder="Pick author or type name"
                      className={adminInput}
                    />
                    <datalist id="admin-authors-list">
                      {authors.map((a) => (
                        <option key={a.name} value={a.name}>
                          {a.role ? `${a.role} · ` : ""}{a.locationNote ?? ""}
                        </option>
                      ))}
                    </datalist>
                  </AdminField>
                  <AdminField label="Category">
                    <select
                      name="category"
                      defaultValue={editing?.category ?? "Guides"}
                      className={adminInput}
                    >
                      {ARTICLE_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </AdminField>
                  <AdminField label="Section">
                    <select
                      name="section"
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      className={adminInput}
                    >
                      {NAV_SECTIONS.map((s) => (
                        <option key={s.slug} value={s.slug}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </AdminField>
                  <AdminField label="Subcategory">
                    <select
                      name="subcategory"
                      defaultValue={editing?.subcategory ?? selectedSection?.subs[0]?.slug}
                      className={adminInput}
                    >
                      {selectedSection?.subs.map((s) => (
                        <option key={s.slug} value={s.slug}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </AdminField>
                  <AdminField label="Tags">
                    <input
                      name="tags"
                      defaultValue={editing?.tags.join(", ")}
                      placeholder="coffee, old town, guide"
                      className={adminInput}
                    />
                  </AdminField>
                  <div className="grid grid-cols-2 gap-3">
                    <AdminField label="Read time">
                      <input
                        name="readingMinutes"
                        type="number"
                        min="1"
                        defaultValue={editing?.readingMinutes ?? 5}
                        className={adminInput}
                      />
                    </AdminField>
                    <AdminField label="Series order">
                      <input
                        name="seriesOrder"
                        type="number"
                        min="1"
                        defaultValue={editing?.seriesOrder}
                        placeholder="e.g. 1"
                        className={adminInput}
                      />
                    </AdminField>
                  </div>
                  <AdminField
                    label="Series"
                    hint="Group related articles into an ordered collection"
                  >
                    <input
                      name="series"
                      list="admin-series-list"
                      defaultValue={editing?.series}
                      placeholder="Series name — pick existing or type new"
                      className={adminInput}
                    />
                    <datalist id="admin-series-list">
                      {Array.from(
                        new Set(articles.filter((a) => a.series).map((a) => a.series!)),
                      ).map((s) => (
                        <option key={s} value={s}>
                          {articles.filter((a) => a.series === s).length} parts
                        </option>
                      ))}
                    </datalist>
                  </AdminField>
                  <ImageUpload
                    key={`img-${editing?.id ?? "new"}`}
                    name="featuredImage"
                    defaultValue={editing?.featuredImage}
                    label="Featured image"
                  />
                  <AdminField label="Sponsor">
                    <input
                      name="sponsorName"
                      defaultValue={editing?.sponsorName}
                      placeholder="Sponsor name, if sponsored"
                      className={adminInput}
                    />
                  </AdminField>
                  <div className="flex flex-wrap gap-4 text-xs font-mono uppercase">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="isFeatured"
                        defaultChecked={editing?.isFeatured}
                      />
                      Featured
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="isSponsored"
                        defaultChecked={editing?.isSponsored}
                      />
                      Sponsored
                    </label>
                  </div>
                </div>
              </div>
              {polls.length > 0 && (
                <AdminFormPanel title="Poll">
                  <AdminField
                    label="Attach a reader poll"
                    hint="One poll per post. The poll appears after the article body."
                  >
                    <select
                      name="pollId"
                      defaultValue={editing?.pollId ?? ""}
                      className={adminInput}
                    >
                      <option value="">— No poll —</option>
                      {polls.map((p) => (
                        <option key={p.id} value={p.id} disabled={p.status === "closed"}>
                          {p.question}
                          {p.status === "closed" ? " (closed)" : ""}
                        </option>
                      ))}
                    </select>
                  </AdminField>
                </AdminFormPanel>
              )}
              <SeoFields
                defaultValue={editing?.seo}
                fallbackTitle={editing?.title}
                fallbackDescription={editing?.excerpt}
              />
              <div className="flex flex-wrap gap-3 pt-2">
                <button disabled={saving} className={`${adminBtn} disabled:opacity-50`}>
                  {saving ? "Saving…" : editing ? "Save Post" : "Create Post"}
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

        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="search"
            placeholder="Search posts…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`${adminInput} max-w-xs`}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`${adminInput} w-auto`}
          >
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
            <option value="expired">Expired</option>
          </select>
          {filtered.length !== articles.length && (
            <span className="text-xs font-mono text-muted-foreground self-center">
              {filtered.length} of {articles.length}
            </span>
          )}
        </div>

        <AdminTable
          headers={["Post", "Section", "Status", "Published", "Flags", "Actions"]}
          rows={filtered.map((a) => [
            <div>
              <div className="font-bold">{a.title}</div>
              <div className="font-mono text-[10px] uppercase text-muted-foreground">
                {a.category}
              </div>
            </div>,
            <span className="font-mono text-[10px] uppercase">
              {a.section ?? "uncategorised"}
              {a.subcategory ? ` / ${a.subcategory}` : ""}
            </span>,
            <button
              onClick={() => toggleStatus(a.id)}
              title="Click to publish/unpublish"
              className="cursor-pointer"
            >
              <AdminStatus status={a.status} />
            </button>,
            <span className="font-mono text-xs">{a.publishedAt}</span>,
            <div className="flex gap-1">
              <button
                onClick={() => toggle(a.id, "isFeatured")}
                className={`text-[9px] font-bold uppercase px-2 py-0.5 ${a.isFeatured ? "bg-accent text-background" : "border border-foreground/20"}`}
              >
                Feat
              </button>
              <button
                onClick={() => toggle(a.id, "isSponsored")}
                className={`text-[9px] font-bold uppercase px-2 py-0.5 ${a.isSponsored ? "bg-accent text-background" : "border border-foreground/20"}`}
              >
                Spon
              </button>
            </div>,
            <div className="flex gap-3">
              <a
                href={articlePath(a)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold uppercase underline"
              >
                View
              </a>
              <button
                onClick={() => openForm(a)}
                className="text-[10px] font-bold uppercase underline"
              >
                Edit
              </button>
              <button
                onClick={() => remove(a.id)}
                className="text-[10px] font-bold uppercase text-red-600 underline"
              >
                Delete
              </button>
            </div>,
          ])}
        />
      </div>
    </div>
  );
}
