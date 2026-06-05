import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { resolveRedirect } from "@/lib/redirects.functions";

export const Route = createFileRoute("/$")({
  loader: async ({ location }) => {
    const path = `/${location.pathname.replace(/^\//, "")}`.replace(/\/$/, "") || "/";
    const match = await resolveRedirect({ data: { path } });
    if (match) {
      throw redirect({ href: match.to_path, statusCode: match.permanent ? 301 : 302 });
    }
    return null;
  },
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
