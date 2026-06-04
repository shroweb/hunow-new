import { articlePath } from "@/lib/taxonomy";
import type { Article } from "@/types";

function seriesSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function SeriesNav({
  current,
  seriesArticles,
}: {
  current: Article;
  seriesArticles: Article[];
}) {
  const sorted = [...seriesArticles].sort(
    (a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0),
  );
  const currentIdx = sorted.findIndex((a) => a.id === current.id);
  const prev = currentIdx > 0 ? sorted[currentIdx - 1] : null;
  const next = currentIdx < sorted.length - 1 ? sorted[currentIdx + 1] : null;

  return (
    <aside className="border-2 border-foreground bg-white my-10 overflow-hidden">
      <a
        href={`/series/${seriesSlug(current.series!)}`}
        className="flex items-center gap-3 bg-foreground text-background px-5 py-3 hover:bg-accent transition-colors group"
      >
        <span className="text-[9px] font-mono uppercase tracking-widest text-background/60 group-hover:text-background/80">
          Series
        </span>
        <span className="font-bold text-sm flex-1">{current.series}</span>
        <span className="text-[10px] font-mono uppercase text-background/60">
          {currentIdx + 1} / {sorted.length}
        </span>
      </a>
      <div className="divide-y divide-foreground/10">
        {sorted.map((a, i) => (
          <a
            key={a.id}
            href={articlePath(a)}
            className={`flex items-center gap-4 px-5 py-3 hover:bg-foreground/5 transition-colors ${a.id === current.id ? "bg-accent/5" : ""}`}
          >
            <span className="text-[10px] font-mono text-muted-foreground w-5 shrink-0">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className={`text-sm flex-1 leading-snug ${a.id === current.id ? "font-bold" : ""}`}>
              {a.title}
            </span>
            {a.id === current.id && (
              <span className="text-[9px] font-bold uppercase text-accent shrink-0">Reading</span>
            )}
          </a>
        ))}
      </div>
      {(prev || next) && (
        <div className="flex border-t-2 border-foreground divide-x-2 divide-foreground">
          {prev ? (
            <a
              href={articlePath(prev)}
              className="flex-1 px-5 py-3 text-[10px] font-bold uppercase hover:bg-foreground hover:text-background transition-colors"
            >
              ← {prev.title}
            </a>
          ) : <div className="flex-1" />}
          {next && (
            <a
              href={articlePath(next)}
              className="flex-1 px-5 py-3 text-[10px] font-bold uppercase text-right hover:bg-foreground hover:text-background transition-colors"
            >
              {next.title} →
            </a>
          )}
        </div>
      )}
    </aside>
  );
}
