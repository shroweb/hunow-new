import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminHeader, AdminTable, adminBtn, adminBtnOutline } from "@/components/admin/AdminLayout";
import { getPendingReviews, moderateReview } from "@/lib/reviews.functions";
import type { Review } from "@/lib/reviews.functions";

export const Route = createFileRoute("/admin/reviews")({ component: AdminReviews });

function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try { setReviews(await getPendingReviews()); } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const act = async (reviewId: string, action: "approve" | "reject") => {
    setActing(reviewId);
    await moderateReview({ data: { reviewId, action } }).catch(() => {});
    setReviews((r) => r.filter((x) => x.id !== reviewId));
    setActing(null);
  };

  return (
    <div>
      <AdminHeader
        title="Review Moderation"
        subtitle={`${reviews.length} pending review${reviews.length !== 1 ? "s" : ""}`}
        action={<button onClick={() => void load()} className={adminBtnOutline}>Refresh</button>}
      />
      <div className="p-6 md:p-10">
        {loading ? (
          <p className="font-mono text-xs uppercase text-muted-foreground">Loading…</p>
        ) : reviews.length === 0 ? (
          <div className="border-2 border-dashed border-foreground/20 p-12 text-center text-muted-foreground">
            No reviews pending moderation.
          </div>
        ) : (
          <AdminTable
            headers={["Listing", "User", "Rating", "Review", "Date", "Actions"]}
            rows={reviews.map((r) => [
              <span className="font-mono text-xs">{r.listingId}</span>,
              <span className="font-bold">{r.userName}</span>,
              <span className="font-display text-2xl">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>,
              <span className="text-sm max-w-xs line-clamp-2">{r.body ?? <em className="text-muted-foreground">No comment</em>}</span>,
              <span className="font-mono text-[10px] text-muted-foreground">
                {new Date(r.createdAt).toLocaleDateString("en-GB")}
              </span>,
              <div className="flex gap-2">
                <button
                  disabled={acting === r.id}
                  onClick={() => void act(r.id, "approve")}
                  className={adminBtn}
                >
                  Approve
                </button>
                <button
                  disabled={acting === r.id}
                  onClick={() => void act(r.id, "reject")}
                  className="border-2 border-red-600 text-red-600 px-3 py-1.5 text-[10px] font-bold uppercase hover:bg-red-600 hover:text-background transition-colors disabled:opacity-40"
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
