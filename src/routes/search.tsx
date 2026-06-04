import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useStore } from "@/lib/store";
import { articlePath } from "@/lib/taxonomy";

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>) => ({
    q: typeof s.q === "string" ? s.q : "",
  }),
  head: () => ({
    meta: [
      { title: "Search — HU NOW" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const articles = useStore((s) => s.articles);
  const events = useStore((s) => s.events);
  const listings = useStore((s) => s.listings);

  const term = q.toLowerCase().trim();

  const results = useMemo(() => {
    if (!term) return { articles: [], events: [], listings: [] };
    const matchA = articles.filter(
      (a) =>
        a.status === "published" &&
        (`${a.title} ${a.excerpt} ${a.tags.join(" ")} ${a.category}`
          .toLowerCase()
          .includes(term)),
    );
    const matchE = events.filter(
      (e) =>
        e.status === "published" &&
        `${e.title} ${e.description} ${e.locationName}`.toLowerCase().includes(term),
    );
    const matchL = listings.filter((l) =>
      `${l.name} ${l.description} ${l.category} ${l.area}`.toLowerCase().includes(term),
    );
    return { articles: matchA, events: matchE, listings: matchL };
  }, [term, articles, events, listings]);

  const total = results.articles.length + results.events.length + results.listings.length;

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
            {total} result{total !== 1 ? "s" : ""} for &ldquo;{q}&rdquo;
          </p>
        )}
      </section>

      {!term && (
        <div className="max-w-7xl mx-auto px-4 py-24 text-center text-muted-foreground">
          Start typing to search across all content
        </div>
      )}

      {term && total === 0 && (
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <p className="font-display text-4xl uppercase mb-4">No results</p>
          <p className="text-muted-foreground">Try a different search term.</p>
        </div>
      )}

      {term && total > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
          {results.articles.length > 0 && (
            <section>
              <h2 className="font-display text-3xl uppercase border-b-2 border-foreground pb-2 mb-6">
                Stories <span className="text-muted-foreground text-xl">({results.articles.length})</span>
              </h2>
              <ul className="divide-y divide-foreground/10">
                {results.articles.map((a) => (
                  <li key={a.id} className="py-4">
                    <a href={articlePath(a)} className="group flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold group-hover:underline">{a.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{a.excerpt}</p>
                      </div>
                      <span className="text-[10px] font-mono uppercase text-accent shrink-0 mt-1">{a.category}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {results.events.length > 0 && (
            <section>
              <h2 className="font-display text-3xl uppercase border-b-2 border-foreground pb-2 mb-6">
                Events <span className="text-muted-foreground text-xl">({results.events.length})</span>
              </h2>
              <ul className="divide-y divide-foreground/10">
                {results.events.map((e) => (
                  <li key={e.id} className="py-4">
                    <Link to="/events/$slug" params={{ slug: e.slug }} className="group flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold group-hover:underline">{e.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">{e.locationName} · {e.startDate}</p>
                      </div>
                      <span className="text-[10px] font-mono uppercase text-accent shrink-0 mt-1">{e.category}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {results.listings.length > 0 && (
            <section>
              <h2 className="font-display text-3xl uppercase border-b-2 border-foreground pb-2 mb-6">
                Places <span className="text-muted-foreground text-xl">({results.listings.length})</span>
              </h2>
              <ul className="divide-y divide-foreground/10">
                {results.listings.map((l) => (
                  <li key={l.id} className="py-4">
                    <Link to="/places/$slug" params={{ slug: l.slug }} className="group flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold group-hover:underline">{l.name}</p>
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{l.description}</p>
                      </div>
                      <span className="text-[10px] font-mono uppercase text-accent shrink-0 mt-1">{l.category} · {l.area}</span>
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
