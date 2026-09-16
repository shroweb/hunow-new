import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ShareMenu } from "@/components/ShareMenu";
import { SaveButton } from "@/components/SaveButton";
import { subscribeNewsletter } from "@/lib/public.functions";
import { ARTICLE_FAQS } from "@/lib/seo-faqs";

const LIGHTS_FAQS = ARTICLE_FAQS["christmas-lights-switch-on"] || [];

interface SwitchOn {
  town: string;
  date: string;
  time: string;
  switchOn: string;
  venue: string;
  highlights: string;
  region?: string;
}

// Day-of-week anchors follow the confirmed 2025 pattern (Fri/Sun cadence).
// Town council events are marked "expected" until organisers confirm.
const SWITCH_ONS: SwitchOn[] = [
  {
    town: "Flemingate, Beverley",
    date: "Fri 13 Nov (expected)",
    time: "5:00pm – 7:30pm",
    switchOn: "6:45pm",
    venue: "Armstrong Way, Flemingate centre",
    highlights:
      "Live music and panto-star performances, festive stalls, funfair rides, Father Christmas and a musical firework finale.",
  },
  {
    town: "Hull City Centre",
    date: "Thu 19 Nov (expected)",
    time: "5:00pm – 7:30pm",
    switchOn: "Approx 6:50pm",
    venue: "Queen Victoria Square",
    highlights:
      "The 50ft Norwegian spruce, performers on the City Hall balcony, rooftop fireworks and the launch of late-night Thursday shopping.",
  },
  {
    town: "St Stephen's & Princes Quay, Hull",
    date: "Mid–late Nov (TBC)",
    time: "Evening",
    switchOn: "Centre-by-centre",
    venue: "St Stephen's (Tesco entrance) & Princes Quay",
    highlights:
      "School choirs and live sets ahead of each countdown, plus the annual Santa Parade arriving at Princes Quay. Free, no tickets.",
  },
  {
    town: "Pocklington",
    date: "Sun 22 Nov (expected)",
    time: "1:00pm – 7:00pm",
    switchOn: "Early evening",
    venue: "Town centre",
    highlights:
      "The Pocklington Christmas Festival: market stalls, family entertainment and the town lights switch-on to close the day.",
  },
  {
    town: "Goole",
    date: "Sun 22 Nov (expected)",
    time: "Market 10:00am – 4:00pm",
    switchOn: "TBC",
    venue: "The Courtyard, Boothferry Road",
    highlights:
      "Christmas market stalls at The Courtyard. The 2025 town switch-on was cancelled over nearby construction safety — watch for a 2026 decision.",
  },
  {
    town: "Hedon",
    date: "Fri 27 Nov (expected)",
    time: "From 5:00pm",
    switchOn: "6:30pm",
    venue: "St Augustine's Gate & Market Place",
    highlights:
      "The Mayor switches on the town lights at 6:30pm, with a Christmas market, Santa, funfair rides and live music around St Augustine's Gate.",
  },
  {
    town: "Hessle",
    date: "Fri 27 Nov (expected)",
    time: "4:30pm – 7:30pm",
    switchOn: "4:30pm",
    venue: "Hessle Square, The Weir & Prestongate",
    highlights:
      "Tree lights on first, then fairground rides, Santa's grotto, a street-food market and live entertainment.",
  },
  {
    town: "Driffield",
    date: "Fri 27 Nov (expected)",
    time: "Evening",
    switchOn: "Approx 7:00pm",
    venue: "Market Place",
    highlights:
      "The Driffield Christmas market and switch-on, with stallholders and community performances around the Market Place.",
  },
  {
    town: "Hornsea",
    date: "Fri 27 Nov (expected)",
    time: "Road closure 5:00pm – 9:00pm",
    switchOn: "6:30pm",
    venue: "Newbegin (Southgate to Cliff)",
    highlights:
      "The seaside town's community switch-on on Newbegin, minutes from Hornsea Garden Centre's Santa train grotto.",
  },
  {
    town: "Kirk Ella & West Ella",
    date: "Sat 28 Nov (expected)",
    time: "3:30pm – 7:00pm",
    switchOn: "Late afternoon (TBC)",
    venue: "Packman Lane, near St Andrew's Church",
    highlights:
      "Parish council switch-on with a school choir, food and craft stalls — a warm village-centre evening. Free.",
  },
  {
    town: "Barton-upon-Humber",
    date: "Sat 28 Nov (expected)",
    time: "12:00pm – 5:30pm",
    switchOn: "4:00pm",
    venue: "Town centre",
    region: "North Lincolnshire",
    highlights:
      "A short trip over the Humber Bridge: market stalls, community performances and roaming festive acts, with the lights on at 4pm.",
  },
  {
    town: "Elloughton-cum-Brough",
    date: "Sun 29 Nov (expected)",
    time: "4:00pm – 8:00pm",
    switchOn: "7:00pm",
    venue: "Half Moon car park & Elloughton crossroads, Main Street",
    highlights:
      "Lights at 7pm with a Christmas market of local stalls, live music and carol singing, Santa's grotto, mulled wine and hot chocolate. Free.",
  },
  {
    town: "Bridlington",
    date: "Sun 29 Nov (expected)",
    time: "From 5:30pm",
    switchOn: "5:30pm",
    venue: "King Street / Manor Street",
    highlights:
      "The Old Town switch-on, with Bridlington's Christmas Tree Festival lighting up churches through December.",
  },
  {
    town: "Cottingham",
    date: "Sun 29 Nov (expected)",
    time: "10:00am – 4:30pm",
    switchOn: "Late afternoon",
    venue: "Village centre",
    highlights:
      "A full daytime Christmas festival — stalls, food and family entertainment — finishing with the village lights.",
  },
  {
    town: "Willerby",
    date: "Late Nov (TBC)",
    time: "From 6:00pm",
    switchOn: "Evening",
    venue: "The Star Inn, Main Street",
    highlights:
      "Parish council tree switch-on with a school choir, ukulele band, town crier, mulled wine and mince pies. Free.",
  },
  {
    town: "Howden",
    date: "Thu 3 Dec (expected)",
    time: "4:00pm – 8:00pm",
    switchOn: "Evening",
    venue: "Howden Shire Hall, Market Place",
    highlights:
      "Market stalls, a Santa's grotto and a brass band at the Shire Hall Christmas market evening.",
  },
  {
    town: "Withernsea",
    date: "Sat 5 Dec (expected)",
    time: "From 12:00pm",
    switchOn: "From 7:00pm",
    venue: "Valley Gardens & Memorial Avenue",
    highlights:
      "A pop-up market on Memorial Avenue from midday, with entertainment and the festive lights in Valley Gardens.",
  },
  {
    town: "Market Weighton",
    date: "Sun 6 Dec (expected)",
    time: "4:00pm – 7:00pm",
    switchOn: "Afternoon close",
    venue: "High Street",
    highlights:
      "The Market Weighton Christmas tree switch-on, a short drive from Langlands Garden Centre at Shiptonthorpe.",
  },
];

