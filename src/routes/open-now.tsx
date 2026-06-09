import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ListingCard } from "@/components/cards";
import { useStore } from "@/lib/store";
import { openStatus } from "@/lib/hours";

export const Route = createFileRoute("/open-now")({
  head: () => ({
    meta: [
      { title: "Open Now in Hull — HU NOW" },
      { name: "description", content: "Places open right now in Hull." },
    ],
  }),
  component: OpenNow,
});

function OpenNow() {
  const listings = useStore((s) => s.listings);
  const [now, setNow] = useState(() => new Date());
  const [cat, setCat] = useState("All");
  const [mode, setMode] = useState<"now" | "late" | "sunday">("now");

  // Refresh every minute
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const open = useMemo(() => {
    return listings.filter((l) => {
      if (!l.hours) return false;
      if (mode === "now") return openStatus(l.hours, now).open;
      if (mode === "late") {
        return Object.values(l.hours).some((hours) => hours && hours.close >= "21:00");
      }
      return !!l.hours.sun;
    });
  }, [listings, now, mode]);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(open.map((l) => l.category)))],
    [open],
  );

  const filtered = useMemo(
    () => (cat === "All" ? open : open.filter((l) => l.category === cat)),
    [open, cat],
  );

  const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return (
    <PublicLayout>
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-20 border-b-2 border-foreground">
        <div className="text-[10px] font-mono uppercase mb-4 text-accent">
          Right now · {timeStr}
        </div>
        <h1 className="text-6xl md:text-8xl font-display uppercase leading-none mb-4">Open Now</h1>
        <p className="text-xl max-w-2xl text-muted-foreground">
          {open.length} {open.length === 1 ? "place" : "places"} matching your opening-hours filter.
        </p>
      </section>

      {
        <section className="max-w-7xl mx-auto px-4 py-5 border-b border-border space-y-4">
          <div className="flex flex-wrap gap-2">
            {[
              ["now", "Open now"],
              ["late", "Open late"],
              ["sunday", "Open Sunday"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => { setMode(key as "now" | "late" | "sunday"); setCat("All"); }}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase ${mode === key ? "bg-foreground text-background" : "border border-foreground/20 hover:bg-foreground/5"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase ${cat === c ? "bg-accent text-background" : "border border-foreground/20 hover:bg-foreground/5"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </section>
      }

      <section className="max-w-7xl mx-auto px-4 py-12">
        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-display text-4xl uppercase mb-4">
              {mode === "now" ? "Nothing open right now" : mode === "late" ? "No places open late" : "No places open on Sunday"}
            </p>
            <p className="text-muted-foreground">
              Browse{" "}
              <a href="/listings" className="underline font-bold">
                all listings
              </a>{" "}
              or check back later.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {filtered.map((l) => (
                <div key={l.id} className="relative">
                  <div className="absolute top-3 left-3 z-10 bg-[oklch(0.58_0.15_145)] text-background text-[9px] font-bold uppercase px-2 py-0.5">
                    {openStatus(l.hours!, now).label}
                  </div>
                  <ListingCard listing={l} />
                </div>
              ))}
            </div>
            <p className="text-[10px] font-mono uppercase text-muted-foreground">
              Updates every minute · based on listed opening hours
            </p>
          </>
        )}
      </section>
    </PublicLayout>
  );
}
