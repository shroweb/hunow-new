import { createFileRoute, Link } from "@tanstack/react-router";
import { articlePath } from "@/lib/taxonomy";
import { useState, type FormEvent } from "react";
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
import type { Article } from "@/types";

export const Route = createFileRoute("/admin/articles")({ component: AdminArticles });

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
  const articles = useStore((s) => s.articles);
  const [editing, setEditing] = useState<Article | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [section, setSection] = useState(editing?.section ?? "whats-on");
  const [errors, setErrors] = useState<string[]>([]);
  const selectedSection = findSection(section) ?? NAV_SECTIONS[0];
  const published = articles.filter((a) => a.status === "published").length;
  const drafts = articles.filter((a) => a.status === "draft").length;

  const openForm = (article: Article | null) => {
    setEditing(article);
    setSection(article?.section ?? "whats-on");
    setErrors([]);
    setShowForm(true);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
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
      author: String(fd.get("author")),
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
      seo: readSeo(fd),
    };
    setState((s) => ({
      ...s,
      articles: editing ? s.articles.map((x) => (x.id === a.id ? a : x)) : [a, ...s.articles],
    }));
    setEditing(null);
    setErrors([]);
    setShowForm(false);
  };

  const remove = (id: string) => {
    if (!confirm("Delete this post?")) return;
    setState((s) => ({ ...s, articles: s.articles.filter((a) => a.id !== id) }));
  };

  const toggle = (id: string, key: "isFeatured" | "isSponsored") => {
    setState((s) => ({
      ...s,
      articles: s.articles.map((a) => (a.id === id ? { ...a, [key]: !a[key] } : a)),
    }));
  };

  return (
    <div>
      <AdminHeader
        title="Posts"
        subtitle={`${articles.length} posts · ${published} published · ${drafts} drafts`}
        action={
          <button onClick={() => openForm(null)} className={adminBtn}>
            New Post
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
                  <AdminField
                    label="Body"
                  >
                    <TiptapEditor name="content" defaultValue={editing?.content} />
                  </AdminField>
                </div>

                <div className="space-y-4">
                  <AdminField label="Slug">
                    <input
                      name="slug"
                      defaultValue={editing?.slug}
                      placeholder="auto-generated-from-title"
                      className={adminInput}
                    />
                  </AdminField>
                  <PublishWorkflow
                    status={editing?.status}
                    dateName="publishedAt"
                    dateLabel="Publish date"
                    dateValue={editing?.publishedAt}
                    scheduledFor={editing?.scheduledFor}
                    previewHref={articlePath({ subcategory: editing?.subcategory, slug: editing?.slug ?? "preview" })}
                  />
                  <AdminField label="Author">
                    <input
                      name="author"
                      defaultValue={editing?.author ?? "HU NOW"}
                      required
                      className={adminInput}
                    />
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
                  <AdminField label="Series" hint="Group related articles, e.g. 'Hidden Hull'">
                    <input
                      name="series"
                      defaultValue={editing?.series}
                      placeholder="Series name (optional)"
                      className={adminInput}
                    />
                  </AdminField>
                  <ImageUpload
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
              <SeoFields
                defaultValue={editing?.seo}
                fallbackTitle={editing?.title}
                fallbackDescription={editing?.excerpt}
              />
              <div className="flex flex-wrap gap-3 pt-2">
                <button className={adminBtn}>{editing ? "Save Post" : "Create Post"}</button>
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

        <AdminTable
          headers={["Post", "Section", "Status", "Published", "Flags", "Actions"]}
          rows={articles.map((a) => [
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
            <AdminStatus status={a.status} />,
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
