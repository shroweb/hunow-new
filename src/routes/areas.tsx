import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { getAreasIndexData } from "@/lib/area-guides.functions";

export const Route = createFileRoute("/areas")({
  loader: async () => ({ areas: await getAreasIndexData() }),
  head: () => ({
    meta: [
      { title: "Hull Areas — HU NOW" },
      { name: "description", content: "Explore Hull neighbourhood by neighbourhood." },
    ],
  }),
  component: AreasIndex,
});

function AreasIndex() {
  const { areas } = Route.useLoaderData();

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {areas.map(({ area, slug, listingCount, intro, featuredImage }) => (
            <Link
              key={slug}
              to="/areas/$area"
              params={{ area: slug }}
              className="group border-2 border-foreground bg-white overflow-hidden hover:border-accent transition-colors"
            >
              {featuredImage ? (
                <div className="h-36 overflow-hidden">
                  <img
                    src={featuredImage}
                    alt={area}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="h-36 bg-foreground/5 flex items-center justify-center">
                  <span className="font-display text-5xl uppercase text-foreground/15">
                    {area[0]}
                  </span>
                </div>
              )}
              <div className="p-5">
                <div className="font-display text-3xl uppercase leading-none mb-2">{area}</div>
                {intro && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{intro}</p>
                )}
                <div className="text-[10px] font-mono uppercase text-muted-foreground group-hover:text-accent transition-colors">
                  {listingCount} {listingCount === 1 ? "listing" : "listings"} →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
