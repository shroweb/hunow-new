import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ArticleCard, EventCard, ListingCard } from "@/components/cards";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SaveButton } from "@/components/SaveButton";
import { ShareMenu } from "@/components/ShareMenu";
import { ReadingProgress } from "@/components/ReadingProgress";
import { ArticleContent, TableOfContents } from "@/components/ArticleContent";
import { ArticleComments } from "@/components/ArticleComments";
import { SeriesNav } from "@/components/SeriesNav";
import { useStore } from "@/lib/store";
import { addToHistory } from "@/lib/reading-history";
import { authorSlug } from "@/lib/authors";
import { fetchArticleBySlug } from "@/lib/store.functions";
import { findTaxonomy, articlePath } from "@/lib/taxonomy";
import { img } from "@/data/seed";
import { subscribeNewsletter } from "@/lib/public.functions";
import { PollWidget } from "@/components/PollWidget";
import { relatedForArticle } from "@/lib/related-content";

export const Route = createFileRoute("/$taxonomy/$slug")({
  component: ArticleDetail,
  loader: async ({ params }) => {
    const article = await fetchArticleBySlug({ data: { slug: params.slug } });
    if (!article) throw notFound();

    // Redirect to canonical URL if taxonomy param doesn't match the article's subcategory
    const canonicalTaxonomy = article.subcategory ?? "stories";
    if (params.taxonomy !== canonicalTaxonomy) {
      throw redirect({
        to: articlePath(article),
        replace: true,
      });
    }

    const taxonomy = findTaxonomy(params.taxonomy);
    return { article, taxonomy };
  },
  head: ({ loaderData, params }) => {
    const a = loaderData?.article;
    if (!a) return {};
    const title = a.seo?.title ?? `${a.title} — HU NOW`;
    const description = a.seo?.description ?? a.excerpt;
    const image = a.seo?.ogImage ?? img(a.featuredImage, 1200, 630);
    const url = articlePath(a);
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
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: a.title,
            description: a.excerpt,
            image,
            datePublished: a.publishedAt,
            author: { "@type": "Person", name: a.author },
            publisher: {
              "@type": "Organization",
              name: "HU NOW",
              url: process.env.SITE_URL ?? "https://hunow.co.uk",
            },
            url: `${process.env.SITE_URL ?? "https://hunow.co.uk"}${url}`,
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 py-32 text-center">
        <h1 className="font-display text-6xl mb-4">STORY NOT FOUND</h1>
        <Link to="/" className="underline">
          Back to Home
        </Link>
      </div>
    </PublicLayout>
  ),
});

function ArticleDetail() {
  const { slug, taxonomy: taxonomySlug } = Route.useParams();
  const { article: loadedArticle, taxonomy } = Route.useLoaderData();
  const articles = useStore((s) => s.articles);
  const events = useStore((s) => s.events);
  const listings = useStore((s) => s.listings);
  const article = articles.find((a) => a.slug === slug) ?? loadedArticle;
  if (!article) throw notFound();

  useEffect(() => {
    addToHistory({
      kind: "article",
      id: article.id,
      slug: article.slug,
      title: article.title,
      subcategory: article.subcategory,
    });
  }, [article.id]);

  const seriesArticles = article.series
    ? articles.filter((a) => a.series === article.series && a.status === "published")
    : [];
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
          ...(taxonomy ? [{ label: taxonomy.eyebrow, to: `/${taxonomySlug}` as "/" }] : []),
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
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-[10px] uppercase text-accent">{article.category}</span>
            {article.series && seriesArticles.length > 0 && (
              <a
                href={`/series/${article.series.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className="font-mono text-[10px] uppercase text-muted-foreground hover:text-accent transition-colors"
              >
                {article.series}
                {article.seriesOrder &&
                  ` · Part ${article.seriesOrder} of ${seriesArticles.length}`}
              </a>
            )}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-balance">
            {article.title}
          </h1>
          <p className="text-2xl text-muted-foreground mb-8 leading-snug">{article.excerpt}</p>
          <div className="flex gap-4 border-y border-border py-4 mb-12 font-mono text-[10px] uppercase">
            <span>
              <span className="text-muted-foreground">By </span>
              <a
                href={`/authors/${authorSlug(article.author)}`}
                className="font-bold hover:text-accent hover:underline"
              >
                {article.author}
              </a>
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
                subcategory={article.subcategory}
                className="px-3 py-1.5 border border-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
              />
            </div>
          </div>
          {seriesArticles.length > 1 && (
            <SeriesNav current={article} seriesArticles={seriesArticles} />
          )}
          <TableOfContents content={article.content} />
          <ArticleContent content={article.content} entities={entities} />
          {article.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2">
              {article.tags.map((tag: string) => (
                <a
                  key={tag}
                  href={`/tag/${encodeURIComponent(tag.toLowerCase())}`}
                  className="px-3 py-1.5 border border-foreground/20 text-[10px] font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
                >
                  #{tag}
                </a>
              ))}
            </div>
          )}
          <div className="mt-8 flex flex-wrap gap-3 border-t border-border pt-8">
            <ShareMenu title={article.title} text={article.excerpt} />
            <SaveButton
              kind="story"
              id={article.id}
              slug={article.slug}
              title={article.title}
              subcategory={article.subcategory}
            />
          </div>
          {article.isSponsored && (
            <div className="mt-12 p-6 border-2 border-accent bg-accent/5 font-mono text-xs uppercase">
              Sponsored by {article.sponsorName}
            </div>
          )}
          {article.pollId && (
            <div className="my-10">
              <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">
                Reader poll
              </div>
              <PollWidget pollId={article.pollId} />
            </div>
          )}
          <NewsletterStrip />
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

function NewsletterStrip() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const KEY = "hunow:nl_strip_dismissed";

  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(!localStorage.getItem(KEY));
  }, []);

  if (!visible) return null;

  function dismiss() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* quota */
    }
    setVisible(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    try {
      await subscribeNewsletter({ data: { email, segments: [] } });
    } catch {
      /* ignore */
    }
    setDone(true);
    dismiss();
  }

  return (
    <div className="my-12 -mx-4 sm:mx-0 bg-foreground text-background px-8 py-10">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2">
            Newsletter
          </div>
          <p className="font-display text-3xl uppercase leading-tight">
            The best of Hull,
            <br />
            every Thursday.
          </p>
          <p className="text-sm text-background/70 mt-2">
            Events, food guides and hidden gems — straight to your inbox.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="text-background/40 hover:text-background text-2xl leading-none shrink-0 mt-1"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
      {done ? (
        <p className="font-bold text-accent text-lg">You're in. See you Thursday.</p>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 bg-white/10 border-2 border-white/20 px-4 py-3 font-mono text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/50"
          />
          <button
            type="submit"
            className="bg-accent text-foreground px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors whitespace-nowrap"
          >
            Subscribe
          </button>
        </form>
      )}
    </div>
  );
}
