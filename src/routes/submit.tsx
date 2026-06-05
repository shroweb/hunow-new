import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { setState, uid } from "@/lib/store";
import { submitForReview } from "@/lib/public.functions";
import { getTaxonomy } from "@/lib/taxonomy-config.functions";
import type { Submission } from "@/types";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "Submit — HU NOW" },
      { name: "description", content: "Submit your event or business listing to HU NOW for free." },
    ],
  }),
  loader: async () => {
    const taxonomy = await getTaxonomy();
    return { taxonomy };
  },
  component: Submit,
});

type Step = 0 | 1 | 2 | 3;
type Data = Record<string, string>;

function Submit() {
  const { taxonomy } = Route.useLoaderData();
  const [type, setType] = useState<"event" | "listing">("event");
  const [step, setStep] = useState<Step>(0);
  const [data, setData] = useState<Data>({});
  const [done, setDone] = useState(false);

  const set = (k: string, v: string) => setData((d) => ({ ...d, [k]: v }));

  const steps = useMemo(
    () =>
      type === "event"
        ? [
            { title: "Basics", fields: ["title", "description"] as const },
            { title: "When & where", fields: ["date", "time", "venue"] as const },
            { title: "Details", fields: ["category", "price", "ticketUrl"] as const },
            { title: "Your details", fields: ["contactName", "contactEmail"] as const },
          ]
        : [
            { title: "Basics", fields: ["name", "description"] as const },
            { title: "Location", fields: ["category", "area", "address"] as const },
            { title: "Contact", fields: ["website", "phone", "email"] as const },
            { title: "Your details", fields: ["contactName", "contactEmail"] as const },
          ],
    [type],
  );

  const required: Record<string, true> =
    type === "event"
      ? {
          title: true,
          description: true,
          date: true,
          time: true,
          venue: true,
          category: true,
          contactName: true,
          contactEmail: true,
        }
      : {
          name: true,
          description: true,
          category: true,
          area: true,
          address: true,
          contactName: true,
          contactEmail: true,
        };

  const stepValid = steps[step].fields.every(
    (f) => !required[f] || (data[f] && data[f].trim().length > 0),
  );

  const submit = () => {
    const submission = {
      id: uid(),
      type,
      title: data.title || data.name || "Untitled",
      contactName: data.contactName || "",
      contactEmail: data.contactEmail || "",
      data,
      status: "pending",
      createdAt: new Date().toISOString().slice(0, 10),
    } satisfies Submission;
    void submitForReview({ data: submission }).catch((error) => {
      console.error("Unable to submit for review", error);
    });
    setState((s) => ({ ...s, submissions: [...s.submissions, submission] }), { persist: false });
    setData({});
    setStep(0);
    setDone(true);
  };

  const eventCategories = taxonomy.event_categories ?? [];
  const listingCategories = taxonomy.listing_categories ?? [];
  const areas = taxonomy.areas ?? [];

  const selectOptions: Record<string, string[]> = {
    category: type === "event" ? eventCategories : listingCategories,
    area: areas,
  };

  return (
    <PublicLayout>
      <section className="max-w-3xl mx-auto px-4 py-12 md:py-20">
        <div className="text-[10px] font-mono uppercase mb-4 text-accent">Free Listings</div>
        <h1 className="text-5xl md:text-7xl font-display uppercase leading-none mb-6">
          Submit to HU NOW
        </h1>
        <p className="text-lg mb-10">
          Got an event or independent business to share? Submit it for our editors to review —
          completely free.
        </p>

        <div className="flex gap-2 mb-8">
          {(["event", "listing"] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setType(t);
                setDone(false);
                setStep(0);
                setData({});
              }}
              className={`px-6 py-3 text-xs font-bold uppercase ${type === t ? "bg-foreground text-background" : "border-2 border-foreground"}`}
            >
              {t === "event" ? "Submit Event" : "Submit Listing"}
            </button>
          ))}
        </div>

        {done ? (
          <div className="border-2 border-foreground p-8 text-center bg-accent/5">
            <div className="text-[10px] font-mono uppercase text-accent mb-2">Received</div>
            <h2 className="text-3xl font-display uppercase mb-4">Thanks — we'll take a look.</h2>
            <p className="text-muted-foreground mb-4">
              Our editors review submissions within 48 hours.
            </p>
            <button onClick={() => setDone(false)} className="underline text-sm">
              Submit another
            </button>
          </div>
        ) : (
          <div>
            <ol className="flex items-center gap-3 mb-8" aria-label="Submission progress">
              {steps.map((s, i) => (
                <li key={s.title} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => i < step && setStep(i as Step)}
                    disabled={i > step}
                    className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${i === step ? "text-foreground" : i < step ? "text-accent" : "text-muted-foreground"}`}
                    aria-current={i === step ? "step" : undefined}
                  >
                    <span
                      className={`size-6 grid place-items-center border-2 ${i === step ? "border-foreground bg-foreground text-background" : i < step ? "border-accent bg-accent text-background" : "border-foreground/30"}`}
                    >
                      {i < step ? "✓" : i + 1}
                    </span>
                    <span className="hidden sm:inline">{s.title}</span>
                  </button>
                  {i < steps.length - 1 && <span className="w-6 h-px bg-foreground/20" />}
                </li>
              ))}
            </ol>

            <div className="space-y-3" key={`${type}-${step}`}>
              {steps[step].fields.map((f) => (
                <WizardField
                  key={f}
                  field={f}
                  value={data[f] || ""}
                  onChange={(v) => set(f, v)}
                  options={selectOptions[f]}
                />
              ))}
            </div>

            <div className="flex justify-between gap-3 mt-8 border-t-2 border-foreground pt-6">
              <button
                type="button"
                onClick={() => setStep((s) => (s > 0 ? ((s - 1) as Step) : s))}
                disabled={step === 0}
                className="px-6 py-3 border-2 border-foreground text-xs font-bold uppercase tracking-widest disabled:opacity-40"
              >
                ← Back
              </button>
              {step < steps.length - 1 ? (
                <button
                  type="button"
                  disabled={!stepValid}
                  onClick={() => setStep((s) => (s + 1) as Step)}
                  className="px-6 py-3 bg-foreground text-background text-xs font-bold uppercase tracking-widest hover:bg-accent disabled:opacity-40"
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!stepValid}
                  onClick={submit}
                  className="px-6 py-3 bg-accent text-background text-xs font-bold uppercase tracking-widest hover:bg-foreground disabled:opacity-40"
                >
                  Submit for Review
                </button>
              )}
            </div>
          </div>
        )}
      </section>
    </PublicLayout>
  );
}

const FIELD_META: Record<
  string,
  { label: string; placeholder: string; type?: string; multiline?: boolean }
> = {
  title: { label: "Event title", placeholder: "e.g. Jazz at the Polar Bear" },
  name: { label: "Business name", placeholder: "e.g. Thieving Harry's" },
  description: { label: "Description", placeholder: "Tell us about it...", multiline: true },
  date: { label: "Date", placeholder: "", type: "date" },
  time: { label: "Start time", placeholder: "", type: "time" },
  venue: { label: "Venue / location", placeholder: "Where is it happening?" },
  category: { label: "Category", placeholder: "Select a category" },
  area: { label: "Area of Hull", placeholder: "Select an area" },
  address: { label: "Address", placeholder: "Street address" },
  price: { label: "Price", placeholder: "Free, £10, etc." },
  ticketUrl: { label: "Ticket URL", placeholder: "https://...", type: "url" },
  website: { label: "Website", placeholder: "https://...", type: "url" },
  phone: { label: "Phone", placeholder: "01482 ..." },
  email: { label: "Business email", placeholder: "hello@example.com", type: "email" },
  contactName: { label: "Your name", placeholder: "Full name" },
  contactEmail: { label: "Your email", placeholder: "you@example.com", type: "email" },
};

const fieldCls =
  "w-full bg-white border-2 border-foreground px-6 py-4 font-mono text-sm focus:outline-none focus:border-accent";

function WizardField({
  field,
  value,
  onChange,
  options,
}: {
  field: string;
  value: string;
  onChange: (v: string) => void;
  options?: string[];
}) {
  const meta = FIELD_META[field] ?? { label: field, placeholder: "" };
  const id = `wiz-${field}`;
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[10px] font-mono uppercase text-muted-foreground mb-1"
      >
        {meta.label}
      </label>
      {options && options.length > 0 ? (
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={fieldCls}
        >
          <option value="">{meta.placeholder}</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : meta.multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          placeholder={meta.placeholder}
          className={fieldCls}
        />
      ) : (
        <input
          id={id}
          type={meta.type || "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={meta.placeholder}
          className={fieldCls}
        />
      )}
    </div>
  );
}
