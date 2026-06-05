import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ArticleCard, EventCard } from "@/components/cards";
import { useStore } from "@/lib/store";
import { getState } from "@/lib/store";
import { z } from "zod";

export const Route = createFileRoute("/tag/$tag")({
  validateSearch: z.object({ also: z.string().optional() }),
  loader: ({ params }) => {
    const tag = decodeURIComponent(params.tag).toLowerCase();
    const articles = getState().articles.filter(
      (a) => a.status === "published" && a.tags.some((t) => t.toLowerCase() === tag),
    );
    const events = getState().events.filter(
      (e) => e.status === "published" && e.category.toLowerCase() === tag,
    );
    if (articles.length === 0 && events.length === 0) throw notFound();
    return { tag };
  },
  head: ({ loaderData }) => {
    const tag = loaderData?.tag ?? "";
    return {
      meta: [
        { title: `#${tag} — HU NOW` },
        { name: "description", content: `HU NOW content tagged with ${tag}.` },
      ],
    };
  },
  notFoundComponent: () => (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 py-32 text-center">
        <h1 className="font-display text-6xl mb-4">TAG NOT FOUND</h1>
        <Link to="/" className="underline">
          Back to home
        </Link>
      </div>
    </PublicLayout>
  ),
  component: TagPage,
});

function TagPage() {
  const { tag } = Route.useLoaderData();
  const { also } = Route.useSearch();
  const navigate = useNavigate({ from: "/tag/$tag" });

  const allArticles = useStore((s) => s.articles);
  const allEvents = useStore((s) => s.events);

  const matchTag = (tags: string[]) => tags.some((t) => t.toLowerCase() === tag);
  const matchAlso = (tags: string[]) =>
    !also || tags.some((t) => t.toLowerCase() === also.toLowerCase());

  const articles = allArticles.filter(
    (a) => a.status === "published" && matchTag(a.tags) && matchAlso(a.tags),
  );
  const events = allEvents.filter(
    (e) =>
      e.status === "published" &&
      (e.category.toLowerCase() === tag || matchTag([])) &&
      matchAlso([e.category.toLowerCase()]),
  );

  // Collect related tags from matching articles for refinement
  const relatedTagCounts: Record<string, number> = {};
  for (const a of allArticles.filter((a) => a.status === "published" && matchTag(a.tags))) {
    for (const t of a.tags) {
      const tl = t.toLowerCase();
      if (tl !== tag && tl !== also?.toLowerCase()) {
        relatedTagCounts[t] = (relatedTagCounts[t] ?? 0) + 1;
      }
    }
  }
  const relatedTags = Object.entries(relatedTagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([t]) => t);

  const total = articles.length + events.length;

  return (
    <PublicLayout>
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-20 border-b-2 border-foreground">
        <div className="text-[10px] font-mono uppercase mb-4 text-accent">Tag</div>
        <h1 className="text-6xl md:text-8xl font-display uppercase leading-none">
          #{tag}
          {also && <span className="text-accent"> + #{also}</span>}
        </h1>
        {also && (
          <button
            onClick={() => navigate({ search: {} })}
            className="mt-4 text-xs font-bold uppercase underline text-muted-foreground hover:text-foreground"
          >
            ✕ Remove filter
          </button>
        )}
      </section>

      {relatedTags.length > 0 && !also && (
        <section className="max-w-7xl mx-auto px-4 py-4 border-b border-border">
          <span className="text-[10px] font-mono uppercase text-muted-foreground mr-3">
            Refine by:
          </span>
          {relatedTags.map((t) => (
            <button
              key={t}
              onClick={() => navigate({ search: { also: t.toLowerCase() } })}
              className="mr-2 mb-1 px-3 py-1 text-[10px] font-bold uppercase border border-foreground/20 hover:bg-foreground hover:text-background transition-colors"
            >
              #{t}
            </button>
          ))}
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 py-12 space-y-16">
        <p className="text-[10px] font-mono uppercase text-muted-foreground">
          {total} {total === 1 ? "result" : "results"}
        </p>
        {events.length > 0 && (
          <div>
            <h2 className="font-display text-3xl uppercase mb-6">Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
              {events.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          </div>
        )}
        {articles.length > 0 && (
          <div>
            <h2 className="font-display text-3xl uppercase mb-6">Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {articles.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </div>
        )}
        {total === 0 && <p className="text-muted-foreground">Nothing matches both tags.</p>}
      </section>
    </PublicLayout>
  );
}
