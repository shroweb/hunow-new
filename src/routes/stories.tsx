import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AdSlot } from "@/components/AdSlot";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ArticleCard } from "@/components/cards";
import { PaginationControls } from "@/components/PaginationControls";
import { fetchPagedArticles } from "@/lib/content-read.functions";
import type { Article } from "@/types";

const PER_PAGE = 12;

export const Route = createFileRoute("/stories")({
  head: () => ({
    meta: [
      { title: "Stories — HU NOW" },
      {
        name: "description",
        content: "Editorial stories, interviews, guides and reviews from across Hull.",
      },
    ],
  }),
  component: Stories,
});

const CATS = [
  "All",
  "Culture",
  "Eat & Drink",
  "Interviews",
  "Independent Business",
  "Hidden Gems",
  "Guides",
];

function Stories() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== "/stories") return <Outlet />;

  return <StoriesIndex />;
}

function StoriesIndex() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [cat, setCat] = useState("All");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [cat]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchPagedArticles({
      data: {
        category: cat === "All" ? undefined : cat,
        page,
        limit: 12,
        status: "published",
      },
    })
      .then((res) => {
        if (!active) return;
        setArticles(res.items);
        setTotalCount(res.totalCount);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [cat, page]);

  const totalPages = Math.ceil(totalCount / PER_PAGE);

  return (
    <PublicLayout>
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-20 border-b border-border">
        <div className="text-[10px] font-mono uppercase mb-4 text-accent">Long Reads</div>
        <h1 className="text-6xl md:text-8xl font-display uppercase leading-none mb-6">Stories</h1>
        <p className="text-xl max-w-2xl">Interviews, guides and dispatches from across the city.</p>
      </section>
      <section className="max-w-7xl mx-auto px-4 py-6 border-b border-border">
        <div className="flex flex-wrap gap-2">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase ${cat === c ? "bg-accent text-background" : "border border-foreground/20"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-10">
          <AdSlot placement="Homepage Inline Banner" />
        </div>
        {loading ? (
          <div className="py-20 text-center font-mono text-sm uppercase text-muted-foreground animate-pulse">
            Loading stories…
          </div>
        ) : articles.length === 0 ? (
          <div className="py-20 text-center font-mono text-sm uppercase text-muted-foreground">
            No stories match your filter.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {articles.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
            <PaginationControls
              page={page}
              totalPages={totalPages}
              total={totalCount}
              perPage={PER_PAGE}
              onPrev={() => setPage((p) => p - 1)}
              onNext={() => setPage((p) => p + 1)}
            />
          </>
        )}
      </section>
    </PublicLayout>
  );
}
