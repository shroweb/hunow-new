import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ShareMenu } from "@/components/ShareMenu";
import { SaveButton } from "@/components/SaveButton";
import { AdSlot } from "@/components/AdSlot";
import { subscribeNewsletter } from "@/lib/public.functions";
import { ARTICLE_FAQS } from "@/lib/seo-faqs";

const SESH_FAQS = ARTICLE_FAQS["humber-street-sesh"] || [];

export const Route = createFileRoute("/humber-street-sesh")({
  component: HumberStreetSeshPage,
  head: () => ({
    meta: [
      { title: "Humber Street Sesh: The Ultimate Guide to Hull's Biggest Music Festival — HU NOW" },
      {
        name: "description",
        content:
          "The definitive guide to Humber Street Sesh on Hull Marina & Fruit Market. 200+ bands across 14 stages, wristbands & ticket prices, stage lineup guide, street food, and travel advice.",
      },
      { property: "og:title", content: "Humber Street Sesh: The Complete Festival Guide" },
      {
        property: "og:description",
        content:
          "Over 30,000 festivalgoers, 200 emerging artists, 14 stages on Hull Marina. The definitive guide to the UK's premier grassroots festival.",
      },
      {
        property: "og:image",
        content: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&h=800&q=80",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://hunow.co.uk/humber-street-sesh" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://hunow.co.uk/humber-street-sesh" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MusicEvent",
          name: "Humber Street Sesh",
          description:
            "The UK's largest grassroots independent music festival, featuring 200+ artists across 14 stages on Hull Marina and Fruit Market.",
          startDate: "2027-08-07T11:00:00+01:00",
          endDate: "2027-08-07T23:00:00+01:00",
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          isAccessibleForFree: false,
          url: "https://hunow.co.uk/humber-street-sesh",
          location: {
            "@type": "Place",
            name: "Fruit Market & Hull Marina",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Humber Street",
              addressLocality: "Kingston upon Hull",
              postalCode: "HU1 1UU",
              addressRegion: "East Yorkshire",
              addressCountry: "GB",
            },
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: SESH_FAQS.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }),
      },
    ],
  }),
});

function HumberStreetSeshPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await subscribeNewsletter({ data: { email, segments: ["music", "events"] } });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    }
  };

  return (
    <PublicLayout>
      {/* Hero */}
      <div className="relative bg-black text-white py-16 md:py-24 border-b border-border overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1600&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-accent mb-4">
            <Link to="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span>Festivals</span>
            <span>/</span>
            <span className="text-white">Humber Street Sesh</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/20 border border-accent/40 text-accent font-mono text-xs uppercase tracking-widest mb-4">
            <span>🎸 Grassroots Music Festival</span>
            <span>•</span>
            <span>30,000+ Attendees · 200+ Bands</span>
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-display uppercase tracking-tight leading-none mb-6">
            HUMBER STREET <span className="text-accent">SESH</span>
          </h1>

          <p className="text-lg md:text-2xl text-white/80 max-w-3xl leading-relaxed mb-8">
            The definitive guide to the UK's biggest grassroots independent music festival.
            14 stages, 200+ bands, wristbands, stages, craft beer, and street food across Hull Marina.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 border-t border-white/20">
            <div className="bg-white/5 backdrop-blur p-3 border border-white/10">
              <div className="text-[10px] font-mono uppercase text-white/50">Date</div>
              <div className="font-bold text-sm text-white">Annual August</div>
            </div>
            <div className="bg-white/5 backdrop-blur p-3 border border-white/10">
              <div className="text-[10px] font-mono uppercase text-white/50">Time</div>
              <div className="font-bold text-sm text-white">11am – 11pm</div>
            </div>
            <div className="bg-white/5 backdrop-blur p-3 border border-white/10">
              <div className="text-[10px] font-mono uppercase text-white/50">Stages</div>
              <div className="font-bold text-sm text-accent">14+ Live Stages</div>
            </div>
            <div className="bg-white/5 backdrop-blur p-3 border border-white/10">
              <div className="text-[10px] font-mono uppercase text-white/50">Artists</div>
              <div className="font-bold text-sm text-emerald-400">200+ Acts</div>
            </div>
            <div className="bg-white/5 backdrop-blur p-3 border border-white/10">
              <div className="text-[10px] font-mono uppercase text-white/50">Location</div>
              <div className="font-bold text-sm text-white">Fruit Market & Marina</div>
            </div>
            <div className="bg-white/5 backdrop-blur p-3 border border-white/10">
              <div className="text-[10px] font-mono uppercase text-white/50">Wristbands</div>
              <div className="font-bold text-sm text-white">£15–£20 (U12 Free)</div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ShareMenu title="Humber Street Sesh Guide" text="The complete guide to Humber Street Sesh festival" />
            <SaveButton kind="story" id="sesh-hub" slug="humber-street-sesh" title="Humber Street Sesh" />
          </div>
        </div>
      </div>

      {/* Sticky Centered Quick-Nav */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border py-3 px-4 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center justify-start sm:justify-center gap-2 whitespace-nowrap text-xs font-bold uppercase">
          <span className="text-muted-foreground font-mono text-[10px] mr-2">Jump to:</span>
          <a href="#about" className="px-3 py-1.5 border border-border hover:border-foreground hover:bg-foreground/5 transition-colors">
            ℹ️ About Sesh
          </a>
          <a href="#stages" className="px-3 py-1.5 border border-border hover:border-foreground hover:bg-foreground/5 transition-colors">
            🎸 Stages & Lineup
          </a>
          <a href="#tickets" className="px-3 py-1.5 border border-border hover:border-foreground hover:bg-foreground/5 transition-colors">
            🎟️ Wristbands & Entry
          </a>
          <a href="#food" className="px-3 py-1.5 border border-border hover:border-foreground hover:bg-foreground/5 transition-colors">
            🍔 Food & Craft Beer
          </a>
          <a href="#faqs" className="px-3 py-1.5 border border-border hover:border-foreground hover:bg-foreground/5 transition-colors">
            ❓ FAQs
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 space-y-16">
        <section id="about" className="scroll-mt-20 prose prose-lg max-w-none">
          <p className="text-xl md:text-2xl text-foreground font-serif leading-relaxed">
            What started in 2012 as a local grassroots showcase organized by legendary promoter Mark Page
            has blossomed into <strong>the UK’s premier independent grassroots music festival</strong>.
            Taking over Hull’s historic Fruit Market and Marina waterfront, Humber Street Sesh celebrates the
            extraordinary vitality of northern musical creativity.
          </p>
        </section>

        {/* Stages */}
        <section id="stages" className="scroll-mt-20 border-t-2 border-foreground pt-10">
          <div className="text-[10px] font-mono uppercase tracking-widest text-accent mb-2">Stage Highlights</div>
          <h2 className="text-3xl md:text-4xl font-display uppercase mb-6">14 Stages Across the Marina</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="border border-border p-6">
              <h3 className="font-display text-xl uppercase mb-2">🎤 Main Stage (The Deep Car Park)</h3>
              <p className="text-sm text-muted-foreground">The epicenter of the festival. Headline indie and alternative rock acts performing against the iconic architectural silhouette of The Deep submarium.</p>
            </div>
            <div className="border border-border p-6">
              <h3 className="font-display text-xl uppercase mb-2">📻 BBC Introducing Humberside Stage</h3>
              <p className="text-sm text-muted-foreground">The launchpad for the UK's hottest emerging acts. Broadcast live across BBC airwaves, spotlighting regional bands on the cusp of national acclaim.</p>
            </div>
            <div className="border border-border p-6">
              <h3 className="font-display text-xl uppercase mb-2">⚡ The Rock & Metal Marquee</h3>
              <p className="text-sm text-muted-foreground">High-octane riffs, hardcore, post-punk, and heavy metal acts packing out a dedicated tent with pure energy.</p>
            </div>
            <div className="border border-border p-6">
              <h3 className="font-display text-xl uppercase mb-2">🎧 The Silent Disco & Dance Tents</h3>
              <p className="text-sm text-muted-foreground">Three-channel wireless headphone dance arenas, house DJs, and drum & bass selectors keeping crowds moving all night.</p>
            </div>
          </div>
        </section>

        {/* Wristbands */}
        <section id="tickets" className="scroll-mt-20 border-t-2 border-foreground pt-10">
          <div className="text-[10px] font-mono uppercase tracking-widest text-accent mb-2">Admission</div>
          <h2 className="text-3xl md:text-4xl font-display uppercase mb-6">Wristbands & Entry Details</h2>
          <div className="border-2 border-foreground p-6 bg-foreground/[0.02] mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <h3 className="font-display text-2xl uppercase">Standard Day Wristband</h3>
                <p className="text-sm text-muted-foreground">Access to all 14 stages, outdoor areas, and art zones</p>
              </div>
              <div className="text-2xl font-mono font-bold text-accent">£15–£20 Advance</div>
            </div>
            <p className="text-xs text-muted-foreground">
              Children under 12 receive free entry when accompanied by a paying adult. Advance wristband collection points are stationed in Hull city centre (Trinity Market, Fruit Market) throughout festival week.
            </p>
          </div>
        </section>

        {/* Food & Craft Beer */}
        <section id="food" className="scroll-mt-20 border-t-2 border-foreground pt-10">
          <div className="text-[10px] font-mono uppercase tracking-widest text-accent mb-2">Refreshments</div>
          <h2 className="text-3xl md:text-4xl font-display uppercase mb-6">Street Food & Local Breweries</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Unlike corporate stadium festivals with overpriced generic beer, Humber Street Sesh partners with
            East Yorkshire’s finest independent food trucks and craft breweries. Expect craft pints from
            <strong> Taphouse Bev Co</strong>, <strong>Atom Brewing Co</strong>, and <strong>Bone Machine</strong>,
            alongside wood-fired Neapolitan pizza, loaded bao buns, smash burgers, and vegan tacos.
          </p>
        </section>

        {/* FAQs */}
        <section id="faqs" className="scroll-mt-20 border-t-2 border-foreground pt-10">
          <div className="text-[10px] font-mono uppercase tracking-widest text-accent mb-2">Verified Answers</div>
          <h2 className="text-3xl md:text-4xl font-display uppercase mb-6">Frequently Asked Questions</h2>
          <div className="divide-y divide-border border-b border-border">
            {SESH_FAQS.map((f, i) => (
              <details key={i} className="py-4 group" open={i === 0}>
                <summary className="font-bold text-base md:text-lg cursor-pointer flex items-center justify-between list-none text-foreground group-hover:text-accent transition-colors">
                  <span>{f.question}</span>
                  <span className="text-xl font-mono ml-4 text-muted-foreground group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">{f.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Newsletter */}
        <section className="bg-foreground text-background p-8 md:p-12">
          <div className="max-w-xl">
            <h3 className="font-display text-3xl md:text-4xl uppercase mb-3 text-background">
              Get Lineup Alerts & Hull Festival News
            </h3>
            <p className="text-background/70 text-sm mb-6">
              Subscribe to HU NOW's weekly culture dispatch for stage schedules, ticket drops, and secret afterparty passes.
            </p>
            {submitted ? (
              <div className="p-4 bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-sm font-bold">
                ✓ You're subscribed to festival alerts!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="px-4 py-3 bg-background text-foreground text-sm flex-1 focus:outline-none"
                />
                <button type="submit" className="px-6 py-3 bg-accent text-background text-xs font-bold uppercase tracking-widest hover:bg-accent/90">
                  Subscribe Free
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
