import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  AdminField,
  AdminFormPanel,
  AdminHeader,
  AdminTable,
  adminBtn,
  adminBtnOutline,
  adminInput,
} from "@/components/admin/AdminLayout";
import { img } from "@/data/seed";
import { setState, useStore } from "@/lib/store";
import { deleteMediaFn, upsertMediaFn } from "@/lib/content.functions";
import type { MediaAsset } from "@/types";

export const Route = createFileRoute("/admin/media")({ component: AdminMedia });

function AdminMedia() {
  const media = useStore((s) => s.media);
  const [editing, setEditing] = useState<MediaAsset | null>(null);

  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing) return;
    const fd = new FormData(e.currentTarget);
    const asset: MediaAsset = {
      ...editing,
      fileName: String(fd.get("fileName")),
      url: String(fd.get("url")),
      alt: String(fd.get("alt")),
      credit: String(fd.get("credit") || "") || undefined,
      focalPoint: String(fd.get("focalPoint") || "") || undefined,
    };
    await upsertMediaFn({ data: asset });
    setState(
      (s) => ({
        ...s,
        media: s.media.map((item) => (item.id === asset.id ? asset : item)),
      }),
      { persist: false },
    );
    setEditing(null);
  };

  const remove = async (asset: MediaAsset) => {
    if (
      !confirm(
        `Delete ${asset.fileName} from the media library? Existing content fields are not changed.`,
      )
    ) {
      return;
    }
    await deleteMediaFn({ data: { id: asset.id } });
    setState((s) => ({ ...s, media: s.media.filter((item) => item.id !== asset.id) }), {
      persist: false,
    });
  };

  return (
    <div>
      <AdminHeader
        title="Media"
        subtitle={`${media.length} assets · uploads, alt text, credits and focal points`}
      />
      <div className="p-6 md:p-10">
        {editing && (
          <AdminFormPanel title="Edit Media Asset">
            <form onSubmit={save} className="grid lg:grid-cols-[280px_1fr] gap-6">
              <div className="aspect-[4/3] bg-stone-200 border-2 border-foreground overflow-hidden">
                <img
                  src={img(editing.url, 600, 450)}
                  alt={editing.alt}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-4">
                <AdminField label="File name">
                  <input
                    name="fileName"
                    defaultValue={editing.fileName}
                    required
                    className={adminInput}
                  />
                </AdminField>
                <AdminField label="URL">
                  <input name="url" defaultValue={editing.url} required className={adminInput} />
                </AdminField>
                <AdminField label="Alt text">
                  <input name="alt" defaultValue={editing.alt} required className={adminInput} />
                </AdminField>
                <div className="grid md:grid-cols-2 gap-3">
                  <AdminField label="Credit">
                    <input name="credit" defaultValue={editing.credit} className={adminInput} />
                  </AdminField>
                  <AdminField label="Focal point">
                    <select
                      name="focalPoint"
                      defaultValue={editing.focalPoint ?? "center"}
                      className={adminInput}
                    >
                      <option value="center">Center</option>
                      <option value="top">Top</option>
                      <option value="bottom">Bottom</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </AdminField>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button className={adminBtn}>Save Asset</button>
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className={adminBtnOutline}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </AdminFormPanel>
        )}
        <AdminTable
          headers={["Preview", "Asset", "Alt", "Credit", "Actions"]}
          rows={media.map((asset) => [
            <div className="h-16 w-24 bg-stone-200 overflow-hidden border border-foreground/20">
              <img
                src={img(asset.url, 240, 160)}
                alt={asset.alt}
                className="h-full w-full object-cover"
              />
            </div>,
            <div>
              <div className="font-bold">{asset.fileName}</div>
              <div className="font-mono text-[10px] text-muted-foreground break-all">
                {asset.url}
              </div>
            </div>,
            <span className="text-xs">{asset.alt}</span>,
            <span className="text-xs">{asset.credit ?? "None"}</span>,
            <div className="flex gap-3">
              <button
                onClick={() => setEditing(asset)}
                className="text-[10px] font-bold uppercase underline"
              >
                Edit
              </button>
              <button
                onClick={() => remove(asset)}
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