const ITEM_LIST_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Christmas Lights Switch-Ons 2026 — Hull & East Yorkshire",
  itemListElement: SWITCH_ONS.map((s, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Event",
      name: `${s.town} Christmas Lights Switch-On 2026`,
      description: s.highlights,
      startDate: s.date.includes("TBC") ? "2026-11-30" : "2026-11-13",
      eventStatus: "https://schema.org/EventScheduled",
      isAccessibleForFree: true,
      url: "https://www.hunow.co.uk/christmas-lights-switch-on",
      location: {
        "@type": "Place",
        name: s.venue,
        address: {
          "@type": "PostalAddress",
          addressLocality: s.town.replace(/,.*/, ""),
          addressRegion: s.region ?? "East Riding of Yorkshire",
          addressCountry: "GB",
        },
      },
    },
  })),
};

const GARDEN_CENTRE_EVENTS = [
  {
    name: "Hornsea Garden Centre — Santa's Grotto & Santa Train",
    operator: "British Garden Centres · Southgate, Hornsea, East Yorkshire",
    blurb:
      "The region's most-loved garden centre grotto: Santa's elves welcome families into their magic workshop before a magical train journey and a 40-minute grotto experience with Santa himself, finished with a gift for each child.",
    extras: [
      "Starlight with Santa — a calm evening grotto visit in pyjamas with your teddy",
      "Quiet Grotto — a relaxed, low-sensory one-to-one Santa session",
      "Festive displays, trees and decorations across the centre",
    ],
    booking: "Pre-book online — sessions sell out. Typically runs late Nov to 24 Dec.",
    link: "https://www.britishgardencentres.com/events/santas-grotto-at-hornsea-garden-centre/",
    linkLabel: "Book Santa's Grotto at Hornsea →",
  },
  {
    name: "Langlands Garden Centre — Grotto, Breakfast & Afternoon Tea with Santa",
    operator: "British Garden Centres · York Road, Shiptonthorpe (near Market Weighton)",
    blurb:
      "Langlands goes all-in on Christmas each year, with a spectacular Santa's Grotto in the run-up to the big day, plus Breakfast with Santa and Afternoon Tea with Santa sittings for a longer festive treat.",
    extras: [
      "Santa's Grotto experiences on select dates from late November",
      "Breakfast with Santa and Afternoon Tea with Santa sittings",
      "Huge Christmas department — trees, lights and decorations",
    ],
    booking: "Bookings open early each autumn — book early, especially for breakfast/tea sittings.",
    link: "https://www.britishgardencentres.com/centres/langlands-garden-centre/",
    linkLabel: "Santa experiences at Langlands →",
  },
];

