import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminField, AdminHeader, adminBtn, adminInput } from "@/components/admin/AdminLayout";
import {
  getNewsletterBuilder,
  renderNewsletterIssue,
  saveNewsletterDraft,
  sendNewsletterCampaign,
  sendNewsletterTest,
} from "@/lib/newsletter.functions";

export const Route = createFileRoute("/admin/newsletter")({
  loader: async () => ({ data: await getNewsletterBuilder() }),
  component: AdminNewsletter,
});

type NewsletterSegment = "all" | "events" | "offers" | "businesses";

const segments: { value: NewsletterSegment; label: string; note: string }[] = [
  { value: "all", label: "All", note: "Everyone on the list" },
  { value: "events", label: "Events", note: "Subscribers tagged for what's on" },
  { value: "offers", label: "Offers", note: "Subscribers tagged for deals" },
  { value: "businesses", label: "Business", note: "Owners and advertisers" },
];

function AdminNewsletter() {
  const router = useRouter();
  const { data } = Route.useLoaderData();
  const [subject, setSubject] = useState("This week in Hull");
  const [intro, setIntro] = useState(
    "The best events, stories and offers to know about this week.",
  );
  const [segment, setSegment] = useState<NewsletterSegment>("all");
  const [scheduledFor, setScheduledFor] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [selected, setSelected] = useState(data.suggestedSelection);
  const [preview, setPreview] = useState(data.preview);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState<"preview" | "save" | "test" | "send" | "">("");

  const payload = useMemo(
    () => ({
      subject,
      intro,
      segment,
      selected,
      scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : null,
    }),
    [intro, scheduledFor, segment, selected, subject],
  );

  const issueCounts = {
    stories: selected.articles.length,
    events: selected.events.length,
    offers: selected.offers.length,
    places: selected.listings.length,
  };

  const refreshPreview = async () => {
    setBusy("preview");
    try {
      const next = await renderNewsletterIssue({ data: payload });
      setPreview(next);
      setStatus("Template preview updated.");
    } finally {
      setBusy("");
    }
  };

  const saveDraft = async () => {
    setBusy("save");
    try {
      const result = await saveNewsletterDraft({ data: payload });
      setPreview(await renderNewsletterIssue({ data: payload }));
      setStatus(result.status === "scheduled" ? "Campaign scheduled." : "Draft saved.");
      await router.invalidate();
    } finally {
      setBusy("");
    }
  };

  const sendTest = async () => {
    if (!testEmail) {
      setStatus("Add a test email first.");
      return;
    }
    setBusy("test");
    try {
      await sendNewsletterTest({ data: { ...payload, testEmail } });
      setStatus(`Test sent to ${testEmail}.`);
    } finally {
      setBusy("");
    }
  };

  const sendLive = async () => {
    if (!confirm("Send this newsletter campaign now?")) return;
    setBusy("send");
    try {
      const result = await sendNewsletterCampaign({ data: payload });
      setStatus(`Campaign sent to ${result.recipients} subscribers.`);
      await router.invalidate();
    } finally {
      setBusy("");
    }
  };

  return (
    <div>
      <AdminHeader
        title="Newsletter"
        subtitle={`${data.subscribers} subscribers · build, preview and send a branded HU NOW issue.`}
      />
      <div className="p-6 md:p-10 grid 2xl:grid-cols-[minmax(0,1fr)_620px] gap-8">
        <div className="space-y-6">
          <section className="border-2 border-foreground bg-white p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <AdminField label="Subject">
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={adminInput}
                />
              </AdminField>
              <AdminField label="Schedule">
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className={adminInput}
                />
              </AdminField>
            </div>
            <AdminField label="Intro">
              <textarea
                value={intro}
                onChange={(e) => setIntro(e.target.value)}
                rows={3}
                className={adminInput}
              />
            </AdminField>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                Segment
              </div>
              <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-2">
                {segments.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setSegment(item.value)}
                    className={`border-2 p-3 text-left ${
                      segment === item.value
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-background"
                    }`}
                  >
                    <span className="block font-display text-xl uppercase">{item.label}</span>
                    <span className="block text-xs opacity-75">{item.note}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <div className="grid md:grid-cols-4 gap-3">
            {Object.entries(issueCounts).map(([label, value]) => (
              <div key={label} className="border-2 border-foreground bg-white p-4">
                <div className="font-display text-4xl leading-none">{value}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {label}
                </div>
              </div>
            ))}
          </div>

          <Picker
            title="Stories"
            items={data.articles.map((item) => ({
              id: item.id,
              title: item.title,
              meta: item.category,
              image: item.featuredImage,
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
              image: item.featuredImage,
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
              image: item.featuredImage,
            }))}
            value={selected.listings}
            onChange={(ids) => setSelected((current) => ({ ...current, listings: ids }))}
          />
        </div>

        <aside className="space-y-6">
          <section className="border-2 border-foreground bg-white p-5 sticky top-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                type="button"
                onClick={() => void refreshPreview()}
                className={adminBtn}
                disabled={busy !== ""}
              >
                {busy === "preview" ? "Updating..." : "Update Preview"}
              </button>
              <button
                type="button"
                onClick={() => void saveDraft()}
                className={adminBtn}
                disabled={busy !== ""}
              >
                {busy === "save" ? "Saving..." : scheduledFor ? "Save Schedule" : "Save Draft"}
              </button>
            </div>
            <div className="grid sm:grid-cols-[1fr_auto] gap-2 mb-4">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@email.com"
                className={adminInput}
              />
              <button
                type="button"
                onClick={() => void sendTest()}
                className={adminBtn}
                disabled={busy !== ""}
              >
                {busy === "test" ? "Sending..." : "Send Test"}
              </button>
            </div>
            <button
              type="button"
              onClick={() => void sendLive()}
              className={`${adminBtn} w-full bg-accent text-foreground border-accent`}
              disabled={busy !== ""}
            >
              {busy === "send" ? "Sending..." : "Send Campaign Now"}
            </button>
            {status && (
              <div className="mt-4 border border-border bg-background p-3 text-sm text-muted-foreground">
                {status}
              </div>
            )}
            <div className="mt-5">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                HTML preview
              </div>
              <iframe
                title="Newsletter HTML preview"
                srcDoc={preview.html}
                className="w-full h-[720px] border-2 border-foreground bg-background"
              />
              <button
                type="button"
                onClick={() => void navigator.clipboard?.writeText(preview.text)}
                className={`${adminBtn} mt-3`}
              >
                Copy Plain Text
              </button>
            </div>
          </section>

          <section className="border-2 border-foreground bg-white p-5">
            <h2 className="font-display text-3xl uppercase mb-4">Campaign history</h2>
            <div className="space-y-3">
              {data.campaigns.length === 0 ? (
                <p className="text-sm text-muted-foreground">No newsletter campaigns yet.</p>
              ) : (
                data.campaigns.map((campaign) => (
                  <div key={campaign.id} className="border border-border p-3">
                    <div className="font-bold">{campaign.subject}</div>
                    <div className="font-mono text-[10px] uppercase text-muted-foreground">
                      {campaign.status} · {campaign.segment} · {campaign.recipientCount} recipients
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {campaign.sentAt
                        ? `Sent ${new Date(campaign.sentAt).toLocaleString()}`
                        : campaign.scheduledFor
                          ? `Scheduled ${new Date(campaign.scheduledFor).toLocaleString()}`
                          : `Created ${new Date(campaign.createdAt).toLocaleString()}`}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
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
  items: { id: string; title: string; meta: string; image?: string }[];
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
