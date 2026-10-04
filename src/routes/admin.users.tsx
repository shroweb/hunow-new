import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AdminHeader,
  AdminTable,
  adminBtn,
  adminBtnOutline,
  adminInput,
  AdminFormPanel,
  AdminField,
} from "@/components/admin/AdminLayout";
import {
  getAdminUsers,
  updateAdminUserRole,
  updateAdminUserAppRole,
  createAdminUser,
  deleteAdminUser,
  resetAdminUserPassword,
  getCurrentUser,
} from "@/lib/auth.functions";
import type { AdminUserRow, AuthRole, AuthUser } from "@/lib/auth.server";
import {
  UserPlus,
  RefreshCw,
  Trash2,
  KeyRound,
  Copy,
  Check,
  X,
  Shield,
  Briefcase,
  User as UserIcon,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

export const Route = createFileRoute("/admin/users")({ component: AdminUsers });

function generateRandomPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*";
  let pass = "";
  // Ensure strong composition: uppercase, lowercase, number, symbol
  const uppers = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lowers = "abcdefghijkmnpqrstuvwxyz";
  const nums = "23456789";
  const syms = "!@#$%&*";
  pass += uppers[Math.floor(Math.random() * uppers.length)];
  pass += lowers[Math.floor(Math.random() * lowers.length)];
  pass += nums[Math.floor(Math.random() * nums.length)];
  pass += syms[Math.floor(Math.random() * syms.length)];
  for (let i = 0; i < 8; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)];
  }
  return pass.split("").sort(() => 0.5 - Math.random()).join("");
}

