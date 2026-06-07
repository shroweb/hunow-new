import { createServerFn } from "@tanstack/react-start";

export const resetStoreToEmpty = createServerFn({ method: "POST" }).handler(async () => {
  const { requireAdmin } = await import("./auth.server");
  const { resetDatabaseToEmpty } = await import("./db.server");
  await requireAdmin();
  await resetDatabaseToEmpty();
  return { ok: true };
});
