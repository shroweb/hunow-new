import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { getCurrentUser, signOutUser } from "@/lib/auth.functions";
import type { AuthUser } from "@/lib/auth.server";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Account — HU NOW" },
      { name: "description", content: "Manage your HU NOW account." },
    ],
  }),
  component: Account,
});

function Account() {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  return (
    <PublicLayout>
      <section className="max-w-3xl mx-auto px-4 py-16 md:py-24">
        <div className="border-2 border-foreground bg-white p-6 md:p-8">
          <div className="text-[10px] font-mono uppercase tracking-widest text-accent mb-2">
            Account
          </div>
          <h1 className="font-display text-5xl uppercase leading-none mb-6">Your account</h1>
          {user === undefined ? (
            <p className="text-muted-foreground">Checking your session...</p>
          ) : user ? (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-3 gap-3 text-sm">
                <AccountStat label="Name" value={user.name} />
                <AccountStat label="Email" value={user.email} />
                <AccountStat label="Role" value={user.role} />
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/business/listings"
                  className="border-2 border-foreground px-6 py-3 text-xs font-bold uppercase tracking-widest"
                >
                  Business listings
                </Link>
                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className="bg-foreground text-background px-6 py-3 text-xs font-bold uppercase tracking-widest"
                  >
                    Open admin
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    void signOutUser().then(() => {
                      window.location.href = "/";
                    });
                  }}
                  className="border-2 border-foreground px-6 py-3 text-xs font-bold uppercase tracking-widest"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-muted-foreground mb-6">
                Sign in or create an account to save your details and access account features.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/sign-in"
                  search={{ redirect: "/account" }}
                  className="bg-foreground text-background px-6 py-3 text-xs font-bold uppercase tracking-widest"
                >
                  Sign in
                </Link>
                <Link
                  to="/sign-up"
                  search={{ redirect: "/account" }}
                  className="border-2 border-foreground px-6 py-3 text-xs font-bold uppercase tracking-widest"
                >
                  Create account
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}

function AccountStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-foreground/20 p-3">
      <div className="text-[10px] font-mono uppercase text-muted-foreground mb-1">{label}</div>
      <div className="font-bold break-words">{value}</div>
    </div>
  );
}
