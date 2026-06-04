import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";

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
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            alert("Thanks — we'll be in touch within 24 hours.");
            (e.target as HTMLFormElement).reset();
          }}
        >
          {["Your name", "Email", "Business name"].map((p) => (
            <input
              key={p}
              required
              placeholder={p}
              className="w-full bg-white border-2 border-foreground px-6 py-4 font-mono text-sm focus:outline-none"
            />
          ))}
          <textarea
            required
            rows={5}
            placeholder="Tell us what you're looking for"
            className="w-full bg-white border-2 border-foreground px-6 py-4 font-mono text-sm focus:outline-none"
          />
          <button className="bg-foreground text-background px-8 py-4 font-bold uppercase tracking-widest text-xs hover:bg-accent">
            Send Enquiry
          </button>
        </form>
      </section>
    </PublicLayout>
  );
}
