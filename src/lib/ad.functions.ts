import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const trackAdEvent = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      adId: z.string().min(1),
      eventType: z.enum(["impression", "click"]),
    }),
  )
  .handler(async ({ data }) => {
    const { recordAdEvent } = await import("./db.server");
    const ad = await recordAdEvent(data.adId, data.eventType);
    return { ok: true, ad };
  });
