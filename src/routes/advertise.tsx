import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { submitContact } from "@/lib/public.functions";

export const Route = createFileRoute("/advertise")({
  head: () => ({
    meta: [
      { title: "Advertise with HU NOW" },
      {
        name: "description",
        content: "Reach Hull's most engaged locals — website, newsletter and social packages.",
      },
    ],
  }),
  component: Advertise,
});

const PACKAGES = [
  {
    name: "Website Feature",
    price: "from £120",
    desc: "Featured slot on the homepage or directory for 7 days.",
  },
  {
    name: "Sponsored Article",
    price: "from £350",
    desc: "We write an editorial-quality piece about your business. You approve everything.",
  },
  {
    name: "Newsletter Sponsor",
    price: "from £180",
    desc: "Top-of-fold placement in our Thursday newsletter (12k subscribers, 48% open).",
  },
  {
    name: "Social Boost",
    price: "from £150",
    desc: "A dedicated Instagram + TikTok post written and shot by our team.",
  },
  {
    name: "Local Visibility Bundle",
    price: "from £750",
    desc: "Full-stack: web feature + sponsored article + newsletter + social.",
  },
];

function Advertise() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [business, setBusiness] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      await submitContact({
        data: {
          name,
          email,
          enquiryType: "general",
          subject: `Advertising enquiry — ${business}`,
          message,
        },
      });
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <PublicLayout>
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-24 border-b border-border">
        <div className="text-[10px] font-mono uppercase mb-4 text-accent">For Local Businesses</div>
        <h1 className="text-6xl md:text-9xl font-display uppercase leading-[0.9] mb-8">
          Advertise <span className="text-accent">in HU NOW</span>
        </h1>
        <p className="text-2xl max-w-3xl">
          The most-trusted independent voice in Hull, reaching 90,000 monthly site visitors and
          12,000 newsletter subscribers.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-2 md:grid-cols-3 gap-8 border-b border-border">
        <div>
          <div className="text-5xl font-display text-accent">90k</div>
          <div className="text-xs font-mono uppercase mt-2">Site visitors / month</div>
        </div>
        <div>
          <div className="text-5xl font-display text-accent">12k</div>
          <div className="text-xs font-mono uppercase mt-2">Newsletter subscribers</div>
        </div>
        <div>
          <div className="text-5xl font-display text-accent">42k</div>
          <div className="text-xs font-mono uppercase mt-2">Social followers</div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-5xl font-display uppercase mb-12">Packages</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PACKAGES.map((p) => (
            <div key={p.name} className="border-2 border-foreground p-6 bg-white">
              <div className="text-[10px] font-mono uppercase text-accent mb-2">{p.price}</div>
              <h3 className="text-2xl font-bold mb-3">{p.name}</h3>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-display uppercase mb-6">Get in touch</h2>
        {status === "done" ? (
          <div className="border-2 border-accent bg-accent/5 p-8">
            <p className="font-bold text-lg mb-1">Thanks — we'll be in touch within 24 hours.</p>
            <p className="text-sm text-muted-foreground">
              We've received your enquiry and will respond shortly.
            </p>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={onSubmit}>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className={fieldCls}
            />
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className={fieldCls}
            />
            <input
              required
              value={business}
              onChange={(e) => setBusiness(e.target.value)}
              placeholder="Business name"
              className={fieldCls}
            />
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what you're looking for"
              className={fieldCls}
              minLength={10}
            />
            {status === "error" && (
              <p className="text-sm text-red-600 font-bold">
                Something went wrong — please try again or email us directly.
              </p>
            )}
            <button
              disabled={status === "sending"}
              className="bg-foreground text-background px-8 py-4 font-bold uppercase tracking-widest text-xs hover:bg-accent disabled:opacity-50 transition-colors"
            >
              {status === "sending" ? "Sending…" : "Send Enquiry"}
            </button>
          </form>
        )}
      </section>
    </PublicLayout>
  );
}

const fieldCls =
  "w-full bg-white border-2 border-foreground px-6 py-4 font-mono text-sm focus:outline-none";
