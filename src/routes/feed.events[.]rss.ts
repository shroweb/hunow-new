import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE = (process.env.SITE_URL ?? "https://hunow.co.uk").replace(/\/$/, "");

function escape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const Route = createFileRoute("/feed/events.rss")({
  server: {
    handlers: {
      GET: async () => {
        const { getDatabaseStore } = await import("@/lib/db.server");
        const store = await getDatabaseStore().catch(() => ({ events: [] }));
        const events = store.events
          .filter((e) => e.status === "published")
          .sort((a, b) => a.startDate.localeCompare(b.startDate))
          .slice(0, 20);

        const items = events.map((e) => {
          const url = `${BASE}/events/${e.slug}`;
          return [
            `  <item>`,
            `    <title>${escape(e.title)}</title>`,
            `    <link>${url}</link>`,
            `    <guid isPermaLink="true">${url}</guid>`,
            `    <description>${escape(e.description)}</description>`,
            `    <category>${escape(e.category)}</category>`,
            `    <pubDate>${new Date(e.startDate).toUTCString()}</pubDate>`,
            `  </item>`,
          ].join("\n");
        });

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">`,
          `<channel>`,
          `  <title>HU NOW — What's On</title>`,
          `  <link>${BASE}/whats-on</link>`,
          `  <description>Upcoming events in Hull from HU NOW.</description>`,
          `  <language>en-gb</language>`,
          `  <atom:link href="${BASE}/feed/events.rss" rel="self" type="application/rss+xml"/>`,
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
