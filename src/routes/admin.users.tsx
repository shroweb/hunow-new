import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AdminHeader,
  AdminStatus,
  AdminTable,
  adminBtn,
  adminInput,
} from "@/components/admin/AdminLayout";
import { getAdminUsers, updateAdminUserRole } from "@/lib/auth.functions";
import type { AdminUserRow, AuthRole } from "@/lib/auth.server";
import { Building2 } from "lucide-react";

export const Route = createFileRoute("/admin/users")({ component: AdminUsers });

function AdminUsers() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const adminCount = useMemo(() => users.filter((user) => user.role === "admin").length, [users]);
  const businessCount = useMemo(() => users.filter((u) => u.appRole === "business").length, [users]);

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    );
  }, [users, search]);

  useEffect(() => {
    void loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    setError(null);
    try {
      setUsers(await getAdminUsers());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }

  async function changeRole(user: AdminUserRow, role: AuthRole) {
    if (role === user.role) return;
    setSavingId(user.id);
    setError(null);
    try {
      const updated = await updateAdminUserRole({ data: { userId: user.id, role } });
      setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update role.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <AdminHeader
        title="Users"
        subtitle="Manage account access and assign admin permissions."
        action={
          <button type="button" onClick={() => void loadUsers()} className={adminBtn}>
            Refresh
          </button>
        }
      />
      <div className="p-6 md:p-10 space-y-6">
        {error && (
          <div className="border-2 border-destructive bg-destructive/10 px-4 py-3 text-sm font-bold">
            {error}
          </div>
        )}

        <section className="grid sm:grid-cols-4 gap-4">
          <UserStat label="Total Accounts" value={users.length} />
          <UserStat label="Admins" value={adminCount} />
          <UserStat label="Business accounts" value={businessCount} />
          <UserStat label="Members" value={users.length - adminCount - businessCount} />
        </section>

        <input
          type="search"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${adminInput} max-w-sm`}
        />

        {loading ? (
          <div className="border-2 border-foreground bg-white p-8 font-mono text-xs uppercase">
            Loading users...
          </div>
        ) : (
          <AdminTable
            headers={["Name", "Email", "Role", "Type", "Created"]}
            rows={filteredUsers.map((user) => {
              const appRole = user.appRole;
              return [
                <span className="font-bold">{user.name}</span>,
                <span className="font-mono text-xs">{user.email}</span>,
                <select
                  value={user.role}
                  disabled={savingId === user.id}
                  onChange={(event) => void changeRole(user, event.target.value as AuthRole)}
                  className={`${adminInput} min-w-32 py-2`}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>,
                appRole === "business" ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-accent uppercase">
                    <Building2 className="w-3 h-3" /> Business
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground uppercase">Member</span>
                ),
                <span className="font-mono text-[10px] uppercase text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>,
              ];
            })}
          />
        )}
      </div>
    </div>
  );
}

function UserStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-2 border-foreground bg-white p-5">
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
        {label}
      </div>
      <div className="font-display text-4xl leading-none">{value}</div>
    </div>
  );
}
