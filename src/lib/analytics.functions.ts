import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const trackAnalyticsEvent = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      eventType: z.string().min(1).max(60),
      path: z.string().max(300).optional(),
      label: z.string().max(300).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { recordAnalyticsEvent } = await import("./db.server");
    return recordAnalyticsEvent(data);
  });

export const getAdminAnalytics = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdmin } = await import("./auth.server");
  const { getAnalyticsSummary } = await import("./db.server");
  await requireAdmin();
  return getAnalyticsSummary();
});
