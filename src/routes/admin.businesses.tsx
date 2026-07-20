import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Building2, Plus, Check } from "lucide-react";
import { AdminHeader, adminBtn, adminInput, AdminField } from "@/components/admin/AdminLayout";
import { setState, slugify, uid, useStore } from "@/lib/store";
import { upsertListingFn, upsertOfferFn, createBusinessOwnerFn } from "@/lib/content.functions";
import type { Listing, Offer } from "@/types";

export const Route = createFileRoute("/admin/businesses")({ component: AdminBusinesses });

const LISTING_CATEGORIES = ["Eat", "Drink", "Things To Do", "Shops", "Attractions"];

function AdminBusinesses() {
  const listings = useStore((s) => s.listings);
  const offers = useStore((s) => s.offers);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Businesses = listings that have an ownerUserId set
  const businesses = listings.filter((l) => (l as Listing & { ownerUserId?: string }).ownerUserId);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const fd = new FormData(e.currentTarget);

    const name = String(fd.get("name") || "").trim();
    const category = String(fd.get("category") || "").trim();
    const address = String(fd.get("address") || "").trim();
    const ownerEmail = String(fd.get("ownerEmail") || "").trim();
    const ownerName = String(fd.get("ownerName") || "").trim();
    const offerTitle = String(fd.get("offerTitle") || "").trim();
    const offerDesc = String(fd.get("offerDescription") || "").trim();
    const offerEndDate = String(fd.get("offerEndDate") || "").trim();

    if (!name) {
      setError("Business name is required.");
      return;
    }
    if (!category) {
      setError("Category is required.");
      return;
    }
    if (!ownerEmail) {
      setError("Owner email is required.");
      return;
    }
    if (!ownerName) {
      setError("Owner name is required.");
      return;
    }

    setSaving(true);
    try {
      // 1. Create the listing
      const listing: Listing = {
        id: uid(),
        name,
        slug: slugify(name),
        description: "",
        category,
        area: "City Centre",
        address: address || "",
        openingHours: "",
        featuredImage: "photo-1568901346375-23c9450c58cd",
        isFeatured: false,
        isHiddenGem: false,
        isIndependent: true,
        isVerified: false,
      };
      await upsertListingFn({ data: listing });
      setState((s) => ({ ...s, listings: [listing, ...s.listings] }), { persist: false });

      // 2. Create or find the owner account, then assign (also promotes to business role)
      const assignResult = await createBusinessOwnerFn({
        data: { listingId: listing.id, email: ownerEmail, name: ownerName },
      });
      setState(
        (s) => ({
          ...s,
          listings: s.listings.map((l) =>
            l.id === listing.id ? { ...l, ownerUserId: ownerEmail } : l,
          ),
        }),
        { persist: false },
      );

      // 3. Optionally create an offer
      let offerCreated = false;
      if (offerTitle && offerEndDate) {
        const offer: Offer = {
          id: uid(),
          title: offerTitle,
          listingId: listing.id,
          businessName: name,
          description: offerDesc || offerTitle,
          terms: "",
          startDate: new Date().toISOString().slice(0, 10),
          endDate: offerEndDate,
          redemptionCount: 0,
          category,
          status: "active",
        };
        await upsertOfferFn({ data: offer });
        setState((s) => ({ ...s, offers: [offer, ...s.offers] }), { persist: false });
        offerCreated = true;
      }

      setSuccess(
        `✓ ${name} added and ${assignResult.userName} set as owner` +
          (assignResult.created ? " · account created, password-set email sent" : "") +
          (offerCreated ? " · offer created" : "") +
          ". They can now log in and use /business/listings.",
      );
      e.currentTarget.reset();
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <AdminHeader
        title="Businesses"
        subtitle={`${businesses.length} with owner assigned`}
        action={
          <button
            onClick={() => {
              setShowForm((v) => !v);
              setError("");
              setSuccess("");
            }}
            className={adminBtn}
          >
            <Plus className="w-3 h-3" /> Add Business
          </button>
        }
      />

      <div className="p-6 md:p-10 space-y-8">
        {/* Quick-add form */}
        {showForm && (
          <form onSubmit={onSubmit} className="border-2 border-foreground p-6 space-y-5 max-w-xl">
            <div className="font-bold text-sm uppercase tracking-widest">New Business</div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <AdminField label="Business name *">
                  <input
                    name="name"
                    required
                    className={adminInput}
                    placeholder="e.g. The Minerva"
                  />
                </AdminField>
              </div>

              <AdminField label="Category *">
                <select name="category" required className={adminInput} defaultValue="">
                  <option value="" disabled>
                    Select…
                  </option>
                  {LISTING_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </AdminField>

              <AdminField label="Address">
                <input
                  name="address"
                  className={adminInput}
                  placeholder="e.g. 1 Nelson St, HU1 1XE"
                />
              </AdminField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <AdminField label="Owner name *">
                <input
                  name="ownerName"
                  required
                  className={adminInput}
                  placeholder="e.g. Jane Smith"
                />
              </AdminField>
              <AdminField
                label="Owner email *"
                hint="Account created automatically if they don't have one"
              >
                <input
                  name="ownerEmail"
                  type="email"
                  required
                  className={adminInput}
                  placeholder="owner@business.com"
                />
              </AdminField>
            </div>

            {/* Optional offer */}
            <div className="border-t border-foreground/10 pt-4 space-y-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Optional — create an offer at the same time
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <AdminField label="Offer title">
                    <input
                      name="offerTitle"
                      className={adminInput}
                      placeholder="e.g. 10% off for HU NOW readers"
                    />
                  </AdminField>
                </div>
                <AdminField label="Description">
                  <textarea
                    name="offerDescription"
                    rows={2}
                    className={adminInput}
                    placeholder="Short description…"
                  />
                </AdminField>
                <AdminField label="Expires">
                  <input name="offerEndDate" type="date" className={adminInput} />
                </AdminField>
              </div>
            </div>

            {error && <p className="text-red-600 text-xs font-bold">{error}</p>}

            <div className="flex gap-3">
              <button type="submit" disabled={saving} className={`${adminBtn} disabled:opacity-50`}>
                {saving ? "Saving…" : "Add Business"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border-2 border-foreground px-4 py-2 text-[10px] font-bold uppercase hover:bg-foreground/5"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Success banner */}
        {success && (
          <div className="flex items-start gap-3 border-2 border-green-600 bg-green-50 text-green-800 p-4 text-sm max-w-xl">
            <Check className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Businesses table */}
        {businesses.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No businesses with owners yet. Use "Add Business" above, or go to{" "}
            <Link to="/admin/listings" className="underline">
              Listings
            </Link>{" "}
            and click "Assign owner" on any listing.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-foreground">
                  <th className="text-left py-2 pr-6 text-[10px] font-mono uppercase tracking-widest">
                    Business
                  </th>
                  <th className="text-left py-2 pr-6 text-[10px] font-mono uppercase tracking-widest">
                    Category
                  </th>
                  <th className="text-left py-2 pr-6 text-[10px] font-mono uppercase tracking-widest">
                    Active offer
                  </th>
                  <th className="text-left py-2 pr-6 text-[10px] font-mono uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {businesses.map((l) => {
                  const activeOffer = offers.find(
                    (o) => o.listingId === l.id && o.status === "active",
                  );
                  return (
                    <tr key={l.id} className="border-b border-foreground/10 hover:bg-foreground/3">
                      <td className="py-3 pr-6">
                        <div className="font-bold">{l.name}</div>
                        {l.address && (
                          <div className="text-[11px] text-muted-foreground">{l.address}</div>
                        )}
                      </td>
                      <td className="py-3 pr-6 text-[11px]">{l.category}</td>
                      <td className="py-3 pr-6">
                        {activeOffer ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700">
                            <Check className="w-3 h-3" /> {activeOffer.title}
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">None</span>
                        )}
                      </td>
                      <td className="py-3 pr-6">
                        <div className="flex gap-3">
                          <Link
                            to="/places/$slug"
                            params={{ slug: l.slug }}
                            className="text-[10px] font-bold uppercase underline"
                          >
                            View
                          </Link>
                          <Link
                            to="/admin/listings"
                            className="text-[10px] font-bold uppercase underline"
                          >
                            Edit listing
                          </Link>
                          <Link
                            to="/admin/offers"
                            className="text-[10px] font-bold uppercase underline"
                          >
                            {activeOffer ? "Edit offer" : "Add offer"}
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
