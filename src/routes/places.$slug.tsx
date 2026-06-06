import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect, useRef, type FormEvent } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ArticleCard, ListingCard, EventCard, OfferCard } from "@/components/cards";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SaveButton } from "@/components/SaveButton";
import { ShareMenu } from "@/components/ShareMenu";
import { Gallery } from "@/components/Lightbox";
import { openStatus, formatWeek } from "@/lib/hours";
import { addToHistory } from "@/lib/reading-history";
import { useStore } from "@/lib/store";
import { fetchListingBySlug } from "@/lib/store.functions";
import { autoLink } from "@/lib/autolink";
import {
  getListingReviews,
  submitReview,
  deleteReview,
  type Review,
} from "@/lib/reviews.functions";
import { getCurrentUser } from "@/lib/auth.functions";
import { claimListing } from "@/lib/business.functions";
import { img } from "@/data/seed";
import type { Listing } from "@/types";
import { relatedForListing } from "@/lib/related-content";

export const Route = createFileRoute("/places/$slug")({
  component: PlaceDetail,
  loader: async ({ params }) => {
    const listing = await fetchListingBySlug({ data: { slug: params.slug } });
    if (!listing) throw notFound();
    const { getListingUpdates } = await import("@/lib/db.server");
    const [reviews, user, updates] = await Promise.all([
      getListingReviews({ data: { listingId: listing.id } }).catch(() => [] as Review[]),
      getCurrentUser().catch(() => null),
      getListingUpdates(listing.id).catch(() => []),
    ]);
    return { listing, reviews, user, updates };
  },
  head: ({ loaderData, params }) => {
    const l = loaderData?.listing;
    if (!l) return {};
    const title = l.seo?.title ?? `${l.name} — ${l.category} in ${l.area} — HU NOW`;
    const description = l.seo?.description ?? l.description;
    const image = l.seo?.ogImage ?? img(l.featuredImage, 1200, 630);
    const url = `/places/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        ...(l.seo?.noIndex ? [{ name: "robots", content: "noindex,nofollow" }] : []),
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "place" },
        { property: "og:url", content: url },
        { property: "og:image", content: image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
      ],
      links: [{ rel: "canonical", href: l.seo?.canonicalUrl ?? url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: l.name,
            description: l.description,
            image,
            url: l.website ?? `${process.env.SITE_URL ?? "https://hunow.co.uk"}${url}`,
            sameAs: l.website,
            telephone: l.phone,
            address: {
              "@type": "PostalAddress",
              streetAddress: l.address,
              addressLocality: "Hull",
              addressCountry: "GB",
            },
            geo:
              l.latitude != null
                ? { "@type": "GeoCoordinates", latitude: l.latitude, longitude: l.longitude }
                : undefined,
            openingHours: l.openingHours,
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 py-32 text-center">
        <h1 className="font-display text-6xl mb-4">PLACE NOT FOUND</h1>
        <Link to="/places" className="underline">
          Back to Places
        </Link>
      </div>
    </PublicLayout>
  ),
});

function PlaceDetail() {
  const { slug } = Route.useParams();
  const { listing: loadedListing, reviews: initialReviews, user, updates } = Route.useLoaderData();
  const listings = useStore((s) => s.listings);
  const articles = useStore((s) => s.articles);
  const offers = useStore((s) => s.offers);
  const events = useStore((s) => s.events);
  const listing = listings.find((l) => l.slug === slug) ?? loadedListing;
  if (!listing) throw notFound();

  const entities = [
    ...listings
      .filter((l) => l.id !== listing.id)
      .map((l) => ({ name: l.name, path: `/places/${l.slug}` })),
    ...events.map((e) => ({ name: e.title, path: `/events/${e.slug}` })),
    ...articles.map((a) => ({ name: a.title, path: `/stories/${a.slug}` })),
  ];
  const linkedDescription = autoLink(listing.description, entities);

  useEffect(() => {
    addToHistory({ kind: "place", id: listing.id, slug: listing.slug, title: listing.name });
  }, [listing.id]);
  const offer = listing.activeOfferId
    ? offers.find(
        (o) =>
          o.id === listing.activeOfferId && o.listingId === listing.id && o.status === "active",
      )
    : undefined;
  const {
    articles: relatedArticles,
    events: nearbyEvents,
    listings: similar,
  } = relatedForListing({
    listing,
    articles,
    events,
    listings,
  });
  const nearbyOffers = offers
    .filter((o) => o.listingId !== listing.id && o.status === "active")
    .slice(0, 2);
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${listing.name} ${listing.address}`)}`;
  const mapLinkUrl = listing.mapUrl || directionsUrl;
  const status = openStatus(listing.hours);
  const week = formatWeek(listing.hours);
  const gallery =
    listing.gallery && listing.gallery.length > 0 ? listing.gallery : [listing.featuredImage];

  return (
    <PublicLayout>
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Listings", to: "/listings" },
          { label: listing.category },
          { label: listing.name },
        ]}
      />

      <section className="max-w-7xl mx-auto px-4 py-8 md:py-10 border-b-2 border-foreground">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(240px,360px)_1fr] gap-8 lg:gap-12 items-center">
          <div className="max-w-[360px]">
            <div className="aspect-[4/5] bg-stone-200 overflow-hidden border-2 border-foreground">
              <img
                src={img(listing.featuredImage, 900, 900)}
                alt={`${listing.name} – ${listing.category} in ${listing.area}`}
                width={900}
                height={900}
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="min-w-0">
            <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <span>{listing.category}</span>
              <span className="text-foreground/25">/</span>
              <span>{listing.area}</span>
              {listing.isIndependent && (
                <>
                  <span className="text-foreground/25">/</span>
                  <span>Independent</span>
                </>
              )}
              {listing.isVerified && (
                <>
                  <span className="text-foreground/25">/</span>
                  <span className="text-foreground">Verified</span>
                </>
              )}
              {offer && (
                <span className="ml-1 bg-accent text-background px-2.5 py-1.5 leading-none">
                  Active Offer
                </span>
              )}
              <span
                className={`px-2.5 py-1.5 leading-none ${status.open ? "bg-[oklch(0.58_0.15_145)] text-background" : "border border-foreground/30 text-foreground"}`}
              >
                {status.label}
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-display uppercase leading-[0.9] mb-5">
              {listing.name}
            </h1>
            <p className="text-lg md:text-xl leading-relaxed text-muted-foreground max-w-3xl mb-7">
              {listing.description}
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center px-5 bg-foreground text-background text-xs font-bold uppercase tracking-widest hover:bg-accent transition-colors"
              >
                Get Directions
              </a>
              {listing.website && (
                <a
                  href={listing.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center px-5 border-2 border-foreground text-xs font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
                >
                  Visit Website
                </a>
              )}
              {listing.phone && (
                <a
                  href={`tel:${listing.phone}`}
                  className="inline-flex h-12 items-center px-5 border-2 border-foreground text-xs font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
                >
                  Call
                </a>
              )}
              <SaveButton
                kind="place"
                id={listing.id}
                slug={listing.slug}
                title={listing.name}
                className="inline-flex h-12 items-center px-5 border-2 border-foreground text-xs font-bold uppercase tracking-widest transition-colors hover:bg-foreground hover:text-background"
              />
              <ShareMenu
                title={listing.name}
                text={listing.description}
                className="inline-flex h-12 items-center px-5 border-2 border-foreground text-xs font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Body — two columns: info card + about */}
      <section className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Sidebar info card */}
        <aside className="lg:col-span-4 lg:order-2">
          <div className="lg:sticky lg:top-24 space-y-6">
            <div className="border-2 border-foreground bg-white">
              <div className="bg-foreground text-background px-4 py-2 text-[10px] font-bold uppercase tracking-widest">
                Business Info
              </div>
              <dl className="divide-y divide-foreground/10 font-mono text-xs">
                <InfoRow label="Address" value={listing.address} />
                <InfoRow label="Area" value={listing.area} />
                {week.length > 0 ? (
                  <div className="px-4 py-3">
                    <dt className="uppercase text-muted-foreground mb-1">Hours</dt>
                    <dd
                      className={`text-[11px] font-bold mb-2 ${status.open ? "text-[oklch(0.58_0.15_145)]" : ""}`}
                    >
                      {status.label}
                    </dd>
                    <dl className="space-y-0.5">
                      {week.map((d) => (
                        <div key={d.label} className="flex justify-between">
                          <dt className="text-muted-foreground">{d.label}</dt>
                          <dd className="font-bold">{d.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ) : (
                  <InfoRow label="Hours" value={listing.openingHours} />
                )}
                {listing.phone && <InfoRow label="Phone" value={listing.phone} />}
                {listing.email && <InfoRow label="Email" value={listing.email} />}
                {listing.website && (
                  <div className="px-4 py-3">
                    <dt className="uppercase text-muted-foreground mb-1">Website</dt>
                    <dd className="font-bold break-all">
                      <a
                        href={listing.website}
                        target="_blank"
                        rel="noreferrer"
                        className="underline hover:text-accent"
                      >
                        {listing.website.replace(/^https?:\/\//, "")}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="border-2 border-foreground bg-background overflow-hidden">
              <div className="flex items-center justify-between gap-3 bg-foreground text-background px-4 py-2">
                <div className="text-[10px] font-bold uppercase tracking-widest">Map</div>
                <a
                  href={mapLinkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] font-bold uppercase tracking-widest underline"
                >
                  Open in Maps →
                </a>
              </div>
              <ListingMap listing={listing} />
            </div>

            <Link
              to="/submit"
              className="block text-center px-4 py-3 border-2 border-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
            >
              Suggest an edit
            </Link>
            <ClaimListingPanel
              listingId={listing.id}
              user={user}
              owned={user?.id === listing.ownerUserId}
            />
          </div>
        </aside>

        {/* Main content */}
        <div className="lg:col-span-8 lg:order-1 space-y-10">
          {offer && (
            <div className="border-2 border-accent bg-accent/10 p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="size-12 shrink-0 bg-accent text-background grid place-items-center font-display text-2xl">
                  %
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-mono uppercase mb-1 text-accent">
                    Reader Offer
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">{offer.title}</h3>
                  <p className="mb-4 text-muted-foreground">{offer.description}</p>
                  <Link
                    to="/offers"
                    className="inline-block bg-foreground text-background px-5 py-2.5 font-bold uppercase tracking-widest text-[10px] hover:bg-accent transition-colors"
                  >
                    Claim Offer
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-3xl font-display uppercase border-b-2 border-foreground pb-2 mb-4">
              About
            </h2>
            <p
              className="text-lg leading-relaxed mb-4"
              dangerouslySetInnerHTML={{ __html: linkedDescription }}
            />
            {listing.tags && listing.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {listing.tags.map((tag: string) => (
                  <Link
                    key={tag}
                    to="/tag/$tag"
                    params={{ tag: encodeURIComponent(tag.toLowerCase()) }}
                    className="px-3 py-1 text-[11px] font-bold uppercase tracking-wide border border-foreground/20 hover:bg-foreground/5 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-3xl font-display uppercase border-b-2 border-foreground pb-2 mb-4">
              Photos
            </h2>
            <Gallery images={gallery} alt={listing.name} />
          </div>

          <div>
            <h2 className="text-3xl font-display uppercase border-b-2 border-foreground pb-2 mb-4">
              At a Glance
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Stat label="Category" value={listing.category} />
              <Stat label="Area" value={listing.area} />
              <Stat label="Independent" value={listing.isIndependent ? "Yes" : "No"} />
              <Stat label="Hidden Gem" value={listing.isHiddenGem ? "Yes" : "No"} />
            </div>
          </div>

          {updates && updates.length > 0 && (
            <div className="mt-8 pt-8 border-t border-border space-y-3">
              <h2 className="text-2xl font-display uppercase">From the owner</h2>
              {updates.map((u) => (
                <div key={u.id} className="border-l-2 border-accent pl-4 py-1">
                  <p className="text-sm">{u.body}</p>
                  <p className="font-mono text-[10px] text-muted-foreground mt-1">
                    {new Date(u.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}

          <ReviewsSection
            listingId={listing.id}
            initialReviews={initialReviews ?? []}
            user={user}
          />
        </div>
      </section>

      {(nearbyEvents.length > 0 || nearbyOffers.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 py-12 border-t-2 border-foreground">
          <h2 className="text-4xl font-display uppercase mb-2">Nearby in {listing.area}</h2>
          <p className="text-sm text-muted-foreground mb-8">
            Events and offers near {listing.name}.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {nearbyEvents.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
            {nearbyOffers.map((o) => (
              <OfferCard key={o.id} offer={o} />
            ))}
          </div>
        </section>
      )}

      {relatedArticles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16 border-t-2 border-foreground">
          <h2 className="text-4xl font-display uppercase mb-8">From the Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedArticles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}

      {similar.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16 border-t-2 border-foreground">
          <h2 className="text-4xl font-display uppercase mb-8">Similar Places</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {similar.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}
    </PublicLayout>
  );
}

function ClaimListingPanel({
  listingId,
  user,
  owned,
}: {
  listingId: string;
  user: { id: string; name: string } | null;
  owned: boolean;
}) {
  const [message, setMessage] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [status, setStatus] = useState("");

  if (owned) {
    return (
      <Link
        to="/business/listings"
        className="block text-center px-4 py-3 border-2 border-accent bg-accent/10 text-[10px] font-bold uppercase tracking-widest hover:bg-accent hover:text-background transition-colors"
      >
        Manage this listing
      </Link>
    );
  }

  if (!user) {
    return (
      <div className="border-2 border-foreground bg-white p-4">
        <div className="font-mono text-[10px] uppercase text-muted-foreground mb-2">
          Own this business?
        </div>
        <Link
          to="/sign-in"
          search={{ redirect: windowSafePath() }}
          className="font-bold text-xs uppercase underline"
        >
          Sign in to claim it
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setStatus("Sending...");
        void claimListing({ data: { listingId, message, proofUrl } })
          .then(() => setStatus("Claim sent for review"))
          .catch((error) => setStatus(error instanceof Error ? error.message : "Unable to claim."));
      }}
      className="border-2 border-foreground bg-white p-4 space-y-3"
    >
      <div>
        <div className="font-mono text-[10px] uppercase text-muted-foreground mb-1">
          Own this business?
        </div>
        <p className="text-xs text-muted-foreground">
          Claim it to manage basic listing details from your account.
        </p>
      </div>
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="Tell us your role at the business"
        className="w-full border border-foreground/30 bg-background p-3 text-xs font-mono"
      />
      <input
        value={proofUrl}
        onChange={(event) => setProofUrl(event.target.value)}
        maxLength={500}
        placeholder="Optional proof link, e.g. website admin page or Companies House"
        className="w-full border border-foreground/30 bg-background p-3 text-xs font-mono"
      />
      <button
        type="submit"
        className="w-full bg-foreground text-background px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-colors"
      >
        Claim this listing
      </button>
      {status && <p className="text-xs font-bold">{status}</p>}
    </form>
  );
}

function windowSafePath() {
  if (typeof window === "undefined") return "/business/listings";
  return window.location.pathname;
}

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`text-2xl leading-none ${n <= value ? "text-accent" : "text-foreground/20"} hover:text-accent transition-colors`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function ReviewsSection({
  listingId,
  initialReviews,
  user,
}: {
  listingId: string;
  initialReviews: Review[];
  user: { id: string; name: string } | null;
}) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const avgRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : null;
  const userReview = user ? reviews.find((r) => r.userId === user.id) : null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await submitReview({ data: { listingId, rating, body: body.trim() || undefined } });
      const fresh = await getListingReviews({ data: { listingId } });
      setReviews(fresh);
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    await deleteReview({ data: { reviewId } }).catch(() => {});
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  };

  return (
    <div>
      <div className="flex items-baseline gap-4 border-b-2 border-foreground pb-2 mb-6">
        <h2 className="text-3xl font-display uppercase">Reviews</h2>
        {avgRating && (
          <span className="font-mono text-sm text-muted-foreground">
            {avgRating} / 5 · {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </span>
        )}
      </div>

      {user && !userReview && (
        <form
          onSubmit={handleSubmit}
          className="border-2 border-foreground p-5 mb-8 space-y-4 bg-white"
        >
          <div className="text-[10px] font-mono uppercase font-bold tracking-widest">
            Leave a review
          </div>
          <StarPicker value={rating} onChange={setRating} />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="What did you think? (optional)"
            className="w-full border-2 border-foreground px-4 py-3 font-mono text-sm bg-background focus:outline-none resize-none"
          />
          {error && <p className="text-sm font-bold text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-foreground text-background text-xs font-bold uppercase tracking-widest hover:bg-accent transition-colors disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit review"}
          </button>
        </form>
      )}

      {!user && (
        <p className="mb-6 text-sm text-muted-foreground">
          <a href="/sign-in" className="font-bold underline hover:text-accent">
            Sign in
          </a>{" "}
          to leave a review.
        </p>
      )}

      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews yet — be the first.</p>
      ) : (
        <ul className="space-y-5">
          {reviews.map((r) => (
            <li key={r.id} className="border border-foreground/10 p-4 bg-white">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className="font-bold text-sm">{r.userName}</span>
                  <span className="ml-3 text-accent tracking-widest">
                    {"★".repeat(r.rating)}
                    {"☆".repeat(5 - r.rating)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  {user && user.id === r.userId && (
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-[10px] uppercase font-bold text-muted-foreground hover:text-red-600"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              {r.body && <p className="text-sm text-muted-foreground">{r.body}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3">
      <dt className="uppercase text-muted-foreground mb-1">{label}</dt>
      <dd className="font-bold">{value}</dd>
    </div>
  );
}

function ListingMap({ listing }: { listing: Listing }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current || typeof window === "undefined") return;
    let destroyed = false;

    // Determine centre: use lat/lng if available, otherwise geocode via Nominatim
    const initMap = async () => {
      const L = (await import("leaflet")).default;
      if (destroyed || !mapRef.current) return;

      // @ts-expect-error bundler icon fix
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      let lat = listing.latitude;
      let lng = listing.longitude;

      // If no coordinates, try geocoding via Nominatim
      if (lat == null || lng == null) {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(listing.address)}&format=json&limit=1`,
            { headers: { "Accept-Language": "en" } },
          );
          const data = (await res.json()) as { lat?: string; lon?: string }[];
          if (data[0]?.lat) {
            lat = parseFloat(data[0].lat);
            lng = parseFloat(data[0].lon!);
          }
        } catch {
          /* ignore */
        }
      }

      if (lat == null || lng == null) return; // can't render

      const map = L.map(mapRef.current!, { zoomControl: true, scrollWheelZoom: false });
      instanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      map.setView([lat, lng], 16);
      L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`<strong>${listing.name}</strong><br>${listing.address}`)
        .openPopup();
    };

    void initMap();

    return () => {
      destroyed = true;
      if (instanceRef.current) {
        // @ts-expect-error leaflet instance
        instanceRef.current.remove();
        instanceRef.current = null;
      }
    };
  }, [listing.id, listing.latitude, listing.longitude, listing.address]);

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={mapRef} style={{ height: "260px", width: "100%" }} />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-2 border-foreground p-3">
      <div className="text-[10px] font-mono uppercase text-muted-foreground mb-1">{label}</div>
      <div className="font-bold">{value}</div>
    </div>
  );
}
