import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ArticleCard, EventCard, ListingCard, OfferCard } from "@/components/cards";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/collections/$slug")({
  component: CollectionDetail,
  head: ({ params }) => ({
    meta: [{ title: `${params.slug.replace(/-/g, " ")} — HU NOW Collections` }],
  }),
  notFoundComponent: () => (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 py-32 text-center">
        <h1 className="font-display text-6xl mb-4">COLLECTION NOT FOUND</h1>
        <Link to="/stories" className="underline">
          Back to Stories
        </Link>
      </div>
    </PublicLayout>
  ),
});

function CollectionDetail() {
  const { slug } = Route.useParams();
  const collections = useStore((s) => s.collections);
  const articles = useStore((s) => s.articles);
  const events = useStore((s) => s.events);
  const listings = useStore((s) => s.listings);
  const offers = useStore((s) => s.offers);
  const collection = collections.find((item) => item.slug === slug && item.status === "published");
  if (!collection) throw notFound();

  const resolved = collection.items
    .map((item) => {
      if (item.kind === "article")
        return { kind: item.kind, value: articles.find((a) => a.id === item.id) };
      if (item.kind === "event")
        return { kind: item.kind, value: events.find((e) => e.id === item.id) };
      if (item.kind === "listing")
        return { kind: item.kind, value: listings.find((l) => l.id === item.id) };
      return { kind: item.kind, value: offers.find((o) => o.id === item.id) };
    })
    .filter((item) => item.value);

  return (
    <PublicLayout>
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Collections", to: "/stories" },
          { label: collection.title },
        ]}
      />
      <section className="max-w-7xl mx-auto px-4 py-16 border-b-2 border-foreground">
        <div className="font-mono text-[10px] uppercase text-accent mb-4">Editorial collection</div>
        <h1 className="font-display text-6xl md:text-8xl uppercase leading-none mb-6">
          {collection.title}
        </h1>
        {collection.description && (
          <p className="max-w-3xl text-xl text-muted-foreground">{collection.description}</p>
        )}
      </section>
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {resolved.map((item) => {
            if (item.kind === "article") {
              return (
                <ArticleCard key={`article-${item.value!.id}`} article={item.value as never} />
              );
            }
            if (item.kind === "event") {
              return <EventCard key={`event-${item.value!.id}`} event={item.value as never} />;
            }
            if (item.kind === "listing") {
              return (
                <ListingCard key={`listing-${item.value!.id}`} listing={item.value as never} />
              );
            }
            return <OfferCard key={`offer-${item.value!.id}`} offer={item.value as never} />;
          })}
        </div>
      </section>
    </PublicLayout>
  );
}
