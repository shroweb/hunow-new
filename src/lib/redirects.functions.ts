import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getRedirects = createServerFn({ method: "GET" }).handler(async () => {
  const { getAllRedirects } = await import("./db.server");
  return getAllRedirects();
});

export const saveRedirect = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string(),
      from: z.string().min(1),
      to: z.string().min(1),
      permanent: z.boolean(),
    }),
  )
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    const { upsertRedirect } = await import("./db.server");
    await requireAdmin();
    await upsertRedirect(data.id, data.from, data.to, data.permanent);
    return { ok: true };
  });

export const removeRedirect = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    const { deleteRedirect } = await import("./db.server");
    await requireAdmin();
    await deleteRedirect(data.id);
    return { ok: true };
  });

export const resolveRedirect = createServerFn({ method: "GET" })
  .inputValidator(z.object({ path: z.string() }))
  .handler(async ({ data }) => {
    const { checkRedirect } = await import("./db.server");
    return checkRedirect(data.path);
  });
