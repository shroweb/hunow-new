import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { EventCard, ListingCard } from "@/components/cards";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SaveButton } from "@/components/SaveButton";
import { ShareMenu } from "@/components/ShareMenu";
import { downloadICS, googleCalUrl } from "@/lib/ics";
import { fetchEventBySlug } from "@/lib/content-read.functions";
import { getEventRsvp, toggleRsvp } from "@/lib/rsvp.functions";
import { addToHistory } from "@/lib/reading-history";
import { autoLink } from "@/lib/autolink";
import { sanitizeHtml, escapeAttr } from "@/lib/sanitize";
import { img } from "@/data/seed";

export const Route = createFileRoute("/events/$slug")({
  component: EventDetail,
  loader: async ({ params }) => {
    const event = await fetchEventBySlug({ data: { slug: params.slug } });
    if (!event) throw notFound();
    const { fetchRelatedForEvent } = await import("@/lib/content-read.functions");
    const related = await fetchRelatedForEvent({
      data: {
        eventId: event.id,
        category: event.category,
        locationName: event.locationName,
        address: event.address || "",
      },
    }).catch(() => ({ events: [], listings: [] }));
    return { event, related };
  },
  head: ({ loaderData, params }) => {
    const e = loaderData?.event;
    if (!e) return {};
    const title = e.seo?.title ?? `${e.title} — HU NOW`;
    const description = e.seo?.description ?? e.description;
    const image = e.seo?.ogImage ?? img(e.featuredImage, 1200, 630);
    const url = `/events/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        ...(e.seo?.noIndex ? [{ name: "robots", content: "noindex,nofollow" }] : []),
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "event" },
        { property: "og:url", content: url },
        { property: "og:image", content: image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
      ],
      links: [
        { rel: "canonical", href: e.seo?.canonicalUrl ?? url },
        { rel: "stylesheet", href: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            name: e.title,
            description: e.description,
            startDate: `${e.startDate}T${e.startTime}`,
            endDate: e.endTime ? `${e.startDate}T${e.endTime}` : undefined,
            eventStatus: "https://schema.org/EventScheduled",
            eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
            image,
            url: `${process.env.SITE_URL ?? "https://hunow.co.uk"}${url}`,
            location: {
              "@type": "Place",
              name: e.locationName,
              address: { "@type": "PostalAddress", streetAddress: e.address },
            },
            offers: e.isFree
              ? {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "GBP",
                  availability: "https://schema.org/InStock",
                }
              : { "@type": "Offer", price: e.price, priceCurrency: "GBP", url: e.ticketUrl },
            organizer: { "@type": "Organization", name: "HU NOW" },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://hunow.co.uk" },
              {
                "@type": "ListItem",
                position: 2,
                name: "What's On",
                item: "https://hunow.co.uk/whats-on",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: e.title,
                item: `https://hunow.co.uk${url}`,
              },
            ],
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 py-32 text-center">
        <h1 className="font-display text-6xl mb-4">EVENT NOT FOUND</h1>
        <Link to="/whats-on" className="underline">
          Back to What's On
        </Link>
      </div>
    </PublicLayout>
  ),
});

