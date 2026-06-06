import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ListingCard, EventCard, ArticleCard } from "@/components/cards";
import { getAreaPageData } from "@/lib/area-guides.functions";

export const Route = createFileRoute("/areas/$area")({
  loader: async ({ params }) => {
    const data = await getAreaPageData({ data: { areaSlug: params.area } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    const area = loaderData?.area ?? "";
    const intro = loaderData?.guide?.intro ?? "";
    return {
      meta: [
        { title: `${area} — Hull Area Guide — HU NOW` },
        {
          name: "description",
          content: intro || `Places, events and stories from ${area} in Hull.`,
        },
      ],
    };
  },
  notFoundComponent: () => (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 py-32 text-center">
        <h1 className="font-display text-6xl mb-4">AREA NOT FOUND</h1>
        <Link to="/areas" className="underline">
          All areas
        </Link>
      </div>
    </PublicLayout>
  ),
  component: AreaPage,
});

function AreaPage() {
  const { area, guide, listings, events, articles } = Route.useLoaderData();
  const featured = listings.filter((l) => l.isFeatured || l.isHiddenGem).slice(0, 3);
  const rest = listings.filter((l) => !featured.find((f) => f.id === l.id));

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative border-b-2 border-foreground overflow-hidden">
        {guide.featuredImage ? (
          <>
            <img
              src={guide.featuredImage}
              alt={area}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-foreground/65" />
            <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 text-background">
              <div className="text-[10px] font-mono uppercase mb-4 text-accent">Area Guide</div>
              <h1 className="text-6xl md:text-8xl font-display uppercase leading-none mb-4">
                {area}
              </h1>
              {guide.intro && (
                <p className="text-lg max-w-2xl text-background/80 mb-4">{guide.intro}</p>
              )}
              <div className="flex flex-wrap gap-6 text-[10px] font-mono uppercase text-background/60">
                <span>{listings.length} listings</span>
                {events.length > 0 && <span>{events.length} upcoming events</span>}
                {articles.length > 0 && <span>{articles.length} stories</span>}
              </div>
            </div>
          </>
        ) : (
          <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
            <div className="text-[10px] font-mono uppercase mb-4 text-accent">Area Guide</div>
            <h1 className="text-6xl md:text-8xl font-display uppercase leading-none mb-4">{area}</h1>
            {guide.intro && (
              <p className="text-lg max-w-2xl text-muted-foreground mb-4">{guide.intro}</p>
            )}
            <div className="flex flex-wrap gap-6 text-[10px] font-mono uppercase text-muted-foreground">
              <span>{listings.length} listings</span>
              {events.length > 0 && <span>{events.length} upcoming events</span>}
              {articles.length > 0 && <span>{articles.length} stories</span>}
            </div>
          </div>
        )}
      </section>

      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 border-b border-border">
          <h2 className="text-4xl font-display uppercase mb-8">Highlights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featured.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}

      {events.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 border-b border-border">
          <h2 className="text-4xl font-display uppercase mb-8">Events in {area}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {events.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}

      {rest.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 border-b border-border">
          <h2 className="text-4xl font-display uppercase mb-8">
            All Places in {area}
            <span className="ml-3 text-xl font-mono text-muted-foreground">({rest.length})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rest.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}

      {articles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-4xl font-display uppercase mb-8">Stories about {area}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
    </PublicLayout>
  );
}
