import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminHeader, AdminTable, StatCard, adminBtn } from "@/components/admin/AdminLayout";
import { getNewsletterSubscribers } from "@/lib/newsletter.functions";

function downloadCsv(subscribers: { email: string; segments: string[]; createdAt: string }[]) {
  const rows = [
    ["email", "segments", "signed_up"],
    ...subscribers.map((s) => [s.email, s.segments.join("|"), new Date(s.createdAt).toISOString()]),
  ];
  const csv = rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `hunow-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export const Route = createFileRoute("/admin/subscribers")({
  loader: async () => ({ data: await getNewsletterSubscribers() }),
  component: AdminSubscribers,
});

function AdminSubscribers() {
  const { data } = Route.useLoaderData();

  return (
    <div>
      <AdminHeader
        title="Subscribers"
        subtitle="People who signed up through the public newsletter forms."
        action={
          <Link to="/admin/newsletter" className={adminBtn}>
            Build Newsletter
          </Link>
        }
      />
      <div className="p-6 md:p-10 space-y-6">
        <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Total Audience" value={data.total} accent />
          <StatCard label="Events Segment" value={data.segments.events} />
          <StatCard label="Offers Segment" value={data.segments.offers} />
          <StatCard label="Business Segment" value={data.segments.businesses} />
        </section>

        <section>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
            <div>
              <h2 className="font-display text-3xl uppercase leading-none">Email list</h2>
              <p className="text-sm text-muted-foreground mt-1">
                The newsletter send button uses this list, filtered by the selected segment.
              </p>
            </div>
            <button
              type="button"
              onClick={() => downloadCsv(data.subscribers)}
              className={adminBtn}
            >
              Export CSV
            </button>
          </div>
          <AdminTable
            headers={["Email", "Segments", "Unsubscribe", "Signed up"]}
            rows={data.subscribers.map((subscriber) => [
              <span className="font-bold">{subscriber.email}</span>,
              <span className="font-mono text-[10px] uppercase">
                {subscriber.segments.join(", ")}
              </span>,
              <span className={subscriber.hasUnsubscribeToken ? "text-green-700" : "text-accent"}>
                {subscriber.hasUnsubscribeToken ? "Ready" : "Backfills on send"}
              </span>,
              new Date(subscriber.createdAt).toLocaleString(),
            ])}
          />
        </section>
      </div>
    </div>
  );
}
