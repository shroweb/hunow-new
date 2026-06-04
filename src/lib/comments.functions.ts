import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getComments = createServerFn({ method: "GET" })
  .inputValidator(z.object({ articleId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { getApprovedComments } = await import("./db.server");
    return getApprovedComments(data.articleId);
  });

export const submitComment = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      articleId: z.string().min(1),
      authorName: z.string().min(1).max(80),
      authorEmail: z.string().email(),
      body: z.string().min(3).max(2000),
    }),
  )
  .handler(async ({ data }) => {
    const { insertComment } = await import("./db.server");
    await insertComment({
      id: crypto.randomUUID(),
      articleId: data.articleId,
      authorName: data.authorName,
      authorEmail: data.authorEmail,
      body: data.body,
      approved: false,
      createdAt: new Date().toISOString(),
    });
    return { ok: true };
  });

export const adminGetAllComments = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdmin } = await import("./auth.server");
  const { getAllComments } = await import("./db.server");
  await requireAdmin();
  return getAllComments();
});

export const adminApproveComment = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string(), approved: z.boolean() }))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    const { setCommentApproved } = await import("./db.server");
    await requireAdmin();
    await setCommentApproved(data.id, data.approved);
    return { ok: true };
  });

export const adminDeleteComment = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    const { deleteComment } = await import("./db.server");
    await requireAdmin();
    await deleteComment(data.id);
    return { ok: true };
  });
