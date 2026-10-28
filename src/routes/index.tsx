import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

import { AdSlot } from "@/components/AdSlot";
import { ArticleCard, EventCard, ListingCard } from "@/components/cards";
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
      {/* ── HERO: today's lead story ──────────────────────────────────────── */}
      {primaryHeroArticle && (
        <section className="relative overflow-hidden border-b-2 border-foreground bg-[#070b16] text-white">
          <ResponsiveImage
            id={primaryHeroArticle.featuredImage || "/hull-marina-hero.jpg"}
            alt=""
            width={1600}
            height={900}
            className="absolute inset-0 h-full w-full object-cover"
            fetchPriority="high"
            loading="eager"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070b16] via-[#070b16]/70 to-[#070b16]/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070b16]/85 via-[#070b16]/30 to-transparent hidden lg:block" />

          <div className="relative max-w-7xl mx-auto px-4 pt-5 pb-8 md:pb-12">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-white/25 pb-3">
              <h1 className="text-sm font-bold text-white/90">
                Hull&apos;s independent guide to events, food and culture
              </h1>
              <p className="text-sm text-white/70" suppressHydrationWarning>
                {liveDate}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end pt-28 sm:pt-40 lg:pt-56">
              <a href={articlePath(primaryHeroArticle)} className="group block lg:col-span-8">
                <div className="text-sm font-bold text-accent mb-3">
                  {primaryHeroArticle.category}
                </div>
                <h2 className="font-display-keep text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display uppercase leading-[0.92] tracking-tight mb-5 group-hover:underline decoration-accent decoration-4 underline-offset-8">
                  {decodeHtml(primaryHeroArticle.title)}
                </h2>
                <p className="text-base md:text-xl text-white/85 max-w-2xl leading-relaxed mb-5">
                  {decodeHtml(primaryHeroArticle.excerpt)}
                </p>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                  <span className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-5 py-3 text-xs font-bold uppercase tracking-widest group-hover:bg-white transition-colors">
                    Read the story <ArrowRight className="size-4" />
                  </span>
                  <span className="text-sm text-white/70">
                    By {primaryHeroArticle.author || "HU NOW"}
                    {primaryHeroArticle.readingMinutes
                      ? ` · ${primaryHeroArticle.readingMinutes} min read`
                      : ""}
                  </span>
                </div>
              </a>

              <div className="lg:col-span-4 border-t-2 border-white/25 lg:border-t-0 lg:border-l-2 lg:pl-8 pt-5 lg:pt-0">
                <h2 className="text-base font-bold text-white mb-1">Also on HU NOW</h2>
                <ul className="divide-y divide-white/15">
                  {primaryHeroEvent && (
                    <li>
                      <Link
                        to="/events/$slug"
                        params={{ slug: primaryHeroEvent.slug }}
                        className="group flex gap-4 py-3.5"
                      >
                        <div
                          className="w-12 shrink-0 bg-white text-[#070b16] text-center leading-none py-1.5"
                          suppressHydrationWarning
                        >
                          <div className="text-[10px] font-bold uppercase">
                            {formatWeekday(primaryHeroEvent.startDate)}
                          </div>
                          <div className="font-display text-2xl">
                            {Number(primaryHeroEvent.startDate.slice(8, 10))}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold leading-snug text-white group-hover:underline">
                            {decodeHtml(primaryHeroEvent.title)}
                          </div>
                          <div className="text-sm text-white/65 mt-0.5">
                            {cleanLocation(primaryHeroEvent.locationName)}
                            {primaryHeroEvent.startTime ? ` · ${primaryHeroEvent.startTime}` : ""}
                          </div>
                        </div>
                      </Link>
                    </li>
                  )}
                  {sideArticles.map((a) => (
                    <li key={a.id}>
                      <a href={articlePath(a)} className="group block py-3.5">
                        <div className="font-bold leading-snug text-white group-hover:underline">
                          {decodeHtml(a.title)}
                        </div>
                        <div className="text-sm text-white/65 mt-0.5">{a.category}</div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── COMING UP ──────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-16 border-b border-border">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <h2 className="text-4xl md:text-5xl font-display">Coming up in Hull</h2>
          <Link
            to="/whats-on"
            className="inline-flex items-center gap-2 border-2 border-foreground px-4 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
          >
            Full calendar <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="-mt-4 mb-8 flex flex-wrap gap-2">
          {(
            [
              { label: "Today", search: { when: "today" as const } },
              { label: "This weekend", search: { when: "weekend" as const } },
              { label: "Free", search: { free: true } },
              { label: "Music", search: { category: "Music" } },
              { label: "Food & drink", search: { category: "Food & Drink" } },
              { label: "Arts", search: { category: "Arts" } },
            ] as const
          ).map(({ label, search }) => (
            <Link
              key={label}
              to="/whats-on"
              search={search}
              className="px-3.5 py-2 text-sm font-semibold border border-foreground/25 hover:border-foreground hover:bg-foreground hover:text-background transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
        {events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {events.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        ) : (
          <p className="text-foreground/70">Nothing listed yet. Check the full calendar.</p>
        )}
      </section>

      {/* ── LATEST STORIES ─────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-16 border-b border-border">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <h2 className="text-4xl md:text-5xl font-display">Latest stories</h2>
          <Link
            to="/stories"
            className="inline-flex items-center gap-2 border-2 border-foreground px-4 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
          >
            All stories <ArrowRight className="size-4" />
          </Link>
        </div>
        {latestArticles.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {latestArticles.slice(0, 3).map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12 border-b border-border grid grid-cols-1 lg:grid-cols-2 gap-10">
        <PollWidget />
        <AdSlot placement="Sidebar Ad" />
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

      {/* ── INDEPENDENT HULL ───────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-16 border-b border-border">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <h2 className="text-4xl md:text-5xl font-display">Independent Hull</h2>
          <Link
            to="/places"
            className="inline-flex items-center gap-2 border-2 border-foreground px-4 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
          >
            All places <ArrowRight className="size-4" />
          </Link>
        </div>
        {listings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>

      {/* ── NEIGHBOURHOODS ─────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-end justify-between mb-6 gap-4">
            <div>
              <h2 className="text-4xl md:text-5xl font-display">Hull neighbourhoods</h2>
            </div>
            <Link
              to="/areas"
              className="inline-flex shrink-0 items-center gap-2 border-2 border-foreground px-4 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
            >
              All areas <ArrowRight className="size-4" />
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
