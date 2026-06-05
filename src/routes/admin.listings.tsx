import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import {
  AdminField,
  AdminFormPanel,
  AdminHeader,
  AdminTable,
  adminBtn,
  adminBtnOutline,
  adminInput,
} from "@/components/admin/AdminLayout";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { GalleryUpload } from "@/components/admin/GalleryUpload";
import { SeoFields } from "@/components/admin/SeoFields";
import { ValidationErrors } from "@/components/admin/ValidationErrors";
import { validateUniqueSlug, validateUrl } from "@/components/admin/validation-utils";
import { readSeo } from "@/components/admin/seo-utils";
import { WeekHoursPicker } from "@/components/admin/WeekHoursPicker";
import { setState, slugify, uid, useStore } from "@/lib/store";
import type { Listing, WeekHours } from "@/types";

export const Route = createFileRoute("/admin/listings")({ component: AdminListings });

const LISTING_CATEGORIES = ["Eat", "Drink", "Things To Do", "Shops", "Attractions"];
const AREAS = [
  "City Centre",
  "Old Town",
  "Marina",
  "Waterfront",
  "Princes Avenue",
  "Newland",
  "Avenues",
];

function AdminListings() {
  const listings = useStore((s) => s.listings);
  const offers = useStore((s) => s.offers);
  const [editing, setEditing] = useState<Listing | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const verified = listings.filter((l) => l.isVerified).length;
  const independents = listings.filter((l) => l.isIndependent).length;
  const categories = Array.from(new Set(listings.map((l) => l.category))).sort();

  const filtered = listings.filter((l) => {
    const q = query.toLowerCase();
    return (
      (categoryFilter === "all" || l.category === categoryFilter) &&
      (!q || l.name.toLowerCase().includes(q) || l.area?.toLowerCase().includes(q) || l.category.toLowerCase().includes(q))
    );
  });

  const openForm = (listing: Listing | null) => {
    setEditing(listing);
    setErrors([]);
    setShowForm(true);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name"));
    const slug = String(fd.get("slug") || slugify(name));
    const website = String(fd.get("website") || "");
    const mapUrl = String(fd.get("mapUrl") || "");
    const latitudeRaw = String(fd.get("latitude") || "").trim();
    const longitudeRaw = String(fd.get("longitude") || "").trim();
    const latitude = latitudeRaw ? Number(latitudeRaw) : undefined;
    const longitude = longitudeRaw ? Number(longitudeRaw) : undefined;
    const nextErrors = [
      validateUniqueSlug(
        slug,
        listings.map((listing) => listing.slug),
        editing?.slug,
      ),
      validateUrl(website, "Website"),
      validateUrl(mapUrl, "Map link"),
      validateCoordinatePair(latitudeRaw, longitudeRaw),
      validateCoordinate(latitude, "Latitude", -90, 90),
      validateCoordinate(longitude, "Longitude", -180, 180),
    ].filter(Boolean) as string[];
    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      return;
    }
    const gallery = String(fd.get("gallery") || "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
    const requestedActiveOfferId = String(fd.get("activeOfferId") || "") || undefined;
    const v: Listing = {
      id: editing?.id ?? uid(),
      name,
      slug,
      description: String(fd.get("description")),
      category: String(fd.get("category")),
      area: String(fd.get("area")),
      address: String(fd.get("address")),
      latitude,
      longitude,
      mapUrl: mapUrl || undefined,
      openingHours: String(fd.get("openingHours") || ""),
      hours: (() => { try { return JSON.parse(String(fd.get("hours") || "null")) as WeekHours; } catch { return undefined; } })(),
      website: website || undefined,
      phone: String(fd.get("phone") || "") || undefined,
      email: String(fd.get("email") || "") || undefined,
      featuredImage: String(fd.get("featuredImage") || "photo-1568901346375-23c9450c58cd"),
      gallery: gallery.length > 0 ? gallery : undefined,
      tags: String(fd.get("tags") || "").split(",").map((t) => t.trim()).filter(Boolean),
      isFeatured: fd.get("isFeatured") === "on",
      isHiddenGem: fd.get("isHiddenGem") === "on",
      isIndependent: fd.get("isIndependent") === "on",
      isVerified: fd.get("isVerified") === "on",
      activeOfferId: offers.some(
        (offer) =>
          offer.id === requestedActiveOfferId &&
          offer.listingId === (editing?.id ?? "") &&
          offer.status === "active",
      )
        ? requestedActiveOfferId
        : undefined,
      seo: readSeo(fd),
    };
    setState((s) => ({
      ...s,
      listings: editing ? s.listings.map((x) => (x.id === v.id ? v : x)) : [v, ...s.listings],
    }));
    setEditing(null);
    setErrors([]);
    setShowForm(false);
  };

  const remove = (id: string) => {
    if (offers.some((offer) => offer.listingId === id)) {
      alert("This listing has offers attached. Delete or reassign those offers first.");
      return;
    }
    if (!confirm("Delete this listing?")) return;
    setState((s) => ({ ...s, listings: s.listings.filter((l) => l.id !== id) }));
  };

  return (
    <div>
      <AdminHeader
        title="Listings"
        subtitle={`${listings.length} places · ${verified} verified · ${independents} independent`}
        action={
          <button onClick={() => openForm(null)} className={adminBtn}>
            <Plus className="w-3 h-3" /> New Place
          </button>
        }
      />
      <div className="p-6 md:p-10">
        {showForm && (
          <AdminFormPanel title={editing ? "Edit Place" : "New Place"}>
            <ValidationErrors errors={errors} />
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid lg:grid-cols-[1fr_340px] gap-6">
                <div className="space-y-4">
                  <AdminField label="Name">
                    <input
                      name="name"
                      defaultValue={editing?.name}
                      required
                      placeholder="Business or venue name"
                      className={adminInput}
                    />
                  </AdminField>
                  <AdminField label="Description">
                    <textarea
                      name="description"
                      defaultValue={editing?.description}
                      required
                      rows={5}
                      className={adminInput}
                      placeholder="Public listing description"
                    />
                  </AdminField>
                  <div className="grid md:grid-cols-2 gap-3">
                    <AdminField label="Address">
                      <input
                        name="address"
                        defaultValue={editing?.address}
                        required
                        placeholder="Street, Hull"
                        className={adminInput}
                      />
                    </AdminField>
                    <AdminField label="Opening hours (short description)">
                      <input
                        name="openingHours"
                        defaultValue={editing?.openingHours}
                        placeholder="e.g. Mon–Fri 9:00–17:00"
                        className={adminInput}
                      />
                    </AdminField>
                  </div>
                  <AdminField label="Opening hours by day">
                    <WeekHoursPicker name="hours" defaultValue={editing?.hours} />
                  </AdminField>
                  <div className="grid md:grid-cols-2 gap-3">
                    <AdminField label="Latitude" hint="Optional. Used for the embedded map.">
                      <input
                        name="latitude"
                        type="number"
                        step="0.000001"
                        min="-90"
                        max="90"
                        defaultValue={editing?.latitude ?? ""}
                        placeholder="53.7444"
                        className={adminInput}
                      />
                    </AdminField>
                    <AdminField label="Longitude" hint="Add both coordinates for a pinned map.">
                      <input
                        name="longitude"
                        type="number"
                        step="0.000001"
                        min="-180"
                        max="180"
                        defaultValue={editing?.longitude ?? ""}
                        placeholder="-0.3392"
                        className={adminInput}
                      />
                    </AdminField>
                  </div>
                  <AdminField
                    label="Map link"
                    hint="Optional Google or OpenStreetMap link used by the open-in-maps button."
                  >
                    <input
                      name="mapUrl"
                      type="url"
                      defaultValue={editing?.mapUrl}
                      placeholder="https://maps.google.com/..."
                      className={adminInput}
                    />
                  </AdminField>
                  <GalleryUpload key={editing?.id ?? "new"} name="gallery" defaultValue={editing?.gallery} />
                </div>

                <div className="space-y-4">
                  <AdminField label="Slug">
                    <input
                      name="slug"
                      defaultValue={editing?.slug}
                      placeholder="auto-generated-from-name"
                      className={adminInput}
                    />
                  </AdminField>
                  <AdminField label="Category">
                    <select
                      name="category"
                      defaultValue={editing?.category ?? "Eat"}
                      required
                      className={adminInput}
                    >
                      {LISTING_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </AdminField>
                  <AdminField label="Area">
                    <input
                      name="area"
                      list="admin-listing-areas"
                      defaultValue={editing?.area}
                      required
                      placeholder="City Centre"
                      className={adminInput}
                    />
                    <datalist id="admin-listing-areas">
                      {AREAS.map((area) => (
                        <option key={area} value={area} />
                      ))}
                    </datalist>
                  </AdminField>
                  <AdminField label="Website">
                    <input
                      name="website"
                      type="url"
                      defaultValue={editing?.website}
                      placeholder="https://..."
                      className={adminInput}
                    />
                  </AdminField>
                  <AdminField label="Phone">
                    <input name="phone" defaultValue={editing?.phone} className={adminInput} />
                  </AdminField>
                  <AdminField label="Email">
                    <input
                      name="email"
                      type="email"
                      defaultValue={editing?.email}
                      className={adminInput}
                    />
                  </AdminField>
                  <AdminField label="Active offer">
                    <select
                      name="activeOfferId"
                      defaultValue={editing?.activeOfferId ?? ""}
                      disabled={!editing}
                      className={adminInput}
                    >
                      <option value="">
                        {editing ? "No active offer" : "Create the place before linking offers"}
                      </option>
                      {offers
                        .filter((o) => o.status === "active" && o.listingId === editing?.id)
                        .map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.title}
                          </option>
                        ))}
                    </select>
                  </AdminField>
                  <ImageUpload
                    key={`img-${editing?.id ?? "new"}`}
                    name="featuredImage"
                    defaultValue={editing?.featuredImage}
                    label="Featured image"
                  />
                  <AdminField label="Tags / good for (comma-separated)">
                    <input
                      name="tags"
                      defaultValue={editing?.tags?.join(", ")}
                      placeholder="dog-friendly, good for dates, live sport..."
                      className={adminInput}
                    />
                  </AdminField>
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono uppercase">
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
                        name="isVerified"
                        defaultChecked={editing?.isVerified}
                      />
                      Verified
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="isHiddenGem"
                        defaultChecked={editing?.isHiddenGem}
                      />
                      Hidden Gem
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="isIndependent"
                        defaultChecked={editing?.isIndependent}
                      />
                      Independent
                    </label>
                  </div>
                </div>
              </div>
              <SeoFields
                defaultValue={editing?.seo}
                fallbackTitle={editing?.name}
                fallbackDescription={editing?.description}
              />
              <div className="flex flex-wrap gap-3 pt-2">
                <button className={adminBtn}>{editing ? "Save Place" : "Create Place"}</button>
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
            placeholder="Search places…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`${adminInput} max-w-xs`}
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={`${adminInput} w-auto`}
          >
            <option value="all">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {filtered.length !== listings.length && (
            <span className="text-xs font-mono text-muted-foreground self-center">
              {filtered.length} of {listings.length}
            </span>
          )}
        </div>

        <AdminTable
          headers={["Place", "Category", "Area", "Offer", "Flags", "Actions"]}
          rows={filtered.map((l) => [
            <div>
              <div className="font-bold">{l.name}</div>
              <div className="font-mono text-[10px] uppercase text-muted-foreground">{l.slug}</div>
            </div>,
            l.category,
            l.area,
            l.activeOfferId ? (
              <span className="text-[9px] bg-accent text-background px-1.5 py-0.5 uppercase font-bold">
                Active
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">None</span>
            ),
            <div className="flex flex-wrap gap-1">
              {l.isFeatured && (
                <span className="text-[9px] bg-accent text-background px-1.5 py-0.5 uppercase font-bold">
                  Feat
                </span>
              )}
              {l.isVerified && (
                <span className="text-[9px] bg-foreground text-background px-1.5 py-0.5 uppercase font-bold">
                  Ver
                </span>
              )}
              {l.isHiddenGem && (
                <span className="text-[9px] border border-foreground px-1.5 py-0.5 uppercase font-bold">
                  Gem
                </span>
              )}
              {l.isIndependent && (
                <span className="text-[9px] border border-foreground px-1.5 py-0.5 uppercase font-bold">
                  Indy
                </span>
              )}
            </div>,
            <div className="flex gap-3">
              <Link
                to="/places/$slug"
                params={{ slug: l.slug }}
                className="text-[10px] font-bold uppercase underline"
              >
                View
              </Link>
              <button
                onClick={() => openForm(l)}
                className="text-[10px] font-bold uppercase underline"
              >
                Edit
              </button>
              <button
                onClick={() => remove(l.id)}
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

function validateCoordinatePair(latitudeRaw: string, longitudeRaw: string) {
  if ((latitudeRaw && !longitudeRaw) || (!latitudeRaw && longitudeRaw)) {
    return "Latitude and longitude must be entered together.";
  }
  return undefined;
}

function validateCoordinate(value: number | undefined, label: string, min: number, max: number) {
  if (value === undefined) return undefined;
  if (!Number.isFinite(value)) return `${label} must be a number.`;
  if (value < min || value > max) return `${label} must be between ${min} and ${max}.`;
  return undefined;
}
