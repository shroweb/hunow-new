import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/v1/auth/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => null)) as {
          email?: string;
          password?: string;
        } | null;
        if (!body?.email || !body?.password) {
          return Response.json({ error: "email and password are required" }, { status: 400 });
        }

        try {
          const { getPool, ensureSchema } = await import("@/lib/db.server");
          await ensureSchema();
          const pool = getPool();

          const { checkRateLimitSet, getClientIp } = await import("@/lib/rate-limit.server");
          const email = body.email.trim().toLowerCase();
          const ip = getClientIp(request);
          const allowed = await checkRateLimitSet([
            { key: `app-login:${email}`, max: 10, windowSec: 15 * 60 },
            { key: `app-login-ip:${ip}`, max: 30, windowSec: 15 * 60 },
          ]);
          if (!allowed) {
            return Response.json(
              { error: "Too many attempts. Wait 15 minutes and try again." },
              { status: 429 },
            );
          }

          const result = await pool.query<{
            id: string;
            email: string;
            name: string;
            role: string;
            app_role: string;
            password_hash: string;
          }>("select id, email, name, role, app_role, password_hash from users where email = $1", [
            email,
          ]);
          const user = result.rows[0];
          if (!user) {
            return Response.json({ error: "Invalid email or password" }, { status: 401 });
          }

          const { verifyAppPassword, issueAppToken, getUserLoyaltyData } =
            await import("@/lib/app-auth.server");
          const valid = await verifyAppPassword(body.password, user.password_hash);
          if (!valid) {
            return Response.json({ error: "Invalid email or password" }, { status: 401 });
          }

          const token = issueAppToken(user.id);
          const loyalty = await getUserLoyaltyData(user.id);

          return Response.json({
            token,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              display_name: user.name,
              app_role: user.app_role,
              ...loyalty,
            },
          });
        } catch (err) {
          console.error("[app/login]", err);
          return Response.json({ error: "Server error" }, { status: 500 });
        }
      },
    },
  },
});
