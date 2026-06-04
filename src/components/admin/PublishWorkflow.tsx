import { AdminField, adminInput } from "@/components/admin/AdminLayout";
import type { Status } from "@/types";

export function PublishWorkflow({
  status,
  dateName,
  dateLabel,
  dateValue,
  scheduledFor,
  previewHref,
}: {
  status?: Status;
  dateName: string;
  dateLabel: string;
  dateValue?: string;
  scheduledFor?: string;
  previewHref: string;
}) {
  return (
    <div className="border border-foreground/30 bg-stone-50 p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Publish workflow
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Draft, schedule, publish or archive this item.
          </p>
        </div>
        <a
          href={previewHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-bold uppercase underline"
        >
          Preview
        </a>
      </div>
      <AdminField label="Status">
        <select name="status" defaultValue={status ?? "draft"} className={adminInput}>
          <option value="draft">Draft</option>
          <option value="pending">Pending review</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </AdminField>
      <div className="grid grid-cols-2 gap-3">
        <AdminField label={dateLabel}>
          <input
            name={dateName}
            type="date"
            defaultValue={dateValue ?? new Date().toISOString().slice(0, 10)}
            className={adminInput}
          />
        </AdminField>
        <AdminField label="Scheduled for">
          <input
            name="scheduledFor"
            type="datetime-local"
            defaultValue={scheduledFor}
            className={adminInput}
          />
        </AdminField>
      </div>
    </div>
  );
}
