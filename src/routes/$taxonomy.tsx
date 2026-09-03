import {
  createFileRoute,
  Link,
  notFound,
  redirect,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
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
import { AdSlot } from "@/components/AdSlot";

export const Route = createFileRoute("/$taxonomy")({
  loader: async ({ params }) => {
    if (params.taxonomy === "events") {
      throw redirect({ href: "/whats-on", statusCode: 301 });
    }
    if (params.taxonomy === "freedom-fest") {
      throw redirect({ href: "/freedom-festival", statusCode: 301 });
    }
    if (params.taxonomy === "pride-in-hull") {
      throw redirect({ href: "/hull-pride", statusCode: 301 });
    }
    if (params.taxonomy === "humber-sesh") {
      throw redirect({ href: "/humber-street-sesh", statusCode: 301 });
    }
    if (params.taxonomy === "christmas-lights") {
      throw redirect({ href: "/christmas-lights-switch-on", statusCode: 301 });
    }
    const taxonomy = findTaxonomy(params.taxonomy);
    if (!taxonomy) {
      // 1. Check if there is an explicit redirect configured (e.g. /hull-fair-2025...)
      const { resolveRedirect } = await import("@/lib/redirects.functions");
      const match = await resolveRedirect({ data: { path: `/${params.taxonomy}` } }).catch(() => null);
      if (match) {
        throw redirect({ href: match.to_path, statusCode: match.permanent ? 301 : 302 });
      }

      // 2. Old site used bare top-level slugs (e.g. /hull-secret-history) — try article lookup
      const { fetchArticleBySlug } = await import("@/lib/content-read.functions");
      const article = await fetchArticleBySlug({ data: { slug: params.taxonomy } }).catch(
        () => null,
      );
      if (article?.status === "published") {
        const { articlePath } = await import("@/lib/taxonomy");
        throw redirect({ href: articlePath(article), statusCode: 301 });
      }

      // 3. Try event lookup (e.g. /hull-fair-2026)
      const { fetchEventBySlug } = await import("@/lib/content-read.functions");
      const event = await fetchEventBySlug({ data: { slug: params.taxonomy } }).catch(() => null);
      if (event?.status === "published") {
        throw redirect({ href: `/events/${event.slug}`, statusCode: 301 });
      }

      // 4. Try listing lookup
      const { fetchListingBySlug } = await import("@/lib/content-read.functions");
      const listing = await fetchListingBySlug({ data: { slug: params.taxonomy } }).catch(() => null);
      if (listing) {
        throw redirect({ href: `/places/${listing.slug}`, statusCode: 301 });
      }

      throw notFound();
    }
    const { getStoreFromDatabase } = await import("@/lib/store.functions");
    const store = await getStoreFromDatabase().catch(() => null);
    return {
      taxonomy,
      articles: store?.articles ?? [],
      events: store?.events ?? [],
      listings: store?.listings ?? [],
    };
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
  const {
    taxonomy,
    articles: loaderArticles,
    events: loaderEvents,
    listings: loaderListings,
  } = Route.useLoaderData();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const todayIso = new Date().toISOString().slice(0, 10);
  const articles = (loaderArticles ?? [])
    .filter((article) => article.status === "published")
    .filter((article) => articleMatchesTaxonomy(article, taxonomy));
  const events = (loaderEvents ?? [])
    .filter((event) => event.status === "published")
    .filter((event) => eventMatchesTaxonomy(event, taxonomy))
    .filter((event) => (event.endDate || event.startDate) >= todayIso);
  const listings = (loaderListings ?? []).filter((listing) =>
    listingMatchesTaxonomy(listing, taxonomy),
  );
  const total = articles.length + events.length + listings.length;

  if (pathname !== `/${taxonomy.slug}`) return <Outlet />;

  return (
    <PublicLayout>
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-20 border-b-2 border-foreground">
        <div className="text-[10px] font-mono uppercase mb-4 text-accent">{taxonomy.eyebrow}</div>
        <h1 className="text-6xl md:text-8xl font-display uppercase leading-none mb-6">
          {taxonomy.label}
        </h1>
        <p className="text-xl max-w-2xl text-muted-foreground">{taxonomy.description}</p>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <AdSlot placement={`${taxonomy.label} Category`} />
      </div>

      <section className="max-w-7xl mx-auto px-4 py-6 border-b border-border">
        <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-widest" suppressHydrationWarning>
          <span className="border-2 border-foreground px-3 py-1.5" suppressHydrationWarning>
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
