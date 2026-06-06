import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminHeader, AdminTable, adminBtn, adminBtnOutline } from "@/components/admin/AdminLayout";
import { getAdminListingClaims, moderateAdminListingClaim } from "@/lib/business.functions";

type Claim = Awaited<ReturnType<typeof getAdminListingClaims>>[number];

export const Route = createFileRoute("/admin/claims")({ component: AdminClaims });

function AdminClaims() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Claim["status"]>("pending");
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    void refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      setClaims(await getAdminListingClaims());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load listing claims.");
    } finally {
      setLoading(false);
    }
  }

  async function moderate(claimId: string, action: "approve" | "reject") {
    await moderateAdminListingClaim({ data: { claimId, action, adminNote: notes[claimId] ?? "" } });
    await refresh();
  }

  const visibleClaims = claims.filter(
    (claim) => statusFilter === "all" || claim.status === statusFilter,
  );

  return (
    <div>
      <AdminHeader
        title="Listing Claims"
        subtitle="Approve business owners before they can manage listings."
        action={
          <button type="button" onClick={() => void refresh()} className={adminBtn}>
            Refresh
          </button>
        }
      />
      <div className="p-6 md:p-10 space-y-4">
        <div className="flex flex-wrap gap-2">
          {(["pending", "approved", "rejected", "all"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest border-2 ${
                statusFilter === status
                  ? "border-foreground bg-foreground text-background"
                  : "border-foreground/30"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        {error && <div className="border-2 border-red-600 p-4 font-bold text-sm">{error}</div>}
        {loading ? (
          <div className="border-2 border-foreground bg-white p-8 font-mono text-xs uppercase">
            Loading claims...
          </div>
        ) : (
          <AdminTable
            headers={["Listing", "Requester", "Message", "Submitted", "Actions"]}
            rows={visibleClaims.map((claim) => [
              <div>
                <div className="font-bold">{claim.listingName}</div>
                <div className="mt-1 inline-block border border-foreground/20 px-2 py-1 font-mono text-[10px] uppercase">
                  {claim.status}
                </div>
              </div>,
              <div>
                <div className="font-bold">{claim.userName}</div>
                <div className="font-mono text-[10px] text-muted-foreground">{claim.userEmail}</div>
              </div>,
              <div className="max-w-md space-y-2 text-sm text-muted-foreground">
                <p>{claim.message || "No message"}</p>
                {claim.proofUrl && (
                  <a
                    href={claim.proofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block font-bold text-foreground underline"
                  >
                    Proof link
                  </a>
                )}
                {claim.adminNote && (
                  <p className="border-l-2 border-accent pl-3 text-xs">
                    Admin note: {claim.adminNote}
                  </p>
                )}
              </div>,
              <span className="font-mono text-[10px] uppercase">
                {new Date(claim.createdAt).toLocaleDateString("en-GB")}
                {claim.decidedAt && (
                  <span className="block text-muted-foreground">
                    Decided {new Date(claim.decidedAt).toLocaleDateString("en-GB")}
                  </span>
                )}
              </span>,
              <div className="min-w-56 space-y-2">
                {claim.status === "pending" ? (
                  <>
                    <textarea
                      value={notes[claim.id] ?? ""}
                      onChange={(event) =>
                        setNotes((current) => ({ ...current, [claim.id]: event.target.value }))
                      }
                      rows={2}
                      maxLength={1000}
                      placeholder="Admin note"
                      className="w-full border border-foreground/30 bg-background p-2 text-xs"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => void moderate(claim.id, "approve")}
                        className={adminBtn}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => void moderate(claim.id, "reject")}
                        className={adminBtnOutline}
                      >
                        Reject
                      </button>
                    </div>
                  </>
                ) : (
                  <span className="font-mono text-[10px] uppercase text-muted-foreground">
                    No active action
                  </span>
                )}
              </div>,
            ])}
          />
        )}
      </div>
    </div>
  );
}
