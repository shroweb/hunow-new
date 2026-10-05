import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search,
  ArrowRight,
  Sparkles,
  Calendar,
  Clock,
  Compass,
  Flame,
} from "lucide-react";
import { CommandPalette } from "@/components/CommandPalette";
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
      getSettings().catch(() => ({} as Record<string, string>)),
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
  const [cmdOpen, setCmdOpen] = useState(false);
  const [heroQ, setHeroQ] = useState("");
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
  const publishedEvents = allEvents.filter(
    (e) => e.status === "published" && (e.endDate || e.startDate) >= today,
  );
  const events = publishedEvents.slice(0, 4);
  const articles = allArticles.filter((a) => a.status === "published").slice(0, 4);
  const listings = allListingsData.filter((l) => l.isFeatured).slice(0, 4);

  const featuredArticles = allArticles.filter((a) => a.isFeatured && a.status === "published");
  const featuredEvents = allEvents.filter((e) => e.isFeatured && e.status === "published");
  const featuredListings = allListingsData.filter((l) => l.isFeatured);
  const featuredHeadlines = [
    ...featuredArticles.map((a) => ({ label: a.title, href: articlePath(a) })),
    ...featuredEvents.map((e) => ({ label: e.title, href: `/events/${e.slug}` })),
    ...featuredListings.map((l) => ({ label: l.name, href: `/places/${l.slug}` })),
  ].slice(0, 8);
  const primaryHeroArticle = featuredArticles[0] ?? articles[0];
  const secondaryHeroArticle = featuredArticles[1] ?? articles[1];
  const primaryHeroEvent = featuredEvents[0] ?? events[0];

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
  const liveDate = formatFullDate();

  return (
    <PublicLayout>
      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden border-b-2 border-foreground bg-[#070b16] text-white flex flex-col justify-between"
        style={{ animation: "reveal 0.6s cubic-bezier(0.19,1,0.22,1) both" }}
      >
        {/* Layered high-definition backdrop image with clear photographic presence */}
        <ResponsiveImage
          id="/hull-marina-hero.jpg"
          alt="Hull Marina waterfront"
          width={1600}
          height={900}
          className="absolute inset-0 h-full w-full object-cover scale-105 filter brightness-[0.9] contrast-[1.05]"
          fetchPriority="high"
          loading="eager"
          sizes="100vw"
        />
        {/* Gradients tailored to ensure 100% readable text without turning the image pitch black */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070b16]/90 via-[#070b16]/75 to-[#070b16]/95 sm:via-[#070b16]/55 sm:to-[#070b16]/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070b16]/90 via-[#070b16]/40 to-transparent hidden lg:block" />

        {/* Hero Center Stage */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:py-12 lg:py-16 w-full flex-grow flex items-center">
          <div className="w-full grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column (7 cols): Headline, Subtitle, Search */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              
              {/* Overline Tag */}
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-black/60 border border-white/20 text-accent font-mono text-[10px] uppercase font-bold tracking-widest backdrop-blur-md">
                <Sparkles className="size-3 shrink-0" />
                <span>Kingston upon Hull &amp; East Yorkshire</span>
              </div>

              {/* Responsive Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-display leading-[0.95] tracking-tight uppercase text-white">
                DISCOVER WHAT&apos;S{" "}
                <span className="text-accent underline decoration-accent/40 underline-offset-4 sm:underline-offset-8">
                  HAPPENING
                </span>{" "}
                IN HULL
              </h1>

              {/* Sub-lead Description */}
              <p className="text-sm sm:text-base md:text-lg text-white/80 max-w-xl font-sans leading-relaxed text-pretty">
                Independent daily coverage of live music, food &amp; drink, hidden pubs, cultural happenings, and community stories across Hull.
              </p>

              {/* Clean Functional Search Console */}
              <div className="pt-1 max-w-xl">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (heroQ.trim()) {
                      window.location.href = `/search?q=${encodeURIComponent(heroQ.trim())}`;
                    } else {
                      setCmdOpen(true);
                    }
                  }}
                  className="relative flex items-center border-2 border-white/30 bg-black/85 backdrop-blur-md focus-within:border-accent transition-all shadow-2xl p-1"
                >
                  <Search className="size-4 sm:size-5 text-white/50 ml-2.5 sm:ml-3 shrink-0" />
                  <input
                    value={heroQ}
                    onChange={(e) => setHeroQ(e.target.value)}
                    type="text"
                    placeholder="Search events, places, gigs..."
                    className="flex-grow min-w-0 bg-transparent px-2.5 sm:px-3 py-2 sm:py-2.5 font-mono text-xs sm:text-sm text-white placeholder:text-white/40 focus:outline-none"
                  />
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setCmdOpen(true)}
                      className="hidden sm:inline-flex items-center px-2 py-1 bg-white/10 hover:bg-white/20 border border-white/20 font-mono text-[10px] text-white/60 tracking-wider transition-colors cursor-pointer"
                      title="Open Search Palette (⌘K)"
                    >
                      ⌘K
                    </button>
                    <button
                      type="submit"
                      className="bg-accent text-black font-extrabold px-3.5 sm:px-5 py-2 sm:py-2.5 uppercase tracking-wider text-xs hover:bg-white transition-colors cursor-pointer"
                    >
                      Search
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column (5 cols): Curated Editorial Spotlight Card */}
            <div className="lg:col-span-5">
              {primaryHeroArticle && (
                <div className="relative group border-2 border-white/20 bg-[#0d1222] overflow-hidden hover:border-accent transition-all duration-300 shadow-2xl">
                  {/* Spotlight Top Header */}
                  <div className="px-3.5 sm:px-4 py-2 border-b border-white/10 flex items-center justify-between bg-white/5 text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-white/60">
                    <span className="flex items-center gap-1.5 text-accent font-bold">
                      <Flame className="size-3" />
                      FEATURED STORY
                    </span>
                    <span className="text-white/40">
                      {primaryHeroArticle.readingMinutes
                        ? `${primaryHeroArticle.readingMinutes} min read`
                        : "Editorial Guide"}
                    </span>
                  </div>

                  {/* Spotlight Image with category tag */}
                  <div className="relative aspect-[16/9] sm:aspect-[16/10] overflow-hidden bg-black/60">
                    <ResponsiveImage
                      id={primaryHeroArticle.featuredImage || "/hull-marina-hero.jpg"}
                      alt={decodeHtml(primaryHeroArticle.title)}
                      width={700}
                      height={440}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="eager"
                      sizes="(max-width: 1024px) 100vw, 40vw"
                    />
                    <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10">
                      <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-black/90 border border-white/25 text-accent font-mono text-[9px] uppercase font-bold tracking-widest shadow-md">
                        {primaryHeroArticle.category || "Guide"}
                      </span>
                    </div>
                  </div>

                  {/* Spotlight Content & CTA with high-contrast text */}
                  <div className="p-4 sm:p-5 space-y-3 bg-[#0d1222]">
                    <Link
                      to={articlePath(primaryHeroArticle)}
                      className="font-display text-xl sm:text-2xl text-white hover:text-accent transition-colors leading-tight line-clamp-2 block uppercase"
                    >
                      {decodeHtml(primaryHeroArticle.title)}
                    </Link>

                    <p className="text-xs sm:text-sm text-white/70 line-clamp-2 leading-relaxed">
                      {decodeHtml(primaryHeroArticle.excerpt)}
                    </p>
                    
                    <div className="pt-2.5 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider">
                        By {primaryHeroArticle.author || "HU NOW"}
                      </span>
                      <Link
                        to={articlePath(primaryHeroArticle)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold font-mono uppercase tracking-wider text-accent hover:text-white transition-colors"
                      >
                        Read Full Story <ArrowRight className="size-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Mini-ticker of upcoming event or secondary guide */}
                  {(primaryHeroEvent || secondaryHeroArticle) && (
                    <div className="border-t border-white/10 bg-black/50 p-3 flex items-center justify-between text-xs hover:bg-black/70 transition-colors">
                      {primaryHeroEvent ? (
                        <Link
                          to={`/events/${primaryHeroEvent.slug}`}
                          className="flex items-center gap-2 text-white/90 hover:text-white w-full overflow-hidden group"
                        >
                          <span className="shrink-0 text-[9px] font-mono uppercase px-2 py-0.5 bg-accent text-black font-extrabold tracking-wider">
                            Live Gig / Event
                          </span>
                          <span className="truncate text-xs font-medium text-white/80 group-hover:text-accent transition-colors">
                            {decodeHtml(primaryHeroEvent.title)}
                          </span>
                          <ArrowRight className="size-3.5 ml-auto shrink-0 text-white/40 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                        </Link>
                      ) : secondaryHeroArticle ? (
                        <Link
                          to={articlePath(secondaryHeroArticle)}
                          className="flex items-center gap-2 text-white/90 hover:text-white w-full overflow-hidden group"
                        >
                          <span className="shrink-0 text-[9px] font-mono uppercase px-2 py-0.5 bg-white/15 border border-white/20 text-white font-bold tracking-wider">
                            Also Reading
                          </span>
                          <span className="truncate text-xs font-medium text-white/80 group-hover:text-accent transition-colors">
                            {decodeHtml(secondaryHeroArticle.title)}
                          </span>
                          <ArrowRight className="size-3.5 ml-auto shrink-0 text-white/40 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                        </Link>
                      ) : null}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* 3. Hero Bottom: Live Visitor Shortcuts Strip */}
        <div className="relative z-10 border-t-2 border-white/15 bg-black/85 backdrop-blur-md">
          <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/10 divide-y sm:divide-y-0">
            <Link
              to="/whats-on"
              search={{ when: "today" }}
              className="group p-3 sm:px-6 sm:py-3.5 hover:bg-white/5 transition-colors flex flex-col justify-center"
            >
              <div className="flex items-center gap-1.5 min-h-4">
                <span className="size-2 rounded-full bg-accent animate-pulse shrink-0" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 group-hover:text-accent transition-colors leading-none truncate">
                  Happening Today
                </span>
              </div>
              <div className="font-display text-base sm:text-xl lg:text-2xl text-white group-hover:text-accent transition-colors mt-1.5 leading-none uppercase truncate">
                {todayEvents.length > 0 ? `${todayEvents.length} Events` : "What's On"}
              </div>
            </Link>

            <Link
              to="/whats-on"
              search={{ when: "weekend" }}
              className="group p-3 sm:px-6 sm:py-3.5 hover:bg-white/5 transition-colors flex flex-col justify-center"
            >
              <div className="flex items-center gap-1.5 min-h-4">
                <Calendar className="size-3 text-white/40 group-hover:text-accent transition-colors shrink-0" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 group-hover:text-accent transition-colors leading-none truncate">
                  This Weekend
                </span>
              </div>
              <div className="font-display text-base sm:text-xl lg:text-2xl text-white group-hover:text-accent transition-colors mt-1.5 leading-none uppercase truncate">
                {weekendEvents.length > 0 ? `${weekendEvents.length} Events` : "Weekend Guide"}
              </div>
            </Link>

            <Link
              to="/open-now"
              className="group p-3 sm:px-6 sm:py-3.5 hover:bg-white/5 transition-colors flex flex-col justify-center"
            >
              <div className="flex items-center gap-1.5 min-h-4">
                <Clock className="size-3 text-white/40 group-hover:text-accent transition-colors shrink-0" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 group-hover:text-accent transition-colors leading-none truncate">
                  Open Right Now
                </span>
              </div>
              <div className="font-display text-base sm:text-xl lg:text-2xl text-white group-hover:text-accent transition-colors mt-1.5 leading-none uppercase truncate">
                Food &amp; Nightlife
              </div>
            </Link>

            <Link
              to="/whats-on"
              search={{ free: true }}
              className="group p-3 sm:px-6 sm:py-3.5 hover:bg-white/5 transition-colors flex flex-col justify-center"
            >
              <div className="flex items-center gap-1.5 min-h-4">
                <Compass className="size-3 text-white/40 group-hover:text-accent transition-colors shrink-0" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 group-hover:text-accent transition-colors leading-none truncate">
                  Budget Friendly
                </span>
              </div>
              <div className="font-display text-base sm:text-xl lg:text-2xl text-white group-hover:text-accent transition-colors mt-1.5 leading-none uppercase truncate">
                Free Things To Do
              </div>
            </Link>
          </div>
        </div>
      </section>



      {/* [8] Spotlight — live city picks */}
      <section className="border-b-2 border-foreground bg-background">
        <div className="max-w-7xl mx-auto px-4 py-7 md:py-8">
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
                  className={`group border-2 border-foreground overflow-hidden hover:bg-foreground hover:text-background transition-colors ${i === 0 ? "md:row-span-1" : ""}`}
                >
                  <div className="aspect-[16/7] overflow-hidden bg-stone-200">
                    <ResponsiveImage
                      id={event.featuredImage}
                      alt={decodeHtml(event.title)}
                      width={520}
                      height={230}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    {/* [10] Prominent day of week */}
                    <div
                      className="font-display text-3xl uppercase leading-none mb-2 text-foreground/15 group-hover:text-background/15 transition-colors select-none"
                      suppressHydrationWarning
                    >
                      {formatWeekday(event.startDate)}
                    </div>
                    <div
                      className="mb-2 font-mono text-[10px] uppercase"
                      style={{ color: categoryColor(event.category) }}
                    >
                      {event.category} · {event.startTime}
                    </div>
                    <h3 className="font-display text-2xl uppercase leading-none mb-2 group-hover:text-accent transition-colors">
                      {decodeHtml(event.title)}
                    </h3>
                    <p className="text-xs font-mono uppercase opacity-60">
                      {cleanLocation(event.locationName)}
                    </p>
                  </div>
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
      <main className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
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
              className="inline-block text-[10px] font-bold uppercase tracking-widest border-b-2 border-foreground pb-1 hover:text-accent hover:border-accent"
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
            {/* [15] Section number */}
            <div className="text-[10px] font-mono uppercase tracking-widest text-foreground/30 mb-1.5">
              02 / Latest Stories
            </div>
            <h2 className="text-4xl md:text-5xl font-display uppercase">From Our Journalists</h2>
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
            <div className="text-[10px] font-mono uppercase tracking-widest text-foreground/30 mb-1.5">
              03 / Independent Hull
            </div>
            <h2 className="text-4xl md:text-5xl font-display uppercase">Independent Hull</h2>
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

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />

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

function isThisWeekend(date: string) {
  if (!date) return false;
  try {
    const eventDate = new Date(`${date}T12:00:00Z`);
    if (isNaN(eventDate.getTime())) return false;
    const now = new Date();
    const day = now.getUTCDay();
    const daysUntilSaturday = (6 - day + 7) % 7;
    const saturday = new Date(now);
    saturday.setUTCDate(now.getUTCDate() + daysUntilSaturday);
    const sunday = new Date(saturday);
    sunday.setUTCDate(saturday.getUTCDate() + 1);
    const start = saturday.toISOString().slice(0, 10);
    const end = sunday.toISOString().slice(0, 10);
    const eventIso = eventDate.toISOString().slice(0, 10);
    return eventIso >= start && eventIso <= end;
  } catch {
    return false;
  }
}

function formatHomeDate(date: string) {
  return formatEventDate(date);
}