function EventDetail() {
  const { event: loadedEvent, related: loaderRelated } = Route.useLoaderData();
  const event = loadedEvent;
  if (!event) throw notFound();

  useEffect(() => {
    addToHistory({ kind: "event", id: event.id, slug: event.slug, title: event.title });
  }, [event.id]);

  const related = loaderRelated.events;
  const relatedVenues = loaderRelated.listings;
  const venue = relatedVenues[0] ?? undefined;

  const linkedContent = event.content
    ? autoLink(event.content, [
        ...relatedVenues.map((l) => ({ name: l.name, path: `/places/${l.slug}` })),
        ...related.map((e) => ({ name: e.title, path: `/events/${e.slug}` })),
      ])
    : undefined;

  return (
    <PublicLayout>
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "What's On", to: "/whats-on" },
          { label: event.category },
          { label: event.title },
        ]}
      />
      <article>
        <div className="w-full h-[56vw] max-h-[520px] min-h-[240px] bg-stone-200 overflow-hidden relative">
          <img
            src={img(event.featuredImage, 1600, 700)}
            alt={`${event.title} at ${event.locationName}`}
            width={1600}
            height={700}
            decoding="async"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent" />
        </div>
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
          {event.isSponsored && (
            <div className="inline-block bg-accent text-background text-[10px] font-bold uppercase px-3 py-1 mb-4">
              Sponsored
            </div>
          )}
          <div className="font-mono text-[10px] uppercase text-accent mb-4">{event.category}</div>
          <h1 className="text-5xl md:text-7xl font-display uppercase leading-none mb-8">
            {event.title}
          </h1>
          <div className="grid grid-cols-3 gap-4 border-y-2 border-foreground py-5 mb-8 font-mono text-xs uppercase">
            <div>
              <div className="text-muted-foreground mb-1">Date</div>
              <div className="font-bold">
                {event.endDate ? (
                  <>
                    {new Date(`${event.startDate}T12:00:00`).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                    })}
                    {" – "}
                    {new Date(`${event.endDate}T12:00:00`).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                    })}
                  </>
                ) : (
                  new Date(`${event.startDate}T12:00:00`).toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })
                )}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Time</div>
              <div className="font-bold">
                {event.startTime}
                {event.endTime ? ` – ${event.endTime}` : ""}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Price</div>
              <div className="font-bold">{event.isFree ? "FREE" : event.price}</div>
            </div>
          </div>
          {!event.content && <p className="text-xl leading-relaxed mb-8">{event.description}</p>}
          {event.gallery && event.gallery.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-10">
              {event.gallery.map((src: string, i: number) => (
                <div key={i} className="aspect-square overflow-hidden bg-stone-200">
                  <img
                    src={img(src, 600, 600)}
                    alt={`${event.title} — photo ${i + 2}`}
                    width={600}
                    height={600}
                    decoding="async"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          )}
          {linkedContent ? (
            <div
              className="mb-8 [&_h2]:font-display [&_h2]:uppercase [&_h2]:text-3xl [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:leading-none [&_p]:text-lg [&_p]:leading-relaxed [&_p]:mb-4 [&_ul]:text-lg [&_ul]:leading-relaxed [&_ul]:mb-4 [&_ul]:pl-6 [&_ul]:list-disc [&_li]:mb-2 [&_strong]:font-bold"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(linkedContent) }}
            />
          ) : null}
          <div className="border-2 border-foreground mb-8 overflow-hidden">
            <div className="p-5">
              <div className="font-mono text-[10px] uppercase text-muted-foreground mb-1">
                Venue
              </div>
              <div className="font-bold text-lg mb-0.5">
                {venue ? (
                  <Link
                    to="/places/$slug"
                    params={{ slug: venue.slug }}
                    className="hover:underline"
                  >
                    {event.locationName}
                  </Link>
                ) : (
                  event.locationName
                )}
              </div>
              <div className="text-sm text-muted-foreground mb-4">{event.address}</div>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${event.locationName}, ${event.address}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-colors"
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polygon points="3 11 22 2 13 21 11 13 3 11" />
                  </svg>
                  Get directions
                </a>
                <a
                  href={`https://maps.apple.com/?q=${encodeURIComponent(`${event.locationName}, ${event.address}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-foreground/30 text-[10px] font-bold uppercase tracking-widest hover:border-foreground transition-colors"
                >
                  Apple Maps
                </a>
              </div>
            </div>
            <EventMap
              address={`${event.locationName}, ${event.address}`}
              lat={venue?.latitude}
              lng={venue?.longitude}
            />
          </div>
          {/* Primary CTAs */}
          <div className="flex flex-wrap gap-3 mb-6">
            {event.ticketUrl && (
              <a
                href={event.ticketUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block bg-accent text-background px-10 py-4 font-bold uppercase tracking-widest text-sm hover:bg-foreground transition-colors"
              >
                Get Tickets →
              </a>
            )}
            <RsvpButton eventId={event.id} />
          </div>

          {/* Secondary actions */}
          <div className="border-t border-foreground/20 pt-5 flex flex-wrap gap-2">
            <a
              href={googleCalUrl(event)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-foreground/30 text-[10px] font-bold uppercase tracking-widest hover:border-foreground hover:bg-foreground hover:text-background transition-colors"
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Google Calendar
            </a>
            <button
              onClick={() => downloadICS(event)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-foreground/30 text-[10px] font-bold uppercase tracking-widest hover:border-foreground hover:bg-foreground hover:text-background transition-colors"
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Apple / Outlook
            </button>
            <SaveButton
              kind="event"
              id={event.id}
              slug={event.slug}
              title={event.title}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-foreground/30 text-[10px] font-bold uppercase tracking-widest hover:border-foreground hover:bg-foreground hover:text-background transition-colors"
            />
            <ShareMenu
              title={event.title}
              text={event.description}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-foreground/30 text-[10px] font-bold uppercase tracking-widest hover:border-foreground hover:bg-foreground hover:text-background transition-colors"
            />
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16 border-t border-border">
          <h2 className="text-4xl font-display uppercase mb-8">Related Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {related.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}

      {(venue || relatedVenues.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 py-16 border-t border-border">
          <h2 className="text-4xl font-display uppercase mb-8">The Venue</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(venue ? [venue] : relatedVenues).map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      )}
    </PublicLayout>
  );
}

function RsvpButton({ eventId }: { eventId: string }) {
  const [going, setGoing] = useState(false);
  const [count, setCount] = useState(0);
  const [hasUser, setHasUser] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getEventRsvp({ data: { eventId } })
      .then((r) => {
        setGoing(r.going);
        setCount(r.count);
        setHasUser(!!r.userId);
      })
      .catch(() => {});
  }, [eventId]);

  const toggle = async () => {
    if (!hasUser) {
      window.location.href = "/sign-in";
      return;
    }
    setLoading(true);
    try {
      const r = await toggleRsvp({ data: { eventId } });
      setGoing(r.going);
      setCount((c) => (r.going ? c + 1 : Math.max(0, c - 1)));
    } catch {
      /* ignore */
    }
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`px-5 py-4 border-2 text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50 ${going ? "bg-accent text-background border-accent" : "border-foreground hover:bg-foreground hover:text-background"}`}
    >
      {going ? "✓ Going" : "I'm going"}
      {count > 0 && <span className="ml-2 opacity-60">{count}</span>}
    </button>
  );
}

