import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader, AdminTable, StatCard } from "@/components/admin/AdminLayout";
import { getAdminAnalytics } from "@/lib/analytics.functions";

export const Route = createFileRoute("/admin/analytics")({
  loader: async () => ({ analytics: await getAdminAnalytics() }),
  component: AdminAnalytics,
});

function AdminAnalytics() {
  const { analytics } = Route.useLoaderData();
  const pageviews = analytics.eventsByType.find((item) => item.label === "pageview")?.count ?? 0;
  const searches = analytics.eventsByType.find((item) => item.label === "search")?.count ?? 0;
  const offerClaims =
    analytics.eventsByType.find((item) => item.label === "offer_claim")?.count ?? 0;

  return (
    <div>
      <AdminHeader
        title="Analytics"
        subtitle="Lightweight first-party activity tracking for content and growth."
      />
      <div className="p-6 md:p-10 space-y-8">
        <section className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <StatCard label="Pageviews" value={pageviews} />
          <StatCard label="Searches" value={searches} />
          <StatCard label="Offer Claims" value={offerClaims} accent />
          <StatCard label="Users" value={analytics.totals.users} />
          <StatCard label="Newsletter" value={analytics.totals.subscribers} />
        </section>

        <section className="grid xl:grid-cols-2 gap-8">
          <AnalyticsTable title="Popular Pages" rows={analytics.popularPaths} />
          <AnalyticsTable title="Search Terms" rows={analytics.searches} />
          <AnalyticsTable title="Event Types" rows={analytics.eventsByType} />
          <AnalyticsTable title="Ad Events" rows={analytics.adEvents} />
        </section>
      </div>
    </div>
  );
}

function AnalyticsTable({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; count: number }[];
}) {
  return (
    <section>
      <h2 className="font-display text-3xl uppercase mb-3">{title}</h2>
      <AdminTable
        headers={["Item", "Count"]}
        rows={rows.map((row) => [
          <span className="font-mono text-xs break-all">{row.label}</span>,
          <span className="font-display text-2xl">{row.count}</span>,
        ])}
      />
    </section>
  );
}
