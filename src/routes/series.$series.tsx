import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ArticleCard } from "@/components/cards";
import { useStore } from "@/lib/store";
import { getState } from "@/lib/store";
import { articlePath } from "@/lib/taxonomy";

function seriesSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
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
        <Link to="/" className="underline">Back to home</Link>
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

  return (
    <PublicLayout>
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-20 border-b-2 border-foreground">
        <div className="text-[10px] font-mono uppercase mb-4 text-accent">Series</div>
        <h1 className="text-6xl md:text-8xl font-display uppercase leading-none mb-4">{series}</h1>
        <p className="text-xl text-muted-foreground">
          {articles.length} {articles.length === 1 ? "article" : "articles"} in this series
        </p>
      </section>
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="space-y-0 border-2 border-foreground">
          {articles.map((a, i) => (
            <a
              key={a.id}
              href={articlePath(a)}
              className="group flex items-center gap-6 p-5 border-b border-foreground/10 last:border-b-0 hover:bg-foreground hover:text-background transition-colors"
            >
              <span className="font-display text-4xl text-muted-foreground group-hover:text-background/40 shrink-0 w-10 text-right">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-lg leading-tight">{a.title}</p>
                <p className="text-sm text-muted-foreground group-hover:text-background/60 mt-0.5 line-clamp-1">
                  {a.excerpt}
                </p>
              </div>
              <span className="text-[10px] font-mono uppercase shrink-0">{a.readingMinutes} min →</span>
            </a>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
