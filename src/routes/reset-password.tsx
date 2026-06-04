import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { resetPasswordFn } from "@/lib/auth.functions";
import { AuthShell, AuthField } from "./sign-in";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  head: () => ({
    meta: [
      { title: "Set new password — HU NOW" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const { token } = Route.useSearch();
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <PublicLayout>
        <AuthShell eyebrow="Account" title="Invalid link">
          <p className="text-sm text-muted-foreground mb-4">
            This reset link is missing or invalid.
          </p>
          <Link to="/forgot-password" className="font-bold underline text-sm">
            Request a new one →
          </Link>
        </AuthShell>
      </PublicLayout>
    );
  }

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const data = new FormData(e.currentTarget);
    const password = String(data.get("password") || "");
    const confirm = String(data.get("confirm") || "");
    if (password !== confirm) {
      setError("Passwords don't match.");
      setSubmitting(false);
      return;
    }
    try {
      await resetPasswordFn({ data: { token, password } });
      setDone(true);
      await router.invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reset password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <AuthShell eyebrow="Account" title="New password">
        {done ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Password updated. You can now sign in.</p>
            <a
              href="/sign-in"
              className="block w-full bg-foreground text-background px-6 py-4 text-xs font-bold uppercase tracking-widest text-center"
            >
              Sign in
            </a>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <AuthField
              label="New password"
              name="password"
              type="password"
              autoComplete="new-password"
            />
            <AuthField
              label="Confirm password"
              name="confirm"
              type="password"
              autoComplete="new-password"
            />
            <p className="text-xs text-muted-foreground">Use at least 8 characters.</p>
            {error && <p className="text-sm font-bold text-red-600">{error}</p>}
            <button
              disabled={submitting}
              className="w-full bg-foreground text-background px-6 py-4 text-xs font-bold uppercase tracking-widest disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Set new password"}
            </button>
          </form>
        )}
      </AuthShell>
    </PublicLayout>
  );
}
