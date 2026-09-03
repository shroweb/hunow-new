import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ShareMenu } from "@/components/ShareMenu";
import { SaveButton } from "@/components/SaveButton";
import { AdSlot } from "@/components/AdSlot";
import { subscribeNewsletter } from "@/lib/public.functions";

const HULL_FAIR_FAQS = [
  {
    question: "When is Hull Fair 2026?",
    answer:
      "Hull Fair 2026 opens on Friday 9 October and runs through Saturday 17 October 2026 at the Walton Street fairground. It operates daily from 2:00 PM to 11:00 PM (opening at 12:00 PM on Saturdays), except on Sunday 11 October when the fair is strictly closed.",
  },
  {
    question: "Why is Hull Fair closed on Sunday?",
    answer:
      "By historic royal charter dating back to 1278 AD and local council bylaws, Hull Fair does not operate on Sundays. The fairground reopens on Monday 12 October at 2:00 PM.",
  },
  {
    question: "Is admission to Hull Fair free?",
    answer:
      "Yes, admission to the Walton Street fairground is completely free of charge. Visitors only pay for individual rides, games, and food stalls.",
  },
  {
    question: "How much are rides at Hull Fair 2026?",
    answer:
      "Children's rides typically cost £1.50 to £2.50. Classic family rides (such as Dodgems, Waltzers, and the Giant Wheel) cost between £2.50 and £3.50. Headline extreme thrill rides (such as Air, Reverse Bungee, and Bomber) cost between £3.50 and £5.00.",
  },
  {
    question: "Where is the best place to park for Hull Fair?",
    answer:
      "The official Priory Park and Ride (HU4 7DY) off the A63 in Hessle is the easiest and most convenient option. It provides over 650 secure spaces and direct, frequent shuttle buses that drop you right outside the Walton Street gates.",
  },
  {
    question: "Can I park on streets near Walton Street?",
    answer:
      "No. All residential streets within a 1-mile radius of Walton Street have strict residents-only parking permit restrictions enforced by civil parking officers. Unauthorised vehicles face immediate penalty charge notices (PCNs) and towing.",
  },
  {
    question: "Can you pay by card at Hull Fair, or is it cash only?",
    answer:
      "Most major rides, food trucks, and stalls accept contactless and card payments. However, mobile phone network signals can get congested during busy evening crowds, so carrying £20–£30 in cash is strongly recommended for smaller game stalls and backup.",
  },
  {
    question: "What are the must-eat traditional foods at Hull Fair?",
    answer:
      "Traditional Hull Fair favourites include Bob Carver's famous sage-and-onion patties with chips, hot Wright's brandy snaps filled with fresh dairy cream, hot roasted chestnuts, toffee apples, and fresh pomegranates.",
  },
  {
    question: "What are the quietest times to visit Hull Fair with toddlers?",
    answer:
      "The quietest, most family-friendly times are weekday afternoons between 2:00 PM and 5:00 PM (Monday to Thursday). The aisles are spacious, queues are minimal, and the atmosphere is relaxed for prams and toddlers.",
  },
];

