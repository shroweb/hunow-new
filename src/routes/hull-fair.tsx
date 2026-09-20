import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ShareMenu } from "@/components/ShareMenu";
import { SaveButton } from "@/components/SaveButton";
import { AdSlot } from "@/components/AdSlot";
import { subscribeNewsletter } from "@/lib/public.functions";
import { fetchEventBySlug } from "@/lib/content-read.functions";
import { img } from "@/data/seed";

const HULL_FAIR_HERO_IMAGE = "/hull-fair-hero.jpg";
const HULL_FAIR_HERO_IMAGE_URL = `https://www.hunow.co.uk${HULL_FAIR_HERO_IMAGE}`;

const HULL_FAIR_FAQS = [
  {
    question: "When is Hull Fair 2026?",
    answer:
      "Hull Fair 2026 opens on Friday 9 October and runs through Saturday 17 October at Walton Street. It opens from 4:00 PM on the first Friday, 12 noon on both Saturdays, and 2:00 PM Monday to Friday, closing at 11:00 PM each night. It is closed on Sunday 11 October.",
  },
  {
    question: "Is Hull Fair open on Sunday?",
    answer:
      "No. Hull City Council's official 2026 schedule lists Sunday 11 October as closed. The fair reopens at 2:00 PM on Monday 12 October.",
  },
  {
    question: "Is admission to Hull Fair free?",
    answer:
      "Yes, admission to the Walton Street fairground is completely free of charge. Visitors only pay for individual rides, games, and food stalls.",
  },
  {
    question: "How much are rides at Hull Fair 2026?",
    answer:
      "Admission is free, but rides and games are priced individually by their operators. There is no single official 2026 ride-price list; check the displayed price before joining a queue.",
  },
  {
    question: "Can you pay by card at Hull Fair, or is it cash only?",
    answer:
      "Payment methods vary between operators. Check before joining a ride queue or ordering food, and consider carrying both a card and some cash as alternatives.",
  },
  {
    question: "Can you walk to Hull Fair from Hull Paragon Interchange train station?",
    answer:
      "Yes, walking is often faster than sitting in Anlaby Road traffic. It is a straightforward 1.3-mile walk (approx. 20–25 minutes). Exit Paragon Station onto Anlaby Road (A1105), walk directly west past Hull Royal Infirmary, and enter West Park via the MKM Stadium gates, which leads directly to Walton Street.",
  },
  {
    question: "Which buses run to Hull Fair from Hull Paragon Interchange?",
    answer:
      "Additional bus services operate during Hull Fair, but routes, boarding points and last departures can change. Check the current Stagecoach and East Yorkshire Buses journey planners before travelling.",
  },
  {
    question: "Where can taxis drop off and pick up for Hull Fair?",
    answer:
      "Ask your taxi operator to check the current road closures and agree a safe legal drop-off away from Walton Street. Hull Paragon Interchange has a taxi rank, but we have not verified a dedicated fairground drop-off point for 2026.",
  },
  {
    question: "Where is the best place to park for Hull Fair?",
    answer:
      "Hull City Council lists two park-and-ride sites: Priory Park, Henry Boot Way (HU4 7DY), and Humber Bridge, Ferriby Road, Hessle (HU13 0JG). Buses run every 10 to 15 minutes and both sites are open until 11:00 PM each day. The council also lists public parking at MKM Stadium; check availability and charges before travelling.",
  },
  {
    question: "Can I park on streets near Walton Street?",
    answer:
      "Temporary access and permit-parking restrictions apply on Walton Street and specified nearby roads. Check Hull City Council's current road-closure and parking-restriction list before travelling.",
  },
  {
    question: "Are dogs allowed at Hull Fair?",
    answer:
      "Pet dogs are strongly discouraged and not recommended at Hull Fair due to extreme noise, dense crowds, flashing lights, and the hazard of discarded wooden food skewers and hot grease on the ground. Legitimate assistance and guide dogs are permitted, but general pet owners should leave dogs safely at home.",
  },
  {
    question: "Where are the toilets and baby-changing facilities?",
    answer:
      "We have not found an official 2026 facilities map confirming toilet or baby-changing locations. Check the council's latest visitor information or ask an event steward on arrival.",
  },
  {
    question: "What happens if a child gets lost at Hull Fair?",
    answer:
      "Agree a meeting point before entering and tell a nearby event steward or police officer immediately if a child becomes separated. We have not verified a specific lost-children post for 2026.",
  },
  {
    question: "What are the must-eat traditional foods at Hull Fair?",
    answer:
      "Traditional Hull Fair favourites include Bob Carver's famous sage-and-onion patties with chips and chip spice, Wright's brandy snaps filled with fresh whipped dairy cream, hot roasted chestnuts in paper bags, toffee apples, and fresh pomegranates eaten with pins.",
  },
  {
    question: "What are the quietest times to visit Hull Fair with toddlers?",
    answer:
      "Weekday afternoons may be a better choice than Friday and Saturday evenings for families, but crowd and queue levels cannot be guaranteed.",
  },
];

