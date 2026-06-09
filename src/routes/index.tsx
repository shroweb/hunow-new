import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { CommandPalette } from "@/components/CommandPalette";
import { AdSlot } from "@/components/AdSlot";
import { PollWidget } from "@/components/PollWidget";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { OfferCard } from "@/components/cards";
import { useStore } from "@/lib/store";
import { articlePath } from "@/lib/taxonomy";
import { img } from "@/data/seed";
import { subscribeNewsletter } from "@/lib/public.functions";

export const Route = createFileRoute("/")({
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

function Index() {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [heroQ, setHeroQ] = useState("");
  const [nlEmail, setNlEmail] = useState("");
  const [nlDone, setNlDone] = useState(false);
  const publishedEvents = useStore((s) => s.events).filter((e) => e.status === "published");
  const events = publishedEvents.slice(0, 4);
  const articles = useStore((s) => s.articles)
    .filter((a) => a.status === "published")
    .slice(0, 4);
  const offers = useStore((s) => s.offers)
    .filter((o) => o.status === "active")
    .slice(0, 3);
  const listings = useStore((s) => s.listings)
    .filter((l) => l.isFeatured)
    .slice(0, 4);

  const featuredArticles = useStore((s) => s.articles).filter(
    (a) => a.isFeatured && a.status === "published",
  );
  const featuredEvents = useStore((s) => s.events).filter(
    (e) => e.isFeatured && e.status === "published",
  );
  const featuredListings = useStore((s) => s.listings).filter((l) => l.isFeatured);
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

  return (
    <PublicLayout>
      {/* Hero */}
      <section
        className="relative min-h-[calc(100vh-92px)] overflow-hidden border-b-2 border-foreground bg-foreground text-background"
        style={{ animation: "reveal 0.6s cubic-bezier(0.19,1,0.22,1) both" }}
      >
        <img
          src="/hull-marina-hero.jpg"
          alt="Hull Marina waterfront"
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,12,39,0.88)_0%,rgba(7,12,39,0.70)_44%,rgba(7,12,39,0.24)_100%)]" />
        <div className="relative max-w-7xl mx-auto px-4 py-14 md:py-20 min-h-[calc(100vh-92px)] flex items-center">
          <div className="max-w-5xl">
            <h1 className="text-6xl md:text-9xl font-display leading-[0.9] text-balance mb-8">
              DISCOVER WHAT&apos;S <span className="text-accent">HAPPENING</span> IN HULL
            </h1>
            <p className="text-xl md:text-2xl font-medium max-w-2xl mb-10 text-pretty text-background/90">
              Events, food, culture, hidden gems and independent businesses — all in one place.
            </p>
            <form
              className="flex flex-col md:flex-row gap-4 max-w-4xl"
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
                className="flex-grow bg-background border-2 border-background px-6 py-4 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/60"
                readOnly
              />
              <button
                type="button"
                onClick={() => setCmdOpen(true)}
                className="bg-accent text-foreground px-8 py-4 font-bold uppercase tracking-widest hover:bg-background transition-colors"
              >
                Explore What&apos;s On
              </button>
            </form>
            <div className="flex flex-wrap gap-4 mt-6 text-[10px] font-mono uppercase text-background/90">
              <Link to="/stories" className="underline underline-offset-4 decoration-accent">
                Read the latest
              </Link>
              <Link to="/submit" className="underline underline-offset-4 decoration-accent">
                Submit an event
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b-2 border-foreground bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-10">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="mb-3 text-[10px] font-mono uppercase tracking-widest text-accent">
                Live city picks
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
              {spotlightEvents.map((event) => (
                <Link
                  key={event.id}
                  to="/events/$slug"
                  params={{ slug: event.slug }}
                  className="border-2 border-foreground bg-white p-4 hover:bg-foreground hover:text-background transition-colors"
                >
                  <div className="mb-3 font-mono text-[10px] uppercase text-accent">
                    {formatHomeDate(event.startDate)} · {event.startTime}
                  </div>
                  <h3 className="font-display text-2xl uppercase leading-none mb-2">
                    {event.title}
                  </h3>
                  <p className="text-xs font-mono uppercase opacity-75">{event.locationName}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-foreground/30 p-6 text-sm text-muted-foreground">
              No events listed for today yet. Check the full calendar for what is coming up.
            </div>
          )}
        </div>
      </section>

      {/* Featured marquee */}
      <section className="border-b border-border overflow-hidden bg-foreground text-background py-2">
        <div
          className="flex whitespace-nowrap gap-12"
          style={{ animation: "marquee 30s linear infinite" }}
        >
          {[...featuredHeadlines, ...featuredHeadlines, ...featuredHeadlines].map((item, i) => (
            <a
              key={`${item.href}-${i}`}
              href={item.href}
              className="font-display text-xl uppercase tracking-widest shrink-0 hover:text-accent focus-visible:text-accent focus-visible:outline-none"
            >
              Featured This Week: {item.label}
            </a>
          ))}
        </div>
      </section>

      {/* Main grid */}
      <main className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <h2 className="text-5xl font-display uppercase tracking-tight">What's On</h2>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/whats-on"
                search={{ when: "today" }}
                className="px-3 py-1 text-[10px] font-bold uppercase border border-foreground/20 hover:bg-foreground/5"
              >
                Today
              </Link>
              <Link
                to="/whats-on"
                search={{ when: "weekend" }}
                className="px-3 py-1 text-[10px] font-bold uppercase border border-foreground/20 hover:bg-foreground/5"
              >
                This Weekend
              </Link>
              <Link
                to="/whats-on"
                search={{ free: true }}
                className="px-3 py-1 text-[10px] font-bold uppercase border border-foreground/20 hover:bg-foreground/5"
              >
                Free
              </Link>
              <Link
                to="/whats-on"
                search={{ category: "Music" }}
                className="px-3 py-1 text-[10px] font-bold uppercase border border-foreground/20 hover:bg-foreground/5"
              >
                Music
              </Link>
              <Link
                to="/whats-on"
                search={{ category: "Food & Drink" }}
                className="px-3 py-1 text-[10px] font-bold uppercase border border-foreground/20 hover:bg-foreground/5"
              >
                Food
              </Link>
              <Link
                to="/whats-on"
                search={{ category: "Arts" }}
                className="px-3 py-1 text-[10px] font-bold uppercase border border-foreground/20 hover:bg-foreground/5"
              >
                Arts
              </Link>
            </div>
          </div>
          {/* Lead event — full-bleed with overlay */}
          {events[0] && (
            <Link
              to="/events/$slug"
              params={{ slug: events[0].slug }}
              className="group relative block w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-stone-900 mb-6"
            >
              <img
                src={img(events[0].featuredImage, 900, 420)}
                alt={events[0].title}
                width={900}
                height={420}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                <div className="font-mono text-[10px] font-bold uppercase text-accent mb-2">
                  {events[0].category}
                  {events[0].isSponsored && (
                    <span className="ml-3 text-background/60">· Sponsored</span>
                  )}
                </div>
                <h3 className="text-xl md:text-2xl font-bold leading-tight text-background group-hover:underline mb-2">
                  {events[0].title}
                </h3>
                <div className="text-[10px] font-mono uppercase text-background/60">
                  {formatHomeDate(events[0].startDate)} · {events[0].startTime} · {events[0].locationName}
                </div>
              </div>
            </Link>
          )}
          {/* Remaining events — compact rows */}
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
                  <div className="font-mono text-[9px] font-bold uppercase text-accent mb-1">
                    {e.category} · {formatHomeDate(e.startDate)}
                  </div>
                  <h3 className="text-sm font-bold leading-snug group-hover:underline mb-0.5">{e.title}</h3>
                  <div className="text-[9px] font-mono uppercase text-muted-foreground">
                    {e.locationName}
                  </div>
                </div>
                <svg className="shrink-0 text-foreground/25 group-hover:text-accent transition-colors" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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

      {/* Latest Stories — editorial layout */}
      <section className="max-w-7xl mx-auto px-4 py-16 border-t border-border">
        <div className="flex items-end justify-between mb-10 gap-4">
          <h2 className="text-5xl font-display uppercase">Latest Stories</h2>
          <Link
            to="/stories"
            className="text-[10px] font-bold uppercase tracking-widest border-b-2 border-foreground pb-1 hover:text-accent hover:border-accent"
          >
            All stories →
          </Link>
        </div>
        {articles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Lead article */}
            <a href={articlePath(articles[0])} className="group block md:col-span-2">
              <div className="w-full aspect-[16/10] bg-stone-200 overflow-hidden mb-5 relative">
                <img
                  src={img(articles[0].featuredImage, 900, 560)}
                  alt={articles[0].title}
                  width={900}
                  height={560}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <span className="inline-block text-[10px] font-mono font-bold uppercase bg-foreground text-background px-2 py-1 mb-3">
                {articles[0].category}
              </span>
              <h3 className="text-3xl md:text-4xl font-bold leading-tight group-hover:underline mb-3">
                {articles[0].title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-3">{articles[0].excerpt}</p>
              <div className="text-[10px] font-mono uppercase text-muted-foreground mt-3">
                {articles[0].author} · {articles[0].readingMinutes} min read
              </div>
            </a>
            {/* Secondary articles */}
            <div className="flex flex-col gap-6 md:border-l-2 md:border-foreground md:pl-10">
              {articles.slice(1, 3).map((a) => (
                <a key={a.id} href={articlePath(a)} className="group flex gap-4 items-start">
                  <div className="w-20 h-20 shrink-0 overflow-hidden bg-stone-200">
                    <img
                      src={img(a.featuredImage, 160, 160)}
                      alt={a.title}
                      width={160}
                      height={160}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-mono font-bold uppercase text-accent block mb-1">
                      {a.category}
                    </span>
                    <h3 className="text-sm font-bold leading-tight group-hover:underline">
                      {a.title}
                    </h3>
                    <div className="text-[9px] font-mono uppercase text-muted-foreground mt-2">
                      {a.author} · {a.readingMinutes} min
                    </div>
                  </div>
                  <svg className="shrink-0 text-foreground/25 group-hover:text-accent transition-colors" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Editorial feature band */}
      {featuredArticles[0] && (
        <section className="border-y-2 border-foreground overflow-hidden">
          <a href={articlePath(featuredArticles[0])} className="group relative block min-h-[340px] md:min-h-[420px]">
            <img
              src={img(featuredArticles[0].featuredImage, 1400, 600)}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-foreground/72" />
            <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 flex flex-col justify-end min-h-[340px] md:min-h-[420px]">
              <div className="max-w-3xl">
                <span className="inline-block bg-accent text-background text-[10px] font-mono font-bold uppercase px-3 py-1 mb-5">
                  {featuredArticles[0].category}
                </span>
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-display uppercase leading-none text-background mb-4 group-hover:text-accent transition-colors duration-300">
                  {featuredArticles[0].title}
                </h2>
                <p className="text-background/75 text-lg max-w-2xl mb-6 hidden md:block">
                  {featuredArticles[0].excerpt}
                </p>
                <span className="inline-block border-b-2 border-accent text-background text-[10px] font-bold uppercase tracking-widest pb-1">
                  Read the story →
                </span>
              </div>
            </div>
          </a>
        </section>
      )}

      {/* Newsletter CTA */}
      <section className="bg-foreground text-background border-y-2 border-foreground">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          {/* Left — copy */}
          <div>
            <div className="text-accent text-[10px] font-mono uppercase tracking-widest mb-4">
              Free · Every week
            </div>
            <h2 className="text-5xl md:text-7xl font-display uppercase leading-none mb-6">
              Hull in your inbox
            </h2>
            <ul className="space-y-2 text-background/70 text-sm">
              {[
                "What's on this week — events, gigs, markets",
                "New openings and independent businesses",
                "Hidden gems and city guides",
                "Exclusive reader offers",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-accent mt-0.5 shrink-0">—</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          {/* Right — form */}
          <div>
            {nlDone ? (
              <div className="border-2 border-accent p-8">
                <div className="text-accent text-[10px] font-mono uppercase tracking-widest mb-3">
                  You're subscribed
                </div>
                <p className="text-2xl font-display uppercase leading-tight">
                  Welcome to the list. See you in your inbox.
                </p>
              </div>
            ) : (
              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!nlEmail) return;
                  try {
                    await subscribeNewsletter({ data: { email: nlEmail, segments: ["events", "offers"] } });
                  } catch {}
                  setNlDone(true);
                }}
              >
                <label className="block text-[10px] font-mono uppercase tracking-widest text-background/60 mb-1">
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
                  Sign up — it's free →
                </button>
                <p className="text-[10px] font-mono text-background/40 uppercase">
                  No spam. Unsubscribe any time.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Independent Hull — editorial layout */}
      <section className="max-w-7xl mx-auto px-4 py-16 border-b border-border">
        <div className="flex items-end justify-between mb-10 gap-4">
          <h2 className="text-5xl font-display uppercase">Independent Hull</h2>
          <Link
            to="/places"
            className="text-[10px] font-bold uppercase tracking-widest border-b-2 border-foreground pb-1 hover:text-accent hover:border-accent"
          >
            All places →
          </Link>
        </div>
        {listings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Lead listing — full-bleed with overlay */}
            <Link
              to="/places/$slug"
              params={{ slug: listings[0].slug }}
              className="group relative block md:col-span-2 aspect-[16/10] overflow-hidden bg-stone-900"
            >
              <img
                src={img(listings[0].featuredImage, 900, 560)}
                alt={listings[0].name}
                width={900}
                height={560}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="text-[9px] font-mono font-bold uppercase text-accent mb-2">
                  {listings[0].category} · {listings[0].area}
                </div>
                <h3 className="text-3xl md:text-4xl font-bold leading-tight text-background group-hover:underline mb-2">
                  {listings[0].name}
                </h3>
                <p className="text-sm text-background/70 line-clamp-1">{listings[0].description}</p>
              </div>
            </Link>
            {/* Secondary listings */}
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
                      <span className="text-[9px] font-mono font-bold uppercase text-accent block mb-1">
                        {l.category} · {l.area}
                      </span>
                      <h3 className="text-sm font-bold leading-snug group-hover:underline mb-0.5">{l.name}</h3>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{l.description}</p>
                    </div>
                    <svg className="shrink-0 text-foreground/25 group-hover:text-accent transition-colors" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />

      {/* News tips CTA */}
      <section className="max-w-7xl mx-auto px-4 my-20">
        <div className="border-2 border-foreground p-10 md:p-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest mb-3 text-accent">
              Got a story?
            </div>
            <h2 className="text-4xl md:text-6xl font-display uppercase leading-none">
              Send us a tip
            </h2>
            <p className="mt-4 max-w-xl text-muted-foreground">
              News tips, press releases, events, openings — if it's happening in Hull, we want to
              know.
            </p>
          </div>
          <Link
            to="/contact"
            className="bg-foreground text-background px-8 py-4 font-bold uppercase tracking-widest text-xs shrink-0 hover:bg-accent transition-colors"
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
