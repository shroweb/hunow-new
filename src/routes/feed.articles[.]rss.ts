import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { articlePath } from "@/lib/taxonomy";

const BASE = (process.env.SITE_URL ?? "https://hunow.co.uk").replace(/\/$/, "");

function escape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const Route = createFileRoute("/feed/articles.rss")({
  server: {
    handlers: {
      GET: async () => {
        const { getDatabaseStore } = await import("@/lib/db.server");
        const store = await getDatabaseStore().catch(() => ({ articles: [] }));
        const articles = store.articles
          .filter((a) => a.status === "published")
          .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
          .slice(0, 20);

        const items = articles.map((a) => {
          const url = `${BASE}${articlePath(a)}`;
          return [
            `  <item>`,
            `    <title>${escape(a.title)}</title>`,
            `    <link>${url}</link>`,
            `    <guid isPermaLink="true">${url}</guid>`,
            `    <description>${escape(a.excerpt)}</description>`,
            `    <author>${escape(a.author)}</author>`,
            `    <category>${escape(a.category)}</category>`,
            `    <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>`,
            `  </item>`,
          ].join("\n");
        });

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">`,
          `<channel>`,
          `  <title>HU NOW — Stories</title>`,
          `  <link>${BASE}/stories</link>`,
          `  <description>Articles, guides and stories from Hull's independent city guide.</description>`,
          `  <language>en-gb</language>`,
          `  <atom:link href="${BASE}/feed/articles.rss" rel="self" type="application/rss+xml"/>`,
          ...items,
          `</channel>`,
          `</rss>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