export const Route = createFileRoute("/hull-fair")({
  component: HullFairPage,
  loader: async () => {
    const event = await fetchEventBySlug({ data: { slug: "hull-fair-2026" } }).catch(
      () => undefined,
    );
    return { event };
  },
  head: ({ loaderData }) => {
    const event = loaderData?.event;
    const title = event?.seo?.title || "Hull Fair 2026 Dates & Opening Times: 9–17 October";
    const description =
      event?.seo?.description ||
      "Hull Fair 2026 runs 9–17 October at Walton Street. See confirmed opening times, Sunday closure, park-and-ride locations and visitor advice.";
    const image =
      event?.seo?.ogImage ||
      (event?.featuredImage ? img(event.featuredImage) : HULL_FAIR_HERO_IMAGE_URL);

    return {
      meta: [
        { title },
        {
          name: "description",
          content: description,
        },
        {
          property: "og:title",
          content: title,
        },
        {
          property: "og:description",
          content: description,
        },
        {
          property: "og:image",
          content: image,
        },
        { property: "og:type", content: "article" },
        { property: "og:url", content: "https://www.hunow.co.uk/hull-fair" },
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "twitter:title",
          content: title,
        },
        {
          name: "twitter:image",
          content: image,
        },
      ],
      links: [{ rel: "canonical", href: "https://www.hunow.co.uk/hull-fair" }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            name: event?.title || "Hull Fair 2026",
            description:
              event?.description ||
              "One of Europe's largest travelling fairs, held annually at Walton Street, Hull, with more than 250 rides and an array of attractions.",
            startDate: `${event?.startDate || "2026-10-09"}T${event?.startTime || "16:00"}:00+01:00`,
            endDate: `${event?.endDate || "2026-10-17"}T${event?.endTime || "23:00"}:00+01:00`,
            eventStatus: "https://schema.org/EventScheduled",
            eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
            isAccessibleForFree: true,
            url: "https://www.hunow.co.uk/hull-fair",
            image,
            location: {
              "@type": "Place",
              name: event?.locationName || "Walton Street Fairground",
              address: {
                "@type": "PostalAddress",
                streetAddress: event?.address || "Walton Street, Hull HU3 6JU",
                addressLocality: "Kingston upon Hull",
                postalCode: "HU3 6JU",
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
              url: "https://www.hunow.co.uk/hull-fair",
            },
            organizer: {
              "@type": "Organization",
              name: "Showmen's Guild of Great Britain & Hull City Council",
              url: "https://www.showmensguild.co.uk",
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
              { "@type": "ListItem", position: 1, name: "Home", item: "https://www.hunow.co.uk" },
              {
                "@type": "ListItem",
                position: 2,
                name: "Guides",
                item: "https://www.hunow.co.uk/guides",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: "Hull Fair",
                item: "https://www.hunow.co.uk/hull-fair",
              },
            ],
          }),
        },
      ],
    };
  },
});

