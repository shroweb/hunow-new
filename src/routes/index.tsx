import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { AdSlot } from "@/components/AdSlot";
import { PollWidget } from "@/components/PollWidget";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { useStore } from "@/lib/store";
import { articlePath } from "@/lib/taxonomy";
import { img } from "@/data/seed";
import { formatFullDate, formatEventDate, formatWeekday } from "@/lib/dates";
import { subscribeNewsletter } from "@/lib/public.functions";
import { buildSeoMeta } from "@/lib/seo-meta";
import { AREA_IMAGES } from "@/lib/area-images";

export const Route = createFileRoute("/")({
  loader: async () => {
    const { getStoreFromDatabase } = await import("@/lib/store.functions");
    const { getSettings } = await import("@/lib/settings.functions");
    const [store, settings] = await Promise.all([
      getStoreFromDatabase(),
      getSettings().catch(() => ({}) as Record<string, string>),
    ]);
    return {
      articles: store.articles,
      events: store.events,
      listings: store.listings,
      settings,
    };
  },
  head: () =>
    buildSeoMeta({
      title: "HU NOW — Hull's Independent Guide to Events, Food & Culture",
      description:
        "The independent guide to Kingston upon Hull and East Yorkshire. Live music, food and drink, cultural events, hidden gems, and local directories.",
      path: "/",
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

function decodeHtml(val?: string | null): string {
  if (!val) return "";
  return val
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

// Clean and truncate scraped event locations (e.g. removes scraped description paragraphs)
function cleanLocation(val?: string | null): string {
  if (!val) return "";
  const decoded = decodeHtml(val);
  const first = decoded.split(/[.\n]/)[0].trim();
  return first.length > 45 ? first.slice(0, 45) + "…" : first;
}

function Index() {
  const {
    articles: loaderArticles,
    events: loaderEvents,
    listings: loaderListings,
    settings,
  } = Route.useLoaderData();
  const [nlEmail, setNlEmail] = useState("");
  const [nlDone, setNlDone] = useState(false);
  const storeEvents = useStore((s) => s.events);
  const storeArticles = useStore((s) => s.articles);
  const storeListings = useStore((s) => s.listings);

  // Prioritize canonical server loader data for SSR and client hydration
  const allEvents = loaderEvents?.length ? loaderEvents : storeEvents;
  const allArticles = loaderArticles?.length ? loaderArticles : storeArticles;
  const allListingsData = loaderListings?.length ? loaderListings : storeListings;

  const today = todayIso();
  const publishedEvents = allEvents
    .filter((e) => e.status === "published" && (e.endDate || e.startDate) >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const events = publishedEvents.slice(0, 4);
  const articles = allArticles.filter((a) => a.status === "published");
  const listings = allListingsData.filter((l) => l.isFeatured).slice(0, 4);

  const featuredArticles = allArticles.filter((a) => a.isFeatured && a.status === "published");
  const primaryHeroArticle = featuredArticles[0] ?? articles[0];
  const primaryHeroEvent = events[0];
  const publishedArticles = allArticles.filter((a) => a.status === "published");
  const sideArticles = publishedArticles.filter((a) => a.id !== primaryHeroArticle?.id).slice(0, 3);
  // Latest stories skips anything already shown in the front-page block
  const shownIds = new Set([primaryHeroArticle?.id, ...sideArticles.map((a) => a.id)]);
  const latestArticles = publishedArticles.filter((a) => !shownIds.has(a.id));

  // [3] Live date string for the hero masthead
  const liveDate = formatFullDate();

  return (
    <PublicLayout>
      {/* ── FRONT PAGE ───────────────────────────────────────────────────────── */}
      <section className="border-b-2 border-foreground bg-background">
        <div className="max-w-7xl mx-auto px-4 pt-6 pb-10 md:pt-8 md:pb-14">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b-2 border-foreground pb-3 mb-6 md:mb-8">
            <h1 className="text-sm md:text-base font-bold">
              Hull&apos;s independent guide to events, food and culture
            </h1>
            <p className="text-sm text-foreground/70" suppressHydrationWarning>
              {liveDate}
            </p>
          </div>

          {primaryHeroArticle && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              <a href={articlePath(primaryHeroArticle)} className="group block lg:col-span-8">
                <div className="aspect-[16/9] overflow-hidden bg-foreground/10 mb-5">
                  <ResponsiveImage
                    id={primaryHeroArticle.featuredImage || "/hull-marina-hero.jpg"}
                    alt={decodeHtml(primaryHeroArticle.title)}
                    width={1100}
                    height={620}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                    fetchPriority="high"
                    loading="eager"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                </div>
                <div className="text-sm font-bold text-foreground/60 mb-2">
                  {primaryHeroArticle.category}
                </div>
                <h2 className="font-display-keep text-4xl md:text-6xl font-display uppercase leading-[0.95] tracking-tight mb-4 group-hover:underline decoration-accent decoration-4 underline-offset-4">
                  {decodeHtml(primaryHeroArticle.title)}
                </h2>
                <p className="text-base md:text-lg text-foreground/75 max-w-2xl leading-relaxed mb-3">
                  {decodeHtml(primaryHeroArticle.excerpt)}
                </p>
                <p className="text-sm text-foreground/60">
                  By {primaryHeroArticle.author || "HU NOW"}
                  {primaryHeroArticle.readingMinutes
                    ? ` · ${primaryHeroArticle.readingMinutes} min read`
                    : ""}
                </p>
              </a>

              <div className="lg:col-span-4 lg:border-l-2 lg:border-foreground lg:pl-10">
                <h2 className="text-lg font-bold mb-2">Also on HU NOW</h2>
                <ul className="divide-y divide-foreground/15">
                  {primaryHeroEvent && (
                    <li>
                      <Link
                        to="/events/$slug"
                        params={{ slug: primaryHeroEvent.slug }}
                        className="group flex gap-4 py-4"
                      >
                        <div
                          className="w-14 shrink-0 border-2 border-foreground text-center leading-none py-1.5"
                          suppressHydrationWarning
                        >
                          <div className="text-[11px] font-bold uppercase">
                            {formatWeekday(primaryHeroEvent.startDate)}
                          </div>
                          <div className="font-display text-3xl">
                            {Number(primaryHeroEvent.startDate.slice(8, 10))}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold leading-snug group-hover:underline">
                            {decodeHtml(primaryHeroEvent.title)}
                          </div>
                          <div className="text-sm text-foreground/60 mt-1">
                            {cleanLocation(primaryHeroEvent.locationName)}
                            {primaryHeroEvent.startTime ? ` · ${primaryHeroEvent.startTime}` : ""}
                          </div>
                        </div>
                      </Link>
                    </li>
                  )}
                  {sideArticles.map((a) => (
                    <li key={a.id}>
                      <a href={articlePath(a)} className="group flex gap-4 py-4">
                        <div className="w-20 shrink-0 aspect-[4/3] overflow-hidden bg-foreground/10">
                          <img
                            src={img(a.featuredImage, 160, 120)}
                            alt=""
                            width={160}
                            height={120}
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              e.currentTarget.style.visibility = "hidden";
                            }}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold leading-snug group-hover:underline">
                            {decodeHtml(a.title)}
                          </div>
                          <div className="text-sm text-foreground/60 mt-1">{a.category}</div>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── MAIN GRID ────────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-4xl md:text-5xl font-display uppercase tracking-tight">
                Coming up in Hull
              </h2>
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
                <div
                  className="font-mono text-[10px] font-bold uppercase mb-1.5"
                  style={{ color: categoryColor(events[0].category) }}
                >
                  {events[0].category}
                  {events[0].isSponsored && (
                    <span className="ml-3 text-muted-foreground">· Sponsored</span>
                  )}
                </div>
                <h3 className="text-2xl md:text-3xl font-display uppercase leading-none group-hover:underline mb-2">
                  {decodeHtml(events[0].title)}
                </h3>
                <div
                  className="text-[10px] font-mono uppercase text-muted-foreground"
                  suppressHydrationWarning
                >
                  {formatHomeDate(events[0].startDate)} · {events[0].startTime} ·{" "}
                  {cleanLocation(events[0].locationName)}
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
                    alt={decodeHtml(e.title)}
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
                    suppressHydrationWarning
                  >
                    {e.category} · {formatHomeDate(e.startDate)}
                  </div>
                  <h3 className="text-sm font-bold leading-snug group-hover:underline mb-0.5">
                    {decodeHtml(e.title)}
                  </h3>
                  <div className="text-[9px] font-mono uppercase text-muted-foreground">
                    {cleanLocation(e.locationName)}
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
              className="inline-block text-[10px] font-bold uppercase tracking-widest border-b-2 border-foreground pt-2 pb-1 hover:text-accent hover:border-accent"
            >
              View full calendar →
            </Link>
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-12">
          <PollWidget />
          <AdSlot placement="Sidebar Ad" />
        </aside>
      </main>

      {/* ── LATEST STORIES ───────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-12 border-t border-border">
        <div className="flex items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-4xl md:text-5xl font-display uppercase">Latest stories</h2>
          </div>
          <Link
            to="/stories"
            className="text-[10px] font-bold uppercase tracking-widest border-b-2 border-foreground pt-2 pb-1 hover:text-accent hover:border-accent shrink-0"
          >
            All stories →
          </Link>
        </div>
        {latestArticles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Lead article */}
            <a href={articlePath(latestArticles[0])} className="group block md:col-span-2">
              <div className="w-full aspect-[16/10] bg-stone-200 overflow-hidden mb-5 relative">
                <ResponsiveImage
                  id={latestArticles[0].featuredImage}
                  alt={latestArticles[0].title}
                  width={900}
                  height={560}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <span
                className="inline-block text-[10px] font-mono font-bold uppercase px-2 py-1 mb-3"
                style={{
                  background: categoryColor(latestArticles[0].category),
                  color: "var(--background)",
                }}
              >
                {latestArticles[0].category}
              </span>
              <h3 className="text-3xl md:text-5xl font-display uppercase leading-none group-hover:underline mb-4">
                {latestArticles[0].title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                {latestArticles[0].excerpt}
              </p>
              <div className="text-[10px] font-mono uppercase text-muted-foreground">
                {latestArticles[0].author} · {latestArticles[0].readingMinutes} min read
              </div>
            </a>
            {/* Secondary articles */}
            <div className="flex flex-col gap-0 md:border-l-2 md:border-foreground md:pl-10 divide-y divide-foreground/10">
              {latestArticles.slice(1, 3).map((a) => (
                <a
                  key={a.id}
                  href={articlePath(a)}
                  className="group flex gap-4 items-start py-5 first:pt-0"
                >
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

      {/* ── NEWSLETTER CTA ───────────────────────────────────────────────────── */}
      <section className="bg-foreground text-background border-y-2 border-foreground">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div>
            <div className="text-accent text-[10px] font-mono uppercase tracking-widest mb-4">
              Free · Every Thursday
            </div>
            <h2 className="text-5xl md:text-7xl font-display uppercase leading-none mb-5">
              Hull in your inbox
            </h2>
            <p className="text-background/70 text-lg leading-relaxed mb-4 max-w-sm">
              Every Thursday, a round-up of what's on, what's opened and what's worth knowing in
              Hull this week.
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
                  } catch {
                    // Keep the optimistic confirmation used by this lightweight signup form.
                  }
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
      <section className="max-w-7xl mx-auto px-4 py-12 border-b border-border">
        <div className="flex items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-4xl md:text-5xl font-display uppercase">Independent Hull</h2>
            <p className="text-sm text-muted-foreground mt-1.5">
              Shops, cafés, restaurants and more — the city's independent scene
            </p>
          </div>
          <Link
            to="/places"
            className="text-[10px] font-bold uppercase tracking-widest border-b-2 border-foreground pt-2 pb-1 hover:text-accent hover:border-accent shrink-0"
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
              <div className="w-full aspect-[16/7] overflow-hidden bg-stone-200">
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
                <p className="text-sm text-muted-foreground line-clamp-4 max-w-3xl leading-relaxed">
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
                className="mt-6 text-[10px] font-bold uppercase tracking-widest border-b-2 border-foreground pt-2 pb-1 self-start hover:text-accent hover:border-accent"
              >
                All places →
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* [NEW] Hull neighbourhoods strip */}
      <section className="border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-end justify-between mb-6 gap-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-foreground/30 mb-1.5">
                Explore by area
              </div>
              <h2 className="text-4xl font-display uppercase">Hull Neighbourhoods</h2>
            </div>
            <Link
              to="/areas"
              className="text-[10px] font-bold uppercase tracking-widest border-b-2 border-foreground pt-2 pb-1 hover:text-accent hover:border-accent shrink-0"
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
                <div className="border-2 border-foreground/15 group-hover:border-accent group-hover:-translate-y-1 transition-all h-full overflow-hidden">
                  <div className="aspect-[16/8] overflow-hidden bg-stone-200">
                    <img
                      src={AREA_IMAGES[slug]?.src}
                      alt={AREA_IMAGES[slug]?.alt ?? `${label}, Hull`}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-2xl uppercase leading-none mb-2 group-hover:text-accent transition-colors">
                      {label}
                    </h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
                    <div className="mt-3 text-[10px] font-bold uppercase tracking-widest text-foreground/60 group-hover:text-accent transition-colors">
                      Explore →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Send us a tip — editorial bordered block */}
      <section className="bg-background text-foreground border-t-2 border-foreground py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest mb-3 text-accent">
              Got a story?
            </div>
            <h2 className="text-4xl md:text-6xl font-display uppercase leading-none text-foreground">
              Send us a tip
            </h2>
            <p className="mt-4 max-w-xl text-muted-foreground text-sm">
              News tips, press releases, events, openings — if it's happening in Hull, we want to
              know about it.
            </p>
          </div>
          <Link
            to="/contact"
            className="bg-foreground text-background px-8 py-4 font-bold uppercase tracking-widest text-xs shrink-0 hover:bg-accent hover:text-foreground transition-colors"
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
  if (!date) return false;
  const today = todayIso();
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 6);
  const weekEnd = d.toISOString().slice(0, 10);
  return date >= today && date <= weekEnd;
}

function formatHomeDate(date: string) {
  return formatEventDate(date);
}
