import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
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

const RECENT_KEY = "hunow:search:recent";
const MAX_RECENT = 6;

function getRecentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecentSearch(term: string) {
  const recent = getRecentSearches().filter((r) => r !== term);
  recent.unshift(term);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
  } catch {
    /* ignore */
  }
}

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const [type, setType] = useState("all");
  const [results, setResults] = useState<SearchResults>(emptyResults);
  const [isSearching, setIsSearching] = useState(false);
  const [inputValue, setInputValue] = useState(q);
  const [showRecent, setShowRecent] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const term = q.toLowerCase().trim();

  // Sync input with URL q param
  useEffect(() => {
    setInputValue(q);
  }, [q]);

  // Load recent searches on focus
  const handleFocus = () => {
    setRecentSearches(getRecentSearches());
    if (!inputValue.trim()) setShowRecent(true);
  };

  const handleBlur = () => {
    // Delay to allow click on recent search
    setTimeout(() => setShowRecent(false), 200);
  };

  // Track analytics
  useEffect(() => {
    if (term.length < 2) return;
    const id = window.setTimeout(() => {
      void trackAnalyticsEvent({
        data: { eventType: "search", path: "/search", label: term },
      }).catch(() => {});
    }, 500);
    return () => window.clearTimeout(id);
  }, [term]);

  // Search with debounce
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    saveRecentSearch(trimmed);
    setShowRecent(false);
    navigate({ to: "/search", search: { q: trimmed } });
  };

  const selectRecent = (term: string) => {
    saveRecentSearch(term);
    setShowRecent(false);
    setInputValue(term);
    navigate({ to: "/search", search: { q: term } });
  };

  const total =
    results.articles.length +
    results.events.length +
    results.listings.length +
    results.offers.length;
  const showArticles = type === "all" || type === "stories";
  const showEvents = type === "all" || type === "events";
  const showListings = type === "all" || type === "places";
  const showOffers = type === "all" || type === "offers";

  // Autocomplete: top 3 per category for the dropdown
  const autocompleteItems = [
    ...results.listings.slice(0, 3).map((l) => ({
      kind: "place" as const,
      title: l.name,
      sub: `${l.category} · ${l.area}`,
      href: `/places/${l.slug}`,
    })),
    ...results.events.slice(0, 3).map((e) => ({
      kind: "event" as const,
      title: e.title,
      sub: `${e.locationName} · ${e.startDate}`,
      href: `/events/${e.slug}`,
    })),
    ...results.articles.slice(0, 3).map((a) => ({
      kind: "story" as const,
      title: a.title,
      sub: a.category,
      href: articlePath(a),
    })),
    ...results.offers.slice(0, 2).map((o) => ({
      kind: "offer" as const,
      title: o.title,
      sub: o.businessName,
      href: "/offers",
    })),
  ].slice(0, 8);

  const showAutocomplete =
    inputValue.trim().length >= 2 && !isSearching && autocompleteItems.length > 0;

  return (
    <PublicLayout>
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-16 border-b-2 border-foreground">
        <div className="text-[10px] font-mono uppercase mb-4 text-accent">Search</div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row gap-3 max-w-3xl relative"
        >
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              name="q"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setShowRecent(false);
              }}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="Search events, places, stories…"
              autoFocus
              className="w-full bg-white border-2 border-foreground px-6 py-4 font-mono text-sm focus:outline-none"
            />

            {/* Recent searches dropdown */}
            {showRecent && recentSearches.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 bg-background border-2 border-foreground border-t-0 shadow-lg">
                <div className="px-4 py-2 text-[10px] font-mono uppercase text-muted-foreground border-b border-foreground/10">
                  Recent searches
                </div>
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectRecent(term);
                    }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-accent/10 flex items-center gap-3"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-muted-foreground shrink-0"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {term}
                  </button>
                ))}
              </div>
            )}

            {/* Autocomplete dropdown */}
            {showAutocomplete && (
              <div className="absolute top-full left-0 right-0 z-50 bg-background border-2 border-foreground border-t-0 shadow-lg max-h-[50vh] overflow-y-auto">
                {autocompleteItems.map((item) => (
                  <a
                    key={`${item.kind}-${item.href}`}
                    href={item.href}
                    className="w-full text-left px-4 py-3 hover:bg-accent/10 flex items-center justify-between gap-3 border-b border-foreground/5"
                  >
                    <div className="min-w-0">
                      <div className="font-bold truncate text-sm">{item.title}</div>
                      <div className="text-[10px] font-mono uppercase text-muted-foreground">
                        {item.kind} · {item.sub}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono uppercase text-accent shrink-0">→</span>
                  </a>
                ))}
                {total > autocompleteItems.length && (
                  <button
                    type="submit"
                    className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-accent hover:bg-accent/5 border-t border-foreground/10"
                  >
                    See all {total} results →
                  </button>
                )}
              </div>
            )}
          </div>
          <button
            type="submit"
            className="bg-accent text-foreground px-6 py-4 font-bold uppercase tracking-widest text-xs hover:bg-foreground hover:text-background transition-colors shrink-0"
          >
            Search
          </button>
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

      {!term && !showRecent && (
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
                          {e.locationName} ·{" "}
                          {new Date(`${e.startDate}T12:00:00`).toLocaleDateString("en-GB", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
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
