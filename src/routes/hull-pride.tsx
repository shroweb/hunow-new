import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ShareMenu } from "@/components/ShareMenu";
import { SaveButton } from "@/components/SaveButton";
import { subscribeNewsletter } from "@/lib/public.functions";
import { ARTICLE_FAQS } from "@/lib/seo-faqs";

const PRIDE_FAQS = ARTICLE_FAQS["hull-pride"] || [];

export const Route = createFileRoute("/hull-pride")({
  component: HullPridePage,
  head: () => ({
    meta: [
      { title: "Pride in Hull: The Ultimate Guide to Hull's Annual LGBTQ+ Festival — HU NOW" },
      {
        name: "description",
        content:
          "The complete guide to Pride in Hull. Parade route and timings, headline acts, free entry details, family and wellbeing zones, and afterparties across the city.",
      },
      { property: "og:title", content: "Pride in Hull: The Complete LGBTQ+ Festival Guide" },
      {
        property: "og:description",
        content:
          "Over 50,000 attendees, a vibrant city parade, pop headliners and community celebrations. One of the UK's largest free community Pride events.",
      },
      {
        property: "og:image",
        content: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&h=800&q=80",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://hunow.co.uk/hull-pride" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://hunow.co.uk/hull-pride" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Festival",
          name: "Pride in Hull",
          description:
            "One of the UK's largest free LGBTQ+ celebrations featuring a citywide parade, live music stages, and community market.",
          startDate: "2027-07-24T10:00:00+01:00",
          endDate: "2027-07-24T22:00:00+01:00",
          eventStatus: "https://schema.org/EventScheduled",
          isAccessibleForFree: true,
          url: "https://hunow.co.uk/hull-pride",
          location: {
            "@type": "Place",
            name: "Hull City Centre & Queens Gardens",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Kingston upon Hull",
              postalCode: "HU1 3HP",
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
          mainEntity: PRIDE_FAQS.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }),
      },
    ],
  }),
});

