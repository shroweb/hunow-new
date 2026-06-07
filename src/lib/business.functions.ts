import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const claimListing = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      listingId: z.string().min(1),
      message: z.string().max(1000).optional(),
      proofUrl: z.string().max(500).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { currentUser } = await import("./auth.server");
    const { createListingClaim } = await import("./db.server");
    const user = await currentUser();
    if (!user) throw new Error("Sign in to claim this listing.");
    const result = await createListingClaim({
      listingId: data.listingId,
      userId: user.id,
      message: data.message ?? "",
      proofUrl: data.proofUrl ?? "",
    });
    void import("./email.server").then(({ sendAdminAlert }) =>
      sendAdminAlert(
        "New listing claim",
        `User: ${user.name} (${user.email})\nListing ID: ${data.listingId}\nProof: ${data.proofUrl || "(none)"}\nMessage: ${data.message ?? "(none)"}`,
      ),
    );
    return result;
  });

export const getAdminListingClaims = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdmin } = await import("./auth.server");
  const { getListingClaims } = await import("./db.server");
  await requireAdmin();
  return getListingClaims("all");
});

export const moderateAdminListingClaim = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      claimId: z.string().min(1),
      action: z.enum(["approve", "reject"]),
      adminNote: z.string().max(1000).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    const { moderateListingClaim } = await import("./db.server");
    await requireAdmin();
    return moderateListingClaim(data.claimId, data.action, data.adminNote ?? "");
  });

export const getBusinessListings = createServerFn({ method: "GET" }).handler(async () => {
  const { currentUser } = await import("./auth.server");
  const { getOwnedListings } = await import("./db.server");
  const user = await currentUser();
  if (!user) return [];
  return getOwnedListings(user.id);
});

export const getBusinessOffers = createServerFn({ method: "GET" }).handler(async () => {
  const { currentUser } = await import("./auth.server");
  const { getOwnedOffers } = await import("./db.server");
  const user = await currentUser();
  if (!user) return [];
  return getOwnedOffers(user.id);
});

export const updateBusinessListing = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      listingId: z.string().min(1),
      description: z.string().min(1),
      openingHours: z.string(),
      website: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { currentUser } = await import("./auth.server");
    const { updateOwnedListing } = await import("./db.server");
    const user = await currentUser();
    if (!user) throw new Error("Sign in to update this listing.");
    return updateOwnedListing(user.id, data.listingId, {
      description: data.description,
      openingHours: data.openingHours,
      website: data.website || undefined,
      phone: data.phone || undefined,
      email: data.email || undefined,
    });
  });

export const upsertBusinessOffer = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string().optional(),
      listingId: z.string().min(1),
      title: z.string().min(1).max(120),
      description: z.string().min(1).max(700),
      terms: z.string().max(1000).optional(),
      code: z.string().max(80).optional(),
      startDate: z.string().min(1),
      endDate: z.string().min(1),
      category: z.string().min(1).max(80),
    }),
  )
  .handler(async ({ data }) => {
    const { currentUser } = await import("./auth.server");
    const { getOwnedListings, getOwnedOffers, upsertOffer } = await import("./db.server");
    const user = await currentUser();
    if (!user) throw new Error("Sign in to manage offers.");

    const ownedListings = await getOwnedListings(user.id);
    const listing = ownedListings.find((item) => item.id === data.listingId);
    if (!listing) throw new Error("Listing not found or not owned by this account.");

    if (data.endDate < data.startDate) {
      throw new Error("Offer end date must be after start date.");
    }

    const existing = data.id
      ? (await getOwnedOffers(user.id)).find((offer) => offer.id === data.id)
      : undefined;
    if (data.id && !existing) throw new Error("Offer not found or not owned by this account.");

    const offer = {
      id: existing?.id ?? crypto.randomUUID(),
      title: data.title.trim(),
      listingId: listing.id,
      businessName: listing.name,
      description: data.description.trim(),
      terms: data.terms?.trim() ?? "",
      code: data.code?.trim() || undefined,
      startDate: data.startDate,
      endDate: data.endDate,
      redemptionCount: existing?.redemptionCount ?? 0,
      category: data.category.trim(),
      status: "pending" as const,
      isFeatured: existing?.isFeatured ?? false,
      submittedByUserId: user.id,
      adminNote: "",
      seo: existing?.seo,
    };

    await upsertOffer(offer);
    void import("./email.server").then(({ sendAdminAlert }) =>
      sendAdminAlert(
        "Business offer pending review",
        `User: ${user.name} (${user.email})\nBusiness: ${listing.name}\nOffer: ${offer.title}\nDates: ${offer.startDate} to ${offer.endDate}`,
      ),
    );
    return offer;
  });

export const getListingUpdatesForOwner = createServerFn({ method: "GET" })
  .inputValidator(z.object({ listingId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { currentUser } = await import("./auth.server");
    const { getOwnedListings, getListingUpdates } = await import("./db.server");
    const user = await currentUser();
    if (!user) throw new Error("Sign in to view updates.");
    const owned = await getOwnedListings(user.id);
    if (!owned.find((l) => l.id === data.listingId)) throw new Error("Listing not found.");
    return getListingUpdates(data.listingId);
  });

export const postListingUpdateFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ listingId: z.string().min(1), body: z.string().min(1).max(500) }))
  .handler(async ({ data }) => {
    const { currentUser } = await import("./auth.server");
    const { getOwnedListings, postListingUpdate } = await import("./db.server");
    const user = await currentUser();
    if (!user) throw new Error("Sign in to post an update.");
    const owned = await getOwnedListings(user.id);
    if (!owned.find((l) => l.id === data.listingId)) throw new Error("Listing not found.");
    const id = crypto.randomUUID();
    await postListingUpdate(id, data.listingId, user.id, data.body);
    return { ok: true, id };
  });

export const deleteListingUpdateFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ updateId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { currentUser } = await import("./auth.server");
    const { deleteListingUpdate } = await import("./db.server");
    const user = await currentUser();
    if (!user) throw new Error("Sign in to delete an update.");
    await deleteListingUpdate(data.updateId, user.id);
    return { ok: true };
  });

export const getListingReviewsForOwner = createServerFn({ method: "GET" })
  .inputValidator(z.object({ listingId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { currentUser } = await import("./auth.server");
    const { getOwnedListings } = await import("./db.server");
    const { getListingReviewsAdmin } = await import("./db.server.review");
    const user = await currentUser();
    if (!user) throw new Error("Sign in to view reviews.");
    const owned = await getOwnedListings(user.id);
    if (!owned.find((l) => l.id === data.listingId)) throw new Error("Listing not found.");
    return getListingReviewsAdmin(data.listingId);
  });