export const Route = createFileRoute("/hull-fair")({
  component: HullFairPage,
  head: () => ({
    meta: [
      { title: "Hull Fair 2026: Official Dates, Opening Times, Parking & Ride Guide — HU NOW" },
      {
        name: "description",
        content:
          "The definitive guide to Hull Fair 2026 at Walton Street. Official dates (9–17 Oct), daily opening times, Priory Park & Ride details, ride prices, food stalls, and visitor tips.",
      },
      {
        property: "og:title",
        content: "Hull Fair 2026: Official Dates, Opening Times, Parking & Ride Guide",
      },
      {
        property: "og:description",
        content:
          "Everything you need to know for visiting Europe's largest travelling fair at Walton Street, Hull. Dates, ride prices, parking shuttles, and legendary food stalls.",
      },
      {
        property: "og:image",
        content: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&h=800&q=80",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://hunow.co.uk/hull-fair" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Hull Fair 2026: Official Dates, Parking & Ride Guide",
      },
      {
        name: "twitter:image",
        content: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&h=800&q=80",
      },
    ],
    links: [{ rel: "canonical", href: "https://hunow.co.uk/hull-fair" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Event",
          name: "Hull Fair 2026",
          description:
            "Europe's largest travelling fair, held annually at Walton Street, Hull. Over 250 rides, food stalls, and attractions attracting over 800,000 visitors.",
          startDate: "2026-10-09T14:00:00+01:00",
          endDate: "2026-10-17T23:00:00+01:00",
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          isAccessibleForFree: true,
          url: "https://hunow.co.uk/hull-fair",
          image: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&h=800&q=80",
          location: {
            "@type": "Place",
            name: "Walton Street Fairground",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Walton Street",
              addressLocality: "Kingston upon Hull",
              postalCode: "HU3 6JR",
              addressRegion: "East Yorkshire",
              addressCountry: "GB",
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: 53.7431,
              longitude: -0.3702,
            },
          },
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "GBP",
            availability: "https://schema.org/InStock",
            url: "https://hunow.co.uk/hull-fair",
          },
          organizer: {
            "@type": "Organization",
            name: "Showmen's Guild of Great Britain & Hull City Council",
            url: "https://hunow.co.uk",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: HULL_FAIR_FAQS.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: f.answer,
            },
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://hunow.co.uk" },
            { "@type": "ListItem", position: 2, name: "Guides", item: "https://hunow.co.uk/guides" },
            { "@type": "ListItem", position: 3, name: "Hull Fair", item: "https://hunow.co.uk/hull-fair" },
          ],
        }),
      },
    ],
  }),
});

function HullFairPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await subscribeNewsletter({ data: { email, segments: ["events", "offers"] } });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    }
  };

  return (
    <PublicLayout>
      {/* 1. Hero Banner */}
      <div className="relative bg-black text-white py-16 md:py-24 border-b border-border overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1600&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-accent mb-4">
            <Link to="/" className="hover:underline">
              Home
            </Link>
            <span>/</span>
            <span>Annual Traditions</span>
            <span>/</span>
            <span className="text-white">Hull Fair Superhub</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/20 border border-accent/40 text-accent font-mono text-xs uppercase tracking-widest mb-4">
            <span>🎪 Official 2026 Guide</span>
            <span>•</span>
            <span>Europe's Largest Travelling Fair</span>
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-display uppercase tracking-tight leading-none mb-6">
            HULL FAIR <span className="text-accent">2026</span>
          </h1>

          <p className="text-lg md:text-2xl text-white/80 max-w-3xl leading-relaxed mb-8">
            The definitive, evergreen guide to Europe’s premier travelling fair at Walton Street.
            Official dates, daily opening hours, ride prices, parking and shuttle buses, and the
            legendary food bucket list.
          </p>

          {/* Quick Facts Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 border-t border-white/20">
            <div className="bg-white/5 backdrop-blur p-3 border border-white/10">
              <div className="text-[10px] font-mono uppercase text-white/50">Dates</div>
              <div className="font-bold text-sm text-white">9–17 Oct 2026</div>
            </div>
            <div className="bg-white/5 backdrop-blur p-3 border border-white/10">
              <div className="text-[10px] font-mono uppercase text-white/50">Hours</div>
              <div className="font-bold text-sm text-white">2pm – 11pm Daily</div>
            </div>
            <div className="bg-white/5 backdrop-blur p-3 border border-white/10">
              <div className="text-[10px] font-mono uppercase text-white/50">Sunday Rule</div>
              <div className="font-bold text-sm text-accent">Closed Sunday 11th</div>
            </div>
            <div className="bg-white/5 backdrop-blur p-3 border border-white/10">
              <div className="text-[10px] font-mono uppercase text-white/50">Admission</div>
              <div className="font-bold text-sm text-emerald-400">Free Entry</div>
            </div>
            <div className="bg-white/5 backdrop-blur p-3 border border-white/10">
              <div className="text-[10px] font-mono uppercase text-white/50">Location</div>
              <div className="font-bold text-sm text-white">Walton St, HU3 6JR</div>
            </div>
            <div className="bg-white/5 backdrop-blur p-3 border border-white/10">
              <div className="text-[10px] font-mono uppercase text-white/50">Best Parking</div>
              <div className="font-bold text-sm text-white">Priory Park & Ride</div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ShareMenu title="Hull Fair 2026 Complete Guide" text="Everything you need to know about Hull Fair 2026 at Walton Street" />
            <SaveButton kind="story" id="hull-fair-hub" slug="hull-fair" title="Hull Fair Guide" />
            <a
              href="#parking"
              className="px-4 py-2 bg-accent text-background text-xs font-bold uppercase tracking-widest hover:bg-accent/90 transition-colors"
            >
              Jump to Parking →
            </a>
          </div>
        </div>
      </div>

      {/* 2. Quick Navigation Bar */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border py-3 px-4 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center justify-start sm:justify-center gap-2 whitespace-nowrap text-xs font-bold uppercase">
          <span className="text-muted-foreground font-mono text-[10px] mr-2">Jump to:</span>
          <a href="#dates" className="px-3 py-1.5 border border-border hover:border-foreground hover:bg-foreground/5 transition-colors">
            📅 Dates & Times
          </a>
          <a href="#parking" className="px-3 py-1.5 border border-border hover:border-foreground hover:bg-foreground/5 transition-colors">
            🚗 Parking & Shuttles
          </a>
          <a href="#rides" className="px-3 py-1.5 border border-border hover:border-foreground hover:bg-foreground/5 transition-colors">
            🎡 Ride Prices
          </a>
          <a href="#food" className="px-3 py-1.5 border border-border hover:border-foreground hover:bg-foreground/5 transition-colors">
            🥔 Food Bucket List
          </a>
          <a href="#family" className="px-3 py-1.5 border border-border hover:border-foreground hover:bg-foreground/5 transition-colors">
            👨‍👩‍👧 Family & Safety
          </a>
          <a href="#faqs" className="px-3 py-1.5 border border-border hover:border-foreground hover:bg-foreground/5 transition-colors">
            ❓ FAQs
          </a>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 space-y-16">
        {/* Intro */}
        <section className="prose prose-lg max-w-none">
          <p className="text-xl md:text-2xl text-foreground font-serif leading-relaxed">
            With over <strong>800,000 visitors</strong>, 250 thrilling rides, and stalls stretching
            as far as the eye can see, <strong>Hull Fair</strong> is Europe’s largest travelling funfair.
            Tracing its royal charter back over seven centuries to 1278 AD, this week-long spectacle
            transforms West Hull into an electric carnival of neon, laughter, screams, and the aroma
            of hot patties, roasted nuts, and spun sugar.
          </p>
        </section>

        {/* Section 1: Dates & Daily Hours */}
        <section id="dates" className="scroll-mt-20 border-t-2 border-foreground pt-10">
          <div className="text-[10px] font-mono uppercase tracking-widest text-accent mb-2">
            Schedule & Opening Times
          </div>
          <h2 className="text-3xl md:text-4xl font-display uppercase mb-6">
            When is Hull Fair 2026?
          </h2>
          <p className="text-muted-foreground mb-6">
            Hull Fair 2026 runs from <strong>Friday 9 October to Saturday 17 October 2026</strong>.
            Gates open at 2:00 PM daily (and from 12:00 PM on Saturdays), operating until 11:00 PM.
          </p>

          <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 mb-8">
            <div className="font-bold text-amber-900 dark:text-amber-200">
              ⚠️ The Sunday Closure Rule (Sunday 11 October 2026)
            </div>
            <div className="text-sm text-amber-800/90 dark:text-amber-300/90 mt-1">
              By royal charter and city bylaw, <strong>Hull Fair does not open on Sundays</strong>.
              All rides, game stalls, and food vendors remain closed all day on Sunday 11 October.
              Trading resumes promptly at 2:00 PM on Monday 12 October.
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border border-border text-sm">
              <thead className="bg-foreground/5 text-xs font-mono uppercase border-b border-border">
                <tr>
                  <th className="p-3">Day & Date</th>
                  <th className="p-3">Opening Time</th>
                  <th className="p-3">Closing Time</th>
                  <th className="p-3">Atmosphere</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-3 font-bold">Friday 9 Oct</td>
                  <td className="p-3">2:00 PM</td>
                  <td className="p-3">11:00 PM</td>
                  <td className="p-3 text-muted-foreground">Opening Bell & Evening Carnival</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">Saturday 10 Oct</td>
                  <td className="p-3">12:00 PM (Noon)</td>
                  <td className="p-3">11:00 PM</td>
                  <td className="p-3 text-muted-foreground">Peak Weekend Crowds</td>
                </tr>
                <tr className="bg-rose-500/5 text-rose-600 font-bold">
                  <td className="p-3">Sunday 11 Oct</td>
                  <td className="p-3">CLOSED</td>
                  <td className="p-3">CLOSED</td>
                  <td className="p-3">No Sunday Trading by Charter</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">Monday 12 Oct</td>
                  <td className="p-3">2:00 PM</td>
                  <td className="p-3">11:00 PM</td>
                  <td className="p-3 text-muted-foreground">Family & Toddler Afternoon</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">Tuesday 13 Oct</td>
                  <td className="p-3">2:00 PM</td>
                  <td className="p-3">11:00 PM</td>
                  <td className="p-3 text-muted-foreground">Quieter Afternoon Queues</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">Wednesday 14 Oct</td>
                  <td className="p-3">2:00 PM</td>
                  <td className="p-3">11:00 PM</td>
                  <td className="p-3 text-muted-foreground">Midweek Thrills</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">Thursday 15 Oct</td>
                  <td className="p-3">2:00 PM</td>
                  <td className="p-3">11:00 PM</td>
                  <td className="p-3 text-muted-foreground">Pre-Weekend Rush</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">Friday 16 Oct</td>
                  <td className="p-3">2:00 PM</td>
                  <td className="p-3">11:00 PM</td>
                  <td className="p-3 text-muted-foreground">Electric Big Friday Night</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">Saturday 17 Oct</td>
                  <td className="p-3">12:00 PM (Noon)</td>
                  <td className="p-3">11:00 PM</td>
                  <td className="p-3 text-muted-foreground">Grand Finale Saturday</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 2: Parking & Shuttles */}
        <section id="parking" className="scroll-mt-20 border-t-2 border-foreground pt-10">
          <div className="text-[10px] font-mono uppercase tracking-widest text-accent mb-2">
            Travel & Parking Navigator
          </div>
          <h2 className="text-3xl md:text-4xl font-display uppercase mb-6">
            Where to Park for Hull Fair 2026
          </h2>
          <p className="text-muted-foreground mb-6">
            Walton Street and the immediate residential terraces are closed to public traffic.
            Here are the official, stress-free ways to get to the fair without receiving a parking ticket.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="border-2 border-foreground p-6 bg-foreground/[0.02]">
              <div className="text-xs font-mono uppercase text-accent font-bold mb-1">
                Top Recommendation
              </div>
              <h3 className="font-display text-2xl uppercase mb-2">Priory Park & Ride</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Located just off the A63 Clive Sullivan Way in Hessle (<strong>HU4 7DY</strong>).
                Over 650 free parking spaces with high-frequency direct shuttle buses dropping right at the Walton Street gates.
              </p>
              <ul className="text-xs space-y-1.5 font-mono text-muted-foreground">
                <li>• <strong>Frequency:</strong> Buses every 10–15 mins</li>
                <li>• <strong>Fare:</strong> Low-cost return bus fare (parking free)</li>
                <li>• <strong>Postcode:</strong> HU4 7DY</li>
              </ul>
            </div>

            <div className="border border-border p-6 bg-foreground/[0.02]">
              <div className="text-xs font-mono uppercase text-muted-foreground font-bold mb-1">
                Closest Walking Option
              </div>
              <h3 className="font-display text-2xl uppercase mb-2">MKM Stadium Parking</h3>
              <p className="text-sm text-muted-foreground mb-4">
                On non-match days, paid parking is operated inside West Park via the Walton Street / Anlaby Road entrance for £5.00–£6.00 per vehicle.
              </p>
              <ul className="text-xs space-y-1.5 font-mono text-muted-foreground">
                <li>• <strong>Cost:</strong> Approx £5–£6 per vehicle</li>
                <li>• <strong>Tip:</strong> Arrive before 4:30 PM to secure a bay</li>
                <li>• <strong>Postcode:</strong> HU3 6HU</li>
              </ul>
            </div>
          </div>

          <div className="border-2 border-dashed border-rose-500/40 bg-rose-500/5 p-6 mb-6">
            <h4 className="font-bold text-rose-600 uppercase text-sm mb-1">
              ⚠️ Strict Street Permit Zones: Avoid Parking Fines
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              All streets within a one-mile radius of Walton Street (including Anlaby Road terraces,
              Chanterlands Avenue side streets, and Spring Bank West) are strictly controlled
              residents-only permit zones. Civil enforcement officers patrol continuously and issue
              instant penalty charge notices (PCNs) or tow unauthorised vehicles.
            </p>
          </div>

          <Link
            to="/guides/guide-to-parking-at-hull-fair"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent hover:underline"
          >
            Read our in-depth Guide to Parking at Hull Fair →
          </Link>
        </section>

        {/* Ad Placement */}
        <div>
          <AdSlot placement="Stories Feed" />
        </div>

        {/* Section 3: Rides & Prices */}
        <section id="rides" className="scroll-mt-20 border-t-2 border-foreground pt-10">
          <div className="text-[10px] font-mono uppercase tracking-widest text-accent mb-2">
            Attractions & Costs
          </div>
          <h2 className="text-3xl md:text-4xl font-display uppercase mb-6">
            Hull Fair 2026 Ride Prices
          </h2>
          <p className="text-muted-foreground mb-6">
            Because admission to the fairground is free, visitors pay per ride. Prices are set
            individually by each showman operator, but follow these typical price brackets:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="border border-border p-5">
              <div className="text-2xl mb-1">🧸</div>
              <h3 className="font-display text-xl uppercase mb-1">Children's Rides</h3>
              <div className="text-accent font-mono font-bold text-lg mb-3">£1.50 – £2.50</div>
              <p className="text-xs text-muted-foreground">
                Teacups, mini roller coasters, funhouses, toy carousels, inflatables, and gentle train rides.
              </p>
            </div>

            <div className="border border-border p-5">
              <div className="text-2xl mb-1">🎡</div>
              <h3 className="font-display text-xl uppercase mb-1">Family Classics</h3>
              <div className="text-accent font-mono font-bold text-lg mb-3">£2.50 – £3.50</div>
              <p className="text-xs text-muted-foreground">
                Dodgems (bumper cars), Waltzers, Giant Observation Wheel, Ghost Train, Sizzler, and Helter Skelter.
              </p>
            </div>

            <div className="border border-border p-5">
              <div className="text-2xl mb-1">🚀</div>
              <h3 className="font-display text-xl uppercase mb-1">Extreme Thrill Rides</h3>
              <div className="text-accent font-mono font-bold text-lg mb-3">£3.50 – £5.00</div>
              <p className="text-xs text-muted-foreground">
                Air, Reverse Bungee, Giant Booster, XXL Speed, AtmosFear, and 50-metre drop towers.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Food Bucket List */}
        <section id="food" className="scroll-mt-20 border-t-2 border-foreground pt-10">
          <div className="text-[10px] font-mono uppercase tracking-widest text-accent mb-2">
            Culinary Traditions
          </div>
          <h2 className="text-3xl md:text-4xl font-display uppercase mb-6">
            The Legendary Hull Fair Food Bucket List
          </h2>
          <p className="text-muted-foreground mb-8">
            Half the magic of Hull Fair is the unmistakable smell of frying onions, hot sugar, and
            steaming patties. Here are the authentic Hull Fair culinary essentials you must try:
          </p>

          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start border-b border-border pb-6">
              <div className="text-4xl">🥔</div>
              <div>
                <h3 className="font-display text-2xl uppercase mb-1">
                  1. Bob Carver’s Patties & Chips
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The quintessential Hull delicacy. A seasoned patty made from mashed potato infused
                  with sage and onion, dipped in batter and deep-fried golden. Served piping hot with
                  chips, salt, and lashings of chip spice.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-start border-b border-border pb-6">
              <div className="text-4xl">🍯</div>
              <div>
                <h3 className="font-display text-2xl uppercase mb-1">
                  2. Wright’s Brandy Snaps & Fresh Cream
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Crisp, golden-brown rolled ginger-molasses wafer cylinders filled on the spot with
                  sweet whipped fresh dairy cream. A cherished staple for generations of fairgoers.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-start border-b border-border pb-6">
              <div className="text-4xl">🔴</div>
              <div>
                <h3 className="font-display text-2xl uppercase mb-1">
                  3. Pomegranates with Pins & Spoons
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A unique Hull Fair tradition dating back to when exotic Mediterranean fruits were
                  unloaded at Hull Docks each autumn. Fairgoers pick ruby-red seeds straight from the
                  cut fruit using pins or small plastic spoons.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-start pb-2">
              <div className="text-4xl">🌰</div>
              <div>
                <h3 className="font-display text-2xl uppercase mb-1">
                  4. Hot Roasted Chestnuts & Toffee Apples
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Roasted over open coal drums and served in paper bags to warm your hands against
                  the autumn evening chill.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Family & Safety */}
        <section id="family" className="scroll-mt-20 border-t-2 border-foreground pt-10">
          <div className="text-[10px] font-mono uppercase tracking-widest text-accent mb-2">
            Visitor Advice
          </div>
          <h2 className="text-3xl md:text-4xl font-display uppercase mb-6">
            Family Tips, Cash vs Card & Safety
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-border p-6">
              <h3 className="font-bold uppercase text-sm mb-2">🕒 Quiet Times for Families</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Visiting with toddlers or pushchairs? Come between <strong>2:00 PM and 5:00 PM on Monday through Thursday</strong>.
                The aisles are calm, noise levels are moderate, and ride queues are virtually non-existent.
              </p>
            </div>

            <div className="border border-border p-6">
              <h3 className="font-bold uppercase text-sm mb-2">🪪 Lost Children Wristbands</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Humberside Police and Hull City Council staff operate the lost children marquee on
                Walton Street. Pick up a free waterproof wristband upon arrival to write your mobile
                number on your child's wrist.
              </p>
            </div>

            <div className="border border-border p-6">
              <h3 className="font-bold uppercase text-sm mb-2">💳 Cash vs Contactless Cards</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Most rides and food vendors have card readers, but 4G/5G mobile signal frequently drops
                due to 50,000+ people packing Walton Street simultaneously. <strong>Carry £20–£30 in cash</strong> as a backup.
              </p>
            </div>

            <div className="border border-border p-6">
              <h3 className="font-bold uppercase text-sm mb-2">♿ Accessibility & Blue Badges</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Walton Street fairground has flat tarmac pathways accessible for wheelchairs and mobility
                scooters. Accessible toilets are stationed near the police marquee and entrance points.
              </p>
            </div>
          </div>
        </section>

        {/* Section 6: Interactive FAQs */}
        <section id="faqs" className="scroll-mt-20 border-t-2 border-foreground pt-10">
          <div className="text-[10px] font-mono uppercase tracking-widest text-accent mb-2">
            Quick Answers & Verification
          </div>
          <h2 className="text-3xl md:text-4xl font-display uppercase mb-6">
            Frequently Asked Questions
          </h2>

          <div className="divide-y divide-border border-b border-border">
            {HULL_FAIR_FAQS.map((f, i) => (
              <details key={i} className="py-4 group" open={i === 0}>
                <summary className="font-bold text-base md:text-lg cursor-pointer flex items-center justify-between list-none text-foreground group-hover:text-accent transition-colors">
                  <span>{f.question}</span>
                  <span className="text-xl font-mono ml-4 text-muted-foreground group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">
                  {f.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="bg-foreground text-background p-8 md:p-12">
          <div className="max-w-xl">
            <div className="text-[10px] font-mono uppercase tracking-widest text-accent mb-2">
              Stay In The Loop
            </div>
            <h3 className="font-display text-3xl md:text-4xl uppercase mb-3 text-background">
              Get the Hull Fair Pocket Map & Discounts
            </h3>
            <p className="text-background/70 text-sm mb-6">
              Subscribe to the free HU NOW weekly digest for ride updates, exclusive local food vouchers,
              and what's on across Hull and East Yorkshire.
            </p>

            {submitted ? (
              <div className="p-4 bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-sm font-bold">
                ✓ You're on the list! We'll send the latest updates straight to your inbox.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="px-4 py-3 bg-background text-foreground text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-accent text-background text-xs font-bold uppercase tracking-widest hover:bg-accent/90 transition-colors"
                >
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
