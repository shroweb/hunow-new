import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { NAV_SECTIONS } from "@/lib/nav";
import { TAXONOMIES, articlePath } from "@/lib/taxonomy";

const BASE_URL = (process.env.SITE_URL ?? "https://hunow.co.uk").replace(/\/$/, "");

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

function today() {
  return new Date().toISOString().split("T")[0];
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { getDatabaseStore } = await import("@/lib/db.server");
        const store = await getDatabaseStore().catch(() => null);
        const articles = store?.articles ?? [];
        const events = store?.events ?? [];
        const listings = store?.listings ?? [];
        const entries: SitemapEntry[] = [];

        // Static pages
        entries.push({ path: "/", changefreq: "weekly", priority: "1.0", lastmod: today() });
        entries.push({ path: "/whats-on", changefreq: "daily", priority: "0.9", lastmod: today() });
        entries.push({ path: "/stories", changefreq: "daily", priority: "0.9", lastmod: today() });
        entries.push({ path: "/places", changefreq: "weekly", priority: "0.9", lastmod: today() });
        entries.push({ path: "/offers", changefreq: "weekly", priority: "0.8", lastmod: today() });
        entries.push({
          path: "/listings",
          changefreq: "weekly",
          priority: "0.8",
          lastmod: today(),
        });
        entries.push({
          path: "/advertise",
          changefreq: "monthly",
          priority: "0.6",
          lastmod: today(),
        });
        entries.push({ path: "/submit", changefreq: "monthly", priority: "0.6", lastmod: today() });
        entries.push({ path: "/saved", changefreq: "weekly", priority: "0.5", lastmod: today() });

        // Section pages
        for (const taxonomy of TAXONOMIES) {
          entries.push({
            path: `/${taxonomy.slug}`,
            changefreq: "weekly",
            priority: "0.8",
            lastmod: today(),
          });
        }

        for (const section of NAV_SECTIONS) {
          entries.push({
            path: `/c/${section.slug}`,
            changefreq: "weekly",
            priority: "0.8",
            lastmod: today(),
          });
          for (const sub of section.subs) {
            entries.push({
              path: `/c/${section.slug}/${sub.slug}`,
              changefreq: "weekly",
              priority: "0.7",
              lastmod: today(),
            });
          }
        }

        // Published stories (live from DB)
        for (const article of articles) {
          if (article.status === "published") {
            entries.push({
              path: articlePath(article),
              changefreq: "weekly",
              priority: "0.8",
              lastmod: article.publishedAt,
            });
          }
        }

        // Published events (live from DB)
        for (const event of events) {
          if (event.status === "published") {
            entries.push({
              path: `/events/${event.slug}`,
              changefreq: "weekly",
              priority: "0.8",
              lastmod: event.startDate,
            });
          }
        }

        // Listings / places (live from DB)
        for (const listing of listings) {
          entries.push({
            path: `/places/${listing.slug}`,
            changefreq: "weekly",
            priority: "0.8",
            lastmod: today(),
          });
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
