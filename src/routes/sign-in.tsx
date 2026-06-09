import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { signInUser } from "@/lib/auth.functions";

export const Route = createFileRoute("/sign-in")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : "/account",
  }),
  head: () => ({
    meta: [
      { title: "Sign in — HU NOW" },
      { name: "description", content: "Sign in to your HU NOW account." },
    ],
  }),
  component: SignIn,
});

function SignIn() {
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
      await signInUser({
        data: {
          email: String(data.get("email") || ""),
          password: String(data.get("password") || ""),
        },
      });
      await router.invalidate();
      window.location.href = redirect;
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <AuthShell eyebrow="Account" title="Sign in">
        <form onSubmit={submit} className="space-y-4">
          <AuthField label="Email" name="email" type="email" autoComplete="email" />
          <AuthField
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
          />
          {error && <p className="text-sm font-bold text-red-600">{error}</p>}
          <button className="w-full bg-foreground text-background px-6 py-4 text-xs font-bold uppercase tracking-widest">
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <div className="mt-6 flex flex-col gap-2 text-sm text-muted-foreground">
          <p>
            No account yet?{" "}
            <Link to="/sign-up" search={{ redirect }} className="font-bold underline">
              Create one
            </Link>
          </p>
          <p>
            <Link to="/forgot-password" className="font-bold underline">
              Forgot your password?
            </Link>
          </p>
        </div>
      </AuthShell>
    </PublicLayout>
  );
}

export function AuthShell({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="max-w-md mx-auto px-4 py-16 md:py-24">
      <div className="border-2 border-foreground bg-white p-6 md:p-8">
        <div className="text-[10px] font-mono uppercase tracking-widest text-accent mb-2">
          {eyebrow}
        </div>
        <h1 className="font-display text-5xl uppercase leading-none mb-6">{title}</h1>
        {children}
      </div>
    </section>
  );
}

export function AuthField({
  label,
  name,
  type,
  autoComplete,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete: string;
}) {
  const isPassword = type === "password";
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="block text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={isPassword ? (show ? "text" : "password") : type}
          required
          autoComplete={autoComplete}
          className="w-full bg-background border-2 border-foreground px-4 py-3 font-mono text-sm pr-12"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
