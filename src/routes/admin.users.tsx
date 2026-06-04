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

export const Route = createFileRoute("/admin/users")({ component: AdminUsers });

function AdminUsers() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const adminCount = useMemo(() => users.filter((user) => user.role === "admin").length, [users]);

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

        <section className="grid sm:grid-cols-3 gap-4">
          <UserStat label="Total Accounts" value={users.length} />
          <UserStat label="Admins" value={adminCount} />
          <UserStat label="Members" value={users.length - adminCount} />
        </section>

        {loading ? (
          <div className="border-2 border-foreground bg-white p-8 font-mono text-xs uppercase">
            Loading users...
          </div>
        ) : (
          <AdminTable
            headers={["Name", "Email", "Role", "Created", "Access"]}
            rows={users.map((user) => [
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
              <span className="font-mono text-[10px] uppercase text-muted-foreground">
                {new Date(user.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>,
              <AdminStatus status={user.role === "admin" ? "admin" : "user"} />,
            ])}
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
