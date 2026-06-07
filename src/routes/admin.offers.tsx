import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import {
  AdminField,
  AdminFormPanel,
  AdminHeader,
  AdminStatus,
  AdminTable,
  adminBtn,
  adminBtnOutline,
  adminInput,
} from "@/components/admin/AdminLayout";
import { SeoFields } from "@/components/admin/SeoFields";
import { ValidationErrors } from "@/components/admin/ValidationErrors";
import { readSeo } from "@/components/admin/seo-utils";
import { setState, uid, useStore } from "@/lib/store";
import { upsertListingFn, upsertOfferFn, deleteOfferFn } from "@/lib/content.functions";
import type { Offer } from "@/types";

export const Route = createFileRoute("/admin/offers")({ component: AdminOffers });

function AdminOffers() {
  const offers = useStore((s) => s.offers);
  const listings = useStore((s) => s.listings);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const listingId = String(fd.get("listingId"));
    const business = listings.find((l) => l.id === listingId);
    const startDate = String(fd.get("startDate"));
    const endDate = String(fd.get("endDate"));
    const nextErrors = [
      !business ? "Offer must be attached to a listing." : undefined,
      startDate && endDate && endDate < startDate
        ? "Offer end date must be after start date."
        : undefined,
    ].filter(Boolean) as string[];
    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      return;
    }
    const v: Offer = {
      id: editing?.id ?? uid(),
      title: String(fd.get("title")),
      listingId,
      businessName: business?.name ?? String(fd.get("businessName") || ""),
      description: String(fd.get("description")),
      terms: String(fd.get("terms") || ""),
      code: String(fd.get("code") || "") || undefined,
      startDate,
      endDate,
      redemptionCount: editing?.redemptionCount ?? 0,
      category: String(fd.get("category") || "Other"),
      status: fd.get("status") as Offer["status"],
      seo: readSeo(fd),
    };
    const nextListings = listings.map((listing) => {
      if (listing.id === listingId && v.status === "active") {
        return { ...listing, activeOfferId: v.id };
      }
      if (editing && listing.activeOfferId === editing.id && listing.id !== listingId) {
        return { ...listing, activeOfferId: undefined };
      }
      if (listing.activeOfferId === v.id && v.status !== "active") {
        return { ...listing, activeOfferId: undefined };
      }
      return listing;
    });
    await upsertOfferFn({ data: v });
    await Promise.all(
      nextListings
        .filter(
          (listing) =>
            listings.find((current) => current.id === listing.id)?.activeOfferId !==
            listing.activeOfferId,
        )
        .map((listing) => upsertListingFn({ data: listing })),
    );
    setState(
      (s) => ({
        ...s,
        offers: editing ? s.offers.map((x) => (x.id === v.id ? v : x)) : [v, ...s.offers],
        listings: nextListings,
      }),
      { persist: false },
    );
    setEditing(null);
    setErrors([]);
    setShowForm(false);
  };

  const remove = async (id: string) => {
    if (confirm("Delete?")) {
      const nextListings = listings.map((l) =>
        l.activeOfferId === id ? { ...l, activeOfferId: undefined } : l,
      );
      await deleteOfferFn({ data: { id } });
      await Promise.all(
        nextListings
          .filter(
            (listing) =>
              listings.find((current) => current.id === listing.id)?.activeOfferId !==
              listing.activeOfferId,
          )
          .map((listing) => upsertListingFn({ data: listing })),
      );
      setState(
        (s) => ({
          ...s,
          offers: s.offers.filter((o) => o.id !== id),
          listings: nextListings,
        }),
        { persist: false },
      );
    }
  };
  return (
    <div>
      <AdminHeader
        title="Offers"
        subtitle={`${offers.length} offers`}
        action={
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditing(null);
                setErrors([]);
                setShowForm(true);
              }}
              className={adminBtn}
            >
              <Plus className="w-3 h-3" /> New Offer
            </button>
          </div>
        }
      />
      <div className="p-6 md:p-10">
        {showForm && (
          <AdminFormPanel title={editing ? "Edit Offer" : "New Offer"}>
            <ValidationErrors errors={errors} />
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="grid lg:grid-cols-[1fr_320px] gap-5">
                <div className="space-y-4">
                  <AdminField label="Offer title">
                    <input
                      name="title"
                      defaultValue={editing?.title}
                      required
                      placeholder="Offer title"
                      className={adminInput}
                    />
                  </AdminField>
                  <AdminField label="Description">
                    <textarea
                      name="description"
                      defaultValue={editing?.description}
                      required
                      rows={4}
                      placeholder="Description"
                      className={adminInput}
                    />
                  </AdminField>
                  <AdminField label="Terms">
                    <textarea
                      name="terms"
                      defaultValue={editing?.terms}
                      rows={3}
                      placeholder="Terms & conditions"
                      className={adminInput}
                    />
                  </AdminField>
                </div>
                <div className="space-y-4">
                  <AdminField label="Business">
                    <select
                      name="listingId"
                      defaultValue={editing?.listingId}
                      required
                      className={adminInput}
                    >
                      <option value="">Select business</option>
                      {listings.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  </AdminField>
                  <AdminField label="Category">
                    <input
                      name="category"
                      defaultValue={editing?.category ?? "Food"}
                      placeholder="Category"
                      className={adminInput}
                    />
                  </AdminField>
                  <AdminField label="Status">
                    <select
                      name="status"
                      defaultValue={editing?.status ?? "active"}
                      className={adminInput}
                    >
                      <option value="pending">Pending review</option>
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </AdminField>
                  <div className="grid grid-cols-2 gap-3">
                    <AdminField label="Starts">
                      <input
                        name="startDate"
                        type="date"
                        defaultValue={editing?.startDate}
                        required
                        className={adminInput}
                      />
                    </AdminField>
                    <AdminField label="Ends">
                      <input
                        name="endDate"
                        type="date"
                        defaultValue={editing?.endDate}
                        required
                        className={adminInput}
                      />
                    </AdminField>
                  </div>
                </div>
              </div>
              <SeoFields
                defaultValue={editing?.seo}
                fallbackTitle={editing?.title}
                fallbackDescription={editing?.description}
              />
              <div className="flex gap-3 pt-2">
                <button className={adminBtn}>{editing ? "Save Offer" : "Create Offer"}</button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditing(null);
                    setErrors([]);
                  }}
                  className={adminBtnOutline}
                >
                  Cancel
                </button>
              </div>
            </form>
          </AdminFormPanel>
        )}
        <AdminTable
          headers={["Offer", "Business", "Ends", "Status", "Actions"]}
          rows={[...offers].sort(sortOffersForAdmin).map((o) => [
            <div>
              <span className="font-bold">{o.title}</span>
              {o.submittedByUserId && (
                <span className="mt-1 block font-mono text-[10px] uppercase text-muted-foreground">
                  Owner submitted
                </span>
              )}
            </div>,
            o.businessName,
            <span className="font-mono text-xs">{o.endDate}</span>,
            <AdminStatus status={o.status} />,
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditing(o);
                  setShowForm(true);
                }}
                className="text-[10px] font-bold uppercase underline"
              >
                Edit
              </button>
              <button
                onClick={() => remove(o.id)}
                className="text-[10px] font-bold uppercase text-red-600 underline"
              >
                Delete
              </button>
            </div>,
          ])}
        />
      </div>
    </div>
  );
}

function sortOffersForAdmin(a: Offer, b: Offer) {
  const rank = { pending: 0, active: 1, expired: 2, rejected: 3 } satisfies Record<
    Offer["status"],
    number
  >;
  return rank[a.status] - rank[b.status] || b.endDate.localeCompare(a.endDate);
}
