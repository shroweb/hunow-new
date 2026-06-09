import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const signUpUser = createServerFn({ method: "POST" })
  .inputValidator(
    credentialsSchema.extend({
      name: z.string().min(2),
    }),
  )
  .handler(async ({ data }) => {
    const { createAccount } = await import("./auth.server");
    return createAccount(data);
  });

export const signInUser = createServerFn({ method: "POST" })
  .inputValidator(credentialsSchema)
  .handler(async ({ data }) => {
    const { signIn } = await import("./auth.server");
    return signIn(data);
  });

export const signOutUser = createServerFn({ method: "POST" }).handler(async () => {
  const { signOut } = await import("./auth.server");
  await signOut();
  return { ok: true };
});

export const getCurrentUser = createServerFn({ method: "GET" }).handler(async () => {
  const { currentUser } = await import("./auth.server");
  return currentUser();
});

export const requestPasswordResetFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string().email() }))
  .handler(async ({ data }) => {
    const { requestPasswordReset } = await import("./auth.server");
    return requestPasswordReset(data.email);
  });

export const resetPasswordFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string().min(1), password: z.string().min(8) }))
  .handler(async ({ data }) => {
    const { resetPassword } = await import("./auth.server");
    return resetPassword(data.token, data.password);
  });

export const getAdminUsers = createServerFn({ method: "GET" }).handler(async () => {
  const { listUsersForAdmin } = await import("./auth.server");
  return listUsersForAdmin();
});

export const updateAdminUserRole = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      userId: z.string().min(1),
      role: z.enum(["user", "admin"]),
    }),
  )
  .handler(async ({ data }) => {
    const { updateUserRoleForAdmin } = await import("./auth.server");
    return updateUserRoleForAdmin(data);
  });

export const updateAdminUserAppRole = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      userId: z.string().min(1),
      appRole: z.enum(["customer", "business"]),
    }),
  )
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    const { getPool } = await import("./db.server");
    await requireAdmin();
    const pool = getPool();
    const result = await pool.query<{ id: string; app_role: string }>(
      `update users set app_role = $2, updated_at = now() where id = $1 returning id, app_role`,
      [data.userId, data.appRole],
    );
    if (!result.rows[0]) throw new Error("User not found.");
    return { id: result.rows[0].id, appRole: result.rows[0].app_role };
  });

export const updateProfileFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      name: z.string().min(2).optional(),
      avatarUrl: z.string().nullable().optional(),
      bio: z.string().max(300).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { currentUser, updateProfile } = await import("./auth.server");
    const user = await currentUser();
    if (!user) throw new Error("Not signed in.");
    await updateProfile(user.id, data);
    return { ok: true };
  });

export const uploadAvatarFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({ fileName: z.string().min(1), dataUrl: z.string().startsWith("data:image/") }),
  )
  .handler(async ({ data }) => {
    const { currentUser, updateProfile } = await import("./auth.server");
    const user = await currentUser();
    if (!user) throw new Error("Sign in to upload an avatar.");

    const match = data.dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) throw new Error("Unsupported image.");
    const mime = match[1];
    const ext = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"].includes(
      data.fileName.slice(data.fileName.lastIndexOf(".")).toLowerCase(),
    )
      ? data.fileName.slice(data.fileName.lastIndexOf(".")).toLowerCase()
      : ".jpg";
    const id = `avatars/${user.id}-${Date.now()}${ext}`;
    const buffer = Buffer.from(match[2], "base64");

    let url: string;
    if (process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import("@vercel/blob");
      const blob = await put(id, buffer, {
        access: "public",
        contentType: mime,
        addRandomSuffix: false,
      });
      url = blob.url;
    } else if (process.env.VERCEL) {
      throw new Error("Image uploads are not configured. Connect a Blob store.");
    } else {
      const { mkdir, writeFile } = await import("node:fs/promises");
      const { resolve } = await import("node:path");
      const dir = resolve(process.cwd(), "public/uploads/avatars");
      await mkdir(dir, { recursive: true });
      await writeFile(resolve(dir, `${user.id}-${Date.now()}${ext}`), buffer);
      url = `/uploads/avatars/${user.id}-${Date.now()}${ext}`;
    }

    await updateProfile(user.id, { avatarUrl: url });
    return { ok: true, url };
  });

export const updatePasswordFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(8),
    }),
  )
  .handler(async ({ data }) => {
    const { currentUser, updatePassword } = await import("./auth.server");
    const user = await currentUser();
    if (!user) throw new Error("Not signed in.");
    await updatePassword(user.id, data.currentPassword, data.newPassword);
    return { ok: true };
  });

