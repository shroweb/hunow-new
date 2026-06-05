import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ArticleCard } from "@/components/cards";
import { useStore } from "@/lib/store";
import { getAuthor, authorSlug, AUTHORS } from "@/lib/authors";

export const Route = createFileRoute("/authors/$author")({
  loader: ({ params }) => {
    // Find the author name that matches the slug
    const name = Object.keys(AUTHORS).find((n) => authorSlug(n) === params.author);
    if (!name) throw notFound();
    return { author: getAuthor(name) };
  },
  head: ({ loaderData }) => {
    const a = loaderData?.author;
    if (!a) return {};
    return {
      meta: [
        { title: `${a.name} — HU NOW` },
        { name: "description", content: a.bio || `Articles by ${a.name} on HU NOW.` },
      ],
    };
  },
  notFoundComponent: () => (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 py-32 text-center">
        <h1 className="font-display text-6xl mb-4">AUTHOR NOT FOUND</h1>
        <Link to="/" className="underline">
          Back to home
        </Link>
      </div>
    </PublicLayout>
  ),
  component: AuthorPage,
});

function AuthorPage() {
  const { author } = Route.useLoaderData();
  const articles = useStore((s) => s.articles).filter(
    (a) => a.author === author.name && a.status === "published",
  );

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
