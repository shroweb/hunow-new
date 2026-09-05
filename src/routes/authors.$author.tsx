import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ArticleCard } from "@/components/cards";
import { useStore } from "@/lib/store";
import { getAuthor, authorSlug, AUTHORS } from "@/lib/authors";
import { buildSeoMeta } from "@/lib/seo-meta";

export const Route = createFileRoute("/authors/$author")({
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
  const { author, articles: loaderArticles } = Route.useLoaderData();
  // useStore keeps the list reactive if articles are added during the session
  const storeArticles = useStore((s) => s.articles).filter(
    (a) => a.author === author.name && a.status === "published",
  );
  const articles = loaderArticles?.length ? loaderArticles : storeArticles;

  return (
    <PublicLayout>
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-20 border-b-2 border-foreground">
        <div className="text-[10px] font-mono uppercase mb-4 text-accent">{author.role}</div>
        <h1 className="text-6xl md:text-8xl font-display uppercase leading-none mb-4">
          {author.name}
        </h1>
        {author.bio && <p className="text-xl max-w-2xl text-muted-foreground">{author.bio}</p>}
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <p className="text-[10px] font-mono uppercase text-muted-foreground mb-8">
          {articles.length} {articles.length === 1 ? "article" : "articles"}
        </p>
        {articles.length === 0 ? (
          <p className="text-muted-foreground">No published articles yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