export const deleteAccountFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ password: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { currentUser, deleteAccount } = await import("./auth.server");
    const user = await currentUser();
    if (!user) throw new Error("Not signed in.");
    await deleteAccount(user.id, data.password);
    return { ok: true };
  });

export const getPublicProfileFn = createServerFn({ method: "GET" })
  .inputValidator(z.object({ userId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { getPublicProfile } = await import("./auth.server");
    return getPublicProfile(data.userId);
  });

export const getNewsletterPrefsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { currentUser, getUserNewsletterPrefs } = await import("./auth.server");
  const user = await currentUser();
  if (!user) return { subscribed: false, segments: [] as string[] };
  return getUserNewsletterPrefs(user.email);
});

export const updateNewsletterPrefsFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      segments: z.array(z.enum(["events", "offers", "businesses"])),
    }),
  )
  .handler(async ({ data }) => {
    const { currentUser, updateUserNewsletterPrefs } = await import("./auth.server");
    const user = await currentUser();
    if (!user) throw new Error("Not signed in.");
    await updateUserNewsletterPrefs(user.email, data.segments);
    return { ok: true };
  });

export const getActivityFeedFn = createServerFn({ method: "GET" }).handler(async () => {
  const { currentUser } = await import("./auth.server");
  const { getPool } = await import("./db.server");
  const user = await currentUser();
  if (!user) return [];

  const pool = getPool();
  const [reviewRows, savedRows] = await Promise.all([
    pool.query<{
      id: string;
      date: string;
      label: string | null;
      slug: string | null;
      rating: number;
    }>(
      `select r.id, r.created_at::text as date,
              l.data->>'name' as label,
              l.data->>'slug' as slug,
              r.rating
       from reviews r
       left join listings l on l.id = r.listing_id
       where r.user_id = $1
       order by r.created_at desc limit 15`,
      [user.id],
    ),
    pool.query<{
      id: string;
      date: string;
      label: string;
      slug: string;
      kind: string;
      subcategory: string | null;
    }>(
      `select id, saved_at::text as date, title as label, slug, kind, subcategory
       from saved_items where user_id = $1
       order by saved_at desc limit 15`,
      [user.id],
    ),
  ]);

  type FeedItem = {
    type: "review" | "saved";
    id: string;
    date: string;
    label: string;
    href: string;
    meta: string;
  };

  const reviews: FeedItem[] = reviewRows.rows.map((r) => ({
    type: "review",
    id: r.id,
    date: r.date,
    label: r.label ?? "a place",
    href: r.slug ? `/places/${r.slug}` : "/listings",
    meta: "★".repeat(r.rating),
  }));

  const saved: FeedItem[] = savedRows.rows.map((r) => ({
    type: "saved",
    id: r.id,
    date: r.date,
    label: r.label,
    href:
      r.kind === "event"
        ? `/events/${r.slug}`
        : r.kind === "place"
          ? `/places/${r.slug}`
          : r.kind === "offer"
            ? "/offers"
            : `/stories/${r.slug}`,
    meta: r.kind,
  }));

  return [...reviews, ...saved]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 25);
});

export const getLoyaltyCardFn = createServerFn({ method: "GET" }).handler(async () => {
  const { currentUser } = await import("./auth.server");
  const user = await currentUser();
  if (!user) throw new Error("Not authenticated");
  const { getUserLoyaltyData, createLoyaltyCard } = await import("./app-auth.server");
  const data = await getUserLoyaltyData(user.id);
  if (!data.card_token) {
    await createLoyaltyCard(user.id);
    const fresh = await getUserLoyaltyData(user.id);
    return { ...fresh, name: user.name };
  }
  return { ...data, name: user.name };
});

export const getMyRedemptionsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { currentUser } = await import("./auth.server");
  const user = await currentUser();
  if (!user) throw new Error("Not authenticated");
  const { getPool } = await import("./db.server");
  const pool = getPool();
  const result = await pool.query<{
    id: string;
    offer_id: string;
    offer_title: string | null;
    listing_name: string | null;
    redeemed_at: string;
    method: string;
    points: number;
  }>(
    `select r.id, r.offer_id,
            o.data->>'title'                          as offer_title,
            l.data->>'name'                           as listing_name,
            r.redeemed_at,
            coalesce(r.method::text, 'qr')            as method,
            $2::int                                   as points
     from app_redemptions r
     join loyalty_cards c on c.id = r.card_id
     left join offers   o on o.id  = r.offer_id
     left join listings l on l.id  = r.listing_id
     where c.user_id = $1
     order by r.redeemed_at desc
     limit 30`,
    [user.id, 35],
  );
  return result.rows;
});
