import { createFileRoute, redirect, notFound, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { resolveRedirect } from "@/lib/redirects.functions";

export const Route = createFileRoute("/$")({
  loader: async ({ location }) => {
    const path = `/${location.pathname.replace(/^\//, "")}`.replace(/\/$/, "") || "/";

    // Legacy WordPress asset & admin URLs
    if (
      path.startsWith("/wp-content") ||
      path.startsWith("/wp-includes") ||
      path.startsWith("/wp-json") ||
      path.startsWith("/wp-admin") ||
      path.startsWith("/pdfviewer")
    ) {
      throw redirect({ href: "/", statusCode: 301 });
    }

    // Legacy RSS feeds
    if (path === "/feed" || path.startsWith("/feed/")) {
      throw redirect({ href: "/feed.articles.rss", statusCode: 301 });
    }

    // Legacy singular /author/:slug -> plural /authors/:slug
    if (path.startsWith("/author/")) {
      const author = path.replace("/author/", "");
      throw redirect({ href: `/authors/${author}`, statusCode: 301 });
    }

    // Legacy /category/:slug -> smart redirect
    if (path.startsWith("/category/")) {
      const cat = path.replace("/category/", "").split("/")[0].toLowerCase();
      if (cat === "food" || cat === "restaurants" || cat === "drink" || cat === "eat") {
        throw redirect({ href: "/eat", statusCode: 301 });
      }
      if (cat === "events" || cat === "music" || cat === "gigs") {
        throw redirect({ href: "/whats-on", statusCode: 301 });
      }
      if (cat === "arts" || cat === "culture") {
        throw redirect({ href: "/arts", statusCode: 301 });
      }
      throw redirect({ href: "/stories", statusCode: 301 });
    }

    // Legacy pagination /page/:num
    if (path.startsWith("/page/")) {
      throw redirect({ href: "/stories", statusCode: 301 });
    }

    // Explicit database redirects
    const match = await resolveRedirect({ data: { path } }).catch(() => null);
    if (match && match.to_path !== path) {
      throw redirect({ href: match.to_path, statusCode: match.permanent ? 301 : 302 });
    }

    throw notFound();
  },
  head: () => ({
    meta: [
      { title: "Page Not Found (404) — HU NOW" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: NotFound,
});

function NotFound() {
  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 py-32 text-center">
        <div className="font-mono text-[10px] uppercase text-accent mb-4">404</div>
        <h1 className="font-display text-6xl md:text-8xl uppercase leading-none mb-6">
          Page not found
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          This page doesn't exist on HU NOW. Try searching for what you were looking for.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="inline-block bg-foreground text-background px-8 py-4 font-bold uppercase tracking-widest text-xs hover:bg-accent"
          >
            Go home
          </Link>
          <Link
            to="/search"
            search={{ q: "" }}
            className="inline-block px-8 py-4 border-2 border-foreground font-bold uppercase tracking-widest text-xs hover:bg-foreground hover:text-background transition-colors"
          >
            Search
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
