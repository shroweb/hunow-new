import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ArticleCard } from "@/components/cards";
import { useStore } from "@/lib/store";
import { getState } from "@/lib/store";

export const Route = createFileRoute("/tag/$tag")({
  loader: ({ params }) => {
    const tag = decodeURIComponent(params.tag).toLowerCase();
    const articles = getState().articles.filter(
      (a) => a.status === "published" && a.tags.some((t) => t.toLowerCase() === tag),
    );
    if (articles.length === 0) throw notFound();
    return { tag };
  },
  head: ({ loaderData }) => {
    const tag = loaderData?.tag ?? "";
    return {
      meta: [
        { title: `#${tag} — HU NOW` },
        { name: "description", content: `All HU NOW articles tagged with ${tag}.` },
      ],
    };
  },
  notFoundComponent: () => (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 py-32 text-center">
        <h1 className="font-display text-6xl mb-4">TAG NOT FOUND</h1>
        <Link to="/" className="underline">Back to home</Link>
      </div>
    </PublicLayout>
  ),
  component: TagPage,
});

function TagPage() {
  const { tag } = Route.useLoaderData();
  const articles = useStore((s) => s.articles).filter(
    (a) => a.status === "published" && a.tags.some((t) => t.toLowerCase() === tag),
  );

  return (
    <PublicLayout>
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-20 border-b-2 border-foreground">
        <div className="text-[10px] font-mono uppercase mb-4 text-accent">Tag</div>
        <h1 className="text-6xl md:text-8xl font-display uppercase leading-none">#{tag}</h1>
      </section>
      <section className="max-w-7xl mx-auto px-4 py-12">
        <p className="text-[10px] font-mono uppercase text-muted-foreground mb-8">
          {articles.length} {articles.length === 1 ? "article" : "articles"}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
