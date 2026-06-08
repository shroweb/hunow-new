import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AdminField, AdminHeader, adminBtn, adminInput } from "@/components/admin/AdminLayout";
import { getSettings, saveSetting } from "@/lib/settings.functions";
import { resetStoreToEmpty, exportAllDataFn } from "@/lib/admin-maintenance.functions";
import { sendPushToSegmentFn } from "@/lib/content.functions";
import { setState } from "@/lib/store";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
  loader: async () => {
    const settings = await getSettings();
    return { settings };
  },
});

interface FieldDef {
  key: string;
  label: string;
  placeholder?: string;
  type?: "text" | "url" | "email" | "tel" | "textarea";
  hint?: string;
}

const SECTIONS: { title: string; fields: FieldDef[] }[] = [
  {
    title: "Site identity",
    fields: [
      { key: "site_name", label: "Site name", placeholder: "HU NOW" },
      { key: "site_tagline", label: "Tagline", placeholder: "Hull's Independent City Guide" },
    ],
  },
  {
    title: "SEO & metadata",
    fields: [
      {
        key: "meta_description",
        label: "Default meta description",
        type: "textarea",
        placeholder: "Events, places, stories and independent businesses across Hull.",
        hint: "Used on pages that don't have their own description. Keep under 160 characters.",
      },
      {
        key: "meta_description_og",
        label: "Default Open Graph description",
        type: "textarea",
        placeholder: "Find what's on, where to eat and what to explore in Hull.",
        hint: "Shown when the site is shared on social media. Can differ from the meta description.",
      },
      {
        key: "og_image",
        label: "Default OG image URL",
        type: "url",
        placeholder: "https://hunow.co.uk/og-default.jpg",
        hint: "Fallback social share image (1200×630px recommended). Leave blank to use Twitter summary card.",
      },
      {
        key: "ga_id",
        label: "Google Analytics measurement ID",
        placeholder: "G-XXXXXXXXXX",
        hint: "Paste your GA4 measurement ID to enable analytics. Leave blank to disable.",
      },
    ],
  },
  {
    title: "Contact details",
    fields: [
      {
        key: "contact_email",
        label: "Contact email",
        type: "email",
        placeholder: "hello@hunow.co.uk",
      },
      { key: "contact_phone", label: "Phone (optional)", type: "tel", placeholder: "01482 000000" },
      {
        key: "privacy_url",
        label: "Privacy policy URL",
        type: "url",
        placeholder: "https://hunow.co.uk/privacy",
      },
    ],
  },
  {
    title: "Social media links",
    fields: [
      {
        key: "social_facebook",
        label: "Facebook",
        type: "url",
        placeholder: "https://facebook.com/hunow",
      },
      {
        key: "social_instagram",
        label: "Instagram",
        type: "url",
        placeholder: "https://instagram.com/hunow",
      },
      {
        key: "social_twitter",
        label: "X / Twitter",
        type: "url",
        placeholder: "https://x.com/hunow",
      },
      {
        key: "social_tiktok",
        label: "TikTok",
        type: "url",
        placeholder: "https://tiktok.com/@hunow",
      },
      {
        key: "social_youtube",
        label: "YouTube",
        type: "url",
        placeholder: "https://youtube.com/@hunow",
      },
    ],
  },
];

const ALL_KEYS = SECTIONS.flatMap((s) => s.fields.map((f) => f.key));

