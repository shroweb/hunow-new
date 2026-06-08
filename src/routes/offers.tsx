import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useStore } from "@/lib/store";
import { getCurrentUser } from "@/lib/auth.functions";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Reader Offers — HU NOW" },
      {
        name: "description",
        content: "Exclusive discounts and offers from Hull's best independent businesses.",
      },
    ],
  }),
  loader: async () => {
    const user = await getCurrentUser().catch(() => null);
    return { user };
  },
  component: Offers,
});

function CodeCopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="w-full flex items-center justify-between bg-foreground text-background px-4 py-3 hover:bg-accent transition-colors group"
    >
      <span className="font-mono text-lg tracking-widest font-bold">{code}</span>
      <span className="text-[9px] font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100">
        {copied ? "Copied ✓" : "Copy code"}
      </span>
    </button>
  );
}

function Offers() {
  const { user } = Route.useLoaderData();
  const offers = useStore((s) => s.offers).filter((o) => o.status === "active");
  const listings = useStore((s) => s.listings);

  return (
    <PublicLayout>
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-20 border-b border-border">
        <div className="text-[10px] font-mono uppercase mb-4 text-accent">Exclusive</div>
        <h1 className="text-6xl md:text-8xl font-display uppercase leading-none mb-6">
          Reader Offers
        </h1>
        <p className="text-xl max-w-2xl">
          Discounts and freebies from Hull's best — just for HU NOW readers.
        </p>
        {!user && (
          <div className="mt-6 inline-flex items-center gap-4 border-2 border-foreground px-5 py-3">
            <span className="text-sm font-bold">Sign in to unlock all offers</span>
            <a
              href="/sign-in"
              className="px-4 py-2 bg-foreground text-background text-xs font-bold uppercase tracking-widest hover:bg-accent transition-colors"
            >
              Sign in
            </a>
            <a
              href="/sign-up"
              className="text-xs font-bold uppercase tracking-widest underline underline-offset-2 hover:text-accent"
            >
              Create account
            </a>
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((o) => {
          const listing =
            listings.find((l) => l.id === o.listingId) ??
            listings.find((l) => l.name.toLowerCase() === o.businessName.toLowerCase());
          return (
            <div
              key={o.id}
              className="border-2 border-foreground bg-background flex flex-col relative"
            >
              {!user && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/70 backdrop-blur-[2px]">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <a
                    href="/sign-in"
                    className="px-4 py-2 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-colors"
                  >
                    Sign in to view
                  </a>
                </div>
              )}

              {/* Card body */}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="text-[10px] font-mono uppercase text-accent">
                    {o.businessName}
                  </div>
                  {o.isFeatured && (
                    <span className="text-[9px] font-bold uppercase bg-accent text-background px-2 py-0.5 shrink-0">
                      Featured
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-2 leading-snug">{o.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 flex-1 leading-relaxed">
                  {o.description}
                </p>
                <div className="text-[10px] font-mono uppercase text-muted-foreground mb-4">
                  Ends{" "}
                  {new Date(o.endDate).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>

                {/* CTA */}
                {o.code ? (
                  <CodeCopyButton code={o.code} />
                ) : user ? (
                  <Link
                    to="/account"
                    className="block bg-foreground text-background px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-colors text-center"
                  >
                    Redeem with HU NOW card
                  </Link>
                ) : (
                  <a
                    href="/sign-in"
                    className="block border-2 border-foreground px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors text-center"
                  >
                    Sign in to redeem
                  </a>
                )}
              </div>

              {/* Venue footer */}
              {listing && (
                <Link
                  to="/places/$slug"
                  params={{ slug: listing.slug }}
                  className="flex items-center gap-2 px-6 py-3 border-t border-foreground/10 text-[10px] font-bold uppercase hover:bg-foreground/5 transition-colors"
                >
                  <svg
                    width="10"
                    height="12"
                    viewBox="0 0 10 12"
                    fill="currentColor"
                    aria-hidden="true"
                    className="text-accent shrink-0"
                  >
                    <path d="M5 0C2.24 0 0 2.24 0 5c0 3.75 5 7 5 7s5-3.25 5-7c0-2.76-2.24-5-5-5zm0 6.5A1.5 1.5 0 1 1 5 3.5 1.5 1.5 0 0 1 5 6.5z" />
                  </svg>
                  {listing.name}
                </Link>
              )}
            </div>
          );
        })}
      </section>
    </PublicLayout>
  );
}
