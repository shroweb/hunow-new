import { createFileRoute } from "@tanstack/react-router";
import crypto from "node:crypto";

export const Route = createFileRoute("/api/v1/auth/register")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => null)) as {
          name?: string;
          email?: string;
          password?: string;
          app_role?: string;
        } | null;
        if (!body?.name || !body?.email || !body?.password) {
          return Response.json({ error: "name, email and password are required" }, { status: 400 });
        }

        const appRole = body.app_role === "business" ? "business" : "customer";

        try {
          const { getPool, ensureSchema } = await import("@/lib/db.server");
          await ensureSchema();
          const pool = getPool();

          const email = body.email.trim().toLowerCase();
          const existing = await pool.query("select id from users where email = $1", [email]);
          if (existing.rowCount && existing.rowCount > 0) {
            return Response.json(
              { error: "An account already exists for that email" },
              { status: 409 },
            );
          }

          const { hashAppPassword, issueAppToken, createLoyaltyCard, getUserLoyaltyData } =
            await import("@/lib/app-auth.server");

          const passwordHash = await hashAppPassword(body.password);
          const userId = crypto.randomUUID();

          await pool.query(
            "insert into users (id, email, name, password_hash, role, app_role) values ($1, $2, $3, $4, 'user', $5)",
            [userId, email, body.name.trim(), passwordHash, appRole],
          );

          let loyalty = {
            points: 0,
            tier: "standard",
            card_token: null as string | null,
            card_created: null as string | null,
          };

          if (appRole === "customer") {
            const card = await createLoyaltyCard(userId);
            loyalty = {
              points: 0,
              tier: "standard",
              card_token: card.qr_token,
              card_created: card.created_at,
            };
          } else {
            loyalty = await getUserLoyaltyData(userId);
          }

          const token = issueAppToken(userId);

          return Response.json(
            {
              token,
              user: {
                id: userId,
                email,
                name: body.name.trim(),
                display_name: body.name.trim(),
                app_role: appRole,
                ...loyalty,
              },
            },
            { status: 201 },
          );
        } catch (err) {
          console.error("[app/register]", err);
          return Response.json({ error: "Server error" }, { status: 500 });
        }
      },
    },
  },
});
