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
import { getEventHighlights, getEventVisitorGuide } from "@/lib/event-enrichment";

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
          children: JSON.stringify((() => {
            const isSport = e.category === "Sport" || e.title.includes(" vs ") || e.title.includes(" Vs ");
            let homeTeam: string | undefined;
            let awayTeam: string | undefined;
            if (isSport && e.title.includes(" vs ")) {
              const parts = e.title.split(" vs ");
              homeTeam = parts[0]?.trim();
              awayTeam = parts[1]?.replace(/\(Away\)/i, "").trim();
            }

            let sportType = "Sport";
            const lowerTitle = e.title.toLowerCase();
            if (lowerTitle.includes("hull city") || lowerTitle.includes("football") || lowerTitle.includes("fc")) sportType = "Football";
            if (lowerTitle.includes("hull kr") || lowerTitle.includes("hull fc") || lowerTitle.includes("super league") || lowerTitle.includes("rugby")) sportType = "Rugby League";
            if (lowerTitle.includes("seahawks") || lowerTitle.includes("jets") || lowerTitle.includes("hockey")) sportType = "Ice Hockey";
            if (lowerTitle.includes("parkrun") || lowerTitle.includes("10k") || lowerTitle.includes("marathon")) sportType = "Running";

            return {
              "@context": "https://schema.org",
              "@type": isSport ? "SportsEvent" : "Event",
              name: e.title,
              description: e.description,
              startDate: `${e.startDate}T${e.startTime}`,
              endDate: e.endTime ? `${e.startDate}T${e.endTime}` : undefined,
              doorTime: `${e.startDate}T${e.startTime}`,
              eventStatus: "https://schema.org/EventScheduled",
              eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
              image,
              url: `${process.env.SITE_URL ?? "https://hunow.co.uk"}${url}`,
              ...(isSport ? {
                sport: sportType,
                ...(homeTeam && awayTeam ? {
                  homeTeam: { "@type": "SportsTeam", name: homeTeam },
                  awayTeam: { "@type": "SportsTeam", name: awayTeam },
                  competitor: [
                    { "@type": "SportsTeam", name: homeTeam },
                    { "@type": "SportsTeam", name: awayTeam },
                  ],
                } : {}),
              } : {}),
              location: {
                "@type": "Place",
                name: e.locationName,
                address: {
                  "@type": "PostalAddress",
                  streetAddress: e.address,
                  addressLocality: "Hull",
                  addressRegion: "East Yorkshire",
                  addressCountry: "GB",
                },
                ...(e.coordinates ? {
                  geo: {
                    "@type": "GeoCoordinates",
                    latitude: e.coordinates.lat,
                    longitude: e.coordinates.lng,
                  },
                } : {}),
              },
              isAccessibleForFree: !!e.isFree,
              offers: e.isFree
                ? {
                    "@type": "Offer",
                    price: "0",
                    priceCurrency: "GBP",
                    availability: "https://schema.org/InStock",
                    url: `${process.env.SITE_URL ?? "https://hunow.co.uk"}${url}`,
                  }
                : {
                    "@type": "Offer",
                    price: e.price || "See official ticketing",
                    priceCurrency: "GBP",
                    url: e.ticketUrl || `${process.env.SITE_URL ?? "https://hunow.co.uk"}${url}`,
                    availability: "https://schema.org/InStock",
                  },
              organizer: {
                "@type": "Organization",
                name: "HU NOW",
                url: "https://hunow.co.uk",
              },
            };
          })()),
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
        ...(e.slug === "hull-fair-2026"
          ? [
              {
                type: "application/ld+json",
                children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: [
                    {
                      "@type": "Question",
                      name: "What are the dates for Hull Fair 2026?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Hull Fair 2026 runs from Friday 9 October to Saturday 17 October 2026 at Walton Street Fairground. By royal charter tradition, the fair is closed on Sunday 11 October.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Do you need tickets for Hull Fair?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "No. Entry to Hull Fair is 100% free. You do not need an admission ticket or booking to enter the fairground site.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "How much are rides at Hull Fair?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Rides are individually priced: children's rides typically cost £2.00–£3.00, family rides cost £3.00–£4.00, and major thrill rides cost £4.00–£5.00+ each.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Where can you park for Hull Fair?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Official Park and Ride services operate from Priory Park (HU4 7DY) in West Hull and Craven Park (HU9 5DX) in East Hull. Stadium parking is available at the MKM Stadium (£5–£6). Surrounding streets are strict residents-only permit zones.",
                      },
                    },
                  ],
                }),
              },
            ]
          : []),
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

  const todayIso = new Date().toISOString().slice(0, 10);
  const isPast = (event.endDate || event.startDate) < todayIso;

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
      <article className="min-h-screen">
        <div className="relative h-[45vh] md:h-[65vh] w-full overflow-hidden bg-foreground">
          <img
            src={img(event.featuredImage, 1600, 900)}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent" />
        </div>
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
          {isPast && (
            <div className="border-2 border-foreground bg-foreground/[0.04] p-4 md:p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-foreground/40 shrink-0" />
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                    Past Event
                  </div>
                  <p className="text-sm font-medium mt-0.5">
                    This event took place on{" "}
                    <span className="font-bold">
                      {new Date(`${event.startDate}T12:00:00`).toLocaleDateString("en-GB", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    .
                  </p>
                </div>
              </div>
              <Link
                to="/whats-on"
                className="shrink-0 text-xs font-bold uppercase tracking-wider px-4 py-2 border-2 border-foreground hover:bg-foreground hover:text-background transition-colors"
              >
                Browse Upcoming Events →
              </Link>
            </div>
          )}
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
              <div className="font-bold" suppressHydrationWarning>
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
          {!event.content && (
            <div className="space-y-5 text-lg md:text-xl leading-relaxed mb-10 text-foreground/90 font-sans">
              {event.description.split(/\n\n+/).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          )}
          <EventHighlights event={event} />
          <VisitorGuide event={event} />
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
            {isPast ? (
              <Link
                to="/whats-on"
                className="inline-flex items-center gap-2 bg-foreground/10 text-foreground px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-foreground hover:text-background transition-colors"
              >
                Event Ended — Browse What's On →
              </Link>
            ) : (
              <>
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
              </>
            )}
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

          <MakeADayOfIt
            event={event}
            listings={relatedVenues.filter((l) => l.name.toLowerCase() !== event.locationName.toLowerCase())}
          />
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

function EventHighlights({ event }: { event: import("@/types").EventItem }) {
  const highlights = getEventHighlights(event);
  return (
    <div className="border-2 border-foreground p-6 md:p-8 mb-8 bg-foreground/[0.03]">
      <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent mb-2">
        At a Glance
      </div>
      <h2 className="text-2xl md:text-3xl font-display uppercase mb-6">What to Expect</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {highlights.map((h, i) => (
          <div key={i} className="flex gap-3.5 items-start">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="shrink-0 text-accent mt-0.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <div>
              <div className="font-bold text-sm leading-snug">{h.title}</div>
              <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{h.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VisitorGuide({ event }: { event: import("@/types").EventItem }) {
  const guide = getEventVisitorGuide(event);
  return (
    <div className="border-2 border-foreground mb-8 overflow-hidden">
      <div className="bg-foreground text-background px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-display uppercase tracking-wide">Visitor Guide & Essentials</h2>
        <span className="text-[10px] font-mono uppercase tracking-widest text-accent">Good to Know</span>
      </div>
      <div className="p-6 md:p-8 divide-y divide-foreground/10">
        <div className="pb-5">
          <div className="font-bold text-xs uppercase font-mono text-accent mb-1.5 flex items-center gap-2">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="shrink-0"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Timings & Recommended Arrival
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">{guide.timings}</p>
        </div>
        <div className="py-5">
          <div className="font-bold text-xs uppercase font-mono text-accent mb-1.5 flex items-center gap-2">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="shrink-0"
            >
              <rect x="3" y="3" width="18" height="14" rx="2" />
              <path d="M7 17v4" />
              <path d="M17 17v4" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <circle cx="7.5" cy="13.5" r="1" />
              <circle cx="16.5" cy="13.5" r="1" />
            </svg>
            Public Transit & Getting Here
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">{guide.transit}</p>
        </div>
        <div className="py-5">
          <div className="font-bold text-xs uppercase font-mono text-accent mb-1.5 flex items-center gap-2">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="shrink-0"
            >
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <path d="M9 16V8h4a2 2 0 0 1 0 4H9" />
            </svg>
            Parking & Drop-Off
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">{guide.parking}</p>
        </div>
        <div className="pt-5">
          <div className="font-bold text-xs uppercase font-mono text-accent mb-1.5 flex items-center gap-2">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="shrink-0"
            >
              <circle cx="12" cy="4" r="2" />
              <path d="M10 20l4-7-3-3v-4" />
              <path d="M7 13l5-2 3 3" />
              <path d="M17 17a5 5 0 1 1-10 0" />
            </svg>
            Accessibility & Facilities
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">{guide.accessibility}</p>
        </div>
      </div>
    </div>
  );
}

function MakeADayOfIt({
  event,
  listings,
}: {
  event: import("@/types").EventItem;
  listings: import("@/types").Listing[];
}) {
  if (!listings || listings.length === 0) return null;
  return (
    <div className="border-2 border-foreground p-6 md:p-8 mt-12 mb-8">
      <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent mb-2">
        Make a Day of It
      </div>
      <h2 className="text-2xl md:text-3xl font-display uppercase mb-2">Eat & Drink Nearby in Hull</h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-xl">
        Heading to {event.locationName}? Pair your visit with these top-rated independent local spots:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {listings.slice(0, 3).map((place) => (
          <Link
            key={place.id}
            to="/places/$slug"
            params={{ slug: place.slug }}
            className="group block border border-foreground/15 p-3.5 hover:border-foreground hover:bg-foreground/5 transition-colors"
          >
            <div className="aspect-[4/3] bg-stone-200 overflow-hidden mb-3">
              <img
                src={img(place.featuredImage, 400, 300)}
                alt={place.name}
                width={400}
                height={300}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="text-[9px] font-mono font-bold uppercase text-accent mb-1">
              {place.category} · {place.area}
            </div>
            <div className="font-bold text-base leading-snug group-hover:underline line-clamp-1">{place.name}</div>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">{place.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
