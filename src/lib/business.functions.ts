import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const claimListing = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      listingId: z.string().min(1),
      message: z.string().max(1000).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { currentUser } = await import("./auth.server");
    const { createListingClaim } = await import("./db.server");
    const user = await currentUser();
    if (!user) throw new Error("Sign in to claim this listing.");
    return createListingClaim({
      listingId: data.listingId,
      userId: user.id,
      message: data.message ?? "",
    });
  });

export const getAdminListingClaims = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdmin } = await import("./auth.server");
  const { getListingClaims } = await import("./db.server");
  await requireAdmin();
  return getListingClaims("pending");
});

export const moderateAdminListingClaim = createServerFn({ method: "POST" })
  .inputValidator(z.object({ claimId: z.string().min(1), action: z.enum(["approve", "reject"]) }))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    const { moderateListingClaim } = await import("./db.server");
    await requireAdmin();
    return moderateListingClaim(data.claimId, data.action);
  });

export const getBusinessListings = createServerFn({ method: "GET" }).handler(async () => {
  const { currentUser } = await import("./auth.server");
  const { getOwnedListings } = await import("./db.server");
  const user = await currentUser();
  if (!user) return [];
  return getOwnedListings(user.id);
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
