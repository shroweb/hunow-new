import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useId, useMemo, type ChangeEvent } from "react";
import {
  AdminHeader,
  AdminTable,
  StatCard,
  adminBtn,
  adminBtnOutline,
  adminInput,
} from "@/components/admin/AdminLayout";
import {
  getNewsletterSubscribers,
  importNewsletterSubscribersFn,
} from "@/lib/newsletter.functions";
import { parseSubscribersText } from "@/lib/csv-subscribers";
import { toast } from "sonner";
import {
  Upload,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

function downloadCsv(subscribers: { email: string; segments: string[]; createdAt: string }[]) {
  const rows = [
    ["email", "segments", "signed_up"],
    ...subscribers.map((s) => [s.email, s.segments.join("|"), new Date(s.createdAt).toISOString()]),
  ];
  const csv = rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `hunow-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export const Route = createFileRoute("/admin/subscribers")({
  loader: async () => ({ data: await getNewsletterSubscribers() }),
  component: AdminSubscribers,
});

function AdminSubscribers() {
  const { data } = Route.useLoaderData();
  const router = useRouter();

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importMode, setImportMode] = useState<"file" | "paste">("file");
  const [rawText, setRawText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [showInvalidDetails, setShowInvalidDetails] = useState(false);

  // Selected default segments
  const [selectedSegments, setSelectedSegments] = useState<
    Record<"events" | "offers" | "businesses", boolean>
  >({
    events: false,
    offers: false,
    businesses: false,
  });

  const fileInputId = useId();

  const activeSegmentsList = useMemo(() => {
    const list: ("events" | "offers" | "businesses")[] = [];
    if (selectedSegments.events) list.push("events");
    if (selectedSegments.offers) list.push("offers");
    if (selectedSegments.businesses) list.push("businesses");
    return list;
  }, [selectedSegments]);

  const parsedResult = useMemo(() => {
    if (!rawText.trim()) return null;
    return parseSubscribersText(rawText, activeSegmentsList);
  }, [rawText, activeSegmentsList]);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        setRawText(text);
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read the selected file");
    };
    reader.readAsText(file);
  };

  const handleResetImport = () => {
    setRawText("");
    setFileName(null);
    setShowInvalidDetails(false);
    setSelectedSegments({ events: false, offers: false, businesses: false });
  };

  const handleExecuteImport = async () => {
    if (!parsedResult || parsedResult.validCount === 0) {
      toast.error("No valid subscribers to import.");
      return;
    }

    const validSubscribers = parsedResult.subscribers
      .filter((s) => s.isValid)
      .map((s) => ({
        email: s.email,
        createdAt: s.createdAt,
        segments: s.segments,
      }));

    setIsImporting(true);
    try {
      const res = await importNewsletterSubscribersFn({
        data: {
          subscribers: validSubscribers,
          defaultSegments: activeSegmentsList,
        },
      });

      toast.success(
        `Successfully imported ${res.total} subscribers (${res.inserted} new, ${res.updated} updated).`,
      );

      if (res.errors && res.errors.length > 0) {
        toast.warning(`${res.errors.length} rows had errors and were skipped.`);
      }

      handleResetImport();
      setIsImportOpen(false);
      await router.invalidate();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to import subscribers";
      toast.error(msg);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div>
      <AdminHeader
        title="Subscribers"
        subtitle="People who signed up through the public newsletter forms or imports."
        action={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsImportOpen((prev) => !prev)}
              className={adminBtnOutline}
            >
              <Upload className="size-3.5" />
              {isImportOpen ? "Close Import" : "Import Subscribers"}
            </button>
            <Link to="/admin/newsletter" className={adminBtn}>
              Build Newsletter
            </Link>
          </div>
        }
      />

      <div className="p-6 md:p-10 space-y-6">
        {/* Import Panel / Drawer */}
        {isImportOpen && (
          <section className="border-2 border-foreground bg-white p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex items-start justify-between gap-4 border-b-2 border-foreground pb-4">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-accent mb-1">
                  <FileSpreadsheet className="size-4" />
                  Newsletter Audience Importer
                </div>
                <h2 className="font-display text-2xl uppercase tracking-tight">
                  Import Subscribers (CSV / Text)
                </h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                  Import subscribers from Mailchimp, Substack, Beehiiv, or any CSV export.
                  Original subscription dates are preserved, existing subscribers will be updated,
                  and unsubscribe tokens will remain protected.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsImportOpen(false)}
                className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Input Mode Tabs */}
            <div className="space-y-4">
              <div className="flex border-b border-border">
                <button
                  type="button"
                  onClick={() => setImportMode("file")}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 -mb-[2px] transition-colors ${
                    importMode === "file"
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Upload className="size-3.5" />
                    Upload CSV File
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setImportMode("paste")}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 -mb-[2px] transition-colors ${
                    importMode === "paste"
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <FileText className="size-3.5" />
                    Paste CSV or Emails
                  </span>
                </button>
              </div>

              {importMode === "file" ? (
                <div className="space-y-3">
                  <label
                    htmlFor={fileInputId}
                    className="border-2 border-dashed border-foreground/40 hover:border-foreground bg-muted/20 hover:bg-muted/40 p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors text-center"
                  >
                    <Upload className="size-8 text-muted-foreground" />
                    <span className="font-bold text-sm">
                      {fileName ? fileName : "Click to browse or drop a .csv file"}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      Accepts .csv with headers like Subscriber/Email and Subscribed/Date
                    </span>
                    <input
                      id={fileInputId}
                      type="file"
                      accept=".csv,text/csv,text/plain"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {fileName && (
                    <div className="flex items-center justify-between text-xs font-mono bg-muted/30 px-3 py-2 border border-border">
                      <span className="truncate">Loaded: <strong>{fileName}</strong></span>
                      <button
                        type="button"
                        onClick={handleResetImport}
                        className="text-red-600 hover:underline ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea
                    rows={6}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder={`Paste CSV content or list of emails here:
subscriber,subscribed
marwa@example.com,2026-04-18 21:38:30
sarah@example.com,2025-06-14 06:24:49

Or plain email list:
john@example.com
alice@example.com`}
                    className={`${adminInput} font-mono text-xs`}
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                    <span>Paste raw comma-separated CSV or newline-separated emails</span>
                    {rawText && (
                      <button
                        type="button"
                        onClick={handleResetImport}
                        className="text-red-600 hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Segment Assignment */}
            <div className="border-t border-border pt-4 space-y-3">
              <div>
                <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Assign Segments to Imported Subscribers
                </label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  All subscribers automatically belong to the main list. Optionally add them to targeted segments:
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-xs font-bold cursor-not-allowed opacity-75">
                  <input type="checkbox" checked disabled className="rounded border-foreground" />
                  <span>All Subscribers ("all")</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSegments.events}
                    onChange={(e) =>
                      setSelectedSegments((prev) => ({ ...prev, events: e.target.checked }))
                    }
                    className="rounded border-foreground"
                  />
                  <span>Events Segment ("events")</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSegments.offers}
                    onChange={(e) =>
                      setSelectedSegments((prev) => ({ ...prev, offers: e.target.checked }))
                    }
                    className="rounded border-foreground"
                  />
                  <span>Offers Segment ("offers")</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSegments.businesses}
                    onChange={(e) =>
                      setSelectedSegments((prev) => ({ ...prev, businesses: e.target.checked }))
                    }
                    className="rounded border-foreground"
                  />
                  <span>Businesses Segment ("businesses")</span>
                </label>
              </div>
            </div>

            {/* Parsed Result Preview */}
            {parsedResult && parsedResult.totalParsed > 0 && (
              <div className="border-t border-border pt-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/20 p-4 border border-border">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 border border-green-200">
                      <CheckCircle2 className="size-3.5" />
                      {parsedResult.validCount} Valid Emails
                    </span>
                    {parsedResult.invalidCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowInvalidDetails((prev) => !prev)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 border border-amber-200 hover:bg-amber-100 transition-colors"
                      >
                        <AlertCircle className="size-3.5" />
                        {parsedResult.invalidCount} Ignored / Duplicates
                        {showInvalidDetails ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
                    {parsedResult.detectedHeaders.emailColumn && (
                      <span>Email: <strong>{parsedResult.detectedHeaders.emailColumn}</strong></span>
                    )}
                    {parsedResult.detectedHeaders.dateColumn && (
                      <span className="inline-flex items-center gap-1 text-foreground font-semibold">
                        <Calendar className="size-3" />
                        Date: <strong>{parsedResult.detectedHeaders.dateColumn}</strong> (preserved)
                      </span>
                    )}
                  </div>
                </div>

                {/* Invalid / Duplicate rows breakdown */}
                {showInvalidDetails && parsedResult.invalidCount > 0 && (
                  <div className="border border-amber-200 bg-amber-50/50 p-4 text-xs space-y-2">
                    <div className="font-bold text-amber-900 uppercase tracking-wider text-[10px]">
                      Ignored / Warning Rows ({parsedResult.invalidCount})
                    </div>
                    <ul className="list-disc list-inside space-y-1 font-mono text-amber-900/90 max-h-36 overflow-y-auto">
                      {parsedResult.subscribers
                        .filter((s) => !s.isValid || s.error)
                        .map((s, idx) => (
                          <li key={idx}>
                            Row {s.sourceRowNumber}: "{s.email}" — {s.error}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {/* Preview Table (First 5 entries) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                    <span>Previewing first {Math.min(parsedResult.subscribers.length, 5)} subscribers:</span>
                    <span>Total parsed: {parsedResult.totalParsed}</span>
                  </div>
                  <div className="border border-border overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-muted font-mono uppercase text-[10px] text-muted-foreground border-b border-border">
                        <tr>
                          <th className="px-3 py-2 text-left">#</th>
                          <th className="px-3 py-2 text-left">Email</th>
                          <th className="px-3 py-2 text-left">Subscription Date</th>
                          <th className="px-3 py-2 text-left">Assigned Segments</th>
                          <th className="px-3 py-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {parsedResult.subscribers.slice(0, 5).map((row, i) => (
                          <tr key={i} className="hover:bg-muted/20">
                            <td className="px-3 py-2 font-mono text-muted-foreground">{row.sourceRowNumber}</td>
                            <td className="px-3 py-2 font-bold">{row.email}</td>
                            <td className="px-3 py-2 font-mono text-[11px]">
                              {row.createdAt ? (
                                <span className="inline-flex items-center gap-1 text-foreground">
                                  <Calendar className="size-3 text-muted-foreground" />
                                  {new Date(row.createdAt).toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-muted-foreground italic">Current date (now)</span>
                              )}
                            </td>
                            <td className="px-3 py-2 font-mono text-[10px] uppercase">
                              <span className="inline-flex items-center gap-1">
                                <Layers className="size-3 text-muted-foreground" />
                                {row.segments.join(", ")}
                              </span>
                            </td>
                            <td className="px-3 py-2 font-mono text-[10px]">
                              {row.isValid ? (
                                <span className="text-green-700 font-bold">Valid</span>
                              ) : (
                                <span className="text-amber-700 font-bold">{row.error}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Import Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <button
                    type="button"
                    onClick={handleResetImport}
                    className={adminBtnOutline}
                    disabled={isImporting}
                  >
                    Reset
                  </button>

                  <button
                    type="button"
                    disabled={isImporting || parsedResult.validCount === 0}
                    onClick={handleExecuteImport}
                    className={`${adminBtn} disabled:opacity-50`}
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        Importing {parsedResult.validCount} Subscribers...
                      </>
                    ) : (
                      <>
                        <Upload className="size-3.5" />
                        Confirm & Import {parsedResult.validCount} Subscribers
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Total Audience" value={data.total} accent />
          <StatCard label="Events Segment" value={data.segments.events} />
          <StatCard label="Offers Segment" value={data.segments.offers} />
          <StatCard label="Business Segment" value={data.segments.businesses} />
        </section>

        <section>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
            <div>
              <h2 className="font-display text-3xl uppercase leading-none">Email list</h2>
              <p className="text-sm text-muted-foreground mt-1">
                The newsletter send button uses this list, filtered by the selected segment.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsImportOpen(true)}
                className={adminBtnOutline}
              >
                <Upload className="size-3.5" />
                Import Subscribers
              </button>
              <button
                type="button"
                onClick={() => downloadCsv(data.subscribers)}
                className={adminBtn}
              >
                Export CSV
              </button>
            </div>
          </div>
          <AdminTable
            headers={["Email", "Segments", "Unsubscribe", "Signed up"]}
            rows={data.subscribers.map((subscriber) => [
              <span className="font-bold">{subscriber.email}</span>,
              <span className="font-mono text-[10px] uppercase">
                {subscriber.segments.join(", ")}
              </span>,
              <span className={subscriber.hasUnsubscribeToken ? "text-green-700" : "text-accent"}>
                {subscriber.hasUnsubscribeToken ? "Ready" : "Backfills on send"}
              </span>,
              new Date(subscriber.createdAt).toLocaleString(),
            ])}
          />
        </section>
      </div>
    </div>
  );
}
