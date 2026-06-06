import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ArticleCard, EventCard } from "@/components/cards";
import { useStore } from "@/lib/store";
import { findSection, findSub, type NavSection, type NavSub } from "@/lib/nav";
import { AdSlot } from "@/components/AdSlot";

export const Route = createFileRoute("/c/$section/$sub")({
  loader: ({ params }) => {
    const section = findSection(params.section);
    const sub = findSub(params.section, params.sub);
    if (!section || !sub) throw notFound();
    return { section, sub };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.sub.label} — ${loaderData.section.label} — HU NOW` },
          {
            name: "description",
            content: `${loaderData.sub.label} posts in ${loaderData.section.label} from HU NOW.`,
          },
        ]
      : [],
  }),
  component: SubPage,
  notFoundComponent: () => (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 py-32 text-center">
        <h1 className="text-5xl font-display uppercase mb-4">Category not found</h1>
        <Link to="/" className="underline">
          Back home
        </Link>
      </div>
    </PublicLayout>
  ),
  errorComponent: ({ error }) => (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 py-32 text-center">
        <h1 className="text-3xl font-display uppercase mb-2">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    </PublicLayout>
  ),
});

function SubPage() {
  const { section, sub } = Route.useLoaderData();
  const articles = useStore((s) => s.articles).filter(
    (a) =>
      a.status === "published" &&
      ((a.section === section.slug && a.subcategory === sub.slug) ||
        a.tags.some((t) => t.toLowerCase() === sub.slug)),
  );
  const events = useStore((s) => s.events).filter(
    (e) => e.status === "published" && e.category.toLowerCase() === sub.slug,
  );

  const hasContent = articles.length > 0 || events.length > 0;

  return (
    <PublicLayout>
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-16 border-b border-border">
        <div className="text-[10px] font-mono uppercase mb-3 text-accent">
          <Link to="/c/$section" params={{ section: section.slug }} className="hover:underline">
            {section.label}
          </Link>
          <span className="text-foreground/30"> / </span>
          <span>{sub.label}</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-display uppercase leading-none mb-4">
          {sub.label}
        </h1>
        <p className="text-lg text-muted-foreground">{section.blurb}</p>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-6 border-b border-border">
        <div className="flex flex-wrap gap-2">
          <Link
            to="/c/$section"
            params={{ section: section.slug }}
            className="px-3 py-1.5 text-[10px] font-bold uppercase border border-foreground/20 hover:bg-foreground/5"
          >
            All {section.label}
          </Link>
          {section.subs.map((s: NavSub) => (
            <Link
              key={s.slug}
              to="/c/$section/$sub"
              params={{ section: section.slug, sub: s.slug }}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase ${s.slug === sub.slug ? "bg-accent text-background" : "border border-foreground/20 hover:bg-foreground/5"}`}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <AdSlot placement={`${sub.label} Category`} />
      </div>

      <section className="max-w-7xl mx-auto px-4 py-12">
        {!hasContent ? (
          <EmptySection section={section} sub={sub} />
        ) : (
          <div className="space-y-16">
            {events.length > 0 && (
              <div>
                <h2 className="font-display text-3xl uppercase mb-6">Upcoming</h2>
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
          </div>
        )}
      </section>
    </PublicLayout>
  );
}

function EmptySection({ section, sub }: { section: NavSection; sub: NavSub }) {
  const allArticles = useStore((s) => s.articles).filter(
    (a) => a.status === "published" && a.section === section.slug,
  );
  const allEvents = useStore((s) => s.events).filter(
    (e) => e.status === "published" && e.category.toLowerCase().includes(section.slug),
  );
  const fallbackArticles = allArticles.slice(0, 3);
  const fallbackEvents = allEvents.slice(0, 3);
  const hasFallback = fallbackArticles.length > 0 || fallbackEvents.length > 0;

  return (
    <div className="space-y-12">
      <div className="border-2 border-dashed border-foreground/20 p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <p className="font-display text-2xl uppercase mb-1">Nothing here for {sub.label} yet</p>
          <p className="text-sm text-muted-foreground">Got a tip or story? Let us know.</p>
        </div>
        <Link
          to="/contact"
          className="shrink-0 px-6 py-3 bg-foreground text-background text-xs font-bold uppercase tracking-widest hover:bg-accent transition-colors"
        >
          Submit a post →
        </Link>
      </div>
      {hasFallback && (
        <div className="space-y-8">
          <p className="text-[10px] font-mono uppercase text-muted-foreground">
            Meanwhile, from {section.label}:
          </p>
          {fallbackEvents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {fallbackEvents.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          )}
          {fallbackArticles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16">
              {fallbackArticles.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
