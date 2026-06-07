import { createFileRoute } from "@tanstack/react-router";
import crypto from "node:crypto";

export const Route = createFileRoute("/api/v1/me/push")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => null)) as {
          token?: string;
          push_token?: string;
          expo_push_token?: string;
          platform?: string;
          permission_status?: string;
        } | null;
        const token = body?.token ?? body?.push_token ?? body?.expo_push_token;
        if (!token) {
          return Response.json({ error: "Push token is required" }, { status: 400 });
        }

        try {
          const { getAppUser } = await import("@/lib/app-auth.server");
          const { ensureSchema, getPool } = await import("@/lib/db.server");
          await ensureSchema();

          const user = await getAppUser(request);
          if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

          await getPool().query(
            `insert into app_push_subscriptions
               (id, user_id, token, platform, permission_status)
             values ($1, $2, $3, $4, $5)
             on conflict (token) do update set
               user_id = excluded.user_id,
               platform = excluded.platform,
               permission_status = excluded.permission_status,
               updated_at = now()`,
            [
              crypto.randomUUID(),
              user.id,
              token,
              body?.platform ?? null,
              body?.permission_status ?? null,
            ],
          );

          return Response.json({ ok: true });
        } catch (err) {
          console.error("[app/me/push]", err);
          return Response.json({ error: "Server error" }, { status: 500 });
        }
      },
    },
  },
});
