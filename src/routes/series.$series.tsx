import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ArticleCard } from "@/components/cards";
import { useStore } from "@/lib/store";
import { getState } from "@/lib/store";
import { articlePath } from "@/lib/taxonomy";

function seriesSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function seriesPath(name: string) {
  return `/series/${seriesSlug(name)}`;
}

export const Route = createFileRoute("/series/$series")({
  loader: ({ params }) => {
    const all = getState().articles.filter((a) => a.status === "published" && a.series);
    const series = Array.from(new Set(all.map((a) => a.series!))).find(
      (s) => seriesSlug(s) === params.series,
    );
    if (!series) throw notFound();
    return { series };
  },
  head: ({ loaderData }) => {
    const s = loaderData?.series ?? "";
    return {
      meta: [
        { title: `${s} — Series — HU NOW` },
        { name: "description", content: `All articles in the "${s}" series on HU NOW.` },
      ],
    };
  },
  notFoundComponent: () => (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 py-32 text-center">
        <h1 className="font-display text-6xl mb-4">SERIES NOT FOUND</h1>
        <Link to="/" className="underline">
          Back to home
        </Link>
      </div>
    </PublicLayout>
  ),
  component: SeriesPage,
});

function SeriesPage() {
  const { series } = Route.useLoaderData();
  const articles = useStore((s) => s.articles)
    .filter((a) => a.status === "published" && a.series === series)
    .sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0));

  const totalMinutes = articles.reduce((sum, a) => sum + (a.readingMinutes ?? 0), 0);
  const first = articles[0];

  return (
    <PublicLayout>
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-20 border-b-2 border-foreground">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] font-mono uppercase text-accent">Series</span>
          <a
            href="/series"
            className="text-[10px] font-mono uppercase text-muted-foreground hover:text-accent transition-colors"
          >
            ← All series
          </a>
        </div>
        <h1 className="text-6xl md:text-8xl font-display uppercase leading-none mb-6">{series}</h1>
        <div className="flex flex-wrap items-center gap-6">
          <p className="text-lg text-muted-foreground">
            {articles.length} {articles.length === 1 ? "part" : "parts"} · {totalMinutes} min total
          </p>
          {first && (
            <a
              href={articlePath(first)}
              className="bg-foreground text-background px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-accent transition-colors"
            >
              Start from Part 1 →
            </a>
          )}
        </div>
      </section>
      <section className="max-w-3xl mx-auto px-4 py-12">
        <div className="border-2 border-foreground">
          {articles.map((a, i) => (
            <a
              key={a.id}
              href={articlePath(a)}
              className="group flex items-start gap-6 p-5 border-b border-foreground/10 last:border-b-0 hover:bg-foreground hover:text-background transition-colors"
            >
              <span className="font-display text-4xl text-muted-foreground group-hover:text-background/30 shrink-0 w-10 text-right pt-1">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-lg leading-tight mb-1">{a.title}</p>
                <p className="text-sm text-muted-foreground group-hover:text-background/60 line-clamp-2">
                  {a.excerpt}
                </p>
              </div>
              <span className="text-[10px] font-mono uppercase shrink-0 pt-1 text-right">
                {a.readingMinutes} min
                <br />→
              </span>
            </a>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
