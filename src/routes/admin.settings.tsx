import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  AdminField,
  AdminHeader,
  adminBtn,
  adminInput,
} from "@/components/admin/AdminLayout";
import { getSettings, saveSetting } from "@/lib/settings.functions";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
  loader: async () => {
    const settings = await getSettings();
    return { settings };
  },
});

const SOCIAL_FIELDS = [
  { key: "social_facebook", label: "Facebook URL", placeholder: "https://facebook.com/hunow" },
  { key: "social_instagram", label: "Instagram URL", placeholder: "https://instagram.com/hunow" },
  { key: "social_twitter", label: "X / Twitter URL", placeholder: "https://x.com/hunow" },
  { key: "social_tiktok", label: "TikTok URL", placeholder: "https://tiktok.com/@hunow" },
  { key: "social_youtube", label: "YouTube URL", placeholder: "https://youtube.com/@hunow" },
];

function AdminSettings() {
  const { settings: initial } = Route.useLoaderData();
  const [settings, setSettings] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSaving(true);
    setSaved(false);
    try {
      for (const { key } of SOCIAL_FIELDS) {
        await saveSetting({ data: { key, value: String(fd.get(key) || "") } });
      }
      const updated = Object.fromEntries(
        SOCIAL_FIELDS.map(({ key }) => [key, String(fd.get(key) || "")]),
      );
      setSettings((s: Record<string, string>) => ({ ...s, ...updated }));
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <AdminHeader title="Settings" subtitle="Social links and site-wide configuration" />
      <div className="p-6 md:p-10 max-w-2xl">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="border border-border p-6 space-y-4">
            <div className="font-bold text-sm uppercase tracking-wide mb-4">Social media links</div>
            {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
              <AdminField key={key} label={label}>
                <input
                  name={key}
                  type="url"
                  defaultValue={settings[key] ?? ""}
                  placeholder={placeholder}
                  className={adminInput}
                />
              </AdminField>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button className={adminBtn} disabled={saving}>
              {saving ? "Saving…" : "Save settings"}
            </button>
            {saved && <span className="text-sm text-accent font-bold">Saved ✓</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