// ── EventMap ───────────────────────────────────────────────────────────────────

function EventMap({
  address,
  lat,
  lng,
}: {
  address: string;
  lat?: number | null;
  lng?: number | null;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [resolved, setResolved] = useState<{ lat: number; lng: number } | null>(
    lat != null && lng != null ? { lat, lng } : null,
  );

  useEffect(() => {
    if (resolved || !address) return;
    // Geocode address via Nominatim
    fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
      { headers: { "Accept-Language": "en" } },
    )
      .then((r) => r.json())
      .then((data: { lat?: string; lon?: string }[]) => {
        if (data[0]?.lat)
          setResolved({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon!) });
      })
      .catch(() => {});
  }, [address, resolved]);

  useEffect(() => {
    if (!resolved || !mapRef.current) return;
    let destroyed = false;
    const init = async () => {
      const L = (await import("leaflet")).default;
      if (destroyed || !mapRef.current) return;
      // @ts-expect-error icon fix
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      const map = L.map(mapRef.current!, { zoomControl: true, scrollWheelZoom: false });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
      map.setView([resolved.lat, resolved.lng], 16);
      L.marker([resolved.lat, resolved.lng])
        .addTo(map)
        .bindPopup(`<strong>${escapeAttr(address.split(",")[0])}</strong>`)
        .openPopup();
      return map;
    };
    let mapInstance: import("leaflet").Map | undefined;
    void init().then((m) => {
      mapInstance = m;
    });
    return () => {
      destroyed = true;
      mapInstance?.remove();
    };
  }, [resolved, address]);

  if (!resolved) return null;

  return <div ref={mapRef} className="w-full h-48 border-t border-foreground/20" />;
}
