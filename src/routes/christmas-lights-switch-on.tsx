import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ShareMenu } from "@/components/ShareMenu";
import { SaveButton } from "@/components/SaveButton";
import { subscribeNewsletter } from "@/lib/public.functions";
import { ARTICLE_FAQS } from "@/lib/seo-faqs";

const LIGHTS_FAQS = ARTICLE_FAQS["christmas-lights-switch-on"] || [];

export const Route = createFileRoute("/christmas-lights-switch-on")({
  component: ChristmasLightsPage,
  head: () => ({
    meta: [
      { title: "Hull Christmas Lights Switch-On 2026: Official Times, Schedule & Guide — HU NOW" },
      {
        name: "description",
        content:
          "Official guide to the Hull City Centre Christmas Lights Switch-On in Queen Victoria Square. Timings, 50ft tree lighting, fireworks, pantomime cast appearances, and late night shopping.",
      },
      { property: "og:title", content: "Hull Christmas Lights Switch-On 2026 Guide" },
      {
        property: "og:description",
        content:
          "Everything you need to know about the festive switch-on in Queen Victoria Square, Hull. Fireworks, live entertainment, and Christmas markets.",
      },
      {
        property: "og:image",
        content: "https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=1200&h=800&q=80",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://www.hunow.co.uk/christmas-lights-switch-on" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.hunow.co.uk/christmas-lights-switch-on" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Event",
          name: "Hull Christmas Lights Switch-On 2026",
          description:
            "Hull's official festive kickoff event in Queen Victoria Square featuring live entertainment, 50ft tree illumination, and rooftop fireworks.",
          startDate: "2026-11-19T17:00:00+00:00",
          endDate: "2026-11-19T19:30:00+00:00",
          eventStatus: "https://schema.org/EventScheduled",
          isAccessibleForFree: true,
          url: "https://www.hunow.co.uk/christmas-lights-switch-on",
          location: {
            "@type": "Place",
            name: "Queen Victoria Square",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Queen Victoria Square",
              addressLocality: "Kingston upon Hull",
              postalCode: "HU1 3RA",
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
          mainEntity: LIGHTS_FAQS.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }),
      },
    ],
  }),
});

function ChristmasLightsPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await subscribeNewsletter({ data: { email, segments: ["family", "events"] } });
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
              "url('https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=1600&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-accent mb-4">
            <Link to="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span>Festive Season</span>
            <span>/</span>
            <span className="text-white">Christmas Lights Switch-On</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/20 border border-accent/40 text-accent font-mono text-xs uppercase tracking-widest mb-4">
            <span>✨ Festive Kickoff 2026</span>
            <span>•</span>
            <span>Free Community Spectacle</span>
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-display uppercase tracking-tight leading-none mb-6">
            CHRISTMAS LIGHTS <span className="text-accent">SWITCH-ON</span>
          </h1>

          <p className="text-lg md:text-2xl text-white/80 max-w-3xl leading-relaxed mb-8">
            The definitive guide to Hull’s Christmas Lights Switch-On in Queen Victoria Square.
            50ft Norwegian spruce tree, live choirs, pantomime stars, rooftop fireworks, and late-night shopping.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 border-t border-white/20">
            <div className="bg-white/5 backdrop-blur p-3 border border-white/10">
              <div className="text-[10px] font-mono uppercase text-white/50">Date</div>
              <div className="font-bold text-sm text-white">Mid-November</div>
            </div>
            <div className="bg-white/5 backdrop-blur p-3 border border-white/10">
              <div className="text-[10px] font-mono uppercase text-white/50">Times</div>
              <div className="font-bold text-sm text-white">5:00pm – 7:30pm</div>
            </div>
            <div className="bg-white/5 backdrop-blur p-3 border border-white/10">
              <div className="text-[10px] font-mono uppercase text-white/50">Switch-On</div>
              <div className="font-bold text-sm text-accent">Approx 6:50pm</div>
            </div>
            <div className="bg-white/5 backdrop-blur p-3 border border-white/10">
              <div className="text-[10px] font-mono uppercase text-white/50">Admission</div>
              <div className="font-bold text-sm text-emerald-400">Free Entry</div>
            </div>
            <div className="bg-white/5 backdrop-blur p-3 border border-white/10">
              <div className="text-[10px] font-mono uppercase text-white/50">Location</div>
              <div className="font-bold text-sm text-white">Queen Victoria Sq</div>
            </div>
            <div className="bg-white/5 backdrop-blur p-3 border border-white/10">
              <div className="text-[10px] font-mono uppercase text-white/50">Shopping</div>
              <div className="font-bold text-sm text-white">Open Until Late</div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ShareMenu title="Hull Christmas Lights Switch-On Guide" text="Complete guide to Hull Christmas lights switch-on" />
            <SaveButton kind="story" id="christmas-lights-hub" slug="christmas-lights-switch-on" title="Christmas Lights Switch-On" />
          </div>
        </div>
      </div>

      {/* Centered Quick Nav */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border py-3 px-4 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center justify-start sm:justify-center gap-2 whitespace-nowrap text-xs font-bold uppercase">
          <span className="text-muted-foreground font-mono text-[10px] mr-2">Jump to:</span>
          <a href="#times" className="px-3 py-1.5 border border-border hover:border-foreground hover:bg-foreground/5 transition-colors">
            ⏰ Timings & Schedule
          </a>
          <a href="#entertainment" className="px-3 py-1.5 border border-border hover:border-foreground hover:bg-foreground/5 transition-colors">
            🎭 Entertainment
          </a>
          <a href="#shopping" className="px-3 py-1.5 border border-border hover:border-foreground hover:bg-foreground/5 transition-colors">
            🛍️ Late Night Shopping
          </a>
          <a href="#faqs" className="px-3 py-1.5 border border-border hover:border-foreground hover:bg-foreground/5 transition-colors">
            ❓ FAQs
          </a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 space-y-16">
        <section id="times" className="scroll-mt-20 prose prose-lg max-w-none">
          <p className="text-xl md:text-2xl text-foreground font-serif leading-relaxed">
            Every November, thousands of families gather in <strong>Queen Victoria Square</strong> to witness
            the moment Hull transforms into a glowing winter wonderland. With the illumination of the towering
            Norwegian spruce tree, festive street canopies, and a burst of rooftop fireworks over City Hall,
            Christmas officially arrives in the city.
          </p>
        </section>

        <section id="entertainment" className="scroll-mt-20 border-t-2 border-foreground pt-10">
          <div className="text-[10px] font-mono uppercase tracking-widest text-accent mb-2">Stage Program</div>
          <h2 className="text-3xl md:text-4xl font-display uppercase mb-6">What to Expect on the Night</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="border border-border p-6">
              <h3 className="font-display text-xl uppercase mb-2">🎄 The 50ft Norwegian Spruce</h3>
              <p className="text-sm text-muted-foreground">Adorned with thousands of sparkling energy-efficient LED lights, gifts, and glowing decorations right in the center of Queen Victoria Square.</p>
            </div>
            <div className="border border-border p-6">
              <h3 className="font-display text-xl uppercase mb-2">🎆 Rooftop Fireworks Finale</h3>
              <p className="text-sm text-muted-foreground">The moment the countdown reaches zero, the skies above Hull City Hall light up with a spectacular choreographed pyrotechnic fireworks display.</p>
            </div>
            <div className="border border-border p-6">
              <h3 className="font-display text-xl uppercase mb-2">🎭 Star Pantomime Casts</h3>
              <p className="text-sm text-muted-foreground">Appearances and sing-alongs with the celebrity casts of Hull New Theatre’s flagship family panto and Hull Truck Theatre’s festive production.</p>
            </div>
            <div className="border border-border p-6">
              <h3 className="font-display text-xl uppercase mb-2">🎶 Choirs & Local Musicians</h3>
              <p className="text-sm text-muted-foreground">Heartwarming carols performed by Hull Community Choirs, brass bands, and local emerging youth vocalists.</p>
            </div>
          </div>
        </section>

        <section id="faqs" className="scroll-mt-20 border-t-2 border-foreground pt-10">
          <div className="text-[10px] font-mono uppercase tracking-widest text-accent mb-2">Verified Answers</div>
          <h2 className="text-3xl md:text-4xl font-display uppercase mb-6">Frequently Asked Questions</h2>
          <div className="divide-y divide-border border-b border-border">
            {LIGHTS_FAQS.map((f, i) => (
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
              The Complete Hull Christmas Guide
            </h3>
            <p className="text-background/70 text-sm mb-6">
              Looking for Santa's grottos, Victorian Christmas markets, and pantomime tickets? Read our complete seasonal guide.
            </p>
            <Link
              to="/guides/essential-guide-to-christmas-in-hull"
              className="inline-block px-6 py-3 bg-accent text-background text-xs font-bold uppercase tracking-widest hover:bg-accent/90"
            >
              Explore Christmas in Hull Guide →
            </Link>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
