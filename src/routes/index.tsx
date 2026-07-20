import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { CommandPalette } from "@/components/CommandPalette";
import { AdSlot } from "@/components/AdSlot";
import { PollWidget } from "@/components/PollWidget";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { OfferCard } from "@/components/cards";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { useStore } from "@/lib/store";
import { articlePath } from "@/lib/taxonomy";
import { img } from "@/data/seed";
import { subscribeNewsletter } from "@/lib/public.functions";

export const Route = createFileRoute("/")({
  loader: async () => {
    const { getDatabaseStore } = await import("@/lib/db.server");
    const store = await getDatabaseStore();
    return {
      articles: store.articles,
      events: store.events,
      listings: store.listings,
      offers: store.offers,
    };
  },
  head: () => ({
    meta: [
      { title: "HU NOW — Your Guide to What's Happening in Hull" },
      {
        name: "description",
        content:
          "Events, food, culture, hidden gems and independent businesses across Hull — all in one place.",
      },
      { property: "og:title", content: "HU NOW — Hull's Independent City Guide" },
      {
        property: "og:description",
        content: "Find what's on, where to eat, and the city's best-kept secrets.",
      },
    ],
  }),
  component: Index,
});

// [1] Hull neighbourhood data for the areas strip
const HULL_AREAS = [
  { label: "Old Town", slug: "old-town", desc: "Medieval streets, the Deep, museums" },
  { label: "Marina", slug: "marina", desc: "Waterfront dining, nightlife, live music" },
  { label: "Hessle Road", slug: "hessle-road", desc: "Authentic Hull, fish heritage, pubs" },
  { label: "The Avenues", slug: "avenues", desc: "Cafés, independent shops, parks" },
  { label: "City Centre", slug: "city-centre", desc: "Shopping, bars, theatres, galleries" },
];

// [2] Category accent colours (mapped to CSS variables)
function categoryColor(cat: string): string {
  const map: Record<string, string> = {
    Music: "var(--color-cat-music, var(--color-accent))",
    "Food & Drink": "var(--color-cat-food, #4ade80)",
    Arts: "var(--color-cat-arts, #a78bfa)",
    Culture: "var(--color-cat-culture, #60a5fa)",
    Comedy: "#f472b6",
    Sport: "#34d399",
    Film: "#fb923c",
  };
  return map[cat] ?? "var(--color-accent)";
}