function HullPridePage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await subscribeNewsletter({ data: { email, segments: ["community", "events"] } });
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
              "url('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1600&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-accent mb-4">
            <Link to="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span>Community Celebrations</span>
            <span>/</span>
            <span className="text-white">Pride in Hull</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/20 border border-accent/40 text-accent font-mono text-xs uppercase tracking-widest mb-4">
            <span>🏳️‍🌈 Annual Celebration</span>
            <span>•</span>
            <span>50,000+ Attendees · Free Entry</span>
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-display uppercase tracking-tight leading-none mb-6">
            PRIDE IN <span className="text-accent">HULL</span>
          </h1>

          <p className="text-lg md:text-2xl text-white/80 max-w-3xl leading-relaxed mb-8">
            The definitive guide to Pride in Hull. Parade route, main stage headliners, family zones,
            free admission details, and afterparty nightlife across the city.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 border-t border-white/20">
            <div className="bg-white/5 backdrop-blur p-3 border border-white/10">
              <div className="text-[10px] font-mono uppercase text-white/50">Timing</div>
              <div className="font-bold text-sm text-white">Annual July</div>
            </div>
            <div className="bg-white/5 backdrop-blur p-3 border border-white/10">
              <div className="text-[10px] font-mono uppercase text-white/50">Parade</div>
              <div className="font-bold text-sm text-white">10:30am Start</div>
            </div>
            <div className="bg-white/5 backdrop-blur p-3 border border-white/10">
              <div className="text-[10px] font-mono uppercase text-white/50">Admission</div>
              <div className="font-bold text-sm text-emerald-400">100% Free Entry</div>
            </div>
            <div className="bg-white/5 backdrop-blur p-3 border border-white/10">
              <div className="text-[10px] font-mono uppercase text-white/50">Attendance</div>
              <div className="font-bold text-sm text-white">50,000+ People</div>
            </div>
            <div className="bg-white/5 backdrop-blur p-3 border border-white/10">
              <div className="text-[10px] font-mono uppercase text-white/50">Main Stage</div>
              <div className="font-bold text-sm text-accent">Pop & Drag Stars</div>
            </div>
            <div className="bg-white/5 backdrop-blur p-3 border border-white/10">
              <div className="text-[10px] font-mono uppercase text-white/50">Location</div>
              <div className="font-bold text-sm text-white">Hull City Centre</div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ShareMenu title="Pride in Hull Guide" text="Complete guide to Pride in Hull" />
            <SaveButton kind="story" id="pride-hub" slug="hull-pride" title="Pride in Hull" />
          </div>
        </div>
      </div>

      {/* Centered Quick Nav */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border py-3 px-4 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center justify-start sm:justify-center gap-2 whitespace-nowrap text-xs font-bold uppercase">
          <span className="text-muted-foreground font-mono text-[10px] mr-2">Jump to:</span>
          <a href="#parade" className="px-3 py-1.5 border border-border hover:border-foreground hover:bg-foreground/5 transition-colors">
            🏳️‍🌈 The Parade
          </a>
          <a href="#stages" className="px-3 py-1.5 border border-border hover:border-foreground hover:bg-foreground/5 transition-colors">
            🎤 Main Stage & Lineup
          </a>
          <a href="#zones" className="px-3 py-1.5 border border-border hover:border-foreground hover:bg-foreground/5 transition-colors">
            👨‍👩‍👧 Community & Family
          </a>
          <a href="#faqs" className="px-3 py-1.5 border border-border hover:border-foreground hover:bg-foreground/5 transition-colors">
            ❓ FAQs
          </a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 space-y-16">
        <section id="parade" className="scroll-mt-20 prose prose-lg max-w-none">
          <p className="text-xl md:text-2xl text-foreground font-serif leading-relaxed">
            First staged in 2001, <strong>Pride in Hull</strong> has grown into one of the largest, most vibrant
            free Pride festivals in the United Kingdom. Bringing together more than 50,000 people from across
            Yorkshire and beyond, the day is an unapologetic celebration of diversity, equality, love, and community.
          </p>
        </section>

        <section id="stages" className="scroll-mt-20 border-t-2 border-foreground pt-10">
          <div className="text-[10px] font-mono uppercase tracking-widest text-accent mb-2">Entertainment</div>
          <h2 className="text-3xl md:text-4xl font-display uppercase mb-6">Parade & Stage Highlights</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="border border-border p-6">
              <h3 className="font-display text-xl uppercase mb-2">👑 Zebedee's Yard (Main Stage)</h3>
              <p className="text-sm text-muted-foreground">The beating heart of musical performances, hosting chart-topping pop headliners, drag icons from RuPaul's Drag Race UK, and electric live bands.</p>
            </div>
            <div className="border border-border p-6">
              <h3 className="font-display text-xl uppercase mb-2">🏛️ Queen Victoria Square (Trans Square)</h3>
              <p className="text-sm text-muted-foreground">A dedicated, welcoming celebration hub featuring trans-led panel discussions, acoustic stages, spoken word, and creative showcases.</p>
            </div>
            <div className="border border-border p-6">
              <h3 className="font-display text-xl uppercase mb-2">🎨 Ferens Art Gallery (Family Area)</h3>
              <p className="text-sm text-muted-foreground">A calm, inclusive space for LGBTQ+ families and young people featuring craft workshops, quiet sensory zones, and story sessions.</p>
            </div>
            <div className="border border-border p-6">
              <h3 className="font-display text-xl uppercase mb-2">🎪 King Edward & Paragon St (Community Market)</h3>
              <p className="text-sm text-muted-foreground">Dozens of vibrant stalls representing local charities, NHS wellbeing teams, independent makers, craft traders, and street food vendors.</p>
            </div>
          </div>
        </section>

        <section id="faqs" className="scroll-mt-20 border-t-2 border-foreground pt-10">
          <div className="text-[10px] font-mono uppercase tracking-widest text-accent mb-2">Direct Answers</div>
          <h2 className="text-3xl md:text-4xl font-display uppercase mb-6">Frequently Asked Questions</h2>
          <div className="divide-y divide-border border-b border-border">
            {PRIDE_FAQS.map((f, i) => (
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
              Celebrate Hull's Diverse Community
            </h3>
            <p className="text-background/70 text-sm mb-6">
              Subscribe to HU NOW for weekly event listings, community stories, and culture highlights across Kingston upon Hull.
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
