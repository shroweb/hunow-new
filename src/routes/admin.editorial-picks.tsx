import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminHeader, AdminTable } from "@/components/admin/AdminLayout";
import { articlePath } from "@/lib/taxonomy";
import { setState, useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/editorial-picks")({
  component: AdminEditorialPicks,
});

function AdminEditorialPicks() {
  const articles = useStore((s) => s.articles);
  const events = useStore((s) => s.events);
  const listings = useStore((s) => s.listings);
  const offers = useStore((s) => s.offers);

  return (
    <div>
      <AdminHeader
        title="Editorial Picks"
        subtitle="Control featured stories, events, places and offers used across homepage modules."
      />
      <div className="p-6 md:p-10 space-y-8">
        <PickTable
          title="Stories"
          headers={["Story", "Status", "Featured", "Preview"]}
          rows={articles.map((item) => [
            item.title,
            item.status,
            <PickToggle
              checked={item.isFeatured}
              onClick={() =>
                setState((s) => ({
                  ...s,
                  articles: s.articles.map((article) =>
                    article.id === item.id
                      ? { ...article, isFeatured: !article.isFeatured }
                      : article,
                  ),
                }))
              }
            />,
            <a href={articlePath(item)} className="text-[10px] font-bold uppercase underline">
              View
            </a>,
          ])}
        />
        <PickTable
          title="Events"
          headers={["Event", "Date", "Featured", "Preview"]}
          rows={events.map((item) => [
            item.title,
            item.startDate,
            <PickToggle
              checked={item.isFeatured}
              onClick={() =>
                setState((s) => ({
                  ...s,
                  events: s.events.map((event) =>
                    event.id === item.id ? { ...event, isFeatured: !event.isFeatured } : event,
                  ),
                }))
              }
            />,
            <Link
              to="/events/$slug"
              params={{ slug: item.slug }}
              className="text-[10px] font-bold uppercase underline"
            >
              View
            </Link>,
          ])}
        />
        <PickTable
          title="Places"
          headers={["Place", "Area", "Featured", "Preview"]}
          rows={listings.map((item) => [
            item.name,
            item.area,
            <PickToggle
              checked={item.isFeatured}
              onClick={() =>
                setState((s) => ({
                  ...s,
                  listings: s.listings.map((listing) =>
                    listing.id === item.id
                      ? { ...listing, isFeatured: !listing.isFeatured }
                      : listing,
                  ),
                }))
              }
            />,
            <Link
              to="/places/$slug"
              params={{ slug: item.slug }}
              className="text-[10px] font-bold uppercase underline"
            >
              View
            </Link>,
          ])}
        />
        <PickTable
          title="Offers"
          headers={["Offer", "Business", "Featured", "Status"]}
          rows={offers.map((item) => [
            item.title,
            item.businessName,
            <PickToggle
              checked={!!item.isFeatured}
              onClick={() =>
                setState((s) => ({
                  ...s,
                  offers: s.offers.map((offer) =>
                    offer.id === item.id ? { ...offer, isFeatured: !offer.isFeatured } : offer,
                  ),
                }))
              }
            />,
            item.status,
          ])}
        />
      </div>
    </div>
  );
}

function PickTable({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <section>
      <h2 className="font-display text-3xl uppercase mb-3">{title}</h2>
      <AdminTable headers={headers} rows={rows} />
    </section>
  );
}

function PickToggle({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-[10px] font-bold uppercase px-3 py-1 ${
        checked ? "bg-accent text-background" : "border border-foreground/30"
      }`}
    >
      {checked ? "Featured" : "Feature"}
    </button>
  );
}
