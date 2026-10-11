import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { AdSlot } from "@/components/AdSlot";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ArticleCard } from "@/components/cards";
import { PaginationControls } from "@/components/PaginationControls";
import { CardGridSkeleton } from "@/components/CardSkeleton";
import { fetchPagedArticles } from "@/lib/content-read.functions";
import { buildSeoMeta } from "@/lib/seo-meta";
import type { Article } from "@/types";

const PER_PAGE = 12;

export const Route = createFileRoute("/stories")({
  // First page of stories is rendered on the server, so visitors and search engines see it immediately
  loader: async ({ location }) => {
    if (location.pathname.replace(/\/$/, "") !== "/stories") return { initial: null };
    try {
      const res = await fetchPagedArticles({
        data: { page: 1, limit: PER_PAGE, status: "published" },
      });
      return { initial: { items: res.items as Article[], totalCount: res.totalCount } };
    } catch {
      return { initial: null };
    }
  },
  head: ({ params }) => {
    if ((params as { slug?: string })?.slug) return {};
    return buildSeoMeta({
      title: "Stories & Culture in Hull — HU NOW Magazine",
      description:
        "Editorial stories, food reviews, artist interviews, and independent business features from across Kingston upon Hull and East Yorkshire.",
      path: "/stories",
    });
  },
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
  const { initial } = Route.useLoaderData();
  const skipFirstFetch = useRef(!!initial);
  const [articles, setArticles] = useState<Article[]>(initial ? initial.items : []);
  const [totalCount, setTotalCount] = useState(initial ? initial.totalCount : 0);
  const [loading, setLoading] = useState(!initial);
  const [loadFailed, setLoadFailed] = useState(false);

  const [cat, setCat] = useState("All");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [cat]);

  useEffect(() => {
    if (skipFirstFetch.current) {
      skipFirstFetch.current = false;
      return;
    }
    let active = true;
    setLoading(true);
    setLoadFailed(false);
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
        if (active) {
          setLoadFailed(true);
          setLoading(false);
        }
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
              className={`px-3.5 py-2.5 sm:py-2 text-[11px] font-bold uppercase tracking-wide ${cat === c ? "bg-accent text-background" : "border border-foreground/20"}`}
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
          <CardGridSkeleton label="Loading stories" />
        ) : loadFailed ? (
          <div className="py-20 text-center font-mono text-sm uppercase text-muted-foreground">
            Stories could not be loaded. Please refresh and try again.
          </div>
        ) : articles.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-display text-4xl uppercase mb-3">No stories in this category yet</p>
            <button
              type="button"
              onClick={() => setCat("All")}
              className="mt-3 bg-foreground px-6 py-3 text-xs font-bold uppercase tracking-widest text-background hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Show all stories
            </button>
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

      {/* Evergreen Editorial Mission & City Dispatch Overview */}
      <section className="border-t border-border bg-card/40 py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-10">
          <div>
            <div className="text-[10px] font-mono uppercase text-accent mb-2">
              Independent Journalism
            </div>
            <h2 className="text-3xl md:text-5xl font-display uppercase tracking-tight mb-4">
              Long-Form Journalism, Hidden Corners & Honest Hull Culture
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              HU NOW is built on independent, boots-on-the-ground storytelling. From the historic
              cobbles of the Old Town and the maritime heritage of the docks to the bustling indie
              eateries along Newland Avenue and Princes Avenue, our writers dig beneath the press
              releases to profile the makers, chefs, artists, and grassroots communities shaping
              contemporary Hull and East Yorkshire.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-y border-border py-8">
            <div>
              <h3 className="text-base font-bold uppercase mb-2">Food & Drink Dispatches</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                In-depth chef interviews, bakery spotlights, and no-nonsense reviews exploring the
                city's street food markets, independent roasteries, and dockside seafood spots.
              </p>
            </div>
            <div>
              <h3 className="text-base font-bold uppercase mb-2">Creative & Cultural Voices</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Studio visits with regional painters, printmakers, musicians, and theatre producers
                documenting Hull's fiercely independent creative energy.
              </p>
            </div>
            <div>
              <h3 className="text-base font-bold uppercase mb-2">Neighbourhood Guides</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Curated walking guides, architectural secrets, and historical essays uncovering the
                hidden stories behind Hull’s landmark buildings and public spaces.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
