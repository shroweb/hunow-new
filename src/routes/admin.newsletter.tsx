import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminField, AdminHeader, adminBtn, adminInput } from "@/components/admin/AdminLayout";
import { getNewsletterBuilder } from "@/lib/newsletter.functions";

export const Route = createFileRoute("/admin/newsletter")({
  loader: async () => ({ data: await getNewsletterBuilder() }),
  component: AdminNewsletter,
});

function AdminNewsletter() {
  const { data } = Route.useLoaderData();
  const [subject, setSubject] = useState("This week in Hull");
  const [intro, setIntro] = useState(
    "The best events, stories and offers to know about this week.",
  );
  const [selected, setSelected] = useState(() => ({
    articles: data.articles.slice(0, 4).map((item) => item.id),
    events: data.events.slice(0, 4).map((item) => item.id),
    offers: data.offers.slice(0, 3).map((item) => item.id),
    listings: data.listings.slice(0, 3).map((item) => item.id),
  }));

  const issue = useMemo(() => {
    const articles = data.articles.filter((item) => selected.articles.includes(item.id));
    const events = data.events.filter((item) => selected.events.includes(item.id));
    const offers = data.offers.filter((item) => selected.offers.includes(item.id));
    const listings = data.listings.filter((item) => selected.listings.includes(item.id));
    return { articles, events, offers, listings };
  }, [data, selected]);

  const plainText = [
    subject,
    "",
    intro,
    "",
    "Stories",
    ...issue.articles.map((item) => `- ${item.title}: ${item.excerpt}`),
    "",
    "What's On",
    ...issue.events.map((item) => `- ${item.title} at ${item.locationName} (${item.startDate})`),
    "",
    "Offers",
    ...issue.offers.map((item) => `- ${item.title} from ${item.businessName}`),
    "",
    "Places",
    ...issue.listings.map((item) => `- ${item.name} (${item.category}, ${item.area})`),
  ].join("\n");

  return (
    <div>
      <AdminHeader
        title="Newsletter"
        subtitle={`${data.subscribers} subscribers · build a weekly issue from live content.`}
      />
      <div className="p-6 md:p-10 grid xl:grid-cols-[1fr_420px] gap-8">
        <div className="space-y-6">
          <div className="border-2 border-foreground bg-white p-6 space-y-4">
            <AdminField label="Subject">
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={adminInput}
              />
            </AdminField>
            <AdminField label="Intro">
              <textarea
                value={intro}
                onChange={(e) => setIntro(e.target.value)}
                rows={3}
                className={adminInput}
              />
            </AdminField>
          </div>

          <Picker
            title="Stories"
            items={data.articles.map((item) => ({
              id: item.id,
              title: item.title,
              meta: item.category,
            }))}
            value={selected.articles}
            onChange={(ids) => setSelected((current) => ({ ...current, articles: ids }))}
          />
          <Picker
            title="Events"
            items={data.events.map((item) => ({
              id: item.id,
              title: item.title,
              meta: `${item.locationName} · ${item.startDate}`,
            }))}
            value={selected.events}
            onChange={(ids) => setSelected((current) => ({ ...current, events: ids }))}
          />
          <Picker
            title="Offers"
            items={data.offers.map((item) => ({
              id: item.id,
              title: item.title,
              meta: item.businessName,
            }))}
            value={selected.offers}
            onChange={(ids) => setSelected((current) => ({ ...current, offers: ids }))}
          />
          <Picker
            title="Places"
            items={data.listings.map((item) => ({
              id: item.id,
              title: item.name,
              meta: `${item.category} · ${item.area}`,
            }))}
            value={selected.listings}
            onChange={(ids) => setSelected((current) => ({ ...current, listings: ids }))}
          />
        </div>

        <aside className="border-2 border-foreground bg-white p-6 h-fit sticky top-6">
          <div className="font-mono text-[10px] uppercase text-muted-foreground mb-3">
            Issue preview
          </div>
          <h2 className="font-display text-4xl uppercase leading-none mb-3">{subject}</h2>
          <p className="text-sm text-muted-foreground mb-6">{intro}</p>
          <pre className="whitespace-pre-wrap bg-background border border-border p-4 text-xs max-h-[560px] overflow-auto">
            {plainText}
          </pre>
          <button
            type="button"
            onClick={() => void navigator.clipboard?.writeText(plainText)}
            className={`${adminBtn} mt-4`}
          >
            Copy Text
          </button>
        </aside>
      </div>
    </div>
  );
}

function Picker({
  title,
  items,
  value,
  onChange,
}: {
  title: string;
  items: { id: string; title: string; meta: string }[];
  value: string[];
  onChange: (ids: string[]) => void;
}) {
  return (
    <section className="border-2 border-foreground bg-white p-6">
      <h3 className="font-display text-2xl uppercase mb-4">{title}</h3>
      <div className="grid md:grid-cols-2 gap-2">
        {items.map((item) => (
          <label key={item.id} className="flex gap-3 border border-border p-3 text-sm">
            <input
              type="checkbox"
              checked={value.includes(item.id)}
              onChange={(event) =>
                onChange(
                  event.target.checked ? [...value, item.id] : value.filter((id) => id !== item.id),
                )
              }
            />
            <span>
              <span className="block font-bold">{item.title}</span>
              <span className="font-mono text-[10px] uppercase text-muted-foreground">
                {item.meta}
              </span>
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}
