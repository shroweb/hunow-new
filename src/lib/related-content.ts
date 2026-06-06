import { articlePath } from "@/lib/taxonomy";
import type { Article, EventItem, Listing } from "@/types";

const norm = (value = "") => value.toLowerCase().trim();

function tokenSet(values: Array<string | undefined>) {
  return new Set(
    values.flatMap((value) => norm(value).split(/[^a-z0-9]+/)).filter((value) => value.length > 2),
  );
}

function overlap(a: Set<string>, b: Set<string>) {
  let score = 0;
  for (const item of a) if (b.has(item)) score += 1;
  return score;
}

function articleTokens(article: Article) {
  return tokenSet([
    article.title,
    article.category,
    article.subcategory,
    article.series,
    ...article.tags,
  ]);
}

function eventTokens(event: EventItem) {
  return tokenSet([event.title, event.category, event.locationName, event.address]);
}

function listingTokens(listing: Listing) {
  return tokenSet([
    listing.name,
    listing.category,
    listing.area,
    listing.address,
    ...(listing.tags ?? []),
  ]);
}

function rank<T extends { id: string; isFeatured?: boolean }>(
  items: T[],
  score: (item: T) => number,
  limit: number,
) {
  return items
    .map((item) => ({ item, score: score(item) + (item.isFeatured ? 0.5 : 0) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item);
}

export function relatedForArticle(input: {
  article: Article;
  articles: Article[];
  events: EventItem[];
  listings: Listing[];
  limit?: number;
}) {
  const tokens = articleTokens(input.article);
  const articleText = norm(
    `${input.article.title} ${input.article.excerpt} ${input.article.content}`,
  );
  return {
    articles: rank(
      input.articles.filter(
        (item) =>
          item.id !== input.article.id &&
          item.status === "published" &&
          item.series !== input.article.series,
      ),
      (item) =>
        overlap(tokens, articleTokens(item)) +
        (item.category === input.article.category ? 3 : 0) +
        (item.subcategory && item.subcategory === input.article.subcategory ? 2 : 0),
      input.limit ?? 3,
    ),
    events: rank(
      input.events.filter((item) => item.status === "published"),
      (item) =>
        overlap(tokens, eventTokens(item)) +
        (articleText.includes(norm(item.locationName)) ? 3 : 0),
      2,
    ),
    listings: rank(
      input.listings,
      (item) =>
        overlap(tokens, listingTokens(item)) + (articleText.includes(norm(item.name)) ? 4 : 0),
      2,
    ),
  };
}

export function relatedForListing(input: {
  listing: Listing;
  articles: Article[];
  events: EventItem[];
  listings: Listing[];
}) {
  const tokens = listingTokens(input.listing);
  return {
    articles: rank(
      input.articles.filter((item) => item.status === "published"),
      (item) => {
        const text = norm(`${item.title} ${item.excerpt} ${item.content}`);
        return (
          overlap(tokens, articleTokens(item)) +
          (text.includes(norm(input.listing.name)) ? 5 : 0) +
          (item.tags.map(norm).includes(norm(input.listing.area)) ? 3 : 0)
        );
      },
      3,
    ),
    events: rank(
      input.events.filter((item) => item.status === "published"),
      (item) =>
        overlap(tokens, eventTokens(item)) +
        (norm(item.locationName).includes(norm(input.listing.name)) ? 5 : 0) +
        (norm(item.address).includes(norm(input.listing.area)) ? 2 : 0),
      3,
    ),
    listings: rank(
      input.listings.filter((item) => item.id !== input.listing.id),
      (item) =>
        overlap(tokens, listingTokens(item)) +
        (item.category === input.listing.category ? 3 : 0) +
        (item.area === input.listing.area ? 2 : 0),
      3,
    ),
  };
}

export function relatedForEvent(input: {
  event: EventItem;
  events: EventItem[];
  listings: Listing[];
}) {
  const tokens = eventTokens(input.event);
  return {
    events: rank(
      input.events.filter((item) => item.id !== input.event.id && item.status === "published"),
      (item) =>
        overlap(tokens, eventTokens(item)) +
        (item.category === input.event.category ? 3 : 0) +
        (item.locationName === input.event.locationName ? 3 : 0),
      3,
    ),
    listings: rank(
      input.listings,
      (item) =>
        overlap(tokens, listingTokens(item)) +
        (norm(input.event.locationName).includes(norm(item.name)) ? 6 : 0),
      1,
    ),
  };
}

export function relatedArticlePath(article: Article) {
  return articlePath(article);
}
