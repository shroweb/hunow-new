import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useStore } from "@/lib/store";
import { getCurrentUser } from "@/lib/auth.functions";
import { redeemOffer } from "@/lib/public.functions";
import { trackAnalyticsEvent } from "@/lib/analytics.functions";

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

function Offers() {
  const { user } = Route.useLoaderData();
  const offers = useStore((s) => s.offers).filter((o) => o.status === "active");
  const listings = useStore((s) => s.listings);
  const events = useStore((s) => s.events).filter((e) => e.status === "published");
  const today = new Date().toISOString().slice(0, 10);

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
        {offers.map((o) => (
          <div
            key={o.id}
            className={`border-2 border-foreground p-6 bg-white flex flex-col relative transition-opacity ${!user ? "opacity-50 select-none" : ""}`}
          >
            {!user && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/60 backdrop-blur-[2px]">
                <svg
                  width="20"
                  height="20"
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
            <div className="text-[10px] font-mono uppercase text-accent mb-2">{o.businessName}</div>
            <h3 className="text-2xl font-bold mb-3 leading-tight">{o.title}</h3>
            <p className="text-sm text-muted-foreground mb-4 flex-1">{o.description}</p>
            <div className="text-[10px] font-mono uppercase text-muted-foreground mb-3">
              Ends {new Date(o.endDate).toLocaleDateString("en-GB")}
            </div>
            {(() => {
              // Match listing by id first, fall back to matching by business name
              const listing =
                listings.find((l) => l.id === o.listingId) ??
                listings.find(
                  (l) => l.name.toLowerCase() === o.businessName.toLowerCase(),
                );
              const upcomingEvents = listing
                ? events
                    .filter(
                      (e) =>
                        e.locationName.toLowerCase() === listing.name.toLowerCase() &&
                        e.startDate >= today,
                    )
                    .slice(0, 2)
                : [];
              return (
                <>
                  {listing ? (
                    <Link
                      to="/places/$slug"
                      params={{ slug: listing.slug }}
                      onClick={() => {
                        void redeemOffer({ data: { offerId: o.id } }).catch(() => {});
                        void trackAnalyticsEvent({
                          data: { eventType: "offer_claim", path: "/offers", label: o.title },
                        }).catch(() => {});
                      }}
                      className="mb-3 block bg-foreground text-background px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-colors text-center"
                    >
                      {o.code ? `Use code: ${o.code}` : "Claim Offer"}
                    </Link>
                  ) : (
                    user && (
                      <button
                        type="button"
                        onClick={() => {
                          void redeemOffer({ data: { offerId: o.id } }).catch(() => {});
                          void trackAnalyticsEvent({
                            data: { eventType: "offer_claim", path: "/offers", label: o.title },
                          }).catch(() => {});
                          alert(o.code ? `Use code: ${o.code}` : "Offer claimed. Show this page in-store.");
                        }}
                        className="mb-3 bg-foreground text-background px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-colors w-full"
                      >
                        Claim Offer
                      </button>
                    )
                  )}
                  <div className="mt-auto pt-3 border-t border-foreground/10 space-y-2">
                    {listing && (
                      <Link
                        to="/places/$slug"
                        params={{ slug: listing.slug }}
                        className="flex items-center gap-2 text-[10px] font-bold uppercase hover:text-accent transition-colors"
                      >
                        <span className="text-foreground/40">📍</span> {listing.name}
                      </Link>
                    )}
                    {upcomingEvents.map((e) => (
                      <Link
                        key={e.id}
                        to="/events/$slug"
                        params={{ slug: e.slug }}
                        className="block text-[10px] font-mono text-muted-foreground hover:text-accent transition-colors truncate"
                      >
                        {new Date(`${e.startDate}T12:00`).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}{" "}
                        · {e.title}
                      </Link>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        ))}
      </section>
    </PublicLayout>
  );
}
