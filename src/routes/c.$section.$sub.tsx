import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ArticleCard, EventCard } from "@/components/cards";
import { useStore } from "@/lib/store";
import { findSection, findSub, type NavSub } from "@/lib/nav";
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
      (
        (a.section === section.slug && a.subcategory === sub.slug) ||
        a.tags.some((t) => t.toLowerCase() === sub.slug)
      ),
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
        <p className="text-lg text-muted-foreground">
          Posts and events in {sub.label.toLowerCase()} from across Hull.
        </p>
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
          <div className="text-center py-20">
            <p className="text-2xl font-display uppercase mb-2">No content yet</p>
            <p className="text-sm text-muted-foreground mb-6">
              Check back soon — or submit one yourself.
            </p>
            <Link
              to="/submit"
              className="inline-block px-6 py-3 bg-foreground text-background text-xs font-bold uppercase tracking-widest"
            >
              Submit a post
            </Link>
          </div>
        ) : (
          <div className="space-y-16">
            {events.length > 0 && (
              <div>
                <h2 className="font-display text-3xl uppercase mb-6">Upcoming</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
                  {events.map((e) => <EventCard key={e.id} event={e} />)}
                </div>
              </div>
            )}
            {articles.length > 0 && (
              <div>
                <h2 className="font-display text-3xl uppercase mb-6">Stories</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                  {articles.map((a) => <ArticleCard key={a.id} article={a} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
