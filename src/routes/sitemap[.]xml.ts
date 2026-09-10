import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { NAV_SECTIONS } from "@/lib/nav";
import { TAXONOMIES, articlePath, sectionHref } from "@/lib/taxonomy";

const BASE_URL = "https://www.hunow.co.uk";

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
        const articles = (store?.articles ?? []).filter((a) => !a.seo?.noIndex);
        const events = store?.events ?? [];
        const listings = store?.listings ?? [];
        const collections = store?.collections ?? [];
        const entries: SitemapEntry[] = [];

        // Static pages
        entries.push({ path: "/", changefreq: "weekly", priority: "1.0", lastmod: today() });
        entries.push({ path: "/hull-fair", changefreq: "daily", priority: "1.0", lastmod: today() });
        entries.push({ path: "/humber-street-sesh", changefreq: "weekly", priority: "0.9", lastmod: today() });
        entries.push({ path: "/freedom-festival", changefreq: "weekly", priority: "0.9", lastmod: today() });
        entries.push({ path: "/christmas-lights-switch-on", changefreq: "weekly", priority: "0.9", lastmod: today() });
        entries.push({ path: "/hull-pride", changefreq: "weekly", priority: "0.9", lastmod: today() });
        entries.push({ path: "/whats-on", changefreq: "daily", priority: "0.9", lastmod: today() });
        entries.push({ path: "/stories", changefreq: "daily", priority: "0.9", lastmod: today() });
        entries.push({ path: "/offers", changefreq: "weekly", priority: "0.8", lastmod: today() });
        entries.push({
          path: "/advertise",
          changefreq: "monthly",
          priority: "0.6",
          lastmod: today(),
        });
        entries.push({ path: "/submit", changefreq: "monthly", priority: "0.6", lastmod: today() });
        entries.push({ path: "/about", changefreq: "monthly", priority: "0.7", lastmod: today() });
        entries.push({ path: "/open-now", changefreq: "daily", priority: "0.8", lastmod: today() });
        entries.push({ path: "/areas", changefreq: "weekly", priority: "0.7", lastmod: today() });
        entries.push({ path: "/series", changefreq: "weekly", priority: "0.6", lastmod: today() });
        entries.push({
          path: "/newsletter",
          changefreq: "monthly",
          priority: "0.6",
          lastmod: today(),
        });
        entries.push({
          path: "/contact",
          changefreq: "monthly",
          priority: "0.5",
          lastmod: today(),
        });

        // Section pages (clean, deduplicated non-redirect canonical paths)
        const addedPaths = new Set<string>();
        for (const e of entries) {
          addedPaths.add(e.path);
        }

        const FESTIVAL_PATHS: Record<string, string> = {
          "hull-fair": "/hull-fair",
          "humber-street-sesh": "/humber-street-sesh",
          "freedom-festival": "/freedom-festival",
          "christmas-lights-switch-on": "/christmas-lights-switch-on",
          "hull-pride": "/hull-pride",
        };

        for (const taxonomy of TAXONOMIES) {
          // /events redirects with 301 to /whats-on
          if (taxonomy.slug === "events") continue;
          const p = `/${taxonomy.slug}`;
          if (!addedPaths.has(p)) {
            addedPaths.add(p);
            entries.push({
              path: p,
              changefreq: "weekly",
              priority: "0.8",
              lastmod: today(),
            });
          }
        }

        for (const section of NAV_SECTIONS) {
          const canonicalSection = sectionHref(section.slug);
          if (!addedPaths.has(canonicalSection)) {
            addedPaths.add(canonicalSection);
            entries.push({
              path: canonicalSection,
              changefreq: "weekly",
              priority: "0.8",
              lastmod: today(),
            });
          }
          for (const sub of section.subs) {
            const canonicalSub = FESTIVAL_PATHS[sub.slug] ?? `/c/${section.slug}/${sub.slug}`;
            if (!addedPaths.has(canonicalSub)) {
              addedPaths.add(canonicalSub);
              entries.push({
                path: canonicalSub,
                changefreq: "weekly",
                priority: "0.7",
                lastmod: today(),
              });
            }
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

        // Listings / places are paused for SEO recovery to focus crawl equity on editorial stories and guides

        // Area pages
        const areas = [...new Set(listings.map((l) => l.area).filter(Boolean))];
        for (const area of areas) {
          entries.push({
            path: `/areas/${encodeURIComponent(area.toLowerCase().replace(/\s+/g, "-"))}`,
            changefreq: "weekly",
            priority: "0.7",
            lastmod: today(),
          });
        }

        // Author pages
        const authors = [...new Set(articles.map((a) => a.author).filter(Boolean))];
        for (const author of authors) {
          entries.push({
            path: `/authors/${encodeURIComponent(author.toLowerCase().replace(/\s+/g, "-"))}`,
            changefreq: "weekly",
            priority: "0.6",
          });
        }

        // Tag pages
        const tags = [...new Set(articles.flatMap((a) => a.tags ?? []).filter(Boolean))];
        for (const tag of tags) {
          entries.push({
            path: `/tag/${encodeURIComponent(tag.toLowerCase().replace(/\s+/g, "-"))}`,
            changefreq: "weekly",
            priority: "0.5",
          });
        }

        // Series pages
        const seriesList = [...new Set(articles.map((a) => a.series).filter(Boolean))];
        for (const series of seriesList) {
          entries.push({
            path: `/series/${encodeURIComponent(series!.toLowerCase().replace(/\s+/g, "-"))}`,
            changefreq: "weekly",
            priority: "0.6",
          });
        }

        // Collection pages
        for (const collection of collections) {
          entries.push({
            path: `/collections/${collection.slug}`,
            changefreq: "weekly",
            priority: "0.7",
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
            "Cache-Control": "public, max-age=60, s-maxage=60",
          },
        });
      },
    },
  },
});
