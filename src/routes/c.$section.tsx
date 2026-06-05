import { createFileRoute, Link, Outlet, notFound, useRouterState } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ArticleCard } from "@/components/cards";
import { useStore } from "@/lib/store";
import { findSection, NAV_SECTIONS, type NavSub } from "@/lib/nav";
import { AdSlot } from "@/components/AdSlot";

export const Route = createFileRoute("/c/$section")({
  loader: ({ params }) => {
    const section = findSection(params.section);
    if (!section) throw notFound();
    return { section };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.section.label} — HU NOW` },
          { name: "description", content: loaderData.section.blurb },
        ]
      : [],
  }),
  component: SectionPage,
  notFoundComponent: () => (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 py-32 text-center">
        <h1 className="text-5xl font-display uppercase mb-4">Section not found</h1>
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

function SectionPage() {
  const { section } = Route.useLoaderData();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== `/c/${section.slug}`) return <Outlet />;

  return <SectionIndex />;
}

function SectionIndex() {
  const { section } = Route.useLoaderData();
  const articles = useStore((s) => s.articles).filter(
    (a) => a.status === "published" && a.section === section.slug,
  );

  return (
    <PublicLayout>
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-20 border-b border-border">
        <div className="text-[10px] font-mono uppercase mb-4 text-accent">Section</div>
        <h1 className="text-6xl md:text-8xl font-display uppercase leading-none mb-6">
          {section.label}
        </h1>
        <p className="text-xl max-w-2xl text-muted-foreground">{section.blurb}</p>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-6 border-b border-border">
        <div className="flex flex-wrap gap-2">
          <Link
            to="/c/$section"
            params={{ section: section.slug }}
            className="px-3 py-1.5 text-[10px] font-bold uppercase bg-accent text-background"
          >
            All
          </Link>
          {section.subs.map((sub: NavSub) => (
            <Link
              key={sub.slug}
              to="/c/$section/$sub"
              params={{ section: section.slug, sub: sub.slug }}
              className="px-3 py-1.5 text-[10px] font-bold uppercase border border-foreground/20 hover:bg-foreground/5"
            >
              {sub.label}
            </Link>
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <AdSlot placement={`${section.label} Section`} />
      </div>

      <section className="max-w-7xl mx-auto px-4 py-12">
        {articles.length === 0 ? (
          <p className="text-muted-foreground">No posts yet in this section.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12 border-t border-border">
        <h2 className="text-3xl font-display uppercase mb-6">Other sections</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {NAV_SECTIONS.filter((s) => s.slug !== section.slug).map((s) => (
            <Link
              key={s.slug}
              to="/c/$section"
              params={{ section: s.slug }}
              className="block border-2 border-foreground p-4 hover:bg-accent hover:text-background transition-colors"
            >
              <div className="text-lg font-bold uppercase">{s.label}</div>
            </Link>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