function AdminSettings() {
  const { settings: initial } = Route.useLoaderData();
  const [settings, setSettings] = useState<Record<string, string>>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetConfirm, setResetConfirm] = useState("");
  const [exporting, setExporting] = useState(false);

  const onExport = async () => {
    setExporting(true);
    try {
      const data = await exportAllDataFn();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hunow-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSaving(true);
    setSaved(false);
    try {
      for (const key of ALL_KEYS) {
        await saveSetting({ data: { key, value: String(fd.get(key) || "") } });
      }
      const updated = Object.fromEntries(ALL_KEYS.map((k) => [k, String(fd.get(k) || "")]));
      setSettings((s) => ({ ...s, ...updated }));
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const onReset = async () => {
    if (resetConfirm !== "RESET") return;
    setResetting(true);
    try {
      // Wipe everything on the server
      await resetStoreToEmpty();

      // Clear local state and localStorage
      try {
        localStorage.removeItem("hunow:store:v3");
      } catch {
        /* ignore */
      }
      setState(() => ({
        articles: [],
        events: [],
        listings: [],
        offers: [],
        submissions: [],
        ads: [],
        media: [],
        collections: [],
        newsletter: [],
      }));
      window.location.reload();
    } catch (err) {
      console.error("Reset failed:", err);
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Reset failed: ${msg}`);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div>
      <AdminHeader
        title="Settings"
        subtitle="Site identity, SEO, contact details and social links"
      />
      <div className="p-6 md:p-10 max-w-2xl">
        <form onSubmit={onSubmit} className="space-y-8">
          {SECTIONS.map((section) => (
            <div key={section.title} className="border border-border p-6 space-y-4">
              <div className="font-bold text-sm uppercase tracking-wide border-b border-border pb-3 mb-2">
                {section.title}
              </div>
              {section.fields.map(({ key, label, placeholder, type = "text", hint }) => (
                <AdminField key={key} label={label}>
                  {type === "textarea" ? (
                    <textarea
                      name={key}
                      defaultValue={settings[key] ?? ""}
                      placeholder={placeholder}
                      rows={3}
                      className={adminInput}
                    />
                  ) : (
                    <input
                      name={key}
                      type={type}
                      defaultValue={settings[key] ?? ""}
                      placeholder={placeholder}
                      className={adminInput}
                    />
                  )}
                  {hint && (
                    <p className="mt-1 text-[11px] text-muted-foreground font-mono">{hint}</p>
                  )}
                </AdminField>
              ))}
            </div>
          ))}

          <div className="flex items-center gap-4 pt-2">
            <button className={adminBtn} disabled={saving}>
              {saving ? "Saving…" : "Save all settings"}
            </button>
            {saved && <span className="text-sm text-accent font-bold">Saved ✓</span>}
          </div>
        </form>

        {/* Web Push */}
        <div className="mt-12 border border-border p-6">
          <div className="font-bold text-sm uppercase tracking-wide mb-1">Web Push Notifications</div>
          <p className="text-sm text-muted-foreground mb-4">
            Send a push notification to subscribed users. Requires VAPID keys in environment variables.
          </p>
          <PushSendForm />
        </div>

        {/* Backup */}
        <div className="mt-6 border border-border p-6">
          <div className="font-bold text-sm uppercase tracking-wide mb-1">Data backup</div>
          <p className="text-sm text-muted-foreground mb-4">
            Download a full JSON backup of all content and subscribers. Store it somewhere safe
            before making large changes.
          </p>
          <button
            type="button"
            onClick={onExport}
            disabled={exporting}
            className={`${adminBtn} disabled:opacity-50`}
          >
            {exporting ? "Exporting…" : "Export JSON backup"}
          </button>
        </div>

        {/* Danger zone */}
        <div className="mt-6 border-2 border-red-600 p-6">
          <div className="font-bold text-sm uppercase tracking-wide text-red-600 mb-1">
            Danger zone
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Permanently deletes all articles, events, places, media and other content. The site will
            be completely empty. This cannot be undone.
          </p>
          <div className="mb-3">
            <label className="block text-xs font-mono uppercase tracking-wide text-muted-foreground mb-1.5">
              Type RESET to confirm
            </label>
            <input
              type="text"
              value={resetConfirm}
              onChange={(e) => setResetConfirm(e.target.value)}
              placeholder="RESET"
              className={`${adminInput} w-48`}
            />
          </div>
          <button
            type="button"
            onClick={onReset}
            disabled={resetting || resetConfirm !== "RESET"}
            className="bg-red-600 text-white px-5 py-2.5 font-bold uppercase tracking-widest text-[10px] hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resetting ? "Resetting…" : "Reset all content"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PushSendForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [segment, setSegment] = useState<"all" | "events" | "offers" | "businesses">("all");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");

  const send = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    setStatus("");
    try {
      const result = await sendPushToSegmentFn({ data: { segment, title, body, url: url || undefined } });
      setStatus(`✓ Sent to ${result.sent} subscriber${result.sent !== 1 ? "s" : ""}${result.failed ? `, ${result.failed} failed` : ""}`);
      setTitle(""); setBody(""); setUrl("");
    } catch (err) {
      setStatus(`Error: ${String(err)}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={send} className="space-y-3 max-w-lg">
      <div className="flex gap-2 flex-wrap">
        {(["all", "events", "offers", "businesses"] as const).map((s) => (
          <button key={s} type="button" onClick={() => setSegment(s)}
            className={`px-3 py-1 text-[10px] font-bold uppercase ${segment === s ? "bg-foreground text-background" : "border border-foreground/30"}`}>
            {s}
          </button>
        ))}
      </div>
      <AdminField label="Title">
        <input value={title} onChange={(e) => setTitle(e.target.value)} required className={adminInput} placeholder="What's on this weekend…" />
      </AdminField>
      <AdminField label="Body">
        <input value={body} onChange={(e) => setBody(e.target.value)} required className={adminInput} placeholder="Short message text" />
      </AdminField>
      <AdminField label="Link (optional)">
        <input value={url} onChange={(e) => setUrl(e.target.value)} className={adminInput} placeholder="/whats-on" />
      </AdminField>
      <button type="submit" disabled={sending} className={`${adminBtn} disabled:opacity-50`}>
        {sending ? "Sending…" : "Send Push Notification"}
      </button>
      {status && <p className="text-xs font-mono text-muted-foreground">{status}</p>}
    </form>
  );
}
