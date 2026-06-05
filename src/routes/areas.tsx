import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/areas")({
  head: () => ({
    meta: [
      { title: "Hull Areas — HU NOW" },
      { name: "description", content: "Explore Hull neighbourhood by neighbourhood." },
    ],
  }),
  component: AreasIndex,
});

function AreasIndex() {
  const listings = useStore((s) => s.listings);
  const areas = Array.from(new Set(listings.map((l) => l.area))).sort();

  return (
    <PublicLayout>
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-20 border-b-2 border-foreground">
        <div className="text-[10px] font-mono uppercase mb-4 text-accent">Neighbourhood Guide</div>
        <h1 className="text-6xl md:text-8xl font-display uppercase leading-none mb-4">
          Hull Areas
        </h1>
        <p className="text-xl max-w-2xl text-muted-foreground">
          Explore Hull neighbourhood by neighbourhood.
        </p>
      </section>
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {areas.map((area) => {
            const count = listings.filter((l) => l.area === area).length;
            return (
              <Link
                key={area}
                to="/areas/$area"
                params={{ area: area.toLowerCase().replace(/\s+/g, "-") }}
                className="group border-2 border-foreground p-6 hover:bg-foreground hover:text-background transition-colors"
              >
                <div className="font-display text-3xl uppercase leading-none mb-2">{area}</div>
                <div className="text-[10px] font-mono uppercase text-muted-foreground group-hover:text-background/60">
                  {count} {count === 1 ? "listing" : "listings"}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </PublicLayout>
  );
}
