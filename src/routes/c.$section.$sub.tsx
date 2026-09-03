import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ArticleCard, EventCard } from "@/components/cards";
import { useStore } from "@/lib/store";
import { findSection, findSub, type NavSection, type NavSub } from "@/lib/nav";
import { AdSlot } from "@/components/AdSlot";
import type { Article, EventItem } from "@/types";

export const Route = createFileRoute("/c/$section/$sub")({
  loader: async ({ params }) => {
    const section = findSection(params.section);
    const sub = findSub(params.section, params.sub);
    if (!section || !sub) throw notFound();
    const { getStoreFromDatabase } = await import("@/lib/store.functions");
    const store = await getStoreFromDatabase().catch(() => null);
    return {
      section,
      sub,
      articles: store?.articles ?? [],
      events: store?.events ?? [],
    };
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

function eventMatchesSubcategory(
  e: EventItem,
  sectionSlug: string,
  subSlug: string,
): boolean {
  if (e.status !== "published") return false;

  const cat = (e.category || "").toLowerCase().trim();
  const title = (e.title || "").toLowerCase();
  const desc = (e.description || "").toLowerCase();
  const location = `${e.locationName || ""} ${e.address || ""}`.toLowerCase();
  const tags = (e.tags || []).map((t) => t.toLowerCase());

  // Direct category or tag equality
  if (cat === subSlug || tags.includes(subSlug)) return true;

  if (sectionSlug === "whats-on") {
    // 1. General Events
    if (subSlug === "events") return true;

    // 2. Hull City Football
    if (subSlug === "hull-city") {
      return (
        title.includes("hull city") ||
        desc.includes("hull city") ||
        tags.some((t) => t.includes("hull city")) ||
        cat === "hull-city" ||
        (location.includes("mkm stadium") &&
          (title.includes("vs") || title.includes("fc")) &&
          !desc.includes("rugby") &&
          !title.includes("hull fc"))
      );
    }

    // 3. Hull KR (Hull Kingston Rovers)
    if (subSlug === "hull-kr") {
      return (
        title.includes("hull kr") ||
        title.includes("hull kingston") ||
        desc.includes("hull kr") ||
        desc.includes("hull kingston") ||
        tags.some(
          (t) =>
            t.includes("hull kr") ||
            t.includes("kingston rovers") ||
            t.includes("craven park"),
        ) ||
        cat === "hull-kr" ||
        location.includes("craven park")
      );
    }

    // 4. Hull FC (Rugby League)
    if (subSlug === "hull-fc") {
      return (
        ((title.includes("hull fc") || title.includes("hull f.c.")) &&
          !title.includes("hull kr")) ||
        desc.includes("hull fc") ||
        tags.some((t) => t.includes("hull fc")) ||
        cat === "hull-fc" ||
        (location.includes("mkm stadium") &&
          (desc.includes("super league") || desc.includes("rugby")))
      );
    }

    // 5. Hull Seahawks (Ice Hockey)
    if (subSlug === "hull-seahawks") {
      return (
        title.includes("seahawks") ||
        desc.includes("seahawks") ||
        tags.some((t) => t.includes("seahawks")) ||
        cat === "hull-seahawks" ||
        (location.includes("ice arena") &&
          (title.includes("seahawks") || desc.includes("seahawks")))
      );
    }

    // 6. Hull Jets (Ice Hockey)
    if (subSlug === "hull-jets") {
      return (
        title.includes("hull jets") ||
        title.includes(" jets ") ||
        title.endsWith(" jets") ||
        desc.includes("hull jets") ||
        tags.some((t) => t.includes("jets")) ||
        cat === "hull-jets"
      );
    }

    // 7. Sport (Aggregates all sports, teams, fixtures, and activities)
    if (subSlug === "sport") {
      return (
        cat === "sport" ||
        tags.includes("sport") ||
        tags.includes("football") ||
        tags.includes("rugby") ||
        tags.includes("ice hockey") ||
        title.includes("hull city") ||
        title.includes("hull kr") ||
        title.includes("hull fc") ||
        title.includes("seahawks") ||
        title.includes("jets") ||
        location.includes("mkm stadium") ||
        location.includes("craven park") ||
        location.includes("hull ice arena")
      );
    }

    // 8. Music
    if (subSlug === "music") {
      return (
        cat === "music" ||
        cat === "gig" ||
        cat === "live music" ||
        cat === "concert" ||
        tags.some((t) =>
          ["music", "gig", "concert", "live music", "band", "dj"].includes(t),
        ) ||
        location.includes("bonnét") ||
        location.includes("welly") ||
        location.includes("adelphi") ||
        location.includes("polar bear")
      );
    }

    // 9. Arts
    if (subSlug === "arts") {
      return (
        cat === "arts" ||
        cat === "art" ||
        cat === "theatre" ||
        cat === "comedy" ||
        cat === "exhibition" ||
        tags.some((t) =>
          ["arts", "art", "theatre", "comedy", "exhibition", "gallery", "culture"].includes(t),
        ) ||
        location.includes("hull truck") ||
        location.includes("hull new theatre") ||
        location.includes("ferens art gallery")
      );
    }
  }

  // Cross-category fallback
  return cat.includes(subSlug) || tags.some((t) => t.includes(subSlug));
}

function articleMatchesSubcategory(
  a: Article,
  sectionSlug: string,
  subSlug: string,
): boolean {
  if (a.status !== "published") return false;

  const direct =
    (a.section === sectionSlug && a.subcategory === subSlug) ||
    a.tags.some((t) => t.toLowerCase() === subSlug);
  if (direct) return true;

  const title = a.title.toLowerCase();
  const desc = (a.excerpt || "").toLowerCase();
  const tags = a.tags.map((t) => t.toLowerCase());

  if (sectionSlug === "whats-on") {
    if (subSlug === "hull-city") {
      return title.includes("hull city") || tags.some((t) => t.includes("hull city"));
    }
    if (subSlug === "hull-kr") {
      return (
        title.includes("hull kr") ||
        title.includes("craven park") ||
        tags.some((t) => t.includes("hull kr"))
      );
    }
    if (subSlug === "hull-fc") {
      return title.includes("hull fc") || tags.some((t) => t.includes("hull fc"));
    }
    if (subSlug === "hull-seahawks") {
      return title.includes("seahawks") || tags.some((t) => t.includes("seahawks"));
    }
    if (subSlug === "hull-jets") {
      return title.includes("jets") || tags.some((t) => t.includes("jets"));
    }
    if (subSlug === "sport") {
      return (
        a.subcategory === "sport" ||
        tags.includes("sport") ||
        title.includes("hull city") ||
        title.includes("hull kr") ||
        title.includes("hull fc") ||
        title.includes("seahawks")
      );
    }
    if (subSlug === "music") {
      return (
        a.subcategory === "music" ||
        tags.some((t) => ["music", "gig", "band", "nightlife"].includes(t))
      );
    }
    if (subSlug === "arts") {
      return (
        a.subcategory === "arts" ||
        tags.some((t) => ["arts", "art", "theatre", "comedy", "culture"].includes(t))
      );
    }
  }

  return false;
}

function SubPage() {
  const {
    section,
    sub,
    articles: loaderArticles,
    events: loaderEvents,
  } = Route.useLoaderData();

  const todayIso = new Date().toISOString().slice(0, 10);
  const articles = (loaderArticles ?? []).filter((a) =>
    articleMatchesSubcategory(a, section.slug, sub.slug),
  );
  const events = (loaderEvents ?? [])
    .filter(
      (e) =>
        (e.endDate || e.startDate) >= todayIso &&
        eventMatchesSubcategory(e, section.slug, sub.slug),
    )
    .sort((a, b) => (a.startDate || "").localeCompare(b.startDate || ""));

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
    (e) =>
      e.status === "published" &&
      (section.slug === "whats-on" || e.category.toLowerCase().includes(section.slug)),
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
