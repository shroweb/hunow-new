import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminHeader, AdminTable, StatCard } from "@/components/admin/AdminLayout";
import { getAdminAnalytics } from "@/lib/analytics.functions";

type Range = 1 | 7 | 30 | undefined;

const RANGES: { label: string; value: Range }[] = [
  { label: "Today", value: 1 },
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "All time", value: undefined },
];

export const Route = createFileRoute("/admin/analytics")({
  loader: async () => ({ analytics: await getAdminAnalytics({ data: {} }) }),
  component: AdminAnalytics,
});

function AdminAnalytics() {
  const { analytics: initial } = Route.useLoaderData();
  const [analytics, setAnalytics] = useState(initial);
  const [range, setRange] = useState<Range>(undefined);
  const [loading, setLoading] = useState(false);

  async function applyRange(days: Range) {
    setRange(days);
    setLoading(true);
    try {
      const fresh = await getAdminAnalytics({ data: { days } });
      setAnalytics(fresh);
    } finally {
      setLoading(false);
    }
  }

  const pageviews = analytics.eventsByType.find((item) => item.label === "pageview")?.count ?? 0;
  const searches = analytics.eventsByType.find((item) => item.label === "search")?.count ?? 0;
  const offerClaims =
    analytics.eventsByType.find((item) => item.label === "offer_claim")?.count ?? 0;

  return (
    <div>
      <AdminHeader
        title="Analytics"
        subtitle="Lightweight first-party activity tracking for content and growth."
        action={
          <div className="flex gap-1">
            {RANGES.map((r) => (
              <button
                key={String(r.value)}
                type="button"
                disabled={loading}
                onClick={() => applyRange(r.value)}
                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                  range === r.value
                    ? "bg-foreground text-background"
                    : "border-2 border-foreground/30 hover:border-foreground text-foreground/60 hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      />
      <div
        className={`p-6 md:p-10 space-y-8 transition-opacity ${loading ? "opacity-40 pointer-events-none" : ""}`}
      >
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
