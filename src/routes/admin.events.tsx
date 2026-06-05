import { createFileRoute, Link } from "@tanstack/react-router";
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
import { GalleryUpload } from "@/components/admin/GalleryUpload";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { TiptapEditor } from "@/components/admin/TiptapEditor";
import { PublishWorkflow } from "@/components/admin/PublishWorkflow";
import { SeoFields } from "@/components/admin/SeoFields";
import { ValidationErrors } from "@/components/admin/ValidationErrors";
import { validateUniqueSlug, validateUrl } from "@/components/admin/validation-utils";
import { readSeo } from "@/components/admin/seo-utils";
import { setState, slugify, uid, useStore } from "@/lib/store";
import type { EventItem } from "@/types";

export const Route = createFileRoute("/admin/events")({ component: AdminEvents });

const EVENT_CATEGORIES = [
  "Music",
  "Food & Drink",
  "Arts",
  "Comedy",
  "Family",
  "Theatre",
  "Nightlife",
];

function AdminEvents() {
  const events = useStore((s) => s.events);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [slugDraft, setSlugDraft] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    setSlugDraft(editing?.slug ?? "");
    setSlugManual(!!editing?.slug);
  }, [editing?.id, showForm]);

  const filtered = events.filter((e) => {
    const q = query.toLowerCase();
    return (
      (statusFilter === "all" || e.status === statusFilter) &&
      (!q ||
        e.title.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.locationName?.toLowerCase().includes(q))
    );
  });

  const toggleStatus = (id: string) => {
    setState((s) => ({
      ...s,
      events: s.events.map((e) =>
        e.id === id ? { ...e, status: e.status === "published" ? "draft" : "published" } : e,
      ),
    }));
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get("title"));
    const slug = String(fd.get("slug") || slugify(title));
    const status = fd.get("status") as EventItem["status"];
    const ticketUrl = String(fd.get("ticketUrl") || "");
    const nextErrors = [
      validateUniqueSlug(
        slug,
        events.map((event) => event.slug),
        editing?.slug,
      ),
      validateUrl(ticketUrl, "Ticket URL"),
      status === "scheduled" && !String(fd.get("scheduledFor") || "")
        ? "Scheduled events need a scheduled date and time."
        : undefined,
    ].filter(Boolean) as string[];
    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      return;
    }
    const galleryRaw = String(fd.get("gallery") || "");
    const gallery = galleryRaw
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const v: EventItem = {
      id: editing?.id ?? uid(),
      title,
      slug,
      description: String(fd.get("description")),
      content: String(fd.get("content") || "") || undefined,
      category: String(fd.get("category")),
      startDate: String(fd.get("startDate")),
      endDate: String(fd.get("endDate") || "") || undefined,
      startTime: String(fd.get("startTime")),
      endTime: String(fd.get("endTime") || "") || undefined,
      locationName: String(fd.get("locationName")),
      address: String(fd.get("address")),
      price: String(fd.get("price") || "Free"),
      isFree: fd.get("isFree") === "on",
      ticketUrl: ticketUrl || undefined,
      featuredImage: String(fd.get("featuredImage") || "photo-1514525253161-7a46d19cd819"),
      gallery: gallery.length > 0 ? gallery : undefined,
      status,
      isFeatured: fd.get("isFeatured") === "on",
      isSponsored: fd.get("isSponsored") === "on",
      scheduledFor: String(fd.get("scheduledFor") || "") || undefined,
      recurrence:
        fd.get("recurrenceType") && fd.get("recurrenceType") !== "none"
          ? {
              type: fd.get("recurrenceType") as "weekly" | "biweekly" | "monthly",
              until: String(fd.get("recurrenceUntil") || "") || undefined,
            }
          : undefined,
      seo: readSeo(fd),
    };
    setState((s) => ({
      ...s,
      events: editing ? s.events.map((x) => (x.id === v.id ? v : x)) : [v, ...s.events],
    }));
    setEditing(null);
    setErrors([]);
    setShowForm(false);
  };

  const remove = (id: string) => {
    if (confirm("Delete?"))
      setState((s) => ({ ...s, events: s.events.filter((e) => e.id !== id) }));
  };

  return (
    <div>
      <AdminHeader
        title="Events"
        subtitle={`${events.length} total`}
        action={
          <div className="flex gap-2">
            <button
              onClick={() => {
                const today = new Date().toISOString().slice(0, 10);
                const count = events.filter(
                  (e) => e.status === "published" && e.startDate < today,
                ).length;
                if (count === 0) {
                  alert("No past events to archive.");
                  return;
                }
                if (!confirm(`Archive ${count} past event${count !== 1 ? "s" : ""}?`)) return;
                setState((s) => ({
                  ...s,
                  events: s.events.map((e) =>
                    e.status === "published" && e.startDate < today
                      ? { ...e, status: "expired" as const }
                      : e,
                  ),
                }));
              }}
              className={adminBtnOutline}
            >
              Archive Past
            </button>
            <button
              onClick={() => {
                setEditing(null);
                setErrors([]);
                setShowForm(true);
              }}
              className={adminBtn}
            >
              <Plus className="w-3 h-3" /> New Event
            </button>
          </div>
        }
      />
      <div className="p-6 md:p-10">
        {showForm && (
          <AdminFormPanel title={editing ? "Edit Event" : "New Event"}>
            <ValidationErrors errors={errors} />
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Main two-column grid */}
              <div className="grid lg:grid-cols-[1fr_320px] gap-6">
                {/* Left column */}
                <div className="space-y-4">
                  <AdminField label="Title">
                    <input
                      name="title"
                      defaultValue={editing?.title}
                      required
                      placeholder="Event title"
                      className={adminInput}
                      onChange={(e) => {
                        if (!slugManual) setSlugDraft(slugify(e.target.value));
                      }}
                    />
                  </AdminField>
                  <AdminField label="Description">
                    <textarea
                      name="description"
                      defaultValue={editing?.description}
                      required
                      rows={3}
                      placeholder="Short public description (shown in listings and cards)"
                      className={adminInput}
                    />
                  </AdminField>
                  <AdminField label="Full content (optional)">
                    <TiptapEditor
                      key={editing?.id ?? "new"}
                      name="content"
                      defaultValue={editing?.content}
                    />
                  </AdminField>
                  <div className="grid md:grid-cols-2 gap-3">
                    <AdminField label="Venue">
                      <input
                        name="locationName"
                        defaultValue={editing?.locationName}
                        required
                        placeholder="Venue name"
                        className={adminInput}
                      />
                    </AdminField>
                    <AdminField label="Address">
                      <input
                        name="address"
                        defaultValue={editing?.address}
                        required
                        placeholder="Street, Hull"
                        className={adminInput}
                      />
                    </AdminField>
                  </div>
                </div>

                {/* Right column */}
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
                  <AdminField label="Category">
                    <input
                      name="category"
                      list="admin-event-categories"
                      defaultValue={editing?.category ?? "Music"}
                      required
                      className={adminInput}
                    />
                    <datalist id="admin-event-categories">
                      {EVENT_CATEGORIES.map((category) => (
                        <option key={category} value={category} />
                      ))}
                    </datalist>
                  </AdminField>
                  <PublishWorkflow
                    status={editing?.status}
                    dateName="startDate"
                    dateLabel="Start date"
                    dateValue={editing?.startDate ?? today}
                    scheduledFor={editing?.scheduledFor}
                    previewHref={`/events/${editing?.slug ?? "preview"}`}
                  />
                  <AdminField label="End date (multi-day events)">
                    <input
                      name="endDate"
                      type="date"
                      defaultValue={editing?.endDate}
                      className={adminInput}
                    />
                  </AdminField>
                  <div className="grid grid-cols-2 gap-3">
                    <AdminField label="Start time">
                      <input
                        name="startTime"
                        type="time"
                        defaultValue={editing?.startTime}
                        required
                        className={adminInput}
                      />
                    </AdminField>
                    <AdminField label="End time">
                      <input
                        name="endTime"
                        type="time"
                        defaultValue={editing?.endTime}
                        className={adminInput}
                      />
                    </AdminField>
                  </div>
                  <AdminField label="Price">
                    <input
                      name="price"
                      defaultValue={editing?.price ?? "Free"}
                      className={adminInput}
                    />
                  </AdminField>
                  <AdminField label="Ticket URL">
                    <input
                      name="ticketUrl"
                      type="url"
                      defaultValue={editing?.ticketUrl}
                      placeholder="https://..."
                      className={adminInput}
                    />
                  </AdminField>
                  <ImageUpload
                    key={`img-${editing?.id ?? "new"}`}
                    name="featuredImage"
                    defaultValue={editing?.featuredImage}
                    label="Cover image"
                  />
                  <div className="flex flex-wrap gap-4 text-xs font-mono uppercase">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="isFree" defaultChecked={editing?.isFree} />
                      Free
                    </label>
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

              {/* Full-width gallery */}
              <GalleryUpload
                key={editing?.id ?? "new"}
                name="gallery"
                defaultValue={editing?.gallery}
                label="Gallery images"
              />

              {/* Recurrence + SEO */}
              <div className="grid grid-cols-2 gap-4">
                <AdminField label="Recurrence">
                  <select
                    name="recurrenceType"
                    defaultValue={editing?.recurrence?.type ?? "none"}
                    className={adminInput}
                  >
                    <option value="none">Does not repeat</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Every two weeks</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </AdminField>
                <AdminField label="Repeat until">
                  <input
                    name="recurrenceUntil"
                    type="date"
                    defaultValue={editing?.recurrence?.until}
                    className={adminInput}
                  />
                </AdminField>
              </div>
              <SeoFields
                defaultValue={editing?.seo}
                fallbackTitle={editing?.title}
                fallbackDescription={editing?.description}
              />
              <div className="flex flex-wrap gap-3 pt-2">
                <button className={adminBtn}>{editing ? "Save Event" : "Create Event"}</button>
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
            placeholder="Search events…"
            value={query}
            onChange={(ev) => setQuery(ev.target.value)}
            className={`${adminInput} max-w-xs`}
          />
          <select
            value={statusFilter}
            onChange={(ev) => setStatusFilter(ev.target.value)}
            className={`${adminInput} w-auto`}
          >
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="expired">Expired</option>
          </select>
          {filtered.length !== events.length && (
            <span className="text-xs font-mono text-muted-foreground self-center">
              {filtered.length} of {events.length}
            </span>
          )}
        </div>

        <AdminTable
          headers={["Title", "Date", "Category", "Venue", "Status", "Actions"]}
          rows={filtered.map((e) => [
            <span className="font-bold">
              {e.title}
              {e.isFeatured && (
                <span className="ml-2 text-[9px] bg-accent text-background px-1.5 py-0.5 uppercase">
                  Feat
                </span>
              )}
            </span>,
            <span className="font-mono text-xs">
              {e.startDate}
              {e.endDate ? ` – ${e.endDate}` : ""} {e.startTime}
            </span>,
            e.category,
            <span className="text-xs">{e.locationName}</span>,
            <button
              onClick={() => toggleStatus(e.id)}
              title="Click to publish/unpublish"
              className="cursor-pointer"
            >
              <AdminStatus status={e.status} />
            </button>,
            <div className="flex gap-3">
              <Link
                to="/events/$slug"
                params={{ slug: e.slug }}
                className="text-[10px] font-bold uppercase underline"
              >
                View
              </Link>
              <button
                onClick={() => {
                  setEditing(e);
                  setErrors([]);
                  setShowForm(true);
                }}
                className="text-[10px] font-bold uppercase underline"
              >
                Edit
              </button>
              <button
                onClick={() => remove(e.id)}
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
