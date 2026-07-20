import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      email: z.string().email(),
      segments: z.array(z.enum(["events", "offers", "businesses"])).default([]),
    }),
  )
  .handler(async ({ data }) => {
    const { checkRateLimit, getClientIp } = await import("./rate-limit.server");
    const { getRequest } = await import("@tanstack/start-server-core");
    const request = getRequest();
    const ip = request ? getClientIp(request) : "unknown";
    const allowed = await checkRateLimit(`newsletter:${ip}`, 10, 60 * 60);
    if (!allowed) throw new Error("Too many subscription attempts. Please try again later.");
    const { addNewsletterSubscriber } = await import("./db.server");
    await addNewsletterSubscriber(data.email, data.segments);
    return { ok: true };
  });

export const unsubscribeNewsletter = createServerFn({ method: "GET" })
  .inputValidator(z.object({ token: z.string().min(12) }))
  .handler(async ({ data }) => {
    const { unsubscribeNewsletterToken } = await import("./db.server");
    const email = await unsubscribeNewsletterToken(data.token);
    return { ok: Boolean(email), email };
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
    const { checkRateLimit } = await import("./rate-limit.server");
    const allowed = await checkRateLimit(`submit:${data.contactEmail}`, 5, 60 * 60);
    if (!allowed) throw new Error("Too many submissions. Please try again later.");
    const { addPublicSubmission } = await import("./db.server");
    await addPublicSubmission(data);
    void import("./email.server").then(({ sendAdminAlert }) =>
      sendAdminAlert(
        `New ${data.type} submission: ${data.title}`,
        `From: ${data.contactName} (${data.contactEmail})\nType: ${data.type}\nTitle: ${data.title}`,
      ),
    );
    return { ok: true };
  });

export const submitContact = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      name: z.string().min(1),
      email: z.string().email(),
      enquiryType: z.enum(["news-tip", "press-release", "general"]),
      subject: z.string().min(1),
      message: z.string().min(10),
    }),
  )
  .handler(async ({ data }) => {
    const { checkRateLimit, getClientIp } = await import("./rate-limit.server");
    const { getRequest } = await import("@tanstack/start-server-core");
    const request = getRequest();
    const ip = request ? getClientIp(request) : "unknown";
    const allowed = await checkRateLimit(`contact:${ip}`, 5, 60 * 60);
    if (!allowed) throw new Error("Too many contact submissions. Please try again later.");
    const { addPublicSubmission } = await import("./db.server");
    await addPublicSubmission({
      id: crypto.randomUUID(),
      type: "contact",
      title: `[${data.enquiryType}] ${data.subject}`,
      contactName: data.name,
      contactEmail: data.email,
      data: { enquiryType: data.enquiryType, subject: data.subject, message: data.message },
      status: "pending",
      createdAt: new Date().toISOString(),
    });
    void import("./email.server").then(({ sendAdminAlert }) =>
      sendAdminAlert(
        `Contact: ${data.subject}`,
        `From: ${data.name} (${data.email})\nType: ${data.enquiryType}\n\n${data.message}`,
      ),
    );
    return { ok: true };
  });

export const redeemOffer = createServerFn({ method: "POST" })
  .inputValidator(z.object({ offerId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { checkRateLimit, getClientIp } = await import("./rate-limit.server");
    const { getRequest } = await import("@tanstack/start-server-core");
    const request = getRequest();
    const ip = request ? getClientIp(request) : "unknown";
    const allowed = await checkRateLimit(`redeem:${ip}`, 10, 60 * 60);
    if (!allowed) throw new Error("Too many redemption attempts. Please try again later.");
    const { incrementOfferRedemption } = await import("./db.server");
    const offer = await incrementOfferRedemption(data.offerId);
    return { ok: true, offer };
  });
