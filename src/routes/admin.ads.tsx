import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  AdminField,
  AdminFormPanel,
  AdminHeader,
  AdminStatus,
  AdminTable,
  adminBtn,
  adminBtnOutline,
  adminInput,
} from "@/components/admin/AdminLayout";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { ValidationErrors } from "@/components/admin/ValidationErrors";
import { validateUrl } from "@/components/admin/validation-utils";
import { setState, uid, useStore } from "@/lib/store";
import type { AdPlacement } from "@/types";

export const Route = createFileRoute("/admin/ads")({ component: AdminAds });

const PLACEMENTS = [
  "Homepage Hero Sponsor",
  "Homepage Inline Banner",
  "Sidebar Ad",
  "Listing Detail Sponsor",
  "Story Inline Sponsor",
  "Newsletter Sponsor",
];

function AdminAds() {
  const ads = useStore((s) => s.ads);
  const [editing, setEditing] = useState<AdPlacement | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const active = ads.filter((a) => a.status === "active").length;

  const openForm = (ad: AdPlacement | null) => {
    setEditing(ad);
    setErrors([]);
    setShowForm(true);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const url = String(fd.get("url"));
    const startDate = String(fd.get("startDate"));
    const endDate = String(fd.get("endDate"));
    const nextErrors = [
      validateUrl(url, "Destination URL"),
      startDate && endDate && endDate < startDate
        ? "Ad end date must be after start date."
        : undefined,
    ].filter(Boolean) as string[];
    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      return;
    }
    const ad: AdPlacement = {
      id: editing?.id ?? uid(),
      advertiserName: String(fd.get("advertiserName")),
      placement: String(fd.get("placement")),
      image: String(fd.get("image") || "photo-1497366216548-37526070297c"),
      url,
      startDate,
      endDate,
      impressions: Number(fd.get("impressions") || 0),
      clicks: Number(fd.get("clicks") || 0),
      status: fd.get("status") as AdPlacement["status"],
    };

    setState((s) => ({
      ...s,
      ads: editing ? s.ads.map((x) => (x.id === ad.id ? ad : x)) : [ad, ...s.ads],
    }));
    setEditing(null);
    setErrors([]);
    setShowForm(false);
  };

  const setStatus = (id: string, status: AdPlacement["status"]) => {
    setState((s) => ({
      ...s,
      ads: s.ads.map((ad) => (ad.id === id ? { ...ad, status } : ad)),
    }));
  };

  const remove = (id: string) => {
    if (!confirm("Delete this ad placement?")) return;
    setState((s) => ({ ...s, ads: s.ads.filter((ad) => ad.id !== id) }));
  };

  return (
    <div>
      <AdminHeader
        title="Ad Placements"
        subtitle={`${ads.length} placements · ${active} active`}
        action={
          <button onClick={() => openForm(null)} className={adminBtn}>
            New Placement
          </button>
        }
      />
      <div className="p-6 md:p-10">
        {showForm && (
          <AdminFormPanel title={editing ? "Edit Placement" : "New Placement"}>
            <ValidationErrors errors={errors} />
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid lg:grid-cols-[1fr_320px] gap-6">
                <div className="space-y-4">
                  <AdminField label="Advertiser">
                    <input
                      name="advertiserName"
                      defaultValue={editing?.advertiserName}
                      required
                      className={adminInput}
                    />
                  </AdminField>
                  <AdminField label="Destination URL">
                    <input
                      name="url"
                      type="url"
                      defaultValue={editing?.url}
                      required
                      placeholder="https://..."
                      className={adminInput}
                    />
                  </AdminField>
                  <ImageUpload name="image" defaultValue={editing?.image} label="Creative image" />
                </div>
                <div className="space-y-4">
                  <AdminField label="Placement">
                    <input
                      name="placement"
                      list="admin-ad-placements"
                      defaultValue={editing?.placement ?? PLACEMENTS[0]}
                      required
                      className={adminInput}
                    />
                    <datalist id="admin-ad-placements">
                      {PLACEMENTS.map((placement) => (
                        <option key={placement} value={placement} />
                      ))}
                    </datalist>
                  </AdminField>
                  <AdminField label="Status">
                    <select
                      name="status"
                      defaultValue={editing?.status ?? "active"}
                      className={adminInput}
                    >
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="expired">Expired</option>
                    </select>
                  </AdminField>
                  <div className="grid grid-cols-2 gap-3">
                    <AdminField label="Starts">
                      <input
                        name="startDate"
                        type="date"
                        defaultValue={editing?.startDate ?? new Date().toISOString().slice(0, 10)}
                        required
                        className={adminInput}
                      />
                    </AdminField>
                    <AdminField label="Ends">
                      <input
                        name="endDate"
                        type="date"
                        defaultValue={editing?.endDate}
                        required
                        className={adminInput}
                      />
                    </AdminField>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <AdminField label="Impressions">
                      <input
                        name="impressions"
                        type="number"
                        min="0"
                        defaultValue={editing?.impressions ?? 0}
                        className={adminInput}
                      />
                    </AdminField>
                    <AdminField label="Clicks">
                      <input
                        name="clicks"
                        type="number"
                        min="0"
                        defaultValue={editing?.clicks ?? 0}
                        className={adminInput}
                      />
                    </AdminField>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <button className={adminBtn}>
                  {editing ? "Save Placement" : "Create Placement"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditing(null);
                    setErrors([]);
                  }}
                  className={adminBtnOutline}
                >
                  Cancel
                </button>
              </div>
            </form>
          </AdminFormPanel>
        )}
        <AdminTable
          headers={[
            "Advertiser",
            "Placement",
            "Period",
            "Impressions",
            "Clicks",
            "CTR",
            "Status",
            "Actions",
          ]}
          rows={ads.map((a) => [
            <span className="font-bold">{a.advertiserName}</span>,
            <span className="text-xs">{a.placement}</span>,
            <span className="font-mono text-xs">
              {a.startDate} → {a.endDate}
            </span>,
            <span className="font-mono">{a.impressions.toLocaleString()}</span>,
            <span className="font-mono">{a.clicks.toLocaleString()}</span>,
            <span className="font-mono">
              {((a.clicks / Math.max(1, a.impressions)) * 100).toFixed(2)}%
            </span>,
            <AdminStatus status={a.status} />,
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setStatus(a.id, a.status === "active" ? "paused" : "active")}
                className="text-[10px] font-bold uppercase underline"
              >
                {a.status === "active" ? "Pause" : "Activate"}
              </button>
              <button
                onClick={() => openForm(a)}
                className="text-[10px] font-bold uppercase underline"
              >
                Edit
              </button>
              <button
                onClick={() => remove(a.id)}
                className="text-[10px] font-bold uppercase text-red-600 underline"
              >
                Delete
              </button>
            </div>,
          ])}
        />
      </div>
    </div>
  );
}
