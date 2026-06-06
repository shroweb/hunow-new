import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AdminHeader, AdminTable, adminBtn, adminBtnOutline } from "@/components/admin/AdminLayout";
import {
  getAdminSubmissions,
  approveAdminSubmission,
  rejectAdminSubmission,
} from "@/lib/submissions.functions";
import type { Submission } from "@/types";

export const Route = createFileRoute("/admin/submissions")({
  loader: async () => ({ submissions: await getAdminSubmissions() }),
  component: AdminSubmissions,
});

function AdminSubmissions() {
  const { submissions: initial } = Route.useLoaderData();
  const [submissions, setSubmissions] = useState<Submission[]>(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function approve(submission: Submission) {
    setBusy(submission.id);
    setMessage("");
    try {
      const result = await approveAdminSubmission({ data: { submissionId: submission.id } });
      setSubmissions((prev) =>
        prev.map((s) => (s.id === submission.id ? { ...s, status: "approved" } : s)),
      );
      if (result.created) {
        const path = result.created.type === "event" ? `/admin/events` : `/admin/listings`;
        setMessage(
          `✓ Created draft ${result.created.type}. Edit it in ${result.created.type === "event" ? "Events" : "Listings"}.`,
        );
        // Link to the admin edit page
        void path;
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error approving.");
    } finally {
      setBusy(null);
    }
  }

  async function reject(id: string) {
    setBusy(id);
    try {
      await rejectAdminSubmission({ data: { submissionId: id } });
      setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status: "rejected" } : s)));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error rejecting.");
    } finally {
      setBusy(null);
    }
  }

  const pending = submissions.filter((s) => s.status === "pending").length;

  return (
    <div>
      <AdminHeader
        title="Submissions"
        subtitle={`${pending} pending review — approving creates a draft ready to edit and publish`}
      />
      <div className="p-6 md:p-10 space-y-6">
        {message && (
          <div className="border-2 border-accent bg-accent/5 px-5 py-3 text-sm font-bold flex items-center justify-between gap-4">
            {message}
            <button
              type="button"
              onClick={() => setMessage("")}
              className="text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          </div>
        )}
        {submissions.map((s) => (
          <div key={s.id} className="border-2 border-foreground bg-white p-6">
            <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
              <div>
                <div className="text-[10px] font-mono uppercase text-accent mb-1">
                  {s.type} · {new Date(s.createdAt).toLocaleDateString("en-GB")}
                </div>
                <h3 className="font-display text-2xl uppercase">{s.title}</h3>
                <div className="text-sm text-muted-foreground">
                  {s.contactName} · {s.contactEmail}
                </div>
              </div>
              <span
                className={`font-mono text-[10px] uppercase px-2 py-1 ${
                  s.status === "pending"
                    ? "bg-accent text-background"
                    : s.status === "approved"
                      ? "bg-foreground text-background"
                      : "border border-foreground/30"
                }`}
              >
                {s.status}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs font-mono mb-4 border-y border-border py-3">
              {Object.entries(s.data).map(([k, v]) => (
                <div key={k}>
                  <span className="uppercase text-muted-foreground">{k}: </span>
                  <span className="font-bold">{v}</span>
                </div>
              ))}
            </div>
            {s.status === "pending" && (
              <div className="flex gap-2">
                <button
                  disabled={busy === s.id}
                  onClick={() => approve(s)}
                  className={`${adminBtn} disabled:opacity-40`}
                >
                  {busy === s.id ? "Creating…" : "Approve & Create Draft"}
                </button>
                <button
                  disabled={busy === s.id}
                  onClick={() => reject(s.id)}
                  className={`${adminBtnOutline} disabled:opacity-40`}
                >
                  Reject
                </button>
              </div>
            )}
            {s.status === "approved" && (
              <div className="flex gap-3">
                <Link
                  to={s.type === "event" ? "/admin/events" : "/admin/listings"}
                  className="text-[10px] font-bold uppercase underline text-accent"
                >
                  Edit in {s.type === "event" ? "Events" : "Listings"} →
                </Link>
              </div>
            )}
          </div>
        ))}
        {submissions.length === 0 && (
          <AdminTable headers={["Type", "Title", "Contact"]} rows={[]} />
        )}
      </div>
    </div>
  );
}
