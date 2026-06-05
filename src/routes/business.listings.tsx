import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { getBusinessListings, updateBusinessListing } from "@/lib/business.functions";
import type { Listing } from "@/types";

export const Route = createFileRoute("/business/listings")({
  loader: async () => ({ listings: await getBusinessListings() }),
  component: BusinessListings,
});

function BusinessListings() {
  const { listings: initialListings } = Route.useLoaderData();
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [editing, setEditing] = useState<Listing | null>(null);
  const [status, setStatus] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const fd = new FormData(event.currentTarget);
    setStatus("Saving...");
    try {
      const updated = await updateBusinessListing({
        data: {
          listingId: editing.id,
          description: String(fd.get("description")),
          openingHours: String(fd.get("openingHours") || ""),
          website: String(fd.get("website") || ""),
          phone: String(fd.get("phone") || ""),
          email: String(fd.get("email") || ""),
        },
      });
      setListings((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setEditing(updated);
      setStatus("Saved");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Unable to save.");
    }
  }

  return (
    <PublicLayout>
      <section className="max-w-6xl mx-auto px-4 py-12 md:py-20 border-b-2 border-foreground">
        <div className="font-mono text-[10px] uppercase text-accent mb-4">Business account</div>
        <h1 className="font-display text-6xl md:text-8xl uppercase leading-none mb-4">
          My Listings
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Manage the listings you have claimed and had approved by HU NOW.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12 grid lg:grid-cols-[320px_1fr] gap-8">
        <aside className="space-y-3">
          {listings.length === 0 ? (
            <div className="border-2 border-foreground bg-white p-5">
              <p className="text-sm text-muted-foreground mb-4">
                No approved listings yet. Find your business page and use “Claim this listing”.
              </p>
              <Link to="/listings" className="font-bold uppercase text-xs underline">
                Browse listings
              </Link>
            </div>
          ) : (
            listings.map((listing) => (
              <button
                key={listing.id}
                type="button"
                onClick={() => {
                  setEditing(listing);
                  setStatus("");
                }}
                className={`w-full text-left border-2 p-4 ${
                  editing?.id === listing.id
                    ? "border-accent bg-accent/10"
                    : "border-foreground bg-white"
                }`}
              >
                <span className="block font-bold">{listing.name}</span>
                <span className="font-mono text-[10px] uppercase text-muted-foreground">
                  {listing.category} · {listing.area}
                </span>
              </button>
            ))
          )}
        </aside>

        {editing && (
          <form onSubmit={onSubmit} className="border-2 border-foreground bg-white p-6 space-y-4">
            <h2 className="font-display text-4xl uppercase">{editing.name}</h2>
            <BusinessField label="Description">
              <textarea
                name="description"
                defaultValue={editing.description}
                rows={5}
                className={fieldClass}
              />
            </BusinessField>
            <BusinessField label="Opening hours summary">
              <input
                name="openingHours"
                defaultValue={editing.openingHours}
                className={fieldClass}
              />
            </BusinessField>
            <div className="grid md:grid-cols-3 gap-3">
              <BusinessField label="Website">
                <input name="website" defaultValue={editing.website} className={fieldClass} />
              </BusinessField>
              <BusinessField label="Phone">
                <input name="phone" defaultValue={editing.phone} className={fieldClass} />
              </BusinessField>
              <BusinessField label="Email">
                <input name="email" defaultValue={editing.email} className={fieldClass} />
              </BusinessField>
            </div>
            <div className="flex items-center gap-4">
              <button className="bg-foreground text-background px-6 py-3 font-bold uppercase tracking-widest text-xs">
                Save Changes
              </button>
              {status && <span className="text-sm font-bold">{status}</span>}
            </div>
          </form>
        )}
      </section>
    </PublicLayout>
  );
}

const fieldClass =
  "w-full bg-background border-2 border-foreground px-4 py-3 font-mono text-sm focus:outline-none";

function BusinessField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