function Index() {
  const {
    articles: loaderArticles,
    events: loaderEvents,
    listings: loaderListings,
    offers: loaderOffers,
  } = Route.useLoaderData();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [heroQ, setHeroQ] = useState("");
  const [nlEmail, setNlEmail] = useState("");
  const [nlDone, setNlDone] = useState(false);
  const storeEvents = useStore((s) => s.events);
  const storeArticles = useStore((s) => s.articles);
  const storeListings = useStore((s) => s.listings);
  const storeOffers = useStore((s) => s.offers);

  // Use store data when hydrated, fall back to loader data for SSR
  const allEvents = storeEvents.length > 0 ? storeEvents : loaderEvents;
  const allArticles = storeArticles.length > 0 ? storeArticles : loaderArticles;
  const allListingsData = storeListings.length > 0 ? storeListings : loaderListings;
  const allOffers = storeOffers.length > 0 ? storeOffers : loaderOffers;

  const publishedEvents = allEvents.filter((e) => e.status === "published");
  const events = publishedEvents.slice(0, 4);
  const articles = allArticles.filter((a) => a.status === "published").slice(0, 4);
  const offers = allOffers.filter((o) => o.status === "active").slice(0, 3);
  const listings = allListingsData.filter((l) => l.isFeatured).slice(0, 4);
  const allListings = allListingsData;

  const featuredArticles = allArticles.filter((a) => a.isFeatured && a.status === "published");
  const featuredEvents = allEvents.filter((e) => e.isFeatured && e.status === "published");
  const featuredListings = allListingsData.filter((l) => l.isFeatured);
  const featuredHeadlines = [
    ...featuredArticles.map((a) => ({ label: a.title, href: articlePath(a) })),
    ...featuredEvents.map((e) => ({ label: e.title, href: `/events/${e.slug}` })),
    ...featuredListings.map((l) => ({ label: l.name, href: `/places/${l.slug}` })),
  ].slice(0, 8);
  const todayEvents = publishedEvents.filter((event) => event.startDate === todayIso());
  const weekendEvents = publishedEvents.filter((event) => isThisWeekend(event.startDate));
  const weekEvents = publishedEvents.filter((event) => isThisWeek(event.startDate));
  const [spotlightTab, setSpotlightTab] = useState<"today" | "weekend" | "week">(
    todayEvents.length > 0 ? "today" : weekendEvents.length > 0 ? "weekend" : "week",
  );
  const spotlightEvents = (
    spotlightTab === "today" ? todayEvents : spotlightTab === "weekend" ? weekendEvents : weekEvents
  ).slice(0, 3);

  // [3] Live date string for the hero masthead
  const liveDate = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <PublicLayout>
      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[calc(100vh-92px)] overflow-hidden border-b-2 border-foreground bg-foreground text-background"
        style={{ animation: "reveal 0.6s cubic-bezier(0.19,1,0.22,1) both" }}
      >
        <ResponsiveImage
          id="/hull-marina-hero.jpg"
          alt="Hull Marina waterfront"
          width={1600}
          height={900}
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
          loading="eager"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,12,39,0.88)_0%,rgba(7,12,39,0.70)_44%,rgba(7,12,39,0.24)_100%)]" />

        {/* [4] Newspaper masthead strip */}
        <div className="relative border-b border-background/10">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-background/40">
              Hull · {liveDate}
            </span>
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-background/40">
              Independent City Guide
            </span>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-14 md:py-20 min-h-[calc(100vh-132px)] flex items-center">
          <div className="max-w-5xl">
            {/* [5] Section label */}
            <div className="flex items-center gap-3 mb-5">
              <span className="w-6 h-[2px] bg-accent" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent">
                Hull's independent city guide
              </span>
            </div>
            <h1 className="text-6xl md:text-9xl font-display leading-[0.9] text-balance mb-8">
              DISCOVER WHAT&apos;S <span className="text-accent">HAPPENING</span> IN HULL
            </h1>
            <p className="text-xl md:text-2xl font-medium max-w-2xl mb-10 text-pretty text-background/80">
              Events, food, culture, hidden gems and independent businesses — all in one place.
            </p>
            <form
              className="flex flex-col md:flex-row gap-0 max-w-xl border-2 border-background/30 focus-within:border-accent transition-colors"
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = `/search?q=${encodeURIComponent(heroQ)}`;
              }}
            >
              <input
                value={heroQ}
                onChange={(e) => setHeroQ(e.target.value)}
                onFocus={() => setCmdOpen(true)}
                type="text"
                placeholder="Search events, places, guides..."
                className="flex-grow bg-transparent px-5 py-4 font-mono text-sm text-background placeholder:text-background/30 focus:outline-none"
                readOnly
              />
              <button
                type="button"
                onClick={() => setCmdOpen(true)}
                className="bg-accent text-foreground px-6 py-4 font-bold uppercase tracking-widest text-xs hover:bg-background transition-colors shrink-0"
              >
                Explore
              </button>
            </form>

            {/* [6] Quick-access links — editorial pill style */}
            <div className="flex flex-wrap items-center gap-2 mt-6">
              <span className="text-[9px] font-mono uppercase tracking-widest text-background/30 mr-1">
                Jump to
              </span>
              {[
                { label: "What's On", to: "/whats-on" },
                { label: "Places", to: "/places" },
                { label: "Open Now", to: "/open-now" },
                { label: "Food & Drink", to: "/c/$section", params: { section: "food-and-drink" } },
              ].map(({ label, to, params }) => (
                <Link
                  key={label}
                  to={to as "/whats-on"}
                  params={params as Record<string, string>}
                  className="px-3 py-1 border border-background/20 text-[10px] font-mono uppercase tracking-wide text-background/60 hover:border-accent hover:text-accent transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* [7] Live stats band */}
      <section className="border-b-2 border-foreground bg-foreground text-background">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
          {[
            { label: "Events this week", value: weekEvents.length > 0 ? weekEvents.length : "—" },
            {
              label: "Featured places",
              value: featuredListings.length > 0 ? featuredListings.length : "—",
            },
            { label: "Stories published", value: articles.length > 0 ? articles.length : "—" },
            { label: "Hull businesses", value: allListings.length > 0 ? allListings.length : "—" },
          ].map(({ label, value }) => (
            <div key={label} className="px-4 md:px-8 first:pl-0 last:pr-0 py-2">
              <div className="font-display text-4xl md:text-5xl leading-none mb-1 text-accent">
                {value}
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-white/40">
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* [8] Spotlight — live city picks */}
      <section className="border-b-2 border-foreground bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-10">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              {/* [9] Event count label */}
              <div className="mb-3 text-[10px] font-mono uppercase tracking-widest text-accent">
                {spotlightTab === "today"
                  ? `${todayEvents.length} event${todayEvents.length !== 1 ? "s" : ""} today in Hull`
                  : spotlightTab === "weekend"
                    ? `${weekendEvents.length} event${weekendEvents.length !== 1 ? "s" : ""} this weekend`
                    : `${weekEvents.length} event${weekEvents.length !== 1 ? "s" : ""} this week`}
              </div>
              <div className="flex gap-1">
                {(["today", "weekend", "week"] as const).map((tab) => {
                  const labels = { today: "Today", weekend: "Weekend", week: "This week" };
                  const active = spotlightTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setSpotlightTab(tab)}
                      className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                        active
                          ? "bg-foreground text-background"
                          : "border-2 border-foreground/30 text-foreground/50 hover:border-foreground hover:text-foreground"
                      }`}
                    >
                      {labels[tab]}
                    </button>
                  );
                })}
              </div>
            </div>
            <Link
              to="/whats-on"
              className="text-[10px] font-bold uppercase tracking-widest border-b-2 border-foreground pb-1 hover:text-accent hover:border-accent"
            >
              Full calendar →
            </Link>
          </div>
          {spotlightEvents.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-4">
              {spotlightEvents.map((event, i) => (
                <Link
                  key={event.id}
                  to="/events/$slug"
                  params={{ slug: event.slug }}
                  className={`group border-2 border-foreground p-5 hover:bg-foreground hover:text-background transition-colors ${i === 0 ? "md:row-span-1" : ""}`}
                >
                  {/* [10] Prominent day of week */}
                  <div className="font-display text-5xl uppercase leading-none mb-3 text-foreground/10 group-hover:text-background/10 transition-colors select-none">
                    {new Date(`${event.startDate}T12:00:00`)
                      .toLocaleDateString("en-GB", { weekday: "short" })
                      .toUpperCase()}
                  </div>
                  <div
                    className="mb-2 font-mono text-[10px] uppercase"
                    style={{ color: categoryColor(event.category) }}
                  >
                    {event.category} · {event.startTime}
                  </div>
                  <h3 className="font-display text-2xl uppercase leading-none mb-2 group-hover:text-accent transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-xs font-mono uppercase opacity-60">{event.locationName}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-foreground/30 p-8 text-sm text-muted-foreground font-mono">
              No events listed yet. Check the full calendar for what's coming up.
            </div>
          )}
        </div>
      </section>

      {/* [11] Featured marquee — improved with star separators */}
      {featuredHeadlines.length > 0 && (
        <section className="border-b border-border overflow-hidden bg-foreground text-background py-2.5">
          <div
            className="flex whitespace-nowrap items-center gap-10"
            style={{ animation: "marquee 30s linear infinite" }}
          >
            {[...featuredHeadlines, ...featuredHeadlines, ...featuredHeadlines].map((item, i) => (
              <span key={`${item.href}-${i}`} className="flex items-center gap-10 shrink-0">
                <a
                  href={item.href}
                  className="font-display text-lg uppercase tracking-widest hover:text-accent focus-visible:text-accent focus-visible:outline-none"
                >
                  {item.label}
                </a>
                <span className="text-accent text-sm select-none">★</span>
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ── MAIN GRID ────────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          {/* [12] Section label + number */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-foreground/30 mb-1.5">
                01 / What's On
              </div>
              <h2 className="text-5xl font-display uppercase tracking-tight">This Week in Hull</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { label: "Today", search: { when: "today" as const } },
                  { label: "This Weekend", search: { when: "weekend" as const } },
                  { label: "Free", search: { free: true } },
                  { label: "Music", search: { category: "Music" } },
                  { label: "Food", search: { category: "Food & Drink" } },
                  { label: "Arts", search: { category: "Arts" } },
                ] as const
              ).map(({ label, search }) => (
                <Link
                  key={label}
                  to="/whats-on"
                  search={search}
                  className="px-3 py-1 text-[10px] font-bold uppercase border border-foreground/20 hover:border-foreground hover:bg-foreground/5 transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Lead event */}
          {events[0] && (
            <Link
              to="/events/$slug"
              params={{ slug: events[0].slug }}
              className="group block w-full mb-6"
            >
              <div className="w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-stone-200">
                <ResponsiveImage
                  id={events[0].featuredImage}
                  alt={events[0].title}
                  width={900}
                  height={420}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="pt-3 pb-1">
                {/* [13] Category color coding */}
                <div
                  className="font-mono text-[10px] font-bold uppercase mb-1.5"
                  style={{ color: categoryColor(events[0].category) }}
                >
                  {events[0].category}
                  {events[0].isSponsored && (
                    <span className="ml-3 text-muted-foreground">· Sponsored</span>
                  )}
                </div>
                {/* [14] font-display for lead event title */}
                <h3 className="text-2xl md:text-3xl font-display uppercase leading-none group-hover:underline mb-2">
                  {events[0].title}
                </h3>
                <div className="text-[10px] font-mono uppercase text-muted-foreground">
                  {formatHomeDate(events[0].startDate)} · {events[0].startTime} ·{" "}
                  {events[0].locationName}
                </div>
              </div>
            </Link>
          )}

          {/* Compact event rows */}
          <div className="divide-y divide-foreground/10">
            {events.slice(1).map((e) => (
              <Link
                key={e.id}
                to="/events/$slug"
                params={{ slug: e.slug }}
                className="group flex gap-4 items-center py-3.5"
              >
                <div className="w-20 shrink-0 overflow-hidden bg-stone-200 aspect-[4/3]">
                  <img
                    src={img(e.featuredImage, 160, 120)}
                    alt={e.title}
                    width={160}
                    height={120}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="font-mono text-[9px] font-bold uppercase mb-1"
                    style={{ color: categoryColor(e.category) }}
                  >
                    {e.category} · {formatHomeDate(e.startDate)}
                  </div>
                  <h3 className="text-sm font-bold leading-snug group-hover:underline mb-0.5">
                    {e.title}
                  </h3>
                  <div className="text-[9px] font-mono uppercase text-muted-foreground">
                    {e.locationName}
                  </div>
                </div>
                <svg
                  className="shrink-0 text-foreground/25 group-hover:text-accent transition-colors"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            ))}
          </div>
          <div className="mt-8">
            <Link
              to="/whats-on"
              className="inline-block text-[10px] font-bold uppercase tracking-widest border-b-2 border-foreground pb-1 hover:text-accent hover:border-accent"
            >
              View full calendar →
            </Link>
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-12">
          <PollWidget />
          <AdSlot placement="Sidebar Ad" />
          <div className="space-y-4">
            <h2 className="text-3xl font-display tracking-wide">Reader Offers</h2>
            {offers.map((o) => (
              <OfferCard key={o.id} offer={o} />
            ))}
            <Link
              to="/offers"
              className="inline-block text-[10px] font-bold uppercase tracking-widest text-accent"
            >
              All offers →
            </Link>
          </div>
        </aside>
      </main>

      {/* ── LATEST STORIES ───────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-16 border-t border-border">
        <div className="flex items-end justify-between mb-10 gap-4">
          <div>
            {/* [15] Section number */}
            <div className="text-[10px] font-mono uppercase tracking-widest text-foreground/30 mb-1.5">
              02 / Latest Stories
            </div>
            <h2 className="text-5xl font-display uppercase">From Our Journalists</h2>
            {/* [16] Section subtitle */}
            <p className="text-sm text-muted-foreground mt-1.5">
              Hull news, culture and what's making people talk
            </p>
          </div>
          <Link
            to="/stories"
            className="text-[10px] font-bold uppercase tracking-widest border-b-2 border-foreground pb-1 hover:text-accent hover:border-accent shrink-0"
          >
            All stories →
          </Link>
        </div>
        {articles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Lead article */}
            <a href={articlePath(articles[0])} className="group block md:col-span-2">
              <div className="w-full aspect-[16/10] bg-stone-200 overflow-hidden mb-5 relative">
                <ResponsiveImage
                  id={articles[0].featuredImage}
                  alt={articles[0].title}
                  width={900}
                  height={560}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <span
                className="inline-block text-[10px] font-mono font-bold uppercase px-2 py-1 mb-3"
                style={{
                  background: categoryColor(articles[0].category),
                  color: "var(--background)",
                }}
              >
                {articles[0].category}
              </span>
              {/* [17] Bigger, font-display lead article title */}
              <h3 className="text-3xl md:text-5xl font-display uppercase leading-none group-hover:underline mb-4">
                {articles[0].title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                {articles[0].excerpt}
              </p>
              <div className="text-[10px] font-mono uppercase text-muted-foreground">
                {articles[0].author} · {articles[0].readingMinutes} min read
              </div>
            </a>
            {/* Secondary articles */}
            <div className="flex flex-col gap-0 md:border-l-2 md:border-foreground md:pl-10 divide-y divide-foreground/10">
              {articles.slice(1, 3).map((a) => (
                <a
                  key={a.id}
                  href={articlePath(a)}
                  className="group flex gap-4 items-start py-5 first:pt-0"
                >
                  {/* [18] Wider 4:3 thumbnails on secondary articles */}
                  <div className="w-24 shrink-0 overflow-hidden bg-stone-200 aspect-[4/3]">
                    <img
                      src={img(a.featuredImage, 192, 144)}
                      alt={a.title}
                      width={192}
                      height={144}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span
                      className="text-[9px] font-mono font-bold uppercase block mb-1"
                      style={{ color: categoryColor(a.category) }}
                    >
                      {a.category}
                    </span>
                    <h3 className="text-sm font-bold leading-snug group-hover:underline mb-1">
                      {a.title}
                    </h3>
                    <div className="text-[9px] font-mono uppercase text-muted-foreground mt-1">
                      {a.author} · {a.readingMinutes} min
                    </div>
                  </div>
                  <svg
                    className="shrink-0 text-foreground/25 group-hover:text-accent transition-colors mt-0.5"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── EDITORIAL FEATURE BAND ───────────────────────────────────────────── */}
      {featuredArticles[0] && (
        <section className="border-y-2 border-foreground overflow-hidden">
          <a
            href={articlePath(featuredArticles[0])}
            className="group relative block min-h-[340px] md:min-h-[420px]"
          >
            <img
              src={img(featuredArticles[0].featuredImage, 1400, 600)}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-foreground/72" />
            <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 flex flex-col justify-end min-h-[340px] md:min-h-[420px]">
              <div className="max-w-3xl">
                <span
                  className="inline-block text-[10px] font-mono font-bold uppercase px-3 py-1 mb-5"
                  style={{
                    background: categoryColor(featuredArticles[0].category),
                    color: "var(--foreground)",
                  }}
                >
                  {featuredArticles[0].category}
                </span>
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-display uppercase leading-none text-background mb-4 group-hover:text-accent transition-colors duration-300">
                  {featuredArticles[0].title}
                </h2>
                <p className="text-background/75 text-lg max-w-2xl mb-6 hidden md:block">
                  {featuredArticles[0].excerpt}
                </p>
                <div className="flex items-center gap-4">
                  <span className="inline-block border-b-2 border-accent text-background text-[10px] font-bold uppercase tracking-widest pb-1">
                    Read the story →
                  </span>
                  <span className="text-[10px] font-mono uppercase text-background/40">
                    {featuredArticles[0].readingMinutes} min read
                  </span>
                </div>
              </div>
            </div>
          </a>
        </section>
      )}

      {/* ── NEWSLETTER CTA ───────────────────────────────────────────────────── */}
      {/* [19] Rewritten copy — more personality, less corporate */}
      <section className="bg-foreground text-background border-y-2 border-foreground">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div>
            <div className="text-accent text-[10px] font-mono uppercase tracking-widest mb-4">
              Free · Every Friday
            </div>
            <h2 className="text-5xl md:text-7xl font-display uppercase leading-none mb-5">
              Hull in your inbox
            </h2>
            <p className="text-background/70 text-lg leading-relaxed mb-4 max-w-sm">
              Every Friday morning, a handpicked round-up of what's on, what's opened and what's
              worth knowing in Hull this week.
            </p>
            <p className="text-background/40 text-[11px] font-mono uppercase tracking-wide">
              No noise. No spam. Unsubscribe any time.
            </p>
          </div>
          <div>
            {nlDone ? (
              <div className="border-2 border-accent p-8">
                <div className="text-accent text-[10px] font-mono uppercase tracking-widest mb-3">
                  You're in
                </div>
                <p className="text-2xl font-display uppercase leading-tight">
                  Welcome to the list. See you in your inbox on Friday.
                </p>
              </div>
            ) : (
              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!nlEmail) return;
                  try {
                    await subscribeNewsletter({
                      data: { email: nlEmail, segments: ["events", "offers"] },
                    });
                  } catch {}
                  setNlDone(true);
                }}
              >
                <label className="block text-[10px] font-mono uppercase tracking-widest text-background/50 mb-1">
                  Your email address
                </label>
                <input
                  type="email"
                  required
                  value={nlEmail}
                  onChange={(e) => setNlEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-transparent border-2 border-background/30 focus:border-accent px-5 py-4 font-mono text-sm text-background placeholder:text-background/30 focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="w-full bg-accent text-foreground px-6 py-4 font-bold uppercase tracking-widest text-xs hover:bg-background hover:text-foreground transition-colors"
                >
                  Subscribe — it's free →
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── INDEPENDENT HULL ─────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-16 border-b border-border">
        <div className="flex items-end justify-between mb-10 gap-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-foreground/30 mb-1.5">
              03 / Independent Hull
            </div>
            <h2 className="text-5xl font-display uppercase">Independent Hull</h2>
            {/* [20] Section subtitle */}
            <p className="text-sm text-muted-foreground mt-1.5">
              Shops, cafés, restaurants and more — the city's independent scene
            </p>
          </div>
          <Link
            to="/places"
            className="text-[10px] font-bold uppercase tracking-widest border-b-2 border-foreground pb-1 hover:text-accent hover:border-accent shrink-0"
          >
            All places →
          </Link>
        </div>
        {listings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <Link
              to="/places/$slug"
              params={{ slug: listings[0].slug }}
              className="group block md:col-span-2"
            >
              <div className="w-full aspect-[16/10] overflow-hidden bg-stone-200">
                <ResponsiveImage
                  id={listings[0].featuredImage}
                  alt={listings[0].name}
                  width={900}
                  height={560}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="pt-3 pb-1">
                <div
                  className="text-[9px] font-mono font-bold uppercase mb-1.5"
                  style={{ color: categoryColor(listings[0].category) }}
                >
                  {listings[0].category} · {listings[0].area}
                </div>
                {/* Lead listing font-display */}
                <h3 className="text-2xl md:text-4xl font-display uppercase leading-none group-hover:underline mb-2">
                  {listings[0].name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {listings[0].description}
                </p>
              </div>
            </Link>
            <div className="flex flex-col md:border-l-2 md:border-foreground md:pl-10">
              <div className="divide-y divide-foreground/10 flex-1">
                {listings.slice(1, 4).map((l) => (
                  <Link
                    key={l.id}
                    to="/places/$slug"
                    params={{ slug: l.slug }}
                    className="group flex gap-4 items-center py-4"
                  >
                    <div className="w-20 shrink-0 overflow-hidden bg-stone-200 aspect-[4/3]">
                      {l.featuredImage && (
                        <img
                          src={img(l.featuredImage, 160, 120)}
                          alt={l.name}
                          width={160}
                          height={120}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span
                        className="text-[9px] font-mono font-bold uppercase block mb-1"
                        style={{ color: categoryColor(l.category) }}
                      >
                        {l.category} · {l.area}
                      </span>
                      <h3 className="text-sm font-bold leading-snug group-hover:underline mb-0.5">
                        {l.name}
                      </h3>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {l.description}
                      </p>
                    </div>
                    <svg
                      className="shrink-0 text-foreground/25 group-hover:text-accent transition-colors"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M3 8h10M9 4l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                ))}
              </div>
              <Link
                to="/places"
                className="mt-6 text-[10px] font-bold uppercase tracking-widest border-b-2 border-foreground pb-1 self-start hover:text-accent hover:border-accent"
              >
                All places →
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* [NEW] Hull neighbourhoods strip */}
      <section className="border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-end justify-between mb-6 gap-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-foreground/30 mb-1.5">
                Explore by area
              </div>
              <h2 className="text-4xl font-display uppercase">Hull Neighbourhoods</h2>
            </div>
            <Link
              to="/areas"
              className="text-[10px] font-bold uppercase tracking-widest border-b-2 border-foreground pb-1 hover:text-accent hover:border-accent shrink-0"
            >
              All areas →
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-5">
            {HULL_AREAS.map(({ label, slug, desc }) => (
              <Link
                key={slug}
                to="/areas/$area"
                params={{ area: slug }}
                className="group shrink-0 w-44 md:w-auto"
              >
                <div className="border-2 border-foreground/15 group-hover:border-foreground transition-colors p-5 h-full">
                  <h3 className="font-display text-2xl uppercase leading-none mb-2 group-hover:text-accent transition-colors">
                    {label}
                  </h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
                  <div className="mt-3 text-[9px] font-mono uppercase tracking-widest text-foreground/30 group-hover:text-accent transition-colors">
                    Explore →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />

      {/* [NEW] Send us a tip — full bleed dark treatment */}
      <section className="bg-foreground text-background border-t-2 border-foreground">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest mb-3 text-accent">
              Got a story?
            </div>
            <h2 className="text-4xl md:text-6xl font-display uppercase leading-none text-background">
              Send us a tip
            </h2>
            <p className="mt-4 max-w-xl text-background/50 text-sm">
              News tips, press releases, events, openings — if it's happening in Hull, we want to
              know about it.
            </p>
          </div>
          <Link
            to="/contact"
            className="bg-accent text-foreground px-8 py-4 font-bold uppercase tracking-widest text-xs shrink-0 hover:bg-background hover:text-background transition-colors"
          >
            Get in touch →
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function isThisWeek(date: string) {
  const today = todayIso();
  const d = new Date();
  d.setDate(d.getDate() + 6);
  const weekEnd = d.toISOString().slice(0, 10);
  return date >= today && date <= weekEnd;
}

function isThisWeekend(date: string) {
  const eventDate = new Date(`${date}T12:00:00`);
  const now = new Date();
  const day = now.getDay();
  const daysUntilSaturday = (6 - day + 7) % 7;
  const saturday = new Date(now);
  saturday.setDate(now.getDate() + daysUntilSaturday);
  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);
  const start = saturday.toISOString().slice(0, 10);
  const end = sunday.toISOString().slice(0, 10);
  const eventIso = eventDate.toISOString().slice(0, 10);
  return eventIso >= start && eventIso <= end;
}

function formatHomeDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
