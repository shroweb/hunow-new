import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useStore } from "@/lib/store";
import { getState } from "@/lib/store";
import { articlePath } from "@/lib/taxonomy";
import { useHistory } from "@/lib/reading-history";
import { img } from "@/data/seed";

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
  const history = useHistory();

  const readIds = new Set(history.filter((h) => h.kind === "article").map((h) => h.id));
  const readCount = articles.filter((a) => readIds.has(a.id)).length;
  const lastRead = articles.filter((a) => readIds.has(a.id)).at(-1);
  const nextUp = articles.find((a) => !readIds.has(a.id));

  const totalMinutes = articles.reduce((sum, a) => sum + (a.readingMinutes ?? 0), 0);
  const first = articles[0];
  const coverImage = first?.featuredImage;

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative border-b-2 border-foreground overflow-hidden">
        {coverImage && (
          <>
            <img
              src={img(coverImage, 1600, 500)}
              alt={series}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-foreground/70" />
          </>
        )}
        <div
          className={`relative max-w-7xl mx-auto px-4 py-16 md:py-24 ${coverImage ? "text-background" : ""}`}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] font-mono uppercase text-accent">Series</span>
            <a
              href="/series"
              className={`text-[10px] font-mono uppercase hover:text-accent transition-colors ${coverImage ? "text-background/60" : "text-muted-foreground"}`}
            >
              ← All series
            </a>
          </div>
          <h1 className="text-6xl md:text-8xl font-display uppercase leading-none mb-6">
            {series}
          </h1>

          {/* Progress */}
          {readCount > 0 && (
            <div className="mb-6">
              <div
                className={`text-sm font-mono mb-2 ${coverImage ? "text-background/70" : "text-muted-foreground"}`}
              >
                {readCount} of {articles.length} part{articles.length !== 1 ? "s" : ""} read
              </div>
              <div className="w-48 h-1.5 bg-foreground/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all"
                  style={{ width: `${(readCount / articles.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <p className={`text-lg ${coverImage ? "text-background/80" : "text-muted-foreground"}`}>
              {articles.length} {articles.length === 1 ? "part" : "parts"} · {totalMinutes} min
              total
            </p>
            {/* Smart CTA: continue if in progress, start from 1 otherwise */}
            {lastRead && nextUp ? (
              <a
                href={articlePath(nextUp)}
                className="bg-accent text-foreground px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors"
              >
                Continue — Part {nextUp.seriesOrder ?? ""} →
              </a>
            ) : first && readCount === 0 ? (
              <a
                href={articlePath(first)}
                className="bg-accent text-foreground px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors"
              >
                Start from Part 1 →
              </a>
            ) : readCount === articles.length ? (
              <span
                className={`text-[10px] font-mono uppercase px-3 py-1.5 border ${coverImage ? "border-background/40 text-background/70" : "border-foreground/30 text-muted-foreground"}`}
              >
                ✓ Completed
              </span>
            ) : null}
          </div>
        </div>
      </section>

      {/* Article list */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <div className="border-2 border-foreground">
          {articles.map((a, i) => {
            const isRead = readIds.has(a.id);
            return (
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
                <div className="text-[10px] font-mono uppercase shrink-0 pt-1 text-right space-y-1">
                  <div>{a.readingMinutes} min</div>
                  {isRead ? (
                    <div className="text-accent group-hover:text-accent">✓ read</div>
                  ) : (
                    <div className="text-muted-foreground group-hover:text-background/40">→</div>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      </section>
    </PublicLayout>
  );
}
