import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string().email() }))
  .handler(async ({ data }) => {
    const { addNewsletterSubscriber } = await import("./db.server");
    await addNewsletterSubscriber(data.email);
    return { ok: true };
  });

export const submitForReview = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string().min(1),
      type: z.enum(["event", "listing"]),
      title: z.string().min(1),
      contactName: z.string().min(1),
      contactEmail: z.string().email(),
      data: z.record(z.string()),
      status: z.literal("pending"),
      createdAt: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const { addPublicSubmission } = await import("./db.server");
    await addPublicSubmission(data);
    return { ok: true };
  });

export const redeemOffer = createServerFn({ method: "POST" })
  .inputValidator(z.object({ offerId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { incrementOfferRedemption } = await import("./db.server");
    const offer = await incrementOfferRedemption(data.offerId);
    return { ok: true, offer };
  });
