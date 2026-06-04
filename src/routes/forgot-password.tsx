import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { requestPasswordResetFn } from "@/lib/auth.functions";
import { AuthShell, AuthField } from "./sign-in";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot password — HU NOW" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [devUrl, setDevUrl] = useState<string | null>(null);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const email = String(new FormData(e.currentTarget).get("email") || "");
    try {
      const result = await requestPasswordResetFn({ data: { email } });
      if (result._devResetUrl) setDevUrl(result._devResetUrl);
    } catch {
      // Still show success — don't reveal if email exists
    }
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <PublicLayout>
      <AuthShell eyebrow="Account" title="Reset password">
        {submitted ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              If that email has an account you'll receive a reset link shortly.
            </p>
            {devUrl && (
              <div className="border-2 border-accent bg-accent/5 p-4 space-y-2">
                <p className="text-[10px] font-mono uppercase font-bold text-accent">
                  Dev mode — reset link:
                </p>
                <a href={devUrl} className="text-xs font-mono break-all underline hover:text-accent">
                  {devUrl}
                </a>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <AuthField label="Email" name="email" type="email" autoComplete="email" />
            <button
              disabled={submitting}
              className="w-full bg-foreground text-background px-6 py-4 text-xs font-bold uppercase tracking-widest disabled:opacity-50"
            >
              {submitting ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}
      </AuthShell>
    </PublicLayout>
  );
}
