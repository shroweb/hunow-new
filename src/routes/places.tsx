import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ListingCard } from "@/components/cards";
import { useStore } from "@/lib/store";
import { buildSeoMeta } from "@/lib/seo-meta";

export const Route = createFileRoute("/places")({
  head: ({ params }) => {
    if ((params as { slug?: string })?.slug) return {};
    return buildSeoMeta({
      title: "Places in Hull — Independent Business & Venues Directory",
      description:
        "Browse Kingston upon Hull's finest independent businesses, restaurants, cafes, pubs, cultural attractions and hidden gems across East Yorkshire.",
      path: "/places",
      robots: "noindex, follow",
    });
  },
  component: Places,
});

const CATS = ["All", "Eat", "Drink", "Things To Do", "Shops", "Attractions"];

function Places() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== "/places") return <Outlet />;

  return <PlacesIndex />;
}

function PlacesIndex() {
  const listings = useStore((s) => s.listings);
  const [cat, setCat] = useState("All");
  const [gemsOnly, setGemsOnly] = useState(false);
  const [indyOnly, setIndyOnly] = useState(false);
  const filtered = useMemo(
    () =>
      listings.filter(
        (l) =>
          (cat === "All" || l.category === cat) &&
          (!gemsOnly || l.isHiddenGem) &&
          (!indyOnly || l.isIndependent),
      ),
    [listings, cat, gemsOnly, indyOnly],
  );

  return (
    <PublicLayout>
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-20 border-b border-border">
                <h1 className="text-6xl md:text-8xl font-display uppercase leading-none mb-6">Places</h1>
        <p className="text-xl max-w-2xl">Where to eat, drink, shop and explore across the city.</p>
      </section>
      <section className="max-w-7xl mx-auto px-4 py-6 border-b border-border flex flex-wrap gap-2 items-center">
        {CATS.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`px-3.5 py-2.5 sm:py-2 text-[11px] font-bold uppercase tracking-wide ${cat === c ? "bg-accent text-background" : "border border-foreground/20"}`}
          >
            {c}
          </button>
        ))}
        <button
          onClick={() => setGemsOnly((v) => !v)}
          className={`ml-2 px-3.5 py-2.5 sm:py-2 text-[11px] font-bold uppercase tracking-wide ${gemsOnly ? "bg-foreground text-background" : "border border-foreground/20"}`}
        >
          Hidden Gems
        </button>
        <button
          onClick={() => setIndyOnly((v) => !v)}
          className={`px-3.5 py-2.5 sm:py-2 text-[11px] font-bold uppercase tracking-wide ${indyOnly ? "bg-foreground text-background" : "border border-foreground/20"}`}
        >
          Independent
        </button>
      </section>
      <section className="max-w-7xl mx-auto px-4 py-12">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-display text-4xl uppercase mb-3">No places match those filters</p>
            <button
              type="button"
              onClick={() => {
                setCat("All");
                setGemsOnly(false);
                setIndyOnly(false);
              }}
              className="mt-3 bg-foreground px-6 py-3 text-xs font-bold uppercase tracking-widest text-background hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Show all places
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
            {filtered.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
