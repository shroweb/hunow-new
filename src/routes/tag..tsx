import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ArticleCard, EventCard } from "@/components/cards";
import { buildSeoMeta } from "@/lib/seo-meta";
import { z } from "zod";

export const Route = createFileRoute("/tag/")({
  validateSearch: z.object({ also: z.string().optional() }),
  loader: async ({ params }) => {
    const tag = decodeURIComponent(params.tag).toLowerCase();
    const { getStoreFromDatabase } = await import("@/lib/store.functions");
    const store = await getStoreFromDatabase().catch(() => null);
    const articles = (store?.articles ?? []).filter(
      (a) => a.status === "published" && a.tags?.some((t) => t.toLowerCase() === tag),
    );
    const events = (store?.events ?? []).filter(
      (e) =>
        e.status === "published" &&
        (e.category?.toLowerCase() === tag || e.tags?.some((t: string) => t.toLowerCase() === tag)),
    );
    return { tag, articles, events };
  },
  head: ({ loaderData }) => {
    const tag = loaderData?.tag ?? "";
    return buildSeoMeta({
      title: `#${tag} in Hull & East Yorkshire`,
      description: `Explore all HU NOW articles, culture guides, and upcoming events tagged with #${tag} across Kingston upon Hull.`,
      path: `/tag/${encodeURIComponent(tag)}`,
    });
  },
  component: TagPage,
});

function TagPage() {
  const { tag, articles, events } = Route.useLoaderData();
  const hasContent = articles.length > 0 || events.length > 0;

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="border-b-2 border-foreground pb-6 mb-8">
          <div className="text-[10px] font-mono uppercase tracking-widest text-accent mb-2">Topic Tag</div>
          <h1 className="text-4xl sm:text-6xl font-display uppercase">#{tag}</h1>
          <p className="text-sm text-muted-foreground mt-2 font-mono">
            {articles.length} {articles.length === 1 ? "article" : "articles"} · {events.length} {events.length === 1 ? "event" : "events"}
          </p>
        </div>

        {!hasContent ? (
          <div className="py-16 text-center max-w-lg mx-auto">
            <p className="text-muted-foreground mb-6">
              No published stories or events found for #{tag} right now.
            </p>
            <div className="flex justify-center gap-3">
              <Link
                to="/stories"
                className="px-6 py-2.5 bg-foreground text-background text-xs font-bold uppercase tracking-widest hover:bg-accent"
              >
                Browse Stories
              </Link>
              <Link
                to="/whats-on"
                className="px-6 py-2.5 border border-border text-xs font-bold uppercase tracking-widest hover:border-foreground"
              >
                What's On
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {articles.length > 0 && (
              <div>
                <h2 className="text-2xl font-display uppercase mb-6">Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articles.map((a) => (
                    <ArticleCard key={a.id} article={a} />
                  ))}
                </div>
              </div>
            )}

            {events.length > 0 && (
              <div>
                <h2 className="text-2xl font-display uppercase mb-6">Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((e) => (
                    <EventCard key={e.id} event={e} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
