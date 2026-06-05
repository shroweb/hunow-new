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
