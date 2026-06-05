import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { CommandPalette } from "@/components/CommandPalette";
import { AdSlot } from "@/components/AdSlot";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ArticleCard, EventCard, ListingCard, OfferCard } from "@/components/cards";
import { useStore } from "@/lib/store";
import { articlePath } from "@/lib/taxonomy";

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
  const publishedEvents = useStore((s) => s.events).filter((e) => e.status === "published");
  const events = publishedEvents.slice(0, 4);
  const articles = useStore((s) => s.articles)
    .filter((a) => a.status === "published")
    .slice(0, 3);
  const offers = useStore((s) => s.offers)
    .filter((o) => o.status === "active")
    .slice(0, 3);
  const listings = useStore((s) => s.listings)
    .filter((l) => l.isFeatured)
    .slice(0, 3);

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
            <div className="mb-5 inline-flex border border-background/50 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-background/85">
              Hull Marina / What&apos;s on now
            </div>
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
              <Link to="/advertise" className="underline underline-offset-4 decoration-accent">
                Advertise with HU NOW
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
              {["Today", "This Weekend", "Free", "Music", "Food", "Arts"].map((f, i) => (
                <Link
                  key={f}
                  to="/whats-on"
                  className={`px-3 py-1 text-[10px] font-bold uppercase cursor-pointer ${i === 0 ? "bg-accent text-background" : "border border-foreground/20 hover:bg-foreground/5"}`}
                >
                  {f}
                </Link>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-10">
            {events.map((e) => (
              <EventCard key={e.id} event={e} />
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

      {/* Latest Stories */}
      <section className="max-w-7xl mx-auto px-4 py-16 border-t border-border">
        <h2 className="text-5xl font-display mb-12 uppercase">Latest Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      </section>

      {/* Independent Hull */}
      <section className="max-w-7xl mx-auto px-4 py-16 border-t border-border">
        <div className="flex items-end justify-between mb-10 gap-4">
          <h2 className="text-5xl font-display uppercase">Independent Hull</h2>
          <Link
            to="/places"
            className="text-[10px] font-bold uppercase tracking-widest border-b-2 border-foreground pb-1"
          >
            All places →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
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