export const Route = createFileRoute("/christmas-lights-switch-on")({
  component: ChristmasLightsPage,
  head: () => ({
    meta: [
      {
        title: "Christmas Lights Switch-Ons 2026: Hull & East Riding | HU NOW",
      },
      {
        name: "description",
        content:
          "Confirmed dates and times for 2026 Christmas lights switch-ons across Hull and East Yorkshire, plus Santa's grottos at Hornsea and Langlands.",
      },
      {
        property: "og:title",
        content: "Christmas Lights Switch-Ons 2026: Hull & East Riding | HU NOW",
      },
      {
        property: "og:description",
        content:
          "Confirmed dates and times for 2026 Christmas lights switch-ons across Hull and East Yorkshire, plus Santa's grottos at Hornsea and Langlands.",
      },
      {
        property: "og:image",
        content:
          "https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=1200&h=800&q=80",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://www.hunow.co.uk/christmas-lights-switch-on" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.hunow.co.uk/christmas-lights-switch-on" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(ITEM_LIST_SCHEMA),
      },
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
          organizer: {
            "@type": "Organization",
            name: "Hull City Council",
            url: "https://www.hull.gov.uk",
          },
          publisher: {
            "@type": "Organization",
            name: "HU NOW",
            url: "https://www.hunow.co.uk",
            logo: {
              "@type": "ImageObject",
              url: "https://www.hunow.co.uk/hunow.jpg",
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
      await subscribeNewsletter({ data: { email, segments: ["events", "offers"] } });
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
            <span>Christmas 2026 Hub</span>
            <span>•</span>
            <span>Hull & East Riding</span>
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-display uppercase tracking-tight leading-none mb-6">
            CHRISTMAS LIGHTS <span className="text-accent">SWITCH-ONS</span> 2026
          </h1>

          <p className="text-lg md:text-2xl text-white/80 max-w-3xl leading-relaxed mb-8">
            One hub for the festive season across Hull and the East Riding: every town switch-on
            from Beverley to Bridlington, the big Hull night in Queen Victoria Square, and the
            garden centre Christmas events — Santa's grottos and Santa trains — at Hornsea and
            Langlands.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 border-t border-white/20">
            <div className="bg-white/5 backdrop-blur p-3 border border-white/10">
              <div className="text-[10px] font-mono uppercase text-white/50">Season</div>
              <div className="font-bold text-sm text-white">Nov – Dec 2026</div>
            </div>
            <div className="bg-white/5 backdrop-blur p-3 border border-white/10">
              <div className="text-[10px] font-mono uppercase text-white/50">Switch-Ons</div>
              <div className="font-bold text-sm text-white">18 Towns & Villages</div>
            </div>
            <div className="bg-white/5 backdrop-blur p-3 border border-white/10">
              <div className="text-[10px] font-mono uppercase text-white/50">Hull's Night</div>
              <div className="font-bold text-sm text-accent">Thu 19 Nov</div>
            </div>
            <div className="bg-white/5 backdrop-blur p-3 border border-white/10">
              <div className="text-[10px] font-mono uppercase text-white/50">First On</div>
              <div className="font-bold text-sm text-white">Flemingate, Beverley</div>
            </div>
            <div className="bg-white/5 backdrop-blur p-3 border border-white/10">
              <div className="text-[10px] font-mono uppercase text-white/50">Garden Centres</div>
              <div className="font-bold text-sm text-emerald-400">Grottos From Late Nov</div>
            </div>
            <div className="bg-white/5 backdrop-blur p-3 border border-white/10">
              <div className="text-[10px] font-mono uppercase text-white/50">Admission</div>
              <div className="font-bold text-sm text-emerald-400">Mostly Free</div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ShareMenu
              title="Christmas Lights Switch-Ons 2026 — Hull & East Riding"
              text="Every Christmas lights switch-on across Hull and the East Riding in 2026"
            />
            <SaveButton
              kind="story"
              id="christmas-lights-hub"
              slug="christmas-lights-switch-on"
              title="Christmas Lights Switch-Ons 2026"
            />
          </div>
        </div>
      </div>

      {/* Centered Quick Nav */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border py-3 px-4 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center justify-start sm:justify-center gap-2 whitespace-nowrap text-xs font-bold uppercase">
          <span className="text-muted-foreground font-mono text-[10px] mr-2">Jump to:</span>
          <a href="#dates" className="px-3 py-1.5 border border-border hover:border-foreground hover:bg-foreground/5 transition-colors">
            All Switch-On Dates
          </a>
          <a href="#hull" className="px-3 py-1.5 border border-border hover:border-foreground hover:bg-foreground/5 transition-colors">
            Hull Switch-On
          </a>
          <a href="#garden-centres" className="px-3 py-1.5 border border-border hover:border-foreground hover:bg-foreground/5 transition-colors">
            Garden Centre Christmas
          </a>
          <a href="#faqs" className="px-3 py-1.5 border border-border hover:border-foreground hover:bg-foreground/5 transition-colors">
            FAQs
          </a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 md:py-16 space-y-16">
        {/* Intro */}
        <section id="intro" className="scroll-mt-20 prose prose-lg max-w-none">
          <p className="text-xl md:text-2xl text-foreground font-serif leading-relaxed">
            From the fireworks over <strong>Flemingate in Beverley</strong> to the moment the
            50ft spruce lights up <strong>Queen Victoria Square</strong>, November and December
            2026 see Christmas switch-ons across every corner of the East Riding — Beverley,
            Hessle, Cottingham, Willerby, Kirk Ella, Hedon, Brough, Hornsea, Bridlington,
            Driffield, Pocklington, Goole, Howden, Withernsea and Market Weighton — plus Santa's
            grottos at the region's garden centres.
          </p>
        </section>

        {/* All dates table */}
        <section id="dates" className="scroll-mt-20 border-t-2 border-foreground pt-10">
          <div className="text-[10px] font-mono uppercase tracking-widest text-accent mb-2">
            Every Event · Updated For 2026
          </div>
          <h2 className="text-3xl md:text-4xl font-display uppercase mb-3">
            Christmas Lights Switch-On Dates 2026
          </h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-3xl">
            Day-of-week anchors follow the confirmed 2025 pattern. Town council events are marked
            "expected" until organisers confirm — always check with the organiser before
            travelling. HU NOW updates this hub as 2026 confirmations land.
          </p>

          <div className="overflow-x-auto border border-border">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="bg-foreground text-background text-left">
                  <th className="px-4 py-3 font-display uppercase text-xs tracking-wider">Town / Centre</th>
                  <th className="px-4 py-3 font-display uppercase text-xs tracking-wider">Date</th>
                  <th className="px-4 py-3 font-display uppercase text-xs tracking-wider">Times</th>
                  <th className="px-4 py-3 font-display uppercase text-xs tracking-wider">Lights On</th>
                  <th className="px-4 py-3 font-display uppercase text-xs tracking-wider">Where</th>
                  <th className="px-4 py-3 font-display uppercase text-xs tracking-wider">Highlights</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {SWITCH_ONS.map((s) => (
                  <tr key={s.town} className="align-top hover:bg-foreground/5">
                    <td className="px-4 py-3 font-bold">{s.town}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{s.date}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{s.time}</td>
                    <td className="px-4 py-3 font-mono text-accent whitespace-nowrap">{s.switchOn}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.venue}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.highlights}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Every community switch-on above is free and run by town or parish councils and local
            traders. Organisers usually confirm final dates and stage times in October — spot an
            update?{" "}
            <Link to="/submit" className="underline hover:text-accent">
              Send it to HU NOW
            </Link>{" "}
            and we'll verify and add it.
          </p>
        </section>

        {/* Hull spotlight */}
        <section id="hull" className="scroll-mt-20 border-t-2 border-foreground pt-10">
          <div className="text-[10px] font-mono uppercase tracking-widest text-accent mb-2">
            The Big One · Queen Victoria Square
          </div>
          <h2 className="text-3xl md:text-4xl font-display uppercase mb-6">
            Hull City Centre Switch-On
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="border border-border p-6">
              <h3 className="font-display text-xl uppercase mb-2">The 50ft Norwegian Spruce</h3>
              <p className="text-sm text-muted-foreground">
                Adorned with thousands of sparkling energy-efficient LED lights, gifts, and glowing
                decorations right in the centre of Queen Victoria Square.
              </p>
            </div>
            <div className="border border-border p-6">
              <h3 className="font-display text-xl uppercase mb-2">Rooftop Fireworks Finale</h3>
              <p className="text-sm text-muted-foreground">
                The moment the countdown reaches zero, the skies above Hull City Hall light up with
                a spectacular choreographed pyrotechnic fireworks display.
              </p>
            </div>
            <div className="border border-border p-6">
              <h3 className="font-display text-xl uppercase mb-2">Star Pantomime Casts</h3>
              <p className="text-sm text-muted-foreground">
                Appearances and sing-alongs with the celebrity casts of Hull New Theatre's flagship
                family panto and Hull Truck Theatre's festive production.
              </p>
            </div>
            <div className="border border-border p-6">
              <h3 className="font-display text-xl uppercase mb-2">Choirs & Local Musicians</h3>
              <p className="text-sm text-muted-foreground">
                Heartwarming carols performed by Hull community choirs, brass bands, and local
                emerging youth vocalists — plus late-night shopping across the city centre.
              </p>
            </div>
          </div>
        </section>

        {/* Garden centres */}
        <section id="garden-centres" className="scroll-mt-20 border-t-2 border-foreground pt-10">
          <div className="text-[10px] font-mono uppercase tracking-widest text-accent mb-2">
            Santa's Grottos & Festive Days Out
          </div>
          <h2 className="text-3xl md:text-4xl font-display uppercase mb-3">
            East Riding Garden Centre Christmas Events 2026
          </h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-3xl">
            Garden centres are East Yorkshire's grotto powerhouses — ticketed Santa experiences
            that typically run from late November right through to Christmas Eve. Book online
            early; the best sittings sell out weeks ahead.
          </p>

          <div className="space-y-6">
            {GARDEN_CENTRE_EVENTS.map((g) => (
              <div key={g.name} className="border border-border p-6 md:p-8">
                <h3 className="font-display text-xl md:text-2xl uppercase mb-1">{g.name}</h3>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-4">
                  {g.operator}
                </p>
                <p className="text-sm md:text-base text-foreground leading-relaxed mb-4">{g.blurb}</p>
                <ul className="text-sm text-muted-foreground space-y-1.5 mb-4">
                  {g.extras.map((e) => (
                    <li key={e} className="flex gap-2">
                      <span className="text-accent">▸</span>
                      <span>{e}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs font-bold uppercase tracking-wide text-accent mb-4">
                  {g.booking}
                </p>
                <a
                  href={g.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-5 py-2.5 bg-foreground text-background text-xs font-bold uppercase tracking-widest hover:bg-accent hover:text-background transition-colors"
                >
                  {g.linkLabel}
                </a>
              </div>
            ))}
          </div>

          <p className="mt-6 text-xs text-muted-foreground max-w-3xl">
            Timing tip: pair a grotto visit with a town switch-on — Hornsea Garden Centre is
            minutes from the Newbegin switch-on, and Langlands sits between the Pocklington and
            Market Weighton events. More seasonal listings appear on{" "}
            <a
              href="https://www.visiteastyorkshire.co.uk/whats-on/seasonal-events/christmas-new-years/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-accent"
            >
              Visit East Yorkshire
            </a>{" "}
            as organisers confirm.
          </p>
        </section>

        {/* FAQs */}
        <section id="faqs" className="scroll-mt-20 border-t-2 border-foreground pt-10">
          <div className="text-[10px] font-mono uppercase tracking-widest text-accent mb-2">
            Verified Answers
          </div>
          <h2 className="text-3xl md:text-4xl font-display uppercase mb-6">
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-border border-b border-border">
            {LIGHTS_FAQS.map((f, i) => (
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

        {/* Newsletter */}
        <section className="border-t-2 border-foreground pt-10">
          <div className="max-w-xl">
            <div className="text-[10px] font-mono uppercase tracking-widest text-accent mb-2">
              Never Miss A Switch-On
            </div>
            <h3 className="font-display text-3xl md:text-4xl uppercase mb-3">
              Festive Events In Your Inbox
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              Get the switch-on dates, grotto booking reminders, and Christmas market guides for
              Hull and the East Riding — straight to your inbox.
            </p>
            {submitted ? (
              <p className="font-bold text-accent uppercase tracking-wide text-sm">
                You're on the list — see you at the switch-on! ✨
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-3 border border-border bg-background text-sm"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-accent text-background text-xs font-bold uppercase tracking-widest hover:bg-accent/90"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </section>

        {/* Related CTA */}
        <section className="bg-foreground text-background p-8 md:p-12">
          <div className="max-w-xl">
            <h3 className="font-display text-3xl md:text-4xl uppercase mb-3 text-background">
              The Complete Hull Christmas Guide
            </h3>
            <p className="text-background/70 text-sm mb-6">
              Looking for Santa's grottos, Victorian Christmas markets, and pantomime tickets? Read
              our complete seasonal guide.
            </p>
            <a
              href="/guides/essential-guide-to-christmas-in-hull"
              className="inline-block px-6 py-3 bg-accent text-background text-xs font-bold uppercase tracking-widest hover:bg-accent/90"
            >
              Explore Christmas in Hull Guide →
            </a>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
