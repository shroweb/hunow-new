import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { signUpUser } from "@/lib/auth.functions";
import { AuthField, AuthShell } from "./sign-in";

function sanitizeRedirect(redirect: unknown): string {
  if (typeof redirect !== "string") return "/account";
  if (!redirect.startsWith("/") || redirect.startsWith("//") || /:\/\//.test(redirect)) {
    return "/account";
  }
  return redirect;
}

export const Route = createFileRoute("/sign-up")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: sanitizeRedirect(search.redirect),
  }),
  head: () => ({
    meta: [
      { title: "Create account — HU NOW" },
      { name: "description", content: "Create your HU NOW account." },
    ],
  }),
  component: SignUp,
});

function SignUp() {
  const router = useRouter();
  const { redirect } = Route.useSearch();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      await signUpUser({
        data: {
          name: String(data.get("name") || ""),
          email: String(data.get("email") || ""),
          password: String(data.get("password") || ""),
        },
      });
      await router.invalidate();
      window.location.href = redirect;
    } catch (signUpError) {
      setError(signUpError instanceof Error ? signUpError.message : "Unable to create account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <AuthShell eyebrow="Account" title="Create account">
        <form onSubmit={submit} className="space-y-4">
          <AuthField label="Name" name="name" type="text" autoComplete="name" />
          <AuthField label="Email" name="email" type="email" autoComplete="email" />
          <AuthField label="Password" name="password" type="password" autoComplete="new-password" />
          <p className="text-xs text-muted-foreground">Use at least 8 characters.</p>
          {error && <p className="text-sm font-bold text-red-600">{error}</p>}
          <button className="w-full bg-foreground text-background px-6 py-4 text-xs font-bold uppercase tracking-widest">
            {submitting ? "Creating..." : "Create account"}
          </button>
        </form>
        <p className="mt-6 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/sign-in" search={{ redirect }} className="font-bold underline">
            Sign in
          </Link>
        </p>
      </AuthShell>
    </PublicLayout>
  );
}
