import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { fetchArticleBySlug } from "@/lib/store.functions";
import { articlePath } from "@/lib/taxonomy";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ArticleCard, EventCard, ListingCard } from "@/components/cards";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SaveButton } from "@/components/SaveButton";
import { ShareMenu } from "@/components/ShareMenu";
import { ReadingProgress } from "@/components/ReadingProgress";
import { useStore } from "@/lib/store";
import { ArticleContent, TableOfContents } from "@/components/ArticleContent";
import { ArticleComments } from "@/components/ArticleComments";
import { img } from "@/data/seed";
import { relatedForArticle } from "@/lib/related-content";

export const Route = createFileRoute("/stories/$slug")({
  component: StoryDetail,
  loader: async ({ params }) => {
    const article = await fetchArticleBySlug({ data: { slug: params.slug } });
    if (!article) throw notFound();
    // Redirect to canonical subcategory URL if the article has one
    if (article.subcategory) {
      throw redirect({ to: articlePath(article), replace: true });
    }
    return { article };
  },
  head: ({ loaderData, params }) => {
    const a = loaderData?.article;
    if (!a) return {};
    const title = a.seo?.title ?? `${a.title} — HU NOW`;
    const description = a.seo?.description ?? a.excerpt;
    const image = a.seo?.ogImage ?? img(a.featuredImage, 1200, 630);
    const url = `/stories/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        ...(a.seo?.noIndex ? [{ name: "robots", content: "noindex,nofollow" }] : []),
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "og:image", content: image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
      ],
      links: [{ rel: "canonical", href: a.seo?.canonicalUrl ?? url }],
    };
  },
  notFoundComponent: () => (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 py-32 text-center">
        <h1 className="font-display text-6xl mb-4">STORY NOT FOUND</h1>
        <Link to="/stories" className="underline">
          Back to Stories
        </Link>
      </div>
    </PublicLayout>
  ),
});

function StoryDetail() {
  const { slug } = Route.useParams();
  const { article: loadedArticle } = Route.useLoaderData();
  const articles = useStore((s) => s.articles);
  const events = useStore((s) => s.events);
  const listings = useStore((s) => s.listings);
  const article = articles.find((a) => a.slug === slug) ?? loadedArticle;
  if (!article) throw notFound();
  const {
    articles: related,
    events: relatedEvents,
    listings: relatedPlaces,
  } = relatedForArticle({
    article,
    articles,
    events,
    listings,
  });

  const entities = [
    ...listings.map((l) => ({ name: l.name, path: `/places/${l.slug}` })),
    ...events.map((e) => ({ name: e.title, path: `/events/${e.slug}` })),
    ...articles
      .filter((a) => a.id !== article.id)
      .map((a) => ({ name: a.title, path: articlePath(a) })),
  ];

  return (
    <PublicLayout>
      <ReadingProgress />
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Stories", to: "/stories" },
          { label: article.category },
          { label: article.title },
        ]}
      />
      <article>
        <div className="w-full aspect-[21/9] bg-stone-200 overflow-hidden">
          <img
            src={img(article.featuredImage, 1600, 700)}
            alt={`${article.title} — illustration`}
            width={1600}
            height={700}
            decoding="async"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="font-mono text-[10px] uppercase text-accent mb-4">{article.category}</div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-balance">
            {article.title}
          </h1>
          <p className="text-2xl text-muted-foreground mb-8 leading-snug">{article.excerpt}</p>
          <div className="flex gap-4 border-y border-border py-4 mb-12 font-mono text-[10px] uppercase">
            <span>
              <span className="text-muted-foreground">By </span>
              <span className="font-bold">{article.author}</span>
            </span>
            <span className="text-muted-foreground">·</span>
            <span>
              {new Date(article.publishedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span className="text-muted-foreground">·</span>
            <span>{article.readingMinutes} min read</span>
            <span className="text-muted-foreground ml-auto hidden sm:inline">·</span>
            <div className="ml-auto flex gap-2">
              <SaveButton
                kind="story"
                id={article.id}
                slug={article.slug}
                title={article.title}
                className="px-3 py-1.5 border border-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
              />
            </div>
          </div>
          <TableOfContents content={article.content} />
          <ArticleContent content={article.content} entities={entities} />
          <div className="mt-12 flex flex-wrap gap-3 border-t border-border pt-8">
            <ShareMenu title={article.title} text={article.excerpt} />
            <SaveButton kind="story" id={article.id} slug={article.slug} title={article.title} />
          </div>
          {article.isSponsored && (
            <div className="mt-12 p-6 border-2 border-accent bg-accent/5 font-mono text-xs uppercase">
              Sponsored by {article.sponsorName}
            </div>
          )}
          <ArticleComments articleId={article.id} />
        </div>
      </article>
      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16 border-t border-border">
          <h2 className="text-4xl font-display uppercase mb-8">Related Reads</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {related.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
      {(relatedEvents.length > 0 || relatedPlaces.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 py-16 border-t border-border">
          <h2 className="text-4xl font-display uppercase mb-2">Keep Exploring</h2>
          <p className="text-sm text-muted-foreground mb-8">
            Related events and places from the directory.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {relatedEvents.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
            {relatedPlaces.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}
    </PublicLayout>
  );
}
