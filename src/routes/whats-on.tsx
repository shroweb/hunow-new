import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { z } from "zod";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { EventCard } from "@/components/cards";
import { PaginationControls } from "@/components/PaginationControls";
import { fetchPagedEvents } from "@/lib/content-read.functions";
import type { EventItem } from "@/types";

const PER_PAGE = 12;

const searchSchema = z.object({
  category: z.string().optional(),
  free: z.boolean().optional(),
  when: z.enum(["today", "weekend"]).optional(),
});

import { buildSeoMeta } from "@/lib/seo-meta";

export const Route = createFileRoute("/whats-on")({
  validateSearch: searchSchema,
  head: () => {
    const seo = buildSeoMeta({
      title: "What's On in Hull — Gigs, Shows & Events Guide",
      description:
        "Every live event happening in Hull and East Yorkshire this week. Discover gigs, theatre, comedy, stadium sports, family days out, and weekend markets.",
      path: "/whats-on",
    });
    return {
      ...seo,
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Where are the best live music and entertainment venues in Hull?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Major touring acts and arena shows head to Connexin Live (Hull Arena) near the marina. For independent, grassroots, and alternative music, The New Adelphi Club on De Grey Street, The Polar Bear on Spring Bank, and Social on Humber Street are legendary local hubs.",
                },
              },
              {
                "@type": "Question",
                name: "What theatres operate in Hull for touring plays and comedy?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Hull New Theatre in Kingston Square hosts major West End touring productions, ballet, and opera. Hull Truck Theatre on Ferensway is renowned for producing groundbreaking homegrown drama, independent productions, and stand-up comedy.",
                },
              },
              {
                "@type": "Question",
                name: "What are the biggest annual festivals in Hull?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Hull hosts several major festivals throughout the year: Hull Fair in October (Europe's largest travelling fair), Humber Street Sesh in August (celebrating hundreds of regional musicians), Freedom Festival in late summer (international arts and street theatre), and Pride in Hull.",
                },
              },
              {
                "@type": "Question",
                name: "How can event organizers list an upcoming event on HU NOW?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Organisers, venues, and promoters can submit events directly through HU NOW's submission portal at hunow.co.uk/submit for review and inclusion in our city calendar.",
                },
              },
            ],
          }),
        },
      ],
    };
  },
  component: WhatsOn,
});