function HullFairPage() {
  const { event } = Route.useLoaderData();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const heroImage = event?.featuredImage ? img(event.featuredImage) : HULL_FAIR_HERO_IMAGE;
  const eventTitle = event?.title || "Hull Fair 2026";
  const eventDescription =
    event?.description ||
    "A practical guide to one of Europe’s largest travelling fairs at Walton Street, including confirmed dates, daily opening hours, parking and visitor guidance.";
  const formatDate = (value: string) =>
    new Date(`${value}T12:00:00`).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  const dateSummary = event
    ? `${formatDate(event.startDate)} – ${formatDate(event.endDate || event.startDate)}`
    : "9–17 Oct 2026";

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
          className="absolute inset-0 bg-cover bg-center opacity-50 scale-105"
          style={{
            backgroundImage: `url('${heroImage}')`,
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
            <span>Complete 2026 Guide</span>
            <span>•</span>
            <span>One of Europe's Largest Travelling Fairs</span>
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-display uppercase tracking-tight leading-none mb-6">
            {eventTitle}
          </h1>

          <p className="text-lg md:text-2xl text-white/80 max-w-3xl leading-relaxed mb-8">
            {eventDescription}
          </p>

          {/* Quick Facts Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 border-t border-white/20">
            <div className="bg-white/5 backdrop-blur p-3 border border-white/10">
              <div className="text-[10px] font-mono uppercase text-white/50">Dates</div>
              <div className="font-bold text-sm text-white">{dateSummary}</div>
            </div>
            <div className="bg-white/5 backdrop-blur p-3 border border-white/10">
              <div className="text-[10px] font-mono uppercase text-white/50">Hours</div>
              <div className="font-bold text-sm text-white">Times Vary · Until 11pm</div>
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
              <div className="font-bold text-sm text-white">
                {event?.address || "Walton St, HU3 6JU"}
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur p-3 border border-white/10">
              <div className="text-[10px] font-mono uppercase text-white/50">Best Parking</div>
              <div className="font-bold text-sm text-white">Priory Park & Ride</div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ShareMenu title={`${eventTitle} Complete Guide`} text={eventDescription} />
            <SaveButton kind="story" id="hull-fair-hub" slug="hull-fair" title={eventTitle} />
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
          <a
            href="#dates"
            className="px-3 py-1.5 border border-border hover:border-foreground hover:bg-foreground/5 transition-colors"
          >
            📅 Dates & Times
          </a>
          <a
            href="#travel"
            className="px-3 py-1.5 border border-border hover:border-foreground hover:bg-foreground/5 transition-colors"
          >
            🚶 Walk, Buses & Taxis
          </a>
          <a
            href="#parking"
            className="px-3 py-1.5 border border-border hover:border-foreground hover:bg-foreground/5 transition-colors"
          >
            🚗 Parking & Shuttles
          </a>
          <a
            href="#rides"
            className="px-3 py-1.5 border border-border hover:border-foreground hover:bg-foreground/5 transition-colors"
          >
            🎡 Ride Prices & Budget
          </a>
          <a
            href="#food"
            className="px-3 py-1.5 border border-border hover:border-foreground hover:bg-foreground/5 transition-colors"
          >
            🥔 Food Bucket List
          </a>
          <a
            href="#family"
            className="px-3 py-1.5 border border-border hover:border-foreground hover:bg-foreground/5 transition-colors"
          >
            👨‍👩‍👧 Family, Dogs & Toilets
          </a>
          <a
            href="#faqs"
            className="px-3 py-1.5 border border-border hover:border-foreground hover:bg-foreground/5 transition-colors"
          >
            ❓ FAQs
          </a>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 space-y-16">
        {/* Intro */}
        <section className="prose prose-lg max-w-none">
          <p className="text-xl md:text-2xl text-foreground font-serif leading-relaxed">
            With over <strong>250 rides</strong> and an array of stalls and attractions, Hull City
            Council describes <strong>Hull Fair</strong> as one of Europe’s largest travelling
            funfairs. With a history stretching back more than 700 years, this annual spectacle
            transforms West Hull into an electric carnival of neon, laughter, screams, and the aroma
            of hot patties, roasted nuts, and spun sugar.
          </p>
        </section>

        <figure className="border-2 border-foreground bg-foreground overflow-hidden">
          <div className="aspect-[16/10] md:aspect-[16/9] overflow-hidden">
            <img
              src={heroImage}
              alt="Illuminated thrill rides at Hull Fair on Walton Street"
              width={2438}
              height={1836}
              loading="eager"
              decoding="async"
              className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-[1.02]"
            />
          </div>
          <figcaption className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-[10px] font-mono uppercase tracking-widest text-background/70">
            <span>Hull Fair · Walton Street</span>
            <span>Rides, lights and attractions</span>
          </figcaption>
        </figure>

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
            Gates open at 4:00 PM on Friday 9 October, 12:00 PM on Saturdays, and 2:00 PM Monday to
            Friday, operating until 11:00 PM. The fair is closed on Sunday 11 October.
          </p>

          <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 mb-8">
            <div className="font-bold text-amber-900 dark:text-amber-200">
              The Sunday Closure Rule (Sunday 11 October 2026)
            </div>
            <div className="text-sm text-amber-800/90 dark:text-amber-300/90 mt-1">
              The official schedule confirms that <strong>Hull Fair does not open on Sunday</strong>
              . All rides, game stalls, and food vendors remain closed all day on Sunday 11 October.
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
                  <td className="p-3">4:00 PM</td>
                  <td className="p-3">11:00 PM</td>
                  <td className="p-3 text-muted-foreground">Official Opening Bell & Carnival</td>
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

        {/* Section 2: Getting There — Walking, Buses, Taxis & Parking */}
        <section id="travel" className="scroll-mt-20 border-t-2 border-foreground pt-10">
          <div className="text-[10px] font-mono uppercase tracking-widest text-accent mb-2">
            Transit & Arrival Guide
          </div>
          <h2 className="text-3xl md:text-4xl font-display uppercase mb-6">
            Getting to Hull Fair: Walk, Bus, Taxi or Drive
          </h2>
          <p className="text-muted-foreground mb-6">
            Walton Street and surrounding residential roads are closed to general traffic. Whether
            you are arriving by train at Hull Paragon Interchange, catching a dedicated fair bus,
            taking a cab, or driving to a Park & Ride, here is how to reach Walton Street smoothly.
          </p>

          {/* Walking Route from Station */}
          <div className="border-2 border-foreground p-6 bg-foreground/[0.02] mb-8">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-accent font-bold mb-2">
              <span>🚶 The Insider Choice</span>
              <span>•</span>
              <span>1.3 Miles · 20–25 Mins Walk</span>
            </div>
            <h3 className="font-display text-2xl uppercase mb-3">
              Walking Route from Hull Paragon Interchange
            </h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Arriving in Hull by train or coach? Walking from Hull Paragon Interchange down to the
              MKM Stadium and Walton Street is completely flat, well-lit, and very often{" "}
              <strong>faster than sitting in gridlocked Anlaby Road traffic</strong>.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono bg-background p-4 border border-border mb-4">
              <div>
                <div className="font-bold text-foreground mb-1">Step 1: Exit Station</div>
                <div className="text-muted-foreground">
                  Exit main station entrance onto Ferensway, turn right and head toward Anlaby Road
                  (A1105).
                </div>
              </div>
              <div>
                <div className="font-bold text-foreground mb-1">Step 2: Head West</div>
                <div className="text-muted-foreground">
                  Walk west straight along Anlaby Road past Hull Royal Infirmary and under the
                  railway arches.
                </div>
              </div>
              <div>
                <div className="font-bold text-foreground mb-1">Step 3: Enter West Park</div>
                <div className="text-muted-foreground">
                  Turn right into West Park through the stadium gates, which leads directly onto
                  Walton Street.
                </div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              💡{" "}
              <em>
                Tip: Follow the steady stream of fairgoers and illuminated big wheel visible across
                West Park. Wide pavements all the way make this easy for pushchairs.
              </em>
            </div>
          </div>

          {/* Buses & Taxis Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="border border-border p-6 bg-foreground/[0.02]">
              <div className="text-xs font-mono uppercase text-accent font-bold mb-1">
                Public Transit
              </div>
              <h3 className="font-display text-2xl uppercase mb-2">Buses from the Interchange</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Both major bus operators run high-frequency services between Hull Paragon
                Interchange and the fairground:
              </p>
              <ul className="text-xs space-y-2 text-muted-foreground">
                <li>
                  • <strong>East Yorkshire Buses:</strong> Runs frequent special Hull Fair shuttles
                  from the Interchange, plus regular services <strong>56, 57, and 66</strong>{" "}
                  dropping on Anlaby Road.
                </li>
                <li>
                  • <strong>Stagecoach:</strong> Frequent services <strong>2, 3, 4, and 5</strong>{" "}
                  along Anlaby Road directly to the West Park gates.
                </li>
                <li>
                  • <strong>Late Departures:</strong> Return buses run regularly until after the
                  fair shuts at 11:00 PM.
                </li>
              </ul>
            </div>

            <div className="border border-border p-6 bg-foreground/[0.02]">
              <div className="text-xs font-mono uppercase text-muted-foreground font-bold mb-1">
                Taxis & Private Hire
              </div>
              <h3 className="font-display text-2xl uppercase mb-2">Taxis & Drop-Off Zones</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Road closures change access near Walton Street. We have not verified dedicated
                fairground taxi drop-off points for 2026; agree a safe legal stop with your driver.
              </p>
              <ul className="text-xs space-y-2 text-muted-foreground">
                <li>
                  • <strong>Hull Paragon:</strong> A taxi rank is available at the interchange.
                </li>
                <li>
                  • <strong>Before travelling:</strong> Check the council's current road-closure
                  information and allow extra time.
                </li>
                <li>
                  • <strong>Pick-up:</strong> Arrange a location with your driver that does not
                  block residential access or a temporary closure.
                </li>
              </ul>
            </div>
          </div>

          <div id="parking" className="scroll-mt-20 pt-4">
            <h3 className="font-display text-2xl uppercase mb-4">
              Official Park & Ride and Car Parking
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="border-2 border-foreground p-6 bg-foreground/[0.02]">
                <div className="text-xs font-mono uppercase text-accent font-bold mb-1">
                  Top Recommendation
                </div>
                <h4 className="font-display text-2xl uppercase mb-2">Priory Park & Ride</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Located off the A63 at Henry Boot Way (<strong>HU4 7DY</strong>), with more than
                  650 free parking spaces and frequent Hull Fair bus services.
                </p>
                <ul className="text-xs space-y-1.5 font-mono text-muted-foreground">
                  <li>
                    • <strong>Frequency:</strong> Buses every 10–15 mins
                  </li>
                  <li>
                    • <strong>Fare:</strong> Parking is free; bus fares apply
                  </li>
                  <li>
                    • <strong>Postcode:</strong> HU4 7DY
                  </li>
                </ul>
              </div>

              <div className="border border-border p-6 bg-foreground/[0.02]">
                <div className="text-xs font-mono uppercase text-muted-foreground font-bold mb-1">
                  Second Park & Ride
                </div>
                <h4 className="font-display text-2xl uppercase mb-2">Humber Bridge Park & Ride</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Located at Ferriby Road, Hessle (<strong>HU13 0JG</strong>). Ideal for visitors
                  travelling across the Humber Bridge or from the West.
                </p>
                <ul className="text-xs space-y-1.5 font-mono text-muted-foreground">
                  <li>
                    • <strong>Frequency:</strong> Buses every 10–15 mins
                  </li>
                  <li>
                    • <strong>Hours:</strong> Open until 11:00 PM daily
                  </li>
                  <li>
                    • <strong>Postcode:</strong> HU13 0JG
                  </li>
                </ul>
              </div>
            </div>

            <div className="border border-border p-6 bg-foreground/[0.02] mb-6">
              <div className="text-xs font-mono uppercase text-muted-foreground font-bold mb-1">
                Closest Paid Parking
              </div>
              <h4 className="font-display text-xl uppercase mb-2">
                MKM Stadium Car Park (HU3 6HU)
              </h4>
              <p className="text-sm text-muted-foreground mb-2">
                Situated inside West Park directly next to Walton Street. Dedicated parking is
                provided on non-match days. Entry is via Walton Street / Anlaby Road.
              </p>
              <p className="text-xs text-muted-foreground">
                Spaces fill quickly on Friday and Saturday evenings; check Hull City Council's event
                notices for current vehicle charges.
              </p>
            </div>

            <div className="border-2 border-dashed border-rose-500/40 bg-rose-500/5 p-6 mb-6">
              <h4 className="font-bold text-rose-600 uppercase text-sm mb-1">
                Street Permit Zones: Check Before Parking
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Road closures and permit-only parking apply on Walton Street and specified nearby
                roads, including parts of Lowther Street, Walliker Street, Paisley Street, Lonsdale
                Street, Sandringham Street, Granville Street, Perry Street, Ruskin Street, Arthur
                Street and Little Anlaby Road. Check Hull City Council's current restriction times
                and signs before parking.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/guides/guide-to-parking-at-hull-fair"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent hover:underline"
              >
                Read our in-depth Guide to Parking at Hull Fair →
              </Link>
              <span className="text-muted-foreground/40">•</span>
              <Link
                to="/$taxonomy/$slug"
                params={{ taxonomy: "travel", slug: "hull-fair-buses-2026" }}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent hover:underline"
              >
                See full Hull Fair Bus Times & Shuttles →
              </Link>
            </div>
          </div>
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
            Hull Fair 2026 Ride Costs
          </h2>
          <p className="text-muted-foreground mb-6">
            Admission to the fairground is free, while rides and games are priced individually by
            their operators. Official 2026 prices have not been published, so treat prices seen in
            older guides as historic and check the displayed cost before joining a queue.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="border border-border p-5">
              <div className="text-2xl mb-1">🧸</div>
              <h3 className="font-display text-xl uppercase mb-1">Children's Rides</h3>
              <div className="text-accent font-mono font-bold text-lg mb-3">
                Priced Individually
              </div>
              <p className="text-xs text-muted-foreground">
                Teacups, mini roller coasters, funhouses, toy carousels, inflatables, and gentle
                train rides.
              </p>
            </div>

            <div className="border border-border p-5">
              <div className="text-2xl mb-1">🎡</div>
              <h3 className="font-display text-xl uppercase mb-1">Family Classics</h3>
              <div className="text-accent font-mono font-bold text-lg mb-3">Check On Site</div>
              <p className="text-xs text-muted-foreground">
                Dodgems (bumper cars), Waltzers, Giant Observation Wheel, Ghost Train, Sizzler, and
                Helter Skelter.
              </p>
            </div>

            <div className="border border-border p-5">
              <div className="text-2xl mb-1">🚀</div>
              <h3 className="font-display text-xl uppercase mb-1">Extreme Thrill Rides</h3>
              <div className="text-accent font-mono font-bold text-lg mb-3">Check On Site</div>
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
                  with sage and onion, dipped in batter and deep-fried golden. Served piping hot
                  with chips, salt, and lashings of chip spice.
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
                  unloaded at Hull Docks each autumn. Fairgoers pick ruby-red seeds straight from
                  the cut fruit using pins or small plastic spoons.
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
                Weekday afternoons are generally less busy than Friday and Saturday evenings, making
                them a sensible choice for families. Crowd and queue levels can still vary.
              </p>
            </div>

            <div className="border border-border p-6">
              <h3 className="font-bold uppercase text-sm mb-2">🪪 Plan for Separation</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Agree a meeting point, make sure children know which adults to approach for help,
                and keep a current photo of them on your phone. Follow instructions from event
                staff.
              </p>
            </div>

            <div className="border border-border p-6">
              <h3 className="font-bold uppercase text-sm mb-2">💳 Cash vs Contactless Cards</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Payment methods vary by operator. Check before ordering or joining a ride queue and
                consider carrying both a payment card and some cash as alternatives.
              </p>
            </div>

            <div className="border border-border p-6">
              <h3 className="font-bold uppercase text-sm mb-2">♿ Accessibility & Blue Badges</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Walton Street is largely paved, but temporary fairground layouts and individual ride
                access vary. Check current accessibility arrangements with the council or ride
                operator.
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
              Get Hull Fair Updates
            </h3>
            <p className="text-background/70 text-sm mb-6">
              Subscribe to the free HU NOW weekly digest for Hull Fair updates and what's on across
              Hull and East Yorkshire.
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
