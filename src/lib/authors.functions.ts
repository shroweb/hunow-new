import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Author } from "./authors";

const authorSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  bio: z.string().default(""),
  role: z.string().default("Writer"),
  avatarUrl: z.string().optional(),
  locationNote: z.string().optional(),
  socialHandle: z.string().optional(),
});

export const getAuthorsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { getAuthors } = await import("./db.server");
  return getAuthors();
});

export const upsertAuthorFn = createServerFn({ method: "POST" })
  .inputValidator(authorSchema)
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    const { upsertAuthor } = await import("./db.server");
    await requireAdmin();
    return upsertAuthor(data as Author);
  });

export const deleteAuthorFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    const { deleteAuthor } = await import("./db.server");
    await requireAdmin();
    await deleteAuthor(data.id);
    return { ok: true };
  });
