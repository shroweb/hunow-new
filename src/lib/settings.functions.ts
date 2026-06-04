import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { getSiteSettings } = await import("./db.server");
  return getSiteSettings();
});

export const saveSetting = createServerFn({ method: "POST" })
  .inputValidator(z.object({ key: z.string().min(1), value: z.string() }))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    const { setSiteSetting } = await import("./db.server");
    await requireAdmin();
    await setSiteSetting(data.key, data.value);
    return { ok: true };
  });
