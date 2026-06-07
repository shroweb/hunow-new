import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import {
  getBusinessListings,
  updateBusinessListing,
  getListingUpdatesForOwner,
  postListingUpdateFn,
  deleteListingUpdateFn,
  getListingReviewsForOwner,
  getBusinessOffers,
  upsertBusinessOffer,
} from "@/lib/business.functions";
import type { Listing, Offer } from "@/types";
import type { ListingUpdateRow } from "@/lib/db.server";
import type { Review } from "@/lib/reviews.functions";

type Tab = "details" | "offers" | "updates" | "reviews";

export const Route = createFileRoute("/business/listings")({
  loader: async () => ({ listings: await getBusinessListings() }),
  component: BusinessListings,
});

function BusinessListings() {
  const { listings: initialListings } = Route.useLoaderData();
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [selected, setSelected] = useState<Listing | null>(null);
  const [tab, setTab] = useState<Tab>("details");
  const [detailStatus, setDetailStatus] = useState("");
  const [updates, setUpdates] = useState<ListingUpdateRow[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingTab, setLoadingTab] = useState(false);
  const [newUpdate, setNewUpdate] = useState("");
  const [postingUpdate, setPostingUpdate] = useState(false);
  const [offerStatus, setOfferStatus] = useState("");

  async function selectListing(listing: Listing) {
    setSelected(listing);
    setTab("details");
    setDetailStatus("");
    setUpdates([]);
    setOffers([]);
    setReviews([]);
    setOfferStatus("");
  }

  async function switchTab(next: Tab) {
    setTab(next);
    if (!selected) return;
    if (next === "updates" && updates.length === 0) {
      setLoadingTab(true);
      try {
        setUpdates(await getListingUpdatesForOwner({ data: { listingId: selected.id } }));
      } finally {
        setLoadingTab(false);
      }
    }
    if (next === "offers" && offers.length === 0) {
      setLoadingTab(true);
      try {
        setOffers(await getBusinessOffers());
      } finally {
        setLoadingTab(false);
      }
    }
    if (next === "reviews" && reviews.length === 0) {
      setLoadingTab(true);
      try {
        setReviews(await getListingReviewsForOwner({ data: { listingId: selected.id } }));
      } finally {
        setLoadingTab(false);
      }
    }
  }

  async function onSaveDetails(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;
    const fd = new FormData(e.currentTarget);
    setDetailStatus("Saving…");
    try {
      const updated = await updateBusinessListing({
        data: {
          listingId: selected.id,
          description: String(fd.get("description")),
          openingHours: String(fd.get("openingHours") || ""),
          website: String(fd.get("website") || ""),
          phone: String(fd.get("phone") || ""),
          email: String(fd.get("email") || ""),
        },
      });
      setListings((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setSelected(updated);
      setDetailStatus("Saved");
    } catch (err) {
      setDetailStatus(err instanceof Error ? err.message : "Unable to save.");
    }
  }

  async function onPostUpdate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected || !newUpdate.trim()) return;
    setPostingUpdate(true);
    try {
      await postListingUpdateFn({ data: { listingId: selected.id, body: newUpdate.trim() } });
      const fresh = await getListingUpdatesForOwner({ data: { listingId: selected.id } });
      setUpdates(fresh);
      setNewUpdate("");
    } finally {
      setPostingUpdate(false);
    }
  }

  async function onSubmitOffer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;
    const fd = new FormData(e.currentTarget);
    setOfferStatus("Submitting for review...");
    try {
      const offer = await upsertBusinessOffer({
        data: {
          listingId: selected.id,
          title: String(fd.get("title") || ""),
          description: String(fd.get("description") || ""),
          terms: String(fd.get("terms") || ""),
          code: String(fd.get("code") || ""),
          startDate: String(fd.get("startDate") || ""),
          endDate: String(fd.get("endDate") || ""),
          category: String(fd.get("category") || selected.category),
        },
      });
      setOffers((current) => [offer, ...current.filter((item) => item.id !== offer.id)]);
      e.currentTarget.reset();
      setOfferStatus("Submitted. HU NOW will review it before it appears publicly.");
    } catch (err) {
      setOfferStatus(err instanceof Error ? err.message : "Unable to submit offer.");
    }
  }

  async function onDeleteUpdate(id: string) {
    if (!confirm("Delete this update?")) return;
    await deleteListingUpdateFn({ data: { updateId: id } });
    setUpdates((prev) => prev.filter((u) => u.id !== id));
  }

  return (
    <PublicLayout>
      <section className="max-w-6xl mx-auto px-4 py-12 md:py-20 border-b-2 border-foreground">
        <div className="font-mono text-[10px] uppercase text-accent mb-4">Business account</div>
        <h1 className="font-display text-6xl md:text-8xl uppercase leading-none mb-4">
          My Listings
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Manage the listings you have claimed and had approved by HU NOW.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12 grid lg:grid-cols-[320px_1fr] gap-8">
        {/* Listing selector */}
        <aside className="space-y-3">
          {listings.length === 0 ? (
            <div className="border-2 border-foreground bg-white p-5">
              <p className="text-sm text-muted-foreground mb-4">
                No approved listings yet. Find your business page and use "Claim this listing".
              </p>
              <Link to="/listings" className="font-bold uppercase text-xs underline">
                Browse listings
              </Link>
            </div>
          ) : (
            listings.map((listing) => (
              <button
                key={listing.id}
                type="button"
                onClick={() => selectListing(listing)}
                className={`w-full text-left border-2 p-4 transition-colors ${
                  selected?.id === listing.id
                    ? "border-accent bg-accent/10"
                    : "border-foreground bg-white hover:bg-foreground/5"
                }`}
              >
                <span className="block font-bold">{listing.name}</span>
                <span className="font-mono text-[10px] uppercase text-muted-foreground">
                  {listing.category} · {listing.area}
                </span>
              </button>
            ))
          )}
        </aside>

        {/* Detail panel */}
        {selected && (
          <div className="space-y-0">
            {/* Tabs */}
            <div className="flex border-b-2 border-foreground mb-0">
              {(["details", "offers", "updates", "reviews"] as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => switchTab(t)}
                  className={`px-6 py-3 text-xs font-bold uppercase tracking-widest border-b-2 -mb-[2px] transition-colors ${
                    tab === t
                      ? "border-accent text-accent"
                      : "border-transparent text-foreground/50 hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Details tab */}
            {tab === "details" && (
              <form
                onSubmit={onSaveDetails}
                className="border-2 border-t-0 border-foreground bg-white p-6 space-y-4"
              >
                <h2 className="font-display text-4xl uppercase">{selected.name}</h2>
                <Field label="Description">
                  <textarea
                    name="description"
                    defaultValue={selected.description}
                    rows={5}
                    className={fieldClass}
                  />
                </Field>
                <Field label="Opening hours summary">
                  <input
                    name="openingHours"
                    defaultValue={selected.openingHours}
                    className={fieldClass}
                  />
                </Field>
                <div className="grid md:grid-cols-3 gap-3">
                  <Field label="Website">
                    <input name="website" defaultValue={selected.website} className={fieldClass} />
                  </Field>
                  <Field label="Phone">
                    <input name="phone" defaultValue={selected.phone} className={fieldClass} />
                  </Field>
                  <Field label="Email">
                    <input name="email" defaultValue={selected.email} className={fieldClass} />
                  </Field>
                </div>
                <div className="flex items-center gap-4">
                  <button className="bg-foreground text-background px-6 py-3 font-bold uppercase tracking-widest text-xs">
                    Save Changes
                  </button>
                  {detailStatus && <span className="text-sm font-bold">{detailStatus}</span>}
                </div>
              </form>
            )}

            {/* Offers tab */}
            {tab === "offers" && (
              <div className="border-2 border-t-0 border-foreground bg-white p-6 space-y-6">
                <div>
                  <h2 className="font-display text-3xl uppercase mb-1">{selected.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    Submit offers for HU NOW review. Approved offers appear on your listing and the
                    offers page.
                  </p>
                </div>
                <form
                  onSubmit={onSubmitOffer}
                  className="space-y-4 border border-foreground/15 p-4"
                >
                  <div className="grid md:grid-cols-2 gap-3">
                    <Field label="Offer title">
                      <input
                        name="title"
                        required
                        maxLength={120}
                        placeholder="20% off weekday lunch"
                        className={fieldClass}
                      />
                    </Field>
                    <Field label="Category">
                      <input
                        name="category"
                        defaultValue={selected.category}
                        required
                        maxLength={80}
                        className={fieldClass}
                      />
                    </Field>
                  </div>
                  <Field label="Description">
                    <textarea
                      name="description"
                      required
                      rows={3}
                      maxLength={700}
                      placeholder="Short, clear copy for customers."
                      className={fieldClass}
                    />
                  </Field>
                  <Field label="Terms">
                    <textarea
                      name="terms"
                      rows={2}
                      maxLength={1000}
                      placeholder="Optional terms, dates, exclusions or booking notes."
                      className={fieldClass}
                    />
                  </Field>
                  <div className="grid md:grid-cols-3 gap-3">
                    <Field label="Code">
                      <input
                        name="code"
                        maxLength={80}
                        placeholder="Optional"
                        className={fieldClass}
                      />
                    </Field>
                    <Field label="Start date">
                      <input name="startDate" type="date" required className={fieldClass} />
                    </Field>
                    <Field label="End date">
                      <input name="endDate" type="date" required className={fieldClass} />
                    </Field>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <button className="bg-foreground text-background px-6 py-3 font-bold uppercase tracking-widest text-xs">
                      Submit Offer
                    </button>
                    {offerStatus && <span className="text-sm font-bold">{offerStatus}</span>}
                  </div>
                </form>

                {loadingTab ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : offers.filter((offer) => offer.listingId === selected.id).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No offers submitted yet.</p>
                ) : (
                  <div className="space-y-3">
                    {offers
                      .filter((offer) => offer.listingId === selected.id)
                      .map((offer) => (
                        <div
                          key={offer.id}
                          className="border border-foreground/15 p-4 flex gap-4 justify-between"
                        >
                          <div>
                            <div className="font-bold">{offer.title}</div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {offer.description}
                            </p>
                            <p className="font-mono text-[10px] uppercase text-muted-foreground mt-2">
                              {offer.startDate} to {offer.endDate}
                            </p>
                          </div>
                          <span
                            className={`h-fit font-mono text-[10px] uppercase px-2 py-1 ${
                              offer.status === "active"
                                ? "bg-foreground text-background"
                                : offer.status === "rejected"
                                  ? "border border-red-500 text-red-600"
                                  : "border border-foreground/30"
                            }`}
                          >
                            {offer.status}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Updates tab */}
            {tab === "updates" && (
              <div className="border-2 border-t-0 border-foreground bg-white p-6 space-y-6">
                <div>
                  <h2 className="font-display text-3xl uppercase mb-1">{selected.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    Post short updates that appear on your listing page — new menus, closures,
                    special events.
                  </p>
                </div>
                <form onSubmit={onPostUpdate} className="space-y-3">
                  <textarea
                    value={newUpdate}
                    onChange={(e) => setNewUpdate(e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="New summer menu now available every Friday evening…"
                    className={fieldClass}
                  />
                  <div className="flex items-center justify-between gap-4">
                    <button
                      type="submit"
                      disabled={postingUpdate || !newUpdate.trim()}
                      className="bg-foreground text-background px-6 py-3 font-bold uppercase tracking-widest text-xs disabled:opacity-40"
                    >
                      {postingUpdate ? "Posting…" : "Post Update"}
                    </button>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {newUpdate.length}/500
                    </span>
                  </div>
                </form>

                {loadingTab ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : updates.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No updates posted yet.</p>
                ) : (
                  <div className="space-y-3">
                    {updates.map((u) => (
                      <div
                        key={u.id}
                        className="border border-foreground/15 p-4 flex gap-4 justify-between"
                      >
                        <div>
                          <p className="text-sm">{u.body}</p>
                          <p className="font-mono text-[10px] text-muted-foreground mt-1">
                            {new Date(u.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onDeleteUpdate(u.id)}
                          className="shrink-0 text-[10px] font-bold uppercase text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reviews tab */}
            {tab === "reviews" && (
              <div className="border-2 border-t-0 border-foreground bg-white p-6 space-y-4">
                <div>
                  <h2 className="font-display text-3xl uppercase mb-1">{selected.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    All reviews for your listing. Pending reviews are awaiting admin approval before
                    going public.
                  </p>
                </div>
                {loadingTab ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : reviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No reviews yet.</p>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((r) => (
                      <div key={r.id} className="border border-foreground/15 p-4 space-y-1">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <Stars rating={r.rating} />
                            <span className="font-bold text-sm">{r.userName}</span>
                          </div>
                          <span
                            className={`font-mono text-[10px] uppercase px-2 py-0.5 ${
                              r.status === "approved"
                                ? "bg-foreground text-background"
                                : "border border-foreground/30"
                            }`}
                          >
                            {r.status}
                          </span>
                        </div>
                        {r.body && <p className="text-sm text-muted-foreground">{r.body}</p>}
                        <p className="font-mono text-[10px] text-muted-foreground">
                          {new Date(r.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-accent text-sm" aria-label={`${rating} out of 5`}>
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
    </span>
  );
}

const fieldClass =
  "w-full bg-background border-2 border-foreground px-4 py-3 font-mono text-sm focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
