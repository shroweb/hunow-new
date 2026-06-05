import { createServerFn } from "@tanstack/react-start";

export const getNewsletterBuilder = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdmin } = await import("./auth.server");
  const { getNewsletterBuilderData } = await import("./db.server");
  await requireAdmin();
  return getNewsletterBuilderData();
});
