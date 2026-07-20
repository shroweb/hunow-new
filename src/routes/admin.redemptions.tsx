import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminHeader, AdminTable, adminBtn, adminInput } from "@/components/admin/AdminLayout";
import { createServerFn } from "@tanstack/react-start";

type RedemptionRow = {
  id: string;
  offer_title: string | null;
  listing_name: string | null;
  customer_name: string | null;
  redeemed_at: string;
  method: string;
};

const getAdminRedemptionsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdmin } = await import("@/lib/auth.server");
  await requireAdmin();
  const { getPool, ensureSchema } = await import("@/lib/db.server");
  await ensureSchema();
  const pool = getPool();
  const result = await pool.query<RedemptionRow>(
    `select r.id,
            o.data->>'title'   as offer_title,
            l.data->>'name'    as listing_name,
            r.customer_name,
            r.redeemed_at,
            coalesce(r.method::text, 'qr') as method
     from app_redemptions r
     left join offers   o on o.id = r.offer_id
     left join listings l on l.id = r.listing_id
     order by r.redeemed_at desc
     limit 200`,
  );
  return result.rows;
});

export const Route = createFileRoute("/admin/redemptions")({ component: AdminRedemptions });

function AdminRedemptions() {
  const [rows, setRows] = useState<RedemptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAdminRedemptionsFn()
      .then(setRows)
      .finally(() => setLoading(false));
  }, []);

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    return (
      !q ||
      r.offer_title?.toLowerCase().includes(q) ||
      r.listing_name?.toLowerCase().includes(q) ||
      r.customer_name?.toLowerCase().includes(q)
    );
  });

  // Quick stats from full row set
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
  const thisWeek = rows.filter((r) => new Date(r.redeemed_at).getTime() > weekAgo).length;
  const thisMonth = rows.filter((r) => new Date(r.redeemed_at).getTime() > monthAgo).length;
  const qrCount = rows.filter((r) => r.method === "qr").length;
  const codeCount = rows.filter((r) => r.method === "code").length;

  return (
    <div>
      <AdminHeader
        title="Redemptions"
        subtitle={`${rows.length} total · last 200 shown`}
        action={
          <button
            onClick={() => {
              setLoading(true);
              getAdminRedemptionsFn()
                .then(setRows)
                .finally(() => setLoading(false));
            }}
            className={adminBtn}
          >
            Refresh
          </button>
        }
      />
      <div className="p-6 md:p-10 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "This week", value: thisWeek },
            { label: "This month", value: thisMonth },
            { label: "Via QR", value: qrCount },
            { label: "Via code", value: codeCount },
          ].map((s) => (
            <div key={s.label} className="border-2 border-foreground bg-white p-4">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
                {s.label}
              </div>
              <div className="font-display text-4xl leading-none">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <input
          type="search"
          placeholder="Search by offer, business or customer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${adminInput} max-w-sm`}
        />

        {loading ? (
          <div className="border-2 border-foreground bg-white p-8 font-mono text-xs uppercase">
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-sm text-muted-foreground">No redemptions yet.</div>
        ) : (
          <AdminTable
            headers={["Offer", "Business", "Customer", "Method", "Date"]}
            rows={filtered.map((r) => [
              <span className="font-bold">{r.offer_title ?? "—"}</span>,
              <span>{r.listing_name ?? "—"}</span>,
              <span className="font-mono text-xs">{r.customer_name ?? "—"}</span>,
              <span
                className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                  r.method === "qr"
                    ? "bg-accent/10 text-accent"
                    : "bg-foreground/10 text-foreground"
                }`}
              >
                {r.method}
              </span>,
              <span className="font-mono text-[10px] text-muted-foreground">
                {new Date(r.redeemed_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
                <span className="block">
                  {new Date(r.redeemed_at).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </span>,
            ])}
          />
        )}
      </div>
    </div>
  );
}