function AdminUsers() {
  const [currentUserProfile, setCurrentUserProfile] = useState<AuthUser | null>(null);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savingAppRoleId, setSavingAppRoleId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "business" | "customer">("all");

  // Add User state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<AuthRole>("user");
  const [newAppRole, setNewAppRole] = useState<"customer" | "business">("customer");
  const [creating, setCreating] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [lastCreatedCredentials, setLastCreatedCredentials] = useState<{
    email: string;
    pass: string;
    role: string;
    appRole: string;
  } | null>(null);
  const [copiedPass, setCopiedPass] = useState(false);

  // Reset Password Modal state
  const [resetModalUser, setResetModalUser] = useState<AdminUserRow | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  // Delete User Modal state
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<AdminUserRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const adminCount = useMemo(() => users.filter((u) => u.role === "admin").length, [users]);
  const businessCount = useMemo(
    () => users.filter((u) => u.appRole === "business").length,
    [users],
  );

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase().trim();
    return users.filter((u) => {
      const matchesSearch =
        !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const matchesType = typeFilter === "all" || u.appRole === typeFilter;
      return matchesSearch && matchesRole && matchesType;
    });
  }, [users, search, roleFilter, typeFilter]);

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [fetchedUsers, me] = await Promise.all([
        getAdminUsers(),
        getCurrentUser(),
      ]);
      setUsers(fetchedUsers);
      setCurrentUserProfile(me);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }

  function openAddUser() {
    setNewName("");
    setNewEmail("");
    setNewPassword(generateRandomPassword());
    setNewRole("user");
    setNewAppRole("customer");
    setAddError(null);
    setShowAddModal(true);
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) {
      setAddError("Please enter a name.");
      return;
    }
    if (!newEmail.trim() || !newEmail.includes("@")) {
      setAddError("Please enter a valid email address.");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setAddError("Password must be at least 8 characters.");
      return;
    }

    setCreating(true);
    setAddError(null);
    try {
      const created = await createAdminUser({
        data: {
          name: newName.trim(),
          email: newEmail.trim(),
          password: newPassword,
          role: newRole,
          appRole: newAppRole,
        },
      });

      setUsers((curr) => [created, ...curr]);
      setLastCreatedCredentials({
        email: created.email,
        pass: newPassword,
        role: created.role,
        appRole: created.appRole,
      });
      setShowAddModal(false);
      setSuccessMessage(`Account created for ${created.name} (${created.email}).`);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Failed to create user.");
    } finally {
      setCreating(false);
    }
  }

  async function changeRole(user: AdminUserRow, role: AuthRole) {
    if (role === user.role) return;
    setSavingId(user.id);
    setError(null);
    try {
      const updated = await updateAdminUserRole({ data: { userId: user.id, role } });
      setUsers((current) =>
        current.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)),
      );
      setSuccessMessage(`Updated role for ${user.name} to ${role.toUpperCase()}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update role.");
    } finally {
      setSavingId(null);
    }
  }

  async function changeAppRole(user: AdminUserRow, appRole: "customer" | "business") {
    if (appRole === user.appRole) return;
    setSavingAppRoleId(user.id);
    setError(null);
    try {
      const updated = await updateAdminUserAppRole({ data: { userId: user.id, appRole } });
      setUsers((current) =>
        current.map((item) =>
          item.id === updated.id ? { ...item, appRole: updated.appRole } : item,
        ),
      );
      setSuccessMessage(
        `Updated account type for ${user.name} to ${appRole === "business" ? "Business" : "Member"}.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update account type.");
    } finally {
      setSavingAppRoleId(null);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetModalUser) return;
    if (!resetPasswordValue || resetPasswordValue.length < 8) {
      setResetError("Password must be at least 8 characters.");
      return;
    }

    setResetting(true);
    setResetError(null);
    try {
      await resetAdminUserPassword({
        data: {
          userId: resetModalUser.id,
          newPassword: resetPasswordValue,
        },
      });
      setResetSuccess(resetPasswordValue);
      setSuccessMessage(`Password updated for ${resetModalUser.name}.`);
    } catch (err) {
      setResetError(err instanceof Error ? err.message : "Failed to update password.");
    } finally {
      setResetting(false);
    }
  }

  async function handleDeleteUser() {
    if (!confirmDeleteUser) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAdminUser({
        data: {
          userId: confirmDeleteUser.id,
        },
      });
      setUsers((curr) => curr.filter((u) => u.id !== confirmDeleteUser.id));
      setSuccessMessage(`Account for ${confirmDeleteUser.name} has been deleted.`);
      setConfirmDeleteUser(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete user.");
    } finally {
      setDeleting(false);
    }
  }

  function copyToClipboard(text: string) {
    void navigator.clipboard.writeText(text);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2500);
  }

  return (
    <div>
      <AdminHeader
        title="Users & Roles"
        subtitle="Create accounts, manage access levels, and assign admin and business roles."
        action={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openAddUser}
              className={`${adminBtn} flex items-center gap-2`}
            >
              <UserPlus className="size-3.5" />
              Add User
            </button>
            <button
              type="button"
              onClick={() => void loadData()}
              className={`${adminBtnOutline} flex items-center gap-2`}
              title="Reload list"
            >
              <RefreshCw className="size-3.5" />
              Refresh
            </button>
          </div>
        }
      />

      <div className="p-6 md:p-10 space-y-6">
        {/* Global Error Banner */}
        {error && (
          <div className="border-2 border-destructive bg-destructive/10 px-4 py-3 text-sm font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertTriangle className="size-4 shrink-0 text-destructive" />
              {error}
            </span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-xs uppercase font-mono hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Global Success Banner */}
        {successMessage && (
          <div className="border-2 border-[oklch(0.58_0.15_145)] bg-[oklch(0.95_0.05_145)] px-4 py-3 text-sm font-bold flex items-center justify-between">
            <span className="flex items-center gap-2 text-foreground">
              <Check className="size-4 shrink-0 text-[oklch(0.45_0.15_145)]" />
              {successMessage}
            </span>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="text-xs uppercase font-mono hover:underline text-muted-foreground"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Just Created Credentials Callout */}
        {lastCreatedCredentials && (
          <div className="border-2 border-foreground bg-accent/20 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Sparkles className="size-4 text-foreground" />
                <span>Newly Created User Credentials</span>
              </div>
              <button
                type="button"
                onClick={() => setLastCreatedCredentials(null)}
                className="text-xs uppercase font-mono text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Provide these temporary credentials to the user. They can use them to sign in at{" "}
              <span className="font-mono font-bold text-foreground">/sign-in</span>:
            </p>
            <div className="flex flex-wrap items-center gap-4 bg-white border border-foreground/30 p-3 font-mono text-xs">
              <div>
                <span className="text-muted-foreground">Email:</span>{" "}
                <strong className="text-foreground">{lastCreatedCredentials.email}</strong>
              </div>
              <div className="border-l border-foreground/20 pl-4">
                <span className="text-muted-foreground">Password:</span>{" "}
                <strong className="text-foreground">{lastCreatedCredentials.pass}</strong>
              </div>
              <div className="border-l border-foreground/20 pl-4">
                <span className="text-muted-foreground">Role:</span>{" "}
                <span className="uppercase font-bold">{lastCreatedCredentials.role}</span>
              </div>
              <div className="border-l border-foreground/20 pl-4">
                <span className="text-muted-foreground">Type:</span>{" "}
                <span className="uppercase font-bold">{lastCreatedCredentials.appRole}</span>
              </div>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    `Email: ${lastCreatedCredentials.email}\nPassword: ${lastCreatedCredentials.pass}`,
                  )
                }
                className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 bg-foreground text-background text-[10px] uppercase font-bold tracking-wider hover:bg-accent hover:text-foreground transition-colors"
              >
                {copiedPass ? <Check className="size-3" /> : <Copy className="size-3" />}
                {copiedPass ? "Copied" : "Copy Info"}
              </button>
            </div>
          </div>
        )}

        {/* User Stats Grid */}
        <section className="grid sm:grid-cols-4 gap-4">
          <UserStat label="Total Accounts" value={users.length} icon={<UserIcon className="size-4 text-muted-foreground" />} />
          <UserStat label="Admin Accounts" value={adminCount} icon={<Shield className="size-4 text-muted-foreground" />} />
          <UserStat label="Business Accounts" value={businessCount} icon={<Briefcase className="size-4 text-muted-foreground" />} />
          <UserStat label="Standard Members" value={users.length - adminCount - businessCount} icon={<UserIcon className="size-4 text-muted-foreground" />} />
        </section>

        {/* Add User Panel */}
        {showAddModal && (
          <AdminFormPanel title="Create New User">
            <form onSubmit={handleCreateUser} className="space-y-6">
              {addError && (
                <div className="border-2 border-destructive bg-destructive/10 px-4 py-3 text-sm font-bold text-destructive">
                  {addError}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <AdminField label="Full Name" hint="Personal or display name of the user">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className={adminInput}
                  />
                </AdminField>

                <AdminField label="Email Address" hint="Unique login email for the user">
                  <input
                    type="email"
                    required
                    placeholder="e.g. sarah@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className={adminInput}
                  />
                </AdminField>
              </div>

              <AdminField
                label="Initial Password"
                hint="Minimum 8 characters. You can generate a secure random password."
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter or generate password"
                    className={`${adminInput} font-mono`}
                  />
                  <button
                    type="button"
                    onClick={() => setNewPassword(generateRandomPassword())}
                    className={`${adminBtnOutline} shrink-0`}
                    title="Generate secure password"
                  >
                    <Sparkles className="size-3.5 mr-1" />
                    Generate
                  </button>
                </div>
              </AdminField>

              <div className="grid md:grid-cols-2 gap-6 pt-2">
                <AdminField
                  label="System Role (Permissions)"
                  hint="Controls access to the Admin panel and management desk."
                >
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <label
                      className={`border-2 p-3.5 cursor-pointer transition-colors flex items-start gap-3 ${
                        newRole === "user"
                          ? "border-foreground bg-accent/20"
                          : "border-border hover:border-foreground/40 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="newRole"
                        value="user"
                        checked={newRole === "user"}
                        onChange={() => setNewRole("user")}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-bold text-xs uppercase tracking-wider">User</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          Standard user without admin desk access.
                        </div>
                      </div>
                    </label>

                    <label
                      className={`border-2 p-3.5 cursor-pointer transition-colors flex items-start gap-3 ${
                        newRole === "admin"
                          ? "border-foreground bg-accent/20"
                          : "border-border hover:border-foreground/40 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="newRole"
                        value="admin"
                        checked={newRole === "admin"}
                        onChange={() => setNewRole("admin")}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-bold text-xs uppercase tracking-wider">Admin</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          Full admin permissions to edit listings, events & users.
                        </div>
                      </div>
                    </label>
                  </div>
                </AdminField>

                <AdminField
                  label="Account Type (Community Role)"
                  hint="Controls public listing creation and business features."
                >
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <label
                      className={`border-2 p-3.5 cursor-pointer transition-colors flex items-start gap-3 ${
                        newAppRole === "customer"
                          ? "border-foreground bg-accent/20"
                          : "border-border hover:border-foreground/40 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="newAppRole"
                        value="customer"
                        checked={newAppRole === "customer"}
                        onChange={() => setNewAppRole("customer")}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-bold text-xs uppercase tracking-wider">Member</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          Community member (reviews, bookmarks, attendance).
                        </div>
                      </div>
                    </label>

                    <label
                      className={`border-2 p-3.5 cursor-pointer transition-colors flex items-start gap-3 ${
                        newAppRole === "business"
                          ? "border-foreground bg-accent/20"
                          : "border-border hover:border-foreground/40 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="newAppRole"
                        value="business"
                        checked={newAppRole === "business"}
                        onChange={() => setNewAppRole("business")}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-bold text-xs uppercase tracking-wider">Business</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          Owner account (claim places, publish offers, manage venue).
                        </div>
                      </div>
                    </label>
                  </div>
                </AdminField>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <button type="submit" disabled={creating} className={adminBtn}>
                  {creating ? "Creating Account..." : "Create User"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={adminBtnOutline}
                >
                  Cancel
                </button>
              </div>
            </form>
          </AdminFormPanel>
        )}

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <input
            type="search"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${adminInput} max-w-sm`}
          />

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase text-muted-foreground">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className={`${adminInput} py-1.5 px-3 w-auto text-xs`}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admins only</option>
                <option value="user">Users only</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase text-muted-foreground">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className={`${adminInput} py-1.5 px-3 w-auto text-xs`}
              >
                <option value="all">All Types</option>
                <option value="business">Business</option>
                <option value="customer">Member</option>
              </select>
            </div>

            <div className="font-mono text-xs text-muted-foreground pl-2">
              Showing {filteredUsers.length} of {users.length}
            </div>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="border-2 border-foreground bg-white p-8 font-mono text-xs uppercase flex items-center justify-center gap-2">
            <RefreshCw className="size-4 animate-spin" />
            Loading accounts...
          </div>
        ) : (
          <AdminTable
            headers={["User", "Email", "System Role", "Account Type", "Joined", "Actions"]}
            rows={filteredUsers.map((user) => {
              const isMe = currentUserProfile?.id === user.id;
              const isBusiness = user.appRole === "business";
              const isAdmin = user.role === "admin";

              return [
                <div className="flex items-center gap-2.5">
                  <div className="size-7 rounded bg-foreground text-background flex items-center justify-center font-bold text-xs uppercase">
                    {user.name.charAt(0) || "U"}
                  </div>
                  <div>
                    <div className="font-bold leading-tight flex items-center gap-1.5">
                      <span>{user.name}</span>
                      {isMe && (
                        <span className="bg-accent/40 text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-sm">
                          You
                        </span>
                      )}
                    </div>
                  </div>
                </div>,

                <span className="font-mono text-xs select-all text-muted-foreground">
                  {user.email}
                </span>,

                <div className="flex items-center gap-2">
                  <select
                    value={user.role}
                    disabled={savingId === user.id}
                    onChange={(event) => void changeRole(user, event.target.value as AuthRole)}
                    className={`${adminInput} min-w-28 py-1.5 px-2.5 text-xs font-semibold ${
                      isAdmin ? "bg-foreground text-background" : "bg-white"
                    }`}
                  >
                    <option value="user" className="bg-white text-foreground">User</option>
                    <option value="admin" className="bg-white text-foreground">Admin</option>
                  </select>
                  {savingId === user.id && (
                    <RefreshCw className="size-3.5 animate-spin text-muted-foreground shrink-0" />
                  )}
                </div>,

                <div className="flex items-center gap-2">
                  <select
                    value={isBusiness ? "business" : "customer"}
                    disabled={savingAppRoleId === user.id}
                    onChange={(event) =>
                      void changeAppRole(user, event.target.value as "customer" | "business")
                    }
                    className={`${adminInput} min-w-28 py-1.5 px-2.5 text-xs font-semibold ${
                      isBusiness ? "border-foreground bg-accent/20" : "bg-white"
                    }`}
                  >
                    <option value="customer">Member</option>
                    <option value="business">Business</option>
                  </select>
                  {savingAppRoleId === user.id && (
                    <RefreshCw className="size-3.5 animate-spin text-muted-foreground shrink-0" />
                  )}
                </div>,

                <span className="font-mono text-[10px] uppercase text-muted-foreground whitespace-nowrap">
                  {new Date(user.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>,

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setResetModalUser(user);
                      setResetPasswordValue(generateRandomPassword());
                      setResetError(null);
                      setResetSuccess(null);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 border border-foreground/30 hover:border-foreground hover:bg-foreground hover:text-background text-[10px] font-mono uppercase tracking-wider transition-colors"
                    title="Set new password for this user"
                  >
                    <KeyRound className="size-3" />
                    Reset Pass
                  </button>

                  <button
                    type="button"
                    disabled={isMe}
                    onClick={() => {
                      setConfirmDeleteUser(user);
                      setDeleteError(null);
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 border text-[10px] font-mono uppercase tracking-wider transition-colors ${
                      isMe
                        ? "border-muted text-muted-foreground opacity-50 cursor-not-allowed"
                        : "border-destructive/40 text-destructive hover:bg-destructive hover:text-white"
                    }`}
                    title={isMe ? "You cannot delete your own account" : "Delete account"}
                  >
                    <Trash2 className="size-3" />
                    Delete
                  </button>
                </div>,
              ];
            })}
          />
        )}
      </div>

      {/* Reset Password Modal */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-background border-2 border-foreground max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 font-display text-xl uppercase">
                <KeyRound className="size-5" />
                Reset Password
              </div>
              <button
                type="button"
                onClick={() => setResetModalUser(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Set a new password for{" "}
                <strong className="text-foreground">{resetModalUser.name}</strong> (
                <span className="font-mono">{resetModalUser.email}</span>).
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Any active sessions for this user will be invalidated.
              </p>
            </div>

            {resetError && (
              <div className="border border-destructive bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive">
                {resetError}
              </div>
            )}

            {resetSuccess ? (
              <div className="border border-[oklch(0.58_0.15_145)] bg-[oklch(0.95_0.05_145)] p-4 space-y-3">
                <div className="font-bold text-xs text-[oklch(0.35_0.15_145)] flex items-center gap-1.5">
                  <Check className="size-4" /> Password updated successfully!
                </div>
                <div className="font-mono text-sm bg-white p-2.5 border border-foreground/20 flex items-center justify-between">
                  <span>{resetSuccess}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(resetSuccess)}
                    className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-foreground hover:underline ml-2"
                  >
                    {copiedPass ? <Check className="size-3" /> : <Copy className="size-3" />}
                    {copiedPass ? "Copied" : "Copy"}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  className={`${adminBtn} w-full justify-center mt-2`}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <AdminField label="New Password">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={resetPasswordValue}
                      onChange={(e) => setResetPasswordValue(e.target.value)}
                      className={`${adminInput} font-mono`}
                    />
                    <button
                      type="button"
                      onClick={() => setResetPasswordValue(generateRandomPassword())}
                      className={`${adminBtnOutline} shrink-0`}
                      title="Generate secure password"
                    >
                      <Sparkles className="size-3.5 mr-1" />
                      Generate
                    </button>
                  </div>
                </AdminField>

                <div className="flex items-center gap-3 pt-2">
                  <button type="submit" disabled={resetting} className={adminBtn}>
                    {resetting ? "Updating..." : "Save New Password"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setResetModalUser(null)}
                    className={adminBtnOutline}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {confirmDeleteUser && (
        <div className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-background border-2 border-foreground max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 font-display text-xl uppercase text-destructive">
                <Trash2 className="size-5" />
                Delete User Account
              </div>
              <button
                type="button"
                onClick={() => setConfirmDeleteUser(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <p className="text-sm">
              Are you sure you want to permanently delete the account for{" "}
              <strong>{confirmDeleteUser.name}</strong> (
              <span className="font-mono text-xs">{confirmDeleteUser.email}</span>)?
            </p>

            <div className="border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
              This action cannot be undone. All active sessions, user reviews, bookmarks, and preferences will be permanently removed.
            </div>

            {deleteError && (
              <div className="border border-destructive bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive">
                {deleteError}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteUser}
                className="inline-flex items-center gap-1.5 bg-destructive text-white px-5 py-2.5 font-bold uppercase tracking-widest text-[10px] hover:bg-destructive/80 transition-colors"
              >
                {deleting ? "Deleting..." : "Permanently Delete"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteUser(null)}
                className={adminBtnOutline}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UserStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
}) {
  return (
    <div className="border-2 border-foreground bg-white p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        {icon}
      </div>
      <div className="font-display text-4xl leading-none">{value}</div>
    </div>
  );
}
