import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import crypto from "node:crypto";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function uniqueSlug(base: string, table: "events" | "listings") {
  const { getPool } = await import("./db.server");
  const slug = slugify(base);
  for (let i = 0; i < 10; i++) {
    const candidate = i === 0 ? slug : `${slug}-${i}`;
    const existing = await getPool().query(
      `select 1 from ${table} where slug = $1 limit 1`,
      [candidate],
    );
    if (existing.rowCount === 0) return candidate;
  }
  return `${slug}-${Date.now()}`;
}

export const getAdminSubmissions = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdmin } = await import("./auth.server");
  const { getPool, ensureSchema } = await import("./db.server");
  await requireAdmin();
  await ensureSchema();
  const r = await getPool().query<{ data: unknown }>(
    "select data from submissions order by created_at desc",
  );
  return r.rows.map((row) => row.data) as import("@/types").Submission[];
});

export const approveAdminSubmission = createServerFn({ method: "POST" })
  .inputValidator(z.object({ submissionId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    const { getPool, ensureSchema } = await import("./db.server");
    await requireAdmin();
    await ensureSchema();

    const pool = getPool();
    const row = await pool.query<{ data: import("@/types").Submission }>(
      "select data from submissions where id = $1",
      [data.submissionId],
    );
    const submission = row.rows[0]?.data;
    if (!submission) throw new Error("Submission not found.");
    if (submission.status !== "pending") throw new Error("Already processed.");

    const d = submission.data;
    let created: { type: "event" | "listing"; id: string; slug: string } | null = null;

    if (submission.type === "event") {
      const title = d.title || submission.title;
      const slug = await uniqueSlug(title, "events");
      const id = crypto.randomUUID();
      const event = {
        id,
        title,
        slug,
        description: d.description || "Submitted event — add editorial details before publishing.",
        category: d.category || "Community",
        startDate: d.date || new Date().toISOString().slice(0, 10),
        startTime: d.time || "19:00",
        locationName: d.venue || "Venue to confirm",
        address: d.address || d.venue || "Address to confirm",
        price: d.price || "Free",
        isFree: !d.price || d.price.toLowerCase() === "free",
        ticketUrl: d.ticketUrl || undefined,
        featuredImage: "photo-1492684223066-81342ee5ff30",
        status: "draft" as const,
        isFeatured: false,
        isSponsored: false,
      };
      await pool.query("insert into events (id, data) values ($1, $2)", [
        id,
        JSON.stringify(event),
      ]);
      created = { type: "event", id, slug };
    } else if (submission.type === "listing") {
      const name = d.name || submission.title;
      const slug = await uniqueSlug(name, "listings");
      const id = crypto.randomUUID();
      const listing = {
        id,
        name,
        slug,
        description: d.description || "Submitted listing — add editorial details before publishing.",
        category: d.category || "Things To Do",
        area: d.area || "Hull",
        address: d.address || "Address to confirm",
        openingHours: d.openingHours || "Check with venue",
        website: d.website || undefined,
        phone: d.phone || undefined,
        email: d.email || undefined,
        featuredImage: "photo-1554118811-1e0d58224f24",
        isFeatured: false,
        isHiddenGem: false,
        isIndependent: true,
        isVerified: false,
      };
      await pool.query("insert into listings (id, data) values ($1, $2)", [
        id,
        JSON.stringify(listing),
      ]);
      created = { type: "listing", id, slug };
    }

    // Mark submission approved in DB
    const updated = { ...submission, status: "approved" as const };
    await pool.query("update submissions set data = $2 where id = $1", [
      data.submissionId,
      JSON.stringify(updated),
    ]);

    return { ok: true, created };
  });

export const rejectAdminSubmission = createServerFn({ method: "POST" })
  .inputValidator(z.object({ submissionId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    const { getPool, ensureSchema } = await import("./db.server");
    await requireAdmin();
    await ensureSchema();
    const pool = getPool();
    const row = await pool.query<{ data: import("@/types").Submission }>(
      "select data from submissions where id = $1",
      [data.submissionId],
    );
    const submission = row.rows[0]?.data;
    if (!submission) throw new Error("Submission not found.");
    const updated = { ...submission, status: "rejected" as const };
    await pool.query("update submissions set data = $2 where id = $1", [
      data.submissionId,
      JSON.stringify(updated),
    ]);
    return { ok: true };
  });
