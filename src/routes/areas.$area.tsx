import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ListingCard, EventCard, ArticleCard } from "@/components/cards";
import { useStore } from "@/lib/store";
import { getState } from "@/lib/store";

function slugToArea(slug: string, areas: string[]) {
  return areas.find((a) => a.toLowerCase().replace(/\s+/g, "-") === slug);
}

export const Route = createFileRoute("/areas/$area")({
  loader: ({ params }) => {
    const areas = Array.from(new Set(getState().listings.map((l) => l.area)));
    const area = slugToArea(params.area, areas);
    if (!area) throw notFound();
    return { area };
  },
  head: ({ loaderData }) => {
    const area = loaderData?.area ?? "";
    return {
      meta: [
        { title: `${area} — Hull Area Guide — HU NOW` },
        { name: "description", content: `Places, events and stories from ${area} in Hull.` },
      ],
    };
  },
  notFoundComponent: () => (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 py-32 text-center">
        <h1 className="font-display text-6xl mb-4">AREA NOT FOUND</h1>
        <Link to="/areas" className="underline">All areas</Link>
      </div>
    </PublicLayout>
  ),
  component: AreaPage,
});

function AreaPage() {
  const { area } = Route.useLoaderData();
  const listings = useStore((s) => s.listings).filter((l) => l.area === area);
  const events = useStore((s) => s.events).filter(
    (e) =>
      e.status === "published" &&
      (e.locationName.toLowerCase().includes(area.toLowerCase()) ||
        e.address.toLowerCase().includes(area.toLowerCase())),
  );
  const articles = useStore((s) => s.articles).filter(
    (a) =>
      a.status === "published" &&
      (a.tags.some((t) => t.toLowerCase().includes(area.toLowerCase())) ||
        a.title.toLowerCase().includes(area.toLowerCase()) ||
        a.content.toLowerCase().includes(area.toLowerCase())),
  ).slice(0, 3);

  const featured = listings.filter((l) => l.isFeatured || l.isHiddenGem).slice(0, 3);
  const rest = listings.filter((l) => !featured.find((f) => f.id === l.id));

  return (
    <PublicLayout>
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-20 border-b-2 border-foreground">
        <div className="text-[10px] font-mono uppercase mb-4 text-accent">Area Guide</div>
        <h1 className="text-6xl md:text-8xl font-display uppercase leading-none mb-4">{area}</h1>
        <div className="flex flex-wrap gap-6 text-[10px] font-mono uppercase text-muted-foreground">
          <span>{listings.length} listings</span>
          {events.length > 0 && <span>{events.length} upcoming events</span>}
          {articles.length > 0 && <span>{articles.length} stories</span>}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 border-b border-border">
          <h2 className="text-4xl font-display uppercase mb-8">Highlights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featured.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        </section>
      )}

      {events.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 border-b border-border">
          <h2 className="text-4xl font-display uppercase mb-8">Events in {area}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {events.slice(0, 3).map((e) => <EventCard key={e.id} event={e} />)}
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
            {rest.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        </section>
      )}

      {articles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-4xl font-display uppercase mb-8">Stories about {area}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16">
            {articles.map((a) => <ArticleCard key={a.id} article={a} />)}
          </div>
        </section>
      )}
    </PublicLayout>
  );
}
