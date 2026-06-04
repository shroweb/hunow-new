import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader, AdminTable, adminBtn, adminBtnOutline } from "@/components/admin/AdminLayout";
import { uniqueSlug } from "@/components/admin/slug-utils";
import { setState, slugify, uid, useStore } from "@/lib/store";
import type { EventItem, Listing, Submission } from "@/types";

export const Route = createFileRoute("/admin/submissions")({ component: AdminSubmissions });

function AdminSubmissions() {
  const submissions = useStore((s) => s.submissions);

  const reject = (id: string) => {
    setState((s) => ({
      ...s,
      submissions: s.submissions.map((x) => (x.id === id ? { ...x, status: "rejected" } : x)),
    }));
  };

  const approve = (submission: Submission) => {
    const data = submission.data;
    setState((s) => {
      if (submission.type === "event") {
        const title = data.title || submission.title;
        const event: EventItem = {
          id: uid(),
          title,
          slug: uniqueSlug(
            slugify(title),
            s.events.map((item) => item.slug),
          ),
          description:
            data.description || "Submitted event. Add full editorial details before publishing.",
          category: data.category || "Community",
          startDate: data.date || new Date().toISOString().slice(0, 10),
          startTime: data.time || "19:00",
          locationName: data.venue || "Venue to confirm",
          address: data.address || data.venue || "Address to confirm",
          price: data.price || "Free",
          isFree: !data.price || data.price.toLowerCase() === "free",
          ticketUrl: data.ticketUrl || undefined,
          featuredImage: "photo-1492684223066-81342ee5ff30",
          status: "draft",
          isFeatured: false,
          isSponsored: false,
        };
        return {
          ...s,
          events: [event, ...s.events],
          submissions: s.submissions.map((x) =>
            x.id === submission.id ? { ...x, status: "approved" } : x,
          ),
        };
      }

      const name = data.name || submission.title;
      const listing: Listing = {
        id: uid(),
        name,
        slug: uniqueSlug(
          slugify(name),
          s.listings.map((item) => item.slug),
        ),
        description:
          data.description || "Submitted listing. Add full editorial details before publishing.",
        category: data.category || "Things To Do",
        area: data.area || "Hull",
        address: data.address || "Address to confirm",
        openingHours: data.openingHours || "Check with venue",
        website: data.website || undefined,
        phone: data.phone || undefined,
        email: data.email || undefined,
        featuredImage: "photo-1554118811-1e0d58224f24",
        isFeatured: false,
        isHiddenGem: false,
        isIndependent: true,
        isVerified: false,
      };
      return {
        ...s,
        listings: [listing, ...s.listings],
        submissions: s.submissions.map((x) =>
          x.id === submission.id ? { ...x, status: "approved" } : x,
        ),
      };
    });
  };

  return (
    <div>
      <AdminHeader
        title="Submissions"
        subtitle={`${submissions.filter((s) => s.status === "pending").length} pending review`}
      />
      <div className="p-6 md:p-10 space-y-6">
        {submissions.map((s) => (
          <div key={s.id} className="border-2 border-foreground bg-white p-6">
            <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
              <div>
                <div className="text-[10px] font-mono uppercase text-accent mb-1">
                  {s.type} · {s.createdAt}
                </div>
                <h3 className="font-display text-2xl uppercase">{s.title}</h3>
                <div className="text-sm text-muted-foreground">
                  From {s.contactName} · {s.contactEmail}
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
                <button onClick={() => approve(s)} className={adminBtn}>
                  Approve & Create Draft
                </button>
                <button onClick={() => reject(s.id)} className={adminBtnOutline}>
                  Reject
                </button>
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
