import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useStore } from "@/lib/store";
import { articlePath } from "@/lib/taxonomy";

function seriesSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const Route = createFileRoute("/series")({
  head: () => ({
    meta: [
      { title: "Series — HU NOW" },
      { name: "description", content: "Multi-part editorial series from HU NOW." },
    ],
  }),
  component: SeriesIndex,
});

function SeriesIndex() {
  const articles = useStore((s) => s.articles).filter((a) => a.status === "published" && a.series);

  const seriesMap = new Map<string, typeof articles>();
  for (const a of articles) {
    const name = a.series!;
    if (!seriesMap.has(name)) seriesMap.set(name, []);
    seriesMap.get(name)!.push(a);
  }
  const allSeries = Array.from(seriesMap.entries())
    .map(([name, arts]) => ({
      name,
      slug: seriesSlug(name),
      articles: arts.sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0)),
    }))
    .sort((a, b) => b.articles.length - a.articles.length);

  return (
    <PublicLayout>
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-20 border-b-2 border-foreground">
        <div className="text-[10px] font-mono uppercase mb-4 text-accent">Deep reads</div>
        <h1 className="text-6xl md:text-8xl font-display uppercase leading-none mb-4">Series</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Multi-part editorial collections — start from the beginning or dip in anywhere.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        {allSeries.length === 0 ? (
          <p className="text-muted-foreground">No series published yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-px border border-foreground/10 bg-foreground/10">
            {allSeries.map(({ name, slug, articles: arts }) => {
              const first = arts[0];
              return (
                <div key={slug} className="bg-background p-8 flex flex-col gap-4">
                  <div className="text-[10px] font-mono uppercase text-accent">
                    {arts.length} {arts.length === 1 ? "part" : "parts"}
                  </div>
                  <h2 className="font-display text-3xl uppercase leading-none">
                    <Link
                      to="/series/$series"
                      params={{ series: slug }}
                      className="hover:text-accent transition-colors"
                    >
                      {name}
                    </Link>
                  </h2>
                  <div className="space-y-1 flex-1">
                    {arts.slice(0, 3).map((a, i) => (
                      <a
                        key={a.id}
                        href={articlePath(a)}
                        className="flex items-baseline gap-3 text-sm hover:text-accent transition-colors"
                      >
                        <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="line-clamp-1">{a.title}</span>
                      </a>
                    ))}
                    {arts.length > 3 && (
                      <p className="text-[10px] font-mono text-muted-foreground pl-7">
                        +{arts.length - 3} more
                      </p>
                    )}
                  </div>
                  {first && (
                    <a
                      href={articlePath(first)}
                      className="self-start mt-2 bg-foreground text-background px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-colors"
                    >
                      Start from Part 1 →
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
