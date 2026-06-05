import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminHeader, AdminTable, StatCard, adminBtn } from "@/components/admin/AdminLayout";
import { getNewsletterSubscribers } from "@/lib/newsletter.functions";

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
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {data.total} sendable subscribers
            </div>
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
