import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/v1/me")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const { getAppUser, getUserLoyaltyData } = await import("@/lib/app-auth.server");
          const { ensureSchema } = await import("@/lib/db.server");
          await ensureSchema();

          const user = await getAppUser(request);
          if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

          const loyalty = await getUserLoyaltyData(user.id);

          let listingId: string | null = null;
          if (user.app_role === "business") {
            const pool = (await import("@/lib/db.server")).getPool();
            const lr = await pool.query<{ id: string }>(
              "select id from listings where data->>'ownerUserId' = $1 limit 1",
              [user.id],
            );
            listingId = lr.rows[0]?.id ?? null;
          }

          return Response.json({
            id: user.id,
            email: user.email,
            name: user.name,
            display_name: user.name,
            app_role: user.app_role,
            listing_id: listingId,
            ...loyalty,
          });
        } catch (err) {
          console.error("[app/me]", err);
          return Response.json({ error: "Server error" }, { status: 500 });
        }
      },
    },
  },
});
