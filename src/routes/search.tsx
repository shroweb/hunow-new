import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { articlePath } from "@/lib/taxonomy";
import { trackAnalyticsEvent } from "@/lib/analytics.functions";
import { searchContentFn } from "@/lib/content.functions";
import type { Article, EventItem, Listing as ListingItem, Offer } from "@/types";

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>) => ({
    q: typeof s.q === "string" ? s.q : "",
  }),
  head: () => ({
    meta: [{ title: "Search — HU NOW" }, { name: "robots", content: "noindex" }],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const [type, setType] = useState("all");
  const [results, setResults] = useState<SearchResults>(emptyResults);
  const [isSearching, setIsSearching] = useState(false);

  const term = q.toLowerCase().trim();

  useEffect(() => {
    if (term.length < 2) return;
    const id = window.setTimeout(() => {
      void trackAnalyticsEvent({
        data: { eventType: "search", path: "/search", label: term },
      }).catch(() => {});
    }, 500);
    return () => window.clearTimeout(id);
  }, [term]);

  useEffect(() => {
    let cancelled = false;
    if (term.length < 2) {
      setResults(emptyResults);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const id = window.setTimeout(() => {
      void searchContentFn({ data: { query: term } })
        .then((nextResults) => {
          if (!cancelled) setResults(nextResults);
        })
        .catch(() => {
          if (!cancelled) setResults(emptyResults);
        })
        .finally(() => {
          if (!cancelled) setIsSearching(false);
        });
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [term]);

  const total =
    results.articles.length +
    results.events.length +
    results.listings.length +
    results.offers.length;
  const showArticles = type === "all" || type === "stories";
  const showEvents = type === "all" || type === "events";
  const showListings = type === "all" || type === "places";
  const showOffers = type === "all" || type === "offers";

  return (
    <PublicLayout>
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-16 border-b-2 border-foreground">
        <div className="text-[10px] font-mono uppercase mb-4 text-accent">Search</div>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col md:flex-row gap-3 max-w-3xl"
        >
          <input
            name="q"
            defaultValue={q}
            placeholder="Search events, places, stories…"
            autoFocus
            onChange={(e) => {
              const url = new URL(window.location.href);
              url.searchParams.set("q", e.target.value);
              window.history.replaceState({}, "", url.toString());
            }}
            className="flex-1 bg-white border-2 border-foreground px-6 py-4 font-mono text-sm focus:outline-none"
          />
        </form>
        {term && (
          <p className="mt-4 text-[10px] font-mono uppercase text-muted-foreground">
            {isSearching ? "Searching..." : `${total} result${total !== 1 ? "s" : ""} for "${q}"`}
          </p>
        )}
        {term && total > 0 && (
          <div className="flex flex-wrap gap-2 mt-5">
            {[
              ["all", `All (${total})`],
              ["stories", `Stories (${results.articles.length})`],
              ["events", `Events (${results.events.length})`],
              ["places", `Places (${results.listings.length})`],
              ["offers", `Offers (${results.offers.length})`],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setType(key)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase ${
                  type === key ? "bg-accent text-background" : "border border-foreground/30"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </section>

      {!term && (
        <div className="max-w-7xl mx-auto px-4 py-24 text-center text-muted-foreground">
          Start typing to search across all content
        </div>
      )}

      {term && !isSearching && total === 0 && (
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <p className="font-display text-4xl uppercase mb-4">No results</p>
          <p className="text-muted-foreground">Try a different search term.</p>
        </div>
      )}

      {term && total > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
          {showArticles && results.articles.length > 0 && (
            <section>
              <h2 className="font-display text-3xl uppercase border-b-2 border-foreground pb-2 mb-6">
                Stories{" "}
                <span className="text-muted-foreground text-xl">({results.articles.length})</span>
              </h2>
              <ul className="divide-y divide-foreground/10">
                {results.articles.map((a) => (
                  <li key={a.id} className="py-4">
                    <a
                      href={articlePath(a)}
                      className="group flex items-start justify-between gap-4"
                    >
                      <div>
                        <p className="font-bold group-hover:underline">{a.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                          {a.excerpt}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono uppercase text-accent shrink-0 mt-1">
                        {a.category}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {showEvents && results.events.length > 0 && (
            <section>
              <h2 className="font-display text-3xl uppercase border-b-2 border-foreground pb-2 mb-6">
                Events{" "}
                <span className="text-muted-foreground text-xl">({results.events.length})</span>
              </h2>
              <ul className="divide-y divide-foreground/10">
                {results.events.map((e) => (
                  <li key={e.id} className="py-4">
                    <Link
                      to="/events/$slug"
                      params={{ slug: e.slug }}
                      className="group flex items-start justify-between gap-4"
                    >
                      <div>
                        <p className="font-bold group-hover:underline">{e.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {e.locationName} · {e.startDate}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono uppercase text-accent shrink-0 mt-1">
                        {e.category}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {showListings && results.listings.length > 0 && (
            <section>
              <h2 className="font-display text-3xl uppercase border-b-2 border-foreground pb-2 mb-6">
                Places{" "}
                <span className="text-muted-foreground text-xl">({results.listings.length})</span>
              </h2>
              <ul className="divide-y divide-foreground/10">
                {results.listings.map((l) => (
                  <li key={l.id} className="py-4">
                    <Link
                      to="/places/$slug"
                      params={{ slug: l.slug }}
                      className="group flex items-start justify-between gap-4"
                    >
                      <div>
                        <p className="font-bold group-hover:underline">{l.name}</p>
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                          {l.description}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono uppercase text-accent shrink-0 mt-1">
                        {l.category} · {l.area}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {showOffers && results.offers.length > 0 && (
            <section>
              <h2 className="font-display text-3xl uppercase border-b-2 border-foreground pb-2 mb-6">
                Offers{" "}
                <span className="text-muted-foreground text-xl">({results.offers.length})</span>
              </h2>
              <ul className="divide-y divide-foreground/10">
                {results.offers.map((o) => (
                  <li key={o.id} className="py-4">
                    <Link to="/offers" className="group flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold group-hover:underline">{o.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                          {o.businessName} · {o.description}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono uppercase text-accent shrink-0 mt-1">
                        {o.category}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </PublicLayout>
  );
}

type SearchResults = {
  articles: Article[];
  events: EventItem[];
  listings: ListingItem[];
  offers: Offer[];
};

const emptyResults: SearchResults = {
  articles: [],
  events: [],
  listings: [],
  offers: [],
};
