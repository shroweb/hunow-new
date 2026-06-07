import { createServerFn } from "@tanstack/react-start";

export const resetStoreToEmpty = createServerFn({ method: "POST" }).handler(async () => {
  const { requireAdmin } = await import("./auth.server");
  const { resetDatabaseToEmpty } = await import("./db.server");
  await requireAdmin();
  await resetDatabaseToEmpty();
  return { ok: true };
});

export const exportAllDataFn = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdmin } = await import("./auth.server");
  const { getDatabaseStore } = await import("./db.server");
  const { getNewsletterSubscribers } = await import("./newsletter.functions");
  await requireAdmin();
  const [store, subscriberData] = await Promise.all([getDatabaseStore(), getNewsletterSubscribers()]);
  return {
    exportedAt: new Date().toISOString(),
    store,
    subscribers: subscriberData.subscribers,
  };
});
