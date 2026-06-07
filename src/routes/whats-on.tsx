import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { z } from "zod";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { EventCard } from "@/components/cards";
import { PaginationControls } from "@/components/PaginationControls";
import { useStore } from "@/lib/store";
import type { EventItem } from "@/types";

const PER_PAGE = 12;

const searchSchema = z.object({
  category: z.string().optional(),
  free: z.boolean().optional(),
  when: z.enum(["today", "weekend"]).optional(),
});

export const Route = createFileRoute("/whats-on")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "What's On in Hull — HU NOW" },
      {
        name: "description",
        content: "Every event happening in Hull this week. Music, food, arts, family and more.",
      },
    ],
  }),
  component: WhatsOn,
});

const CATEGORIES = [
  "All",
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
  const events = useStore((s) => s.events).filter((e) => e.status === "published");
  const [category, setCategory] = useState(search.category ?? "All");
  const [freeOnly, setFreeOnly] = useState(search.free ?? false);
  const [when, setWhen] = useState<"today" | "weekend" | "all">(search.when ?? "all");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const today = todayIso();
    const [satStr, sunStr] = weekendRange();
    return events.filter(
      (e) =>
        (category === "All" || e.category === category) &&
        (!freeOnly || e.isFree) &&
        (when === "all" ||
          (when === "today" && e.startDate === today) ||
          (when === "weekend" && (e.startDate === satStr || e.startDate === sunStr))) &&
        (!query ||
          e.title.toLowerCase().includes(query.toLowerCase()) ||
          e.locationName.toLowerCase().includes(query.toLowerCase())),
    );
  }, [events, category, freeOnly, when, query]);

  useEffect(() => {
    setPage(1);
  }, [category, freeOnly, when, query, view]);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

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

      <section className="max-w-7xl mx-auto px-4 py-5 border-b border-border">
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setWhen("all")}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase ${when === "all" ? "bg-accent text-background" : "border border-foreground/20 hover:bg-foreground/5"}`}
          >
            All
          </button>
          <button
            onClick={() => setWhen("today")}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase ${when === "today" ? "bg-accent text-background" : "border border-foreground/20 hover:bg-foreground/5"}`}
          >
            Today
          </button>
          <button
            onClick={() => setWhen("weekend")}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase ${when === "weekend" ? "bg-accent text-background" : "border border-foreground/20 hover:bg-foreground/5"}`}
          >
            This Weekend
          </button>
          <div className="w-px h-4 bg-foreground/20 mx-1" />
          {CATEGORIES.filter((c) => c !== "All").map((c) => (
            <button
              key={c}
              onClick={() => setCategory(category === c ? "All" : c)}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase ${category === c ? "bg-accent text-background" : "border border-foreground/20 hover:bg-foreground/5"}`}
            >
              {c}
            </button>
          ))}
          <button
            onClick={() => setFreeOnly((v) => !v)}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase ml-1 ${freeOnly ? "bg-foreground text-background" : "border border-foreground/20"}`}
          >
            Free Only
          </button>
          <div className="flex gap-1 ml-auto">
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase ${view === "list" ? "bg-foreground text-background" : "border border-foreground/20"}`}
            >
              List
            </button>
            <button
              onClick={() => setView("calendar")}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase ${view === "calendar" ? "bg-foreground text-background" : "border border-foreground/20"}`}
            >
              Calendar
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        {filtered.length === 0 ? (
          <div className="py-32 text-center font-mono text-sm uppercase text-muted-foreground">
            No events match your filters.
          </div>
        ) : view === "calendar" ? (
          <CalendarView events={filtered} />
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
              total={filtered.length}
              perPage={PER_PAGE}
              onPrev={() => setPage((p) => p - 1)}
              onNext={() => setPage((p) => p + 1)}
            />
          </>
        )}
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
