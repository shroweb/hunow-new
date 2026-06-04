import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminHeader, StatCard, adminBtn, adminBtnOutline } from "@/components/admin/AdminLayout";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const articles = useStore((s) => s.articles);
  const events = useStore((s) => s.events);
  const listings = useStore((s) => s.listings);
  const offers = useStore((s) => s.offers);
  const submissions = useStore((s) => s.submissions);
  const newsletter = useStore((s) => s.newsletter);
  const ads = useStore((s) => s.ads);

  const pending = submissions.filter((s) => s.status === "pending").length;
  const publishedArticles = articles.filter((a) => a.status === "published").length;
  const publishedEvents = events.filter((e) => e.status === "published").length;
  const activeListings = listings.filter((l) => !l.isHiddenGem || l.isFeatured).length;
  const upcomingEvents = [...events]
    .filter((e) => e.status === "published")
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 5);
  const recentArticles = [...articles]
    .filter((a) => a.status === "published")
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 5);
  const pendingSubmissions = submissions.filter((s) => s.status === "pending").slice(0, 4);

  return (
    <div>
      <AdminHeader
        title="Dashboard"
        subtitle="Manage published content, submissions, offers and directory records."
      />
      <div className="p-6 md:p-10 space-y-8">
        <section className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Published Articles" value={`${publishedArticles}/${articles.length}`} />
          <StatCard label="Published Events" value={`${publishedEvents}/${events.length}`} />
          <StatCard label="Directory Places" value={listings.length} />
          <StatCard
            label="Active Offers"
            value={offers.filter((o) => o.status === "active").length}
          />
          <StatCard label="Pending Reviews" value={pending} accent />
          <StatCard label="Newsletter" value={newsletter.length} />
          <StatCard label="Active Ads" value={ads.filter((a) => a.status === "active").length} />
        </section>

        <section className="grid xl:grid-cols-[1fr_360px] gap-6">
          <div className="border-2 border-foreground bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="font-display text-3xl uppercase leading-none">Editorial Workflow</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Content is saved to the connected Postgres database.
                </p>
              </div>
              <Link to="/" className={adminBtnOutline}>
                Preview Site
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Link to="/admin/articles" className={adminBtn}>
                New Article
              </Link>
              <Link to="/admin/events" className={adminBtn}>
                New Event
              </Link>
              <Link to="/admin/listings" className={adminBtn}>
                New Place
              </Link>
              <Link to="/admin/offers" className={adminBtn}>
                New Offer
              </Link>
            </div>
          </div>

          <div className="border-2 border-accent bg-accent/5 p-6">
            <div className="text-[10px] font-mono uppercase tracking-widest text-accent mb-2">
              Needs attention
            </div>
            <div className="font-display text-4xl leading-none mb-2">{pending}</div>
            <p className="text-sm text-muted-foreground mb-5">
              Reader submissions are waiting for editorial review.
            </p>
            <Link to="/admin/submissions" className={adminBtn}>
              Review Submissions
            </Link>
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="border-2 border-foreground bg-white p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h3 className="font-display text-2xl uppercase">Upcoming Events</h3>
              <Link
                to="/admin/events"
                className="text-[10px] font-bold uppercase tracking-widest underline"
              >
                Manage
              </Link>
            </div>
            <ul className="space-y-2 text-sm">
              {upcomingEvents.map((e) => (
                <li key={e.id} className="flex justify-between border-b border-border pb-2">
                  <span className="font-bold truncate">{e.title}</span>
                  <span className="font-mono text-[10px] uppercase text-muted-foreground shrink-0 ml-3">
                    {e.startDate}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-2 border-foreground bg-white p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h3 className="font-display text-2xl uppercase">Recent Articles</h3>
              <Link
                to="/admin/articles"
                className="text-[10px] font-bold uppercase tracking-widest underline"
              >
                Manage
              </Link>
            </div>
            <ul className="space-y-2 text-sm">
              {recentArticles.map((a) => (
                <li key={a.id} className="flex justify-between border-b border-border pb-2">
                  <span className="font-bold truncate">{a.title}</span>
                  <span className="font-mono text-[10px] uppercase text-muted-foreground shrink-0 ml-3">
                    {a.publishedAt}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="border-2 border-foreground bg-white p-6">
            <h3 className="font-display text-2xl uppercase mb-4">Pending Queue</h3>
            {pendingSubmissions.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {pendingSubmissions.map((s) => (
                  <li key={s.id} className="flex justify-between border-b border-border pb-2">
                    <span className="font-bold truncate">{s.title}</span>
                    <span className="font-mono text-[10px] uppercase text-muted-foreground shrink-0 ml-3">
                      {s.type}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Nothing waiting for review.</p>
            )}
          </div>
          <div className="border-2 border-foreground bg-white p-6">
            <h3 className="font-display text-2xl uppercase mb-4">Directory Health</h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-mono text-[10px] uppercase text-muted-foreground">
                  Featured places
                </dt>
                <dd className="font-display text-3xl">{activeListings}</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase text-muted-foreground">
                  Verified places
                </dt>
                <dd className="font-display text-3xl">
                  {listings.filter((l) => l.isVerified).length}
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </div>
    </div>
  );
}