const CATEGORIES = [
  "All",
  "Sport",
  "Music",
  "Food & Drink",
  "Arts",
  "Comedy",
  "Family",
  "Theatre",
  "Nightlife",
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function weekendRange(): [string, string] {
  const now = new Date();
  const day = now.getDay(); // 0=Sun,6=Sat
  const daysToSat = day === 6 ? 0 : 6 - day;
  const sat = new Date(now);
  sat.setDate(now.getDate() + daysToSat);
  const sun = new Date(sat);
  sun.setDate(sat.getDate() + 1);
  return [sat.toISOString().slice(0, 10), sun.toISOString().slice(0, 10)];
}

function WhatsOn() {
  const search = Route.useSearch();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState(search.category ?? "All");
  const [freeOnly, setFreeOnly] = useState(search.free ?? false);
  const [when, setWhen] = useState<"today" | "weekend" | "all">(search.when ?? "all");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [page, setPage] = useState(1);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  // If "today" is requested but nothing is on today, silently treat as "all"
  const [hasTodayCheck, setHasTodayCheck] = useState(true);

  useEffect(() => {
    if (when !== "today") return;
    fetchPagedEvents({
      data: {
        when: "today",
        page: 1,
        limit: 1,
        status: "published",
      },
    })
      .then((res) => {
        setHasTodayCheck(res.totalCount > 0);
      })
      .catch(() => {
        setHasTodayCheck(false);
      });
  }, [when]);

  const effectiveWhen = useMemo<"today" | "weekend" | "all">(() => {
    if (when !== "today") return when;
    return hasTodayCheck ? "today" : "all";
  }, [when, hasTodayCheck]);

  // Fetch events from server
  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchPagedEvents({
      data: {
        category: category === "All" ? undefined : category,
        freeOnly: freeOnly ? true : undefined,
        when: effectiveWhen === "all" ? undefined : effectiveWhen,
        q: debouncedQuery || undefined,
        page: view === "calendar" ? 1 : page,
        limit: view === "calendar" ? 500 : 12,
        status: "published",
      },
    })
      .then((res) => {
        if (!active) return;
        setEvents(res.items);
        setTotalCount(res.totalCount);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [category, freeOnly, effectiveWhen, debouncedQuery, page, view]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [category, freeOnly, effectiveWhen, debouncedQuery, view]);

  const totalPages = Math.ceil(totalCount / PER_PAGE);
  const paged = events;

  return (
    <PublicLayout>
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-20 border-b border-border">
        <div className="text-[10px] font-mono uppercase mb-4 text-accent">The Diary</div>
        <h1 className="text-6xl md:text-8xl font-display uppercase leading-none mb-6">
          What's On in Hull
        </h1>
        <p className="text-xl max-w-2xl mb-8">Hand-picked events you won't want to miss.</p>
        <div className="flex flex-col md:flex-row gap-4 max-w-3xl">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events or venues..."
            className="flex-grow bg-white border-2 border-foreground px-6 py-4 font-mono text-sm focus:outline-none"
          />
          <Link
            to="/submit"
            className="bg-foreground text-background px-8 py-4 font-bold uppercase tracking-widest text-xs text-center hover:bg-accent"
          >
            Submit Event
          </Link>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2">
          {/* Single horizontally-scrollable chip row */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none flex-1 min-w-0 py-0.5">
            <button
              onClick={() => {
                setWhen("all");
                setCategory("All");
                setFreeOnly(false);
              }}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase whitespace-nowrap shrink-0 rounded-sm ${effectiveWhen === "all" && category === "All" && !freeOnly ? "bg-foreground text-background" : "border border-foreground/20 hover:bg-foreground/5"}`}
            >
              All
            </button>
            <button
              onClick={() => setWhen("today")}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase whitespace-nowrap shrink-0 rounded-sm ${effectiveWhen === "today" ? "bg-accent text-background" : "border border-foreground/20 hover:bg-foreground/5"}`}
            >
              Today
            </button>
            <button
              onClick={() => setWhen("weekend")}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase whitespace-nowrap shrink-0 rounded-sm ${effectiveWhen === "weekend" ? "bg-accent text-background" : "border border-foreground/20 hover:bg-foreground/5"}`}
            >
              This Weekend
            </button>
            <div className="w-px bg-foreground/15 mx-0.5 self-stretch shrink-0" />
            {CATEGORIES.filter((c) => c !== "All").map((c) => (
              <button
                key={c}
                onClick={() => setCategory(category === c ? "All" : c)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase whitespace-nowrap shrink-0 rounded-sm ${category === c ? "bg-accent text-background" : "border border-foreground/20 hover:bg-foreground/5"}`}
              >
                {c}
              </button>
            ))}
            <div className="w-px bg-foreground/15 mx-0.5 self-stretch shrink-0" />
            <button
              onClick={() => setFreeOnly((v) => !v)}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase whitespace-nowrap shrink-0 rounded-sm ${freeOnly ? "bg-foreground text-background" : "border border-foreground/20 hover:bg-foreground/5"}`}
            >
              Free
            </button>
          </div>
          {/* View toggle pinned right — never scrolls */}
          <div className="flex gap-1 shrink-0 border-l border-foreground/10 pl-2">
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-sm ${view === "list" ? "bg-foreground text-background" : "text-foreground/50 hover:text-foreground"}`}
            >
              List
            </button>
            <button
              onClick={() => setView("calendar")}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-sm ${view === "calendar" ? "bg-foreground text-background" : "text-foreground/50 hover:text-foreground"}`}
            >
              Cal
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="py-32 text-center font-mono text-sm uppercase text-muted-foreground animate-pulse">
            Loading events…
          </div>
        ) : events.length === 0 ? (
          <div className="py-32 text-center font-mono text-sm uppercase text-muted-foreground">
            No events match your filters.
          </div>
        ) : view === "calendar" ? (
          <CalendarView events={events} />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
              {paged.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
            <PaginationControls
              page={page}
              totalPages={totalPages}
              total={totalCount}
              perPage={PER_PAGE}
              onPrev={() => setPage((p) => p - 1)}
              onNext={() => setPage((p) => p + 1)}
            />
          </>
        )}
      </section>

      {/* Evergreen Editorial City Guide & FAQ Hub (Crawlable SEO Depth) */}
      <section className="border-t border-border bg-card/40 py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          <div>
            <div className="text-[10px] font-mono uppercase text-accent mb-2">City Event Guide</div>
            <h2 className="text-3xl md:text-5xl font-display uppercase tracking-tight mb-4">
              Your Guide to Live Entertainment Across Hull & East Yorkshire
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              From packed arena tours on Myton Street to independent grassroots gigs in historic pubs,
              Kingston upon Hull is one of northern England's most vibrant, distinctive cultural centres.
              Whether you are planning a weekend visit, tracking upcoming comedy dates, or scouting free
              family activities during the school holidays, our weekly-updated listings cover every corner of the city.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-y border-border py-8">
            <div>
              <h3 className="text-xl font-bold uppercase mb-2">Major Arenas & Theatres</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                <strong>Connexin Live Hull</strong> (the 3,500-capacity arena near Hull Marina) hosts global touring rock bands,
                stand-up comedians, and major sporting bouts. For theatre lovers, <strong>Hull New Theatre</strong> in Kingston
                Square welcomes national West End musicals, opera, and family pantomimes, while <strong>Hull Truck Theatre</strong> on
                Ferensway champions groundbreaking regional drama and intimate new writing.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold uppercase mb-2">Grassroots Venues & Nightlife</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Hull's live music heritage runs deep. The legendary <strong>New Adelphi Club</strong> on De Grey Street has launched
                breakout bands for over four decades. Along Spring Bank, <strong>The Polar Bear Music Club</strong> offers late-night
                live sets and showcase nights, while the converted warehouses along <strong>Humber Street</strong> host acoustic sessions,
                DJ sets, and contemporary art exhibitions.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-2xl md:text-3xl font-display uppercase mb-6">
              Major Annual Festivals & Celebrations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/hull-fair"
                className="p-5 border border-border bg-background hover:border-accent transition-colors block group"
              >
                <div className="text-xs font-mono uppercase text-accent mb-1">October Tradition</div>
                <div className="font-bold text-lg group-hover:text-accent transition-colors">Hull Fair</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Europe’s largest travelling fair featuring over 250 spectacular rides and attractions along Walton Street.
                </p>
              </Link>
              <Link
                to="/humber-street-sesh"
                className="p-5 border border-border bg-background hover:border-accent transition-colors block group"
              >
                <div className="text-xs font-mono uppercase text-accent mb-1">August Music Festival</div>
                <div className="font-bold text-lg group-hover:text-accent transition-colors">Humber Street Sesh</div>
                <p className="text-xs text-muted-foreground mt-1">
                  The UK’s premier grassroots festival showcasing over 200 homegrown artists across Marina and Old Town stages.
                </p>
              </Link>
              <Link
                to="/freedom-festival"
                className="p-5 border border-border bg-background hover:border-accent transition-colors block group"
              >
                <div className="text-xs font-mono uppercase text-accent mb-1">International Arts</div>
                <div className="font-bold text-lg group-hover:text-accent transition-colors">Freedom Festival</div>
                <p className="text-xs text-muted-foreground mt-1">
                  World-class street theatre, acrobatic spectacles, outdoor dance, and community exhibitions celebrating civil liberties.
                </p>
              </Link>
              <Link
                to="/christmas-lights-switch-on"
                className="p-5 border border-border bg-background hover:border-accent transition-colors block group"
              >
                <div className="text-xs font-mono uppercase text-accent mb-1">Winter Highlight</div>
                <div className="font-bold text-lg group-hover:text-accent transition-colors">Christmas Lights Switch-On</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Queen Victoria Square illuminations, festive markets, and live stage entertainment inaugurating the winter season.
                </p>
              </Link>
            </div>
          </div>

          <div className="pt-6">
            <h3 className="text-2xl md:text-3xl font-display uppercase mb-4">Frequently Asked Questions</h3>
            <div className="divide-y divide-border">
              <div className="py-4">
                <h4 className="font-bold text-base mb-1">Where do the biggest touring bands play in Hull?</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Connexin Live (Hull Arena) near the marina hosts major arena tours, rock bands, and stadium comedy.
                  For intimate touring acts, The New Adelphi Club, Polar Bear, and Social on Humber Street are the go-to independent music rooms.
                </p>
              </div>
              <div className="py-4">
                <h4 className="font-bold text-base mb-1">What theatres operate in Hull for touring plays and comedy?</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Hull New Theatre in Kingston Square stages large West End touring musicals, ballet, and opera.
                  Hull Truck Theatre on Ferensway produces original regional drama, award-winning plays, and regular comedy circuit nights.
                </p>
              </div>
              <div className="py-4">
                <h4 className="font-bold text-base mb-1">Are there free events and community festivals in Hull?</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Yes. Most outdoor programming during Freedom Festival, the Queen Victoria Square Christmas Lights Switch-On,
                  and Pride in Hull are free to attend. You can also filter our calendar using the "Free" toggle above to discover no-cost community activities.
                </p>
              </div>
              <div className="py-4">
                <h4 className="font-bold text-base mb-1">How can event organisers list an event on HU NOW?</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Organisers, promoters, and local venues can submit their event details via our simple{" "}
                  <Link to="/submit" className="underline font-medium hover:text-accent">
                    event submission form
                  </Link>
                  . Submissions are reviewed by our editorial team and published to the live city diary.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function CalendarView({ events }: { events: EventItem[] }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = (firstDay.getDay() + 6) % 7; // Monday-first
  const totalCells = startPad + lastDay.getDate();
  const weeks = Math.ceil(totalCells / 7);

  const byDate = useMemo(() => {
    const map: Record<string, EventItem[]> = {};
    for (const e of events) {
      const d = e.startDate.slice(0, 10);
      (map[d] ||= []).push(e);
    }
    return map;
  }, [events]);

  const monthName = firstDay.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const prev = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const next = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  const todayStr = today.toISOString().slice(0, 10);

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prev}
          className="px-4 py-2 border-2 border-foreground text-xs font-bold uppercase hover:bg-foreground hover:text-background transition-colors"
        >
          ← Prev
        </button>
        <h2 className="font-display text-3xl uppercase">{monthName}</h2>
        <button
          onClick={next}
          className="px-4 py-2 border-2 border-foreground text-xs font-bold uppercase hover:bg-foreground hover:text-background transition-colors"
        >
          Next →
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 border-2 border-foreground border-b-0">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div
            key={d}
            className="bg-foreground text-background text-center py-2 text-[10px] font-bold uppercase border-r border-white/10 last:border-r-0"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="border-2 border-foreground border-t-0">
        {Array.from({ length: weeks }).map((_, wi) => (
          <div key={wi} className="grid grid-cols-7 border-t border-foreground/10">
            {Array.from({ length: 7 }).map((_, di) => {
              const cellIdx = wi * 7 + di;
              const dayNum = cellIdx - startPad + 1;
              if (dayNum < 1 || dayNum > lastDay.getDate()) {
                return (
                  <div
                    key={di}
                    className="min-h-[80px] bg-stone-50 border-r border-foreground/10 last:border-r-0"
                  />
                );
              }
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
              const dayEvents = byDate[dateStr] ?? [];
              const isToday = dateStr === todayStr;
              return (
                <div
                  key={di}
                  className={`min-h-[80px] p-1.5 border-r border-foreground/10 last:border-r-0 ${isToday ? "bg-accent/5" : ""}`}
                >
                  <div
                    className={`text-[11px] font-bold mb-1 w-6 h-6 flex items-center justify-center ${isToday ? "bg-accent text-background rounded-none" : "text-muted-foreground"}`}
                  >
                    {dayNum}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map((e) => (
                      <a
                        key={e.id}
                        href={`/events/${e.slug}`}
                        className="block text-[10px] font-bold leading-tight px-1 py-0.5 bg-foreground text-background hover:bg-accent transition-colors truncate"
                        title={e.title}
                      >
                        {e.title}
                      </a>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[9px] font-mono text-muted-foreground px-1">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <p className="mt-4 text-[10px] font-mono uppercase text-muted-foreground">
        {events.length} event{events.length !== 1 ? "s" : ""} shown · filtered by current selections
      </p>
    </div>
  );
}
