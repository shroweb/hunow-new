import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export interface Review {
  id: string;
  listingId: string;
  userId: string;
  userName: string;
  rating: number;
  body: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export const getListingReviews = createServerFn({ method: "GET" })
  .inputValidator(z.object({ listingId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { getPool, ensureSchemaOnce } = await import("./db.server.review");
    await ensureSchemaOnce();
    const result = await getPool().query<{
      id: string;
      listing_id: string;
      user_id: string;
      user_name: string;
      rating: number;
      body: string | null;
      created_at: Date;
    }>(
      "select id, listing_id, user_id, user_name, rating, body, status, created_at from reviews where listing_id = $1 and status = 'approved' order by created_at desc",
      [data.listingId],
    );
    return result.rows.map((r) => ({
      id: r.id,
      listingId: r.listing_id,
      userId: r.user_id,
      userName: r.user_name,
      rating: r.rating,
      body: r.body,
      status: (r as unknown as { status: Review["status"] }).status ?? "approved",
      createdAt: r.created_at.toISOString(),
    })) as Review[];
  });

export const submitReview = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      listingId: z.string().min(1),
      rating: z.number().int().min(1).max(5),
      body: z.string().max(1000).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { currentUser } = await import("./auth.server");
    const user = await currentUser();
    if (!user) throw new Error("Sign in to leave a review.");
    const { getPool, ensureSchemaOnce } = await import("./db.server.review");
    await ensureSchemaOnce();
    const id = crypto.randomUUID();
    await getPool().query(
      `insert into reviews (id, listing_id, user_id, user_name, rating, body, status)
       values ($1, $2, $3, $4, $5, $6, 'pending')
       on conflict (listing_id, user_id) do update
         set rating = excluded.rating, body = excluded.body, status = 'pending'`,
      [id, data.listingId, user.id, user.name, data.rating, data.body ?? null],
    );
    return { ok: true };
  });

export const getPendingReviews = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdmin } = await import("./auth.server");
  const { getPool, ensureSchemaOnce } = await import("./db.server.review");
  await requireAdmin();
  await ensureSchemaOnce();
  const result = await getPool().query<{
    id: string; listing_id: string; user_id: string; user_name: string;
    rating: number; body: string | null; status: string; created_at: Date;
  }>("select id, listing_id, user_id, user_name, rating, body, status, created_at from reviews where status = 'pending' order by created_at desc");
  return result.rows.map((r) => ({
    id: r.id, listingId: r.listing_id, userId: r.user_id, userName: r.user_name,
    rating: r.rating, body: r.body, status: r.status as Review["status"],
    createdAt: r.created_at.toISOString(),
  })) as Review[];
});

export const moderateReview = createServerFn({ method: "POST" })
  .inputValidator(z.object({ reviewId: z.string(), action: z.enum(["approve", "reject"]) }))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    const { getPool, ensureSchemaOnce } = await import("./db.server.review");
    await requireAdmin();
    await ensureSchemaOnce();
    const status = data.action === "approve" ? "approved" : "rejected";
    await getPool().query("update reviews set status = $1 where id = $2", [status, data.reviewId]);
    return { ok: true };
  });

export const deleteReview = createServerFn({ method: "POST" })
  .inputValidator(z.object({ reviewId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { currentUser } = await import("./auth.server");
    const user = await currentUser();
    if (!user) throw new Error("Not signed in.");
    const { getPool, ensureSchemaOnce } = await import("./db.server.review");
    await ensureSchemaOnce();
    await getPool().query(
      "delete from reviews where id = $1 and (user_id = $2 or $3 = 'admin')",
      [data.reviewId, user.id, user.role],
    );
    return { ok: true };
  });
