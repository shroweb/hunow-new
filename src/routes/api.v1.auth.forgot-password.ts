import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/v1/auth/forgot-password")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json().catch(() => null) as { email?: string } | null;
        if (!body?.email) {
          return Response.json({ error: "email is required" }, { status: 400 });
        }
        try {
          const { requestPasswordReset } = await import("@/lib/auth.server");
          await requestPasswordReset(body.email.trim().toLowerCase());
        } catch {
          // Don't reveal whether the email exists
        }
        return Response.json({ ok: true });
      },
    },
  },
});
