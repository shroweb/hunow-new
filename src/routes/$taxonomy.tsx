import { createFileRoute, Link, notFound, Outlet, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ArticleCard, EventCard, ListingCard } from "@/components/cards";
import {
  articleMatchesTaxonomy,
  eventMatchesTaxonomy,
  findTaxonomy,
  listingMatchesTaxonomy,
} from "@/lib/taxonomy";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/$taxonomy")({
  loader: ({ params }) => {
    const taxonomy = findTaxonomy(params.taxonomy);
    if (!taxonomy) throw notFound();
    return { taxonomy };
  },
  head: ({ loaderData }) => {
    const taxonomy = loaderData?.taxonomy;
    if (!taxonomy) return {};
    return {
      meta: [
        { title: `${taxonomy.label} — HU NOW` },
        { name: "description", content: taxonomy.description },
      ],
      links: [{ rel: "canonical", href: `/${taxonomy.slug}` }],
    };
  },
  component: TaxonomyPage,
  notFoundComponent: () => (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 py-32 text-center">
        <h1 className="font-display text-6xl mb-4">PAGE NOT FOUND</h1>
        <Link to="/" className="underline">
          Back to Home
        </Link>
      </div>
    </PublicLayout>
  ),
});

function TaxonomyPage() {
  const { taxonomy } = Route.useLoaderData();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== `/${taxonomy.slug}`) return <Outlet />;
  const articles = useStore((s) => s.articles)
    .filter((article) => article.status === "published")
    .filter((article) => articleMatchesTaxonomy(article, taxonomy));
  const events = useStore((s) => s.events)
    .filter((event) => event.status === "published")
    .filter((event) => eventMatchesTaxonomy(event, taxonomy));
  const listings = useStore((s) => s.listings).filter((listing) =>
    listingMatchesTaxonomy(listing, taxonomy),
  );
  const total = articles.length + events.length + listings.length;

  return (
    <PublicLayout>
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-20 border-b-2 border-foreground">
        <div className="text-[10px] font-mono uppercase mb-4 text-accent">{taxonomy.eyebrow}</div>
        <h1 className="text-6xl md:text-8xl font-display uppercase leading-none mb-6">
          {taxonomy.label}
        </h1>
        <p className="text-xl max-w-2xl text-muted-foreground">{taxonomy.description}</p>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-6 border-b border-border">
        <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-widest">
          <span className="border-2 border-foreground px-3 py-1.5">
            {total} {total === 1 ? "result" : "results"}
          </span>
          {events.length > 0 && (
            <span className="bg-foreground text-background px-3 py-1.5">
              {events.length} events
            </span>
          )}
          {listings.length > 0 && (
            <span className="bg-accent text-background px-3 py-1.5">
              {listings.length} listings
            </span>
          )}
          {articles.length > 0 && (
            <span className="border-2 border-accent text-accent px-3 py-1.5">
              {articles.length} posts
            </span>
          )}
        </div>
      </section>

      {events.length > 0 && (
        <TaxonomySection title="Events">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </TaxonomySection>
      )}

      {listings.length > 0 && (
        <TaxonomySection title="Listings">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </TaxonomySection>
      )}

      {articles.length > 0 && (
        <TaxonomySection title="Posts">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </TaxonomySection>
      )}

      {total === 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="border-2 border-dashed border-foreground/30 p-8 text-center text-muted-foreground">
            No published items in this taxonomy yet.
          </div>
        </section>
      )}
    </PublicLayout>
  );
}

function TaxonomySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12 border-b border-border last:border-b-0">
      <h2 className="text-4xl font-display uppercase mb-8">{title}</h2>
      {children}
    </section>
  );
}
