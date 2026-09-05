import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ArticleCard } from "@/components/cards";
import { getAuthor, authorSlug, AUTHORS } from "@/lib/authors";
import { buildSeoMeta } from "@/lib/seo-meta";

export const Route = createFileRoute("/authors/")({
  loader: async ({ params }) => {
    const rawSlug = decodeURIComponent(params.author).toLowerCase();
    const matchedName = Object.keys(AUTHORS).find((n) => authorSlug(n) === rawSlug);
    const author = matchedName
      ? getAuthor(matchedName)
      : {
          name: rawSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          role: "Contributing Writer",
          bio: "Contributing writer for HU NOW covering Hull and East Yorkshire.",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
        };

    const { getStoreFromDatabase } = await import("@/lib/store.functions");
    const store = await getStoreFromDatabase().catch(() => null);
    const articles = (store?.articles ?? [])
      .filter((a) => {
        if (a.status !== "published") return false;
        const aSlug = authorSlug(a.author);
        return aSlug === rawSlug || a.author.toLowerCase() === author.name.toLowerCase();
      })
      .sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));

    return { author, articles, slug: rawSlug };
  },
  head: ({ loaderData }) => {
    const a = loaderData?.author;
    const name = a?.name || "Author";
    return buildSeoMeta({
      title: `${name} — HU NOW Contributing Writer`,
      description:
        a?.bio || `Read articles, culture guides, and local stories by ${name} on HU NOW in Kingston upon Hull.`,
      path: `/authors/${loaderData?.slug || ""}`,
    });
  },
  component: AuthorPage,
});

function AuthorPage() {
  const { author, articles } = Route.useLoaderData();

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="border-b-2 border-foreground pb-8 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <img
            src={author.avatar}
            alt={author.name}
            className="w-24 h-24 rounded-full object-cover border-2 border-border"
          />
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-accent mb-1">{author.role}</div>
            <h1 className="text-4xl sm:text-6xl font-display uppercase">{author.name}</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">{author.bio}</p>
          </div>
        </div>

        {articles.length === 0 ? (
          <div className="py-16 text-center max-w-lg mx-auto">
            <p className="text-muted-foreground mb-6">No articles currently published under this profile.</p>
            <Link
              to="/stories"
              className="px-6 py-2.5 bg-foreground text-background text-xs font-bold uppercase tracking-widest hover:bg-accent"
            >
              Explore All Stories
            </Link>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-display uppercase mb-6">Articles by {author.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
