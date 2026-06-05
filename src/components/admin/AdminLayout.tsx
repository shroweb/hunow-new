import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  FileText,
  CalendarDays,
  MapPin,
  Tag,
  Inbox,
  Megaphone,
  Image,
  Star,
  Users,
  MessageSquare,
  ArrowLeftRight,
  Layers,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { getCurrentUser, signOutUser } from "@/lib/auth.functions";
import type { AuthUser } from "@/lib/auth.server";

const nav: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/admin",              label: "Dashboard",   icon: LayoutDashboard },
  { to: "/admin/articles",     label: "Posts",       icon: FileText },
  { to: "/admin/events",       label: "Events",      icon: CalendarDays },
  { to: "/admin/listings",     label: "Listings",    icon: MapPin },
  { to: "/admin/offers",       label: "Offers",      icon: Tag },
  { to: "/admin/submissions",  label: "Submissions", icon: Inbox },
  { to: "/admin/ads",          label: "Ads",         icon: Megaphone },
  { to: "/admin/media",        label: "Media",       icon: Image },
  { to: "/admin/reviews",      label: "Reviews",     icon: Star },
  { to: "/admin/users",        label: "Users",       icon: Users },
  { to: "/admin/comments",     label: "Comments",    icon: MessageSquare },
  { to: "/admin/redirects",    label: "Redirects",   icon: ArrowLeftRight },
  { to: "/admin/taxonomy",     label: "Taxonomy",    icon: Layers },
  { to: "/admin/settings",     label: "Settings",    icon: Settings },
];

export function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-foreground text-background grid place-items-center px-4">
        <div className="font-mono text-xs uppercase tracking-widest">Checking access...</div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-foreground text-background grid place-items-center px-4">
        <div className="w-full max-w-md border-2 border-background bg-background text-foreground p-6">
          <div className="text-[10px] font-mono uppercase tracking-widest text-accent mb-2">
            HU NOW Admin
          </div>
          <h1 className="font-display text-4xl uppercase leading-none mb-4">Admin Sign In</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Sign in with an admin account to access the content desk.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/sign-in" search={{ redirect: "/admin" }} className={adminBtn}>
              Sign in
            </Link>
            <Link to="/" className={adminBtnOutline}>
              Back to site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <aside className="md:w-72 bg-foreground text-background md:min-h-screen md:sticky md:top-0 md:self-start">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="text-2xl font-display tracking-wider">
              HU NOW
            </Link>
            <span className="text-[9px] font-mono uppercase text-accent">Admin</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-background/60">
            <span className="size-2 rounded-full bg-[oklch(0.58_0.15_145)]" />
            {user.email}
          </div>
        </div>
        <nav className="flex md:flex-col overflow-x-auto md:overflow-visible p-3 gap-1">
          {nav.map((n) => {
            const active = n.to === "/admin" ? pathname === "/admin" : pathname.startsWith(n.to);
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/admin" }}
                className={`shrink-0 flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${active ? "bg-accent text-foreground" : "text-background/70 hover:bg-white/5 hover:text-background"}`}
              >
                <Icon size={14} strokeWidth={2} className="shrink-0" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden md:block p-6 mt-8 border-t border-white/10">
          <div className="text-[10px] font-mono uppercase tracking-wider text-background/40 mb-3">
            Environment
          </div>
          <div className="space-y-2 text-[11px] font-mono uppercase text-background/65">
            <div className="flex justify-between gap-4">
              <span>Storage</span>
              <span className="text-accent">Postgres</span>
            </div>
          </div>
          <Link
            to="/"
            className="mt-6 block border border-background/30 px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-background/80 hover:bg-background hover:text-foreground transition-colors"
          >
            View public site
          </Link>
          <button
            type="button"
            onClick={() => {
              void signOutUser().then(() => {
                window.location.href = "/";
              });
            }}
            className="mt-3 w-full border border-background/30 px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-background/80 hover:bg-background hover:text-foreground transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-background min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}

export function AdminHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="border-b-2 border-foreground px-6 md:px-10 py-7 flex flex-wrap items-end justify-between gap-4 bg-background">
      <div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-accent mb-2">
          Content desk
        </div>
        <h1 className="font-display text-4xl md:text-5xl uppercase leading-none">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

export function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div
      className={`p-5 border-2 ${accent ? "border-accent bg-accent/5" : "border-foreground bg-white"}`}
    >
      <div className="text-[10px] font-mono uppercase text-muted-foreground mb-2">{label}</div>
      <div className={`text-4xl font-display leading-none ${accent ? "text-accent" : ""}`}>
        {value}
      </div>
    </div>
  );
}

export function AdminTable({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
  return (
    <div className="border-2 border-foreground bg-white overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-foreground text-background">
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-border hover:bg-foreground/[0.03]">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 align-middle">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div className="py-12 text-center font-mono text-xs uppercase text-muted-foreground">
          Empty
        </div>
      )}
    </div>
  );
}

export function AdminField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      {children}
      {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function AdminFormPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-2 border-foreground bg-white p-6 md:p-8 mb-8">
      <h3 className="font-display text-2xl uppercase mb-5">{title}</h3>
      {children}
    </div>
  );
}

export function AdminStatus({ status }: { status: string }) {
  const live = ["published", "active", "approved"].includes(status);
  return (
    <span
      className={`font-mono text-[10px] uppercase px-2 py-0.5 ${live ? "bg-foreground text-background" : "border border-foreground/30"}`}
    >
      {status}
    </span>
  );
}

export const adminInput =
  "w-full bg-background border-2 border-foreground px-4 py-3 font-mono text-sm focus:outline-none";
export const adminBtn =
  "inline-flex items-center gap-1.5 bg-foreground text-background px-5 py-2.5 font-bold uppercase tracking-widest text-[10px] hover:bg-accent transition-colors";
export const adminBtnOutline =
  "inline-flex items-center gap-1.5 border-2 border-foreground px-5 py-2.5 font-bold uppercase tracking-widest text-[10px] hover:bg-foreground hover:text-background transition-colors";
