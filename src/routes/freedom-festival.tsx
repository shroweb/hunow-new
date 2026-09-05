import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ShareMenu } from "@/components/ShareMenu";
import { SaveButton } from "@/components/SaveButton";
import { subscribeNewsletter } from "@/lib/public.functions";
import { ARTICLE_FAQS } from "@/lib/seo-faqs";

const FREEDOM_FAQS = ARTICLE_FAQS["freedom-festival"] || [];

export const Route = createFileRoute("/freedom-festival")({
  component: FreedomFestivalPage,
  head: () => ({
    meta: [
      { title: "Freedom Festival Hull: The Definitive Guide to Hull's International Arts Festival — HU NOW" },
      {
        name: "description",
        content:
          "The complete guide to Freedom Festival Hull. 5 days of world-class street theatre, circus spectacles, outdoor dance, and art installations across Hull city centre and Old Town.",
      },
      { property: "og:title", content: "Freedom Festival Hull: The Complete Guide" },
      {
        property: "og:description",
        content:
          "Over 100,000 visitors, international performance art, street theatre and spectacles celebrating the legacy of Sir William Wilberforce.",
      },
      {
        property: "og:image",
        content: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&h=800&q=80",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://www.hunow.co.uk/freedom-festival" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.hunow.co.uk/freedom-festival" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Festival",
          name: "Freedom Festival Hull",
          description:
            "Hull's premier international arts festival celebrating heritage, freedom of expression, and performance art across Hull city centre.",
          startDate: "2026-09-04T10:00:00+01:00",
          endDate: "2026-09-06T22:00:00+01:00",
          eventStatus: "https://schema.org/EventScheduled",
          isAccessibleForFree: true,
          url: "https://www.hunow.co.uk/freedom-festival",
          location: {
            "@type": "Place",
            name: "Hull City Centre & Old Town",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Kingston upon Hull",
              postalCode: "HU1 2AA",
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
          mainEntity: FREEDOM_FAQS.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }),
      },
    ],
  }),
});

function FreedomFestivalPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await subscribeNewsletter({ data: { email, segments: ["arts", "events"] } });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    }
  };

  return (
    <PublicLayout>
      <div className="relative bg-black text-white py-16 md:py-24 border-b border-border overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-accent mb-4">
            <Link to="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span>Cultural Highlights</span>
            <span>/</span>
            <span className="text-white">Freedom Festival</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/20 border border-accent/40 text-accent font-mono text-xs uppercase tracking-widest mb-4">
            <span>🎭 International Arts Festival</span>
            <span>•</span>
            <span>Over 100,000 Visitors · 90% Free</span>
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-display uppercase tracking-tight leading-none mb-6">
            FREEDOM <span className="text-accent">FESTIVAL</span>
          </h1>

          <p className="text-lg md:text-2xl text-white/80 max-w-3xl leading-relaxed mb-8">
            The definitive guide to Hull’s award-winning international arts festival.
            World-class acrobatics, outdoor street theatre, thought-provoking installations, and live music across the city.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 border-t border-white/20">
            <div className="bg-white/5 backdrop-blur p-3 border border-white/10">
              <div className="text-[10px] font-mono uppercase text-white/50">2026 Dates</div>
              <div className="font-bold text-sm text-white">4–6 Sept 2026</div>
            </div>
            <div className="bg-white/5 backdrop-blur p-3 border border-white/10">
              <div className="text-[10px] font-mono uppercase text-white/50">2026 Theme</div>
              <div className="font-bold text-sm text-accent">Peace</div>
            </div>
            <div className="bg-white/5 backdrop-blur p-3 border border-white/10">
              <div className="text-[10px] font-mono uppercase text-white/50">Admission</div>
              <div className="font-bold text-sm text-emerald-400">90% Free Entry</div>
            </div>
            <div className="bg-white/5 backdrop-blur p-3 border border-white/10">
              <div className="text-[10px] font-mono uppercase text-white/50">Attendance</div>
              <div className="font-bold text-sm text-white">100,000+ People</div>
            </div>
            <div className="bg-white/5 backdrop-blur p-3 border border-white/10">
              <div className="text-[10px] font-mono uppercase text-white/50">Heritage</div>
              <div className="font-bold text-sm text-accent">William Wilberforce</div>
            </div>
            <div className="bg-white/5 backdrop-blur p-3 border border-white/10">
              <div className="text-[10px] font-mono uppercase text-white/50">Zones</div>
              <div className="font-bold text-sm text-white">Citywide Venues</div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ShareMenu title="Freedom Festival Hull Guide" text="Complete guide to Freedom Festival in Hull" />
            <SaveButton kind="story" id="freedom-hub" slug="freedom-festival" title="Freedom Festival" />
          </div>
        </div>
      </div>

      {/* Centered Quick Nav */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border py-3 px-4 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center justify-start sm:justify-center gap-2 whitespace-nowrap text-xs font-bold uppercase">
          <span className="text-muted-foreground font-mono text-[10px] mr-2">Jump to:</span>
          <a href="#about" className="px-3 py-1.5 border border-border hover:border-foreground hover:bg-foreground/5 transition-colors">
            🕊️ The Legacy
          </a>
          <a href="#zones" className="px-3 py-1.5 border border-border hover:border-foreground hover:bg-foreground/5 transition-colors">
            📍 Festival Zones
          </a>
          <a href="#highlights" className="px-3 py-1.5 border border-border hover:border-foreground hover:bg-foreground/5 transition-colors">
            🎪 What to Expect
          </a>
          <a href="#faqs" className="px-3 py-1.5 border border-border hover:border-foreground hover:bg-foreground/5 transition-colors">
            ❓ FAQs
          </a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 space-y-16">
        <section id="about" className="scroll-mt-20 prose prose-lg max-w-none">
          <p className="text-xl md:text-2xl text-foreground font-serif leading-relaxed">
            Born out of the 2007 bicentenary commemorations of the abolition of the slave trade championed
            by Hull’s most famous son, <strong>Sir William Wilberforce</strong>, Freedom Festival has grown into
            one of the UK’s most respected international festivals of outdoor arts, circus, and street theatre.
          </p>
        </section>

        <section id="zones" className="scroll-mt-20 border-t-2 border-foreground pt-10">
          <div className="text-[10px] font-mono uppercase tracking-widest text-accent mb-2">Locations</div>
          <h2 className="text-3xl md:text-4xl font-display uppercase mb-6">Key Performance Hubs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="border border-border p-6">
              <h3 className="font-display text-xl uppercase mb-2">🏛️ Queen Victoria Square</h3>
              <p className="text-sm text-muted-foreground">The focal point for high-flying aerial acrobatics, kinetic sculptures, and dazzling night-time spectacles framed by Hull City Hall and Ferens Art Gallery.</p>
            </div>
            <div className="border border-border p-6">
              <h3 className="font-display text-xl uppercase mb-2">⛪ Trinity Square & Hull Minster</h3>
              <p className="text-sm text-muted-foreground">Immersive contemporary dance, interactive audio installations inside the ancient Minster, and community poetry circles.</p>
            </div>
            <div className="border border-border p-6">
              <h3 className="font-display text-xl uppercase mb-2">🎪 Zebedee's Yard</h3>
              <p className="text-sm text-muted-foreground">A sheltered open-air courtyard in Old Town featuring intimate circus tents, physical comedy, and boundary-pushing performance art.</p>
            </div>
            <div className="border border-border p-6">
              <h3 className="font-display text-xl uppercase mb-2">🌊 Hull Marina Promenade</h3>
              <p className="text-sm text-muted-foreground">Waterfront sound installations, mobile brass bands, visual street artists, and artisan food stalls running all the way to Victoria Pier.</p>
            </div>
          </div>
        </section>

        <section id="faqs" className="scroll-mt-20 border-t-2 border-foreground pt-10">
          <div className="text-[10px] font-mono uppercase tracking-widest text-accent mb-2">Direct Answers</div>
          <h2 className="text-3xl md:text-4xl font-display uppercase mb-6">Frequently Asked Questions</h2>
          <div className="divide-y divide-border border-b border-border">
            {FREEDOM_FAQS.map((f, i) => (
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

        <section className="bg-foreground text-background p-8 md:p-12">
          <div className="max-w-xl">
            <h3 className="font-display text-3xl md:text-4xl uppercase mb-3 text-background">
              Never Miss a Hull Culture Event
            </h3>
            <p className="text-background/70 text-sm mb-6">
              Get weekly reminders for outdoor art, live music, and hidden events across Hull and East Yorkshire.
            </p>
            {submitted ? (
              <div className="p-4 bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-sm font-bold">
                ✓ You're signed up!
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
