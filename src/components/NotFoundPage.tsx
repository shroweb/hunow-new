import { Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";

export function NotFoundPage({ title = "Page not found" }: { title?: string }) {
  const links = [
    { href: "/whats-on", label: "What's On" },
    { href: "/hull-fair", label: "Hull Fair 2026" },
    { href: "/guides", label: "Guides" },
    { href: "/stories", label: "Stories" },
    { href: "/places", label: "Places" },
    { href: "/eat", label: "Food & Drink" },
  ];
  return (
    <PublicLayout>
      <section className="max-w-3xl mx-auto px-4 py-20 md:py-28">
        <div className="font-mono text-[11px] font-bold uppercase tracking-widest text-accent mb-4">
          Error 404
        </div>
        <h1 className="font-display text-6xl md:text-8xl uppercase leading-[0.9] mb-6">{title}</h1>
        <p className="text-lg text-foreground/75 mb-8 max-w-xl">
          The page you're looking for doesn't exist or has been moved. Try a search, or head to one
          of the sections below.
        </p>
        <form action="/search" method="get" className="flex flex-col sm:flex-row gap-2 mb-10">
          <input
            type="search"
            name="q"
            required
            placeholder="Search events, places, guides…"
            aria-label="Search HU NOW"
            className="flex-1 border-2 border-foreground bg-card px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="submit"
            className="bg-foreground px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-background transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Search
          </button>
        </form>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-px border border-border bg-border">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="bg-card px-4 py-4 font-display text-xl uppercase transition-colors hover:bg-foreground hover:text-background"
            >
              {link.label} →
            </a>
          ))}
        </div>
        <div className="mt-8">
          <Link
            to="/"
            className="text-xs font-bold uppercase tracking-widest underline decoration-accent decoration-2 underline-offset-[6px] hover:text-accent"
          >
            Back to the homepage
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
