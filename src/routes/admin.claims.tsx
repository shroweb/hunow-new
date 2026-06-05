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
    await moderateAdminListingClaim({ data: { claimId, action } });
    setClaims((current) => current.filter((claim) => claim.id !== claimId));
  }

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
        {error && <div className="border-2 border-red-600 p-4 font-bold text-sm">{error}</div>}
        {loading ? (
          <div className="border-2 border-foreground bg-white p-8 font-mono text-xs uppercase">
            Loading claims...
          </div>
        ) : (
          <AdminTable
            headers={["Listing", "Requester", "Message", "Submitted", "Actions"]}
            rows={claims.map((claim) => [
              <span className="font-bold">{claim.listingName}</span>,
              <div>
                <div className="font-bold">{claim.userName}</div>
                <div className="font-mono text-[10px] text-muted-foreground">{claim.userEmail}</div>
              </div>,
              <span className="text-sm text-muted-foreground">
                {claim.message || "No message"}
              </span>,
              <span className="font-mono text-[10px] uppercase">
                {new Date(claim.createdAt).toLocaleDateString("en-GB")}
              </span>,
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
              </div>,
            ])}
          />
        )}
      </div>
    </div>
  );
}
