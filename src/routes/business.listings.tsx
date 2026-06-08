import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef, type FormEvent } from "react";
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
  getBusinessRedemptionsFn,
} from "@/lib/business.functions";
import type { Listing, Offer } from "@/types";
import type { ListingUpdateRow } from "@/lib/db.server";
import type { Review } from "@/lib/reviews.functions";

type Tab = "details" | "offers" | "redeem" | "updates" | "reviews";

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
              {(["details", "offers", "redeem", "updates", "reviews"] as Tab[]).map((t) => (
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

            {/* Redeem tab */}
            {tab === "redeem" && (
              <div className="border-2 border-t-0 border-foreground bg-white p-6 space-y-8">
                <div>
                  <h2 className="font-display text-3xl uppercase mb-1">Redeem Offer</h2>
                  <p className="text-sm text-muted-foreground">
                    Scan a customer's QR code or enter their 6-digit code to redeem an offer.
                  </p>
                </div>
                <RedeemPanel offers={offers} listingId={selected.id} />
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

interface RedeemResult {
  customer_name: string;
  points_awarded: number;
  customer_points: number;
  customer_tier: string;
  method: string;
}

function RedeemPanel({ offers, listingId }: { offers: Offer[]; listingId: string }) {
  const [mode, setMode] = useState<"qr" | "code">("qr");

  // QR state
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<import("@zxing/browser").IScannerControls | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scannedToken, setScannedToken] = useState("");
  const [selectedOffer, setSelectedOffer] = useState(offers[0]?.id ?? "");

  // Code state
  const [enteredCode, setEnteredCode] = useState("");

  // Shared state
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [redeemResult, setRedeemResult] = useState<RedeemResult | null>(null);

  // History
  const [history, setHistory] = useState<
    {
      id: string;
      offer_title: string | null;
      customer_name: string | null;
      redeemed_at: string;
      method: string;
    }[]
  >([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const loadHistory = () => {
    getBusinessRedemptionsFn({ data: { listingId } })
      .then(setHistory)
      .catch(() => {})
      .finally(() => setHistoryLoaded(true));
  };

  useEffect(() => {
    loadHistory();
  }, [listingId]);
  useEffect(
    () => () => {
      controlsRef.current?.stop();
    },
    [],
  );

  const startScan = async () => {
    const { BrowserQRCodeReader } = await import("@zxing/browser");
    const reader = new BrowserQRCodeReader();
    setScanning(true);
    setScannedToken("");
    setStatus("idle");
    setRedeemResult(null);
    try {
      const controls = await reader.decodeFromVideoDevice(
        undefined,
        videoRef.current!,
        (result, _err, controls) => {
          if (result) {
            controls.stop();
            const text = result.getText();
            // QR encodes "https://hunow.co.uk/c/<token>" — extract just the token
            const match = text.match(/\/c\/([0-9a-f-]{36})/i);
            setScannedToken(match ? match[1] : text);
            setScanning(false);
          }
        },
      );
      controlsRef.current = controls;
    } catch {
      setScanning(false);
    }
  };

  const stopScan = () => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setScanning(false);
  };

  const doRedeem = async (body: Record<string, string>) => {
    setStatus("loading");
    setRedeemResult(null);
    try {
      const res = await fetch("/api/v1/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as RedeemResult & { error?: string; success?: boolean };
      if (!res.ok || !data.success) throw new Error(data.error ?? "Redemption failed");
      setStatus("success");
      setStatusMsg(`Redeemed for ${data.customer_name}!`);
      setRedeemResult(data);
      setScannedToken("");
      setEnteredCode("");
      loadHistory();
    } catch (err) {
      setStatus("error");
      setStatusMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const reset = () => {
    setStatus("idle");
    setStatusMsg("");
    setRedeemResult(null);
    setScannedToken("");
    setEnteredCode("");
  };

  if (offers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground font-mono">
        No active offers — add one in the Offers tab first.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex border-2 border-foreground max-w-xs">
        {(["qr", "code"] as const).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              reset();
            }}
            className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${mode === m ? "bg-foreground text-background" : "hover:bg-foreground/5"}`}
          >
            {m === "qr" ? "Scan QR" : "Enter Code"}
          </button>
        ))}
      </div>

      <div className="max-w-sm space-y-4">
        {mode === "qr" && (
          <>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
                Select offer
              </label>
              <select
                value={selectedOffer}
                onChange={(e) => setSelectedOffer(e.target.value)}
                className={fieldClass}
              >
                {offers.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.title}
                  </option>
                ))}
              </select>
            </div>
            <div
              className={`relative bg-foreground/5 border-2 border-foreground overflow-hidden ${scanning ? "block" : "hidden"}`}
            >
              <video
                ref={videoRef}
                className="w-full aspect-square object-cover"
                autoPlay
                muted
                playsInline
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-accent" />
              </div>
              <button
                onClick={stopScan}
                className="absolute top-2 right-2 bg-foreground text-background text-[10px] font-bold uppercase px-3 py-1.5"
              >
                Cancel
              </button>
            </div>
            {scannedToken ? (
              <div className="space-y-3">
                <p className="text-xs font-mono text-accent">✓ Card scanned</p>
                <button
                  onClick={() => doRedeem({ qr_token: scannedToken, offer_id: selectedOffer })}
                  disabled={status === "loading"}
                  className="w-full bg-accent text-background py-3 font-bold uppercase tracking-widest text-xs hover:bg-foreground transition-colors disabled:opacity-50"
                >
                  {status === "loading" ? "Redeeming…" : "Confirm Redemption"}
                </button>
                <button
                  onClick={reset}
                  className="w-full border-2 border-foreground py-2.5 font-bold uppercase tracking-widest text-[10px] hover:bg-foreground/5"
                >
                  Scan Again
                </button>
              </div>
            ) : (
              !scanning && (
                <button
                  onClick={startScan}
                  className="w-full flex items-center justify-center gap-2 bg-foreground text-background py-3 font-bold uppercase tracking-widest text-xs hover:bg-accent transition-colors"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  Scan Customer Card
                </button>
              )
            )}
          </>
        )}

        {mode === "code" && (
          <div className="space-y-4">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
                6-digit customer code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={enteredCode}
                onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className={`${fieldClass} text-2xl tracking-[0.4em] font-bold text-center`}
              />
            </div>
            <button
              onClick={() => doRedeem({ code: enteredCode })}
              disabled={enteredCode.length !== 6 || status === "loading"}
              className="w-full bg-foreground text-background py-3 font-bold uppercase tracking-widest text-xs hover:bg-accent transition-colors disabled:opacity-40"
            >
              {status === "loading" ? "Redeeming…" : "Redeem Code"}
            </button>
          </div>
        )}

        {/* Result */}
        {status === "success" && redeemResult && (
          <div className="bg-foreground text-background p-4 space-y-1">
            <p className="font-bold text-sm">{redeemResult.customer_name}</p>
            <p className="font-mono text-[10px] text-white/70 uppercase">
              +{redeemResult.points_awarded} pts · {redeemResult.customer_points} total ·{" "}
              {redeemResult.customer_tier}
            </p>
            <button
              onClick={reset}
              className="mt-2 text-[10px] font-bold uppercase tracking-widest text-accent"
            >
              Redeem another →
            </button>
          </div>
        )}
        {status === "error" && <p className="text-sm font-bold text-red-600">{statusMsg}</p>}
      </div>

      {/* Redemption history */}
      <div className="border-t border-foreground/10 pt-6">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
          Recent redemptions
        </div>
        {!historyLoaded ? (
          <p className="font-mono text-xs text-muted-foreground">Loading…</p>
        ) : history.length === 0 ? (
          <p className="font-mono text-xs text-muted-foreground">No redemptions yet.</p>
        ) : (
          <div className="space-y-2">
            {history.map((r) => (
              <div
                key={r.id}
                className="border border-foreground/10 p-3 flex justify-between gap-3 text-sm"
              >
                <div>
                  <p className="font-bold">{r.offer_title ?? "Offer"}</p>
                  {r.customer_name && (
                    <p className="font-mono text-[10px] text-muted-foreground">{r.customer_name}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {new Date(r.redeemed_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                  <p className="font-mono text-[9px] text-accent uppercase">{r.method}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

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
