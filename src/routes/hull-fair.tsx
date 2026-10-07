import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ShareMenu } from "@/components/ShareMenu";
import { SaveButton } from "@/components/SaveButton";
import { AdSlot } from "@/components/AdSlot";
import { InteractiveFairMap } from "@/components/hull-fair/InteractiveFairMap";
import { subscribeNewsletter } from "@/lib/public.functions";
import { fetchEventBySlug } from "@/lib/content-read.functions";
import { img } from "@/data/seed";
import {
  ArrowRight,
  Bus,
  CalendarDays,
  Car,
  ChevronDown,
  Clock,
  Footprints,
  HelpCircle,
  Map as MapIcon,
  MapPin,
  ParkingCircle,
  ShieldAlert,
  Ticket,
  TriangleAlert,
  Users,
  Utensils,
  type LucideIcon,
} from "lucide-react";

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
      "The official 2026 layout shows two public toilet blocks: one on the Walton Street side of the fairground, and one on the north-east perimeter by the railway boundary. Both are marked on our interactive Hull Fair Map. Ask an event steward on site for accessible and baby-changing facilities.",
  },
  {
    question: "What happens if a child gets lost at Hull Fair?",
    answer:
      "Agree a meeting point before entering and notify a nearby event steward or police officer immediately. They can direct you to the first aid and lost children point on site.",
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

const SECTION_NAV: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "map", label: "Interactive Map", icon: MapIcon },
  { id: "dates", label: "Dates & Times", icon: CalendarDays },
  { id: "travel", label: "Walk, Buses & Taxis", icon: Footprints },
  { id: "parking", label: "Parking & Shuttles", icon: Car },
  { id: "rides", label: "Ride Prices & Budget", icon: Ticket },
  { id: "food", label: "Food Bucket List", icon: Utensils },
  { id: "family", label: "Family, Dogs & Toilets", icon: Users },
  { id: "faqs", label: "FAQs", icon: HelpCircle },
];

const OPENING_TIMES = [
  {
    day: "Friday 9 Oct",
    open: "4:00 PM",
    close: "11:00 PM",
    note: "Official Opening Bell & Carnival",
  },
  {
    day: "Saturday 10 Oct",
    open: "12:00 PM (Noon)",
    close: "11:00 PM",
    note: "Peak Weekend Crowds",
  },
  {
    day: "Sunday 11 Oct",
    open: "CLOSED",
    close: "CLOSED",
    note: "No Sunday Trading by Charter",
    closed: true,
  },
  { day: "Monday 12 Oct", open: "2:00 PM", close: "11:00 PM", note: "Family & Toddler Afternoon" },
  { day: "Tuesday 13 Oct", open: "2:00 PM", close: "11:00 PM", note: "Quieter Afternoon Queues" },
  { day: "Wednesday 14 Oct", open: "2:00 PM", close: "11:00 PM", note: "Midweek Thrills" },
  { day: "Thursday 15 Oct", open: "2:00 PM", close: "11:00 PM", note: "Pre-Weekend Rush" },
  { day: "Friday 16 Oct", open: "2:00 PM", close: "11:00 PM", note: "Electric Big Friday Night" },
  {
    day: "Saturday 17 Oct",
    open: "12:00 PM (Noon)",
    close: "11:00 PM",
    note: "Grand Finale Saturday",
  },
];

const SECTION_CLASS =
  "scroll-mt-[var(--hf-offset,5rem)] border-t-2 border-foreground pt-10 md:pt-12";
const BODY_CLASS = "text-[15px] md:text-base leading-relaxed text-foreground/75";
const CARD_CLASS = "border border-border bg-card p-5 md:p-6";
const LINK_CLASS =
  "group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground underline decoration-accent decoration-2 underline-offset-[6px] hover:text-accent transition-colors";

function SectionHeader({
  index,
  eyebrow,
  title,
}: {
  index: string;
  eyebrow: string;
  title: ReactNode;
}) {
  return (
    <header className="mb-6 md:mb-8">
      <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-widest text-foreground/60 mb-3">
        <span className="inline-flex h-6 min-w-6 items-center justify-center bg-accent px-1.5 font-bold text-accent-foreground">
          {index}
        </span>
        <span>{eyebrow}</span>
      </div>
      <h2 className="text-3xl md:text-5xl font-display uppercase leading-[1.05]">{title}</h2>
    </header>
  );
}

function BulletList({ children, mono = false }: { children: ReactNode; mono?: boolean }) {
  return (
    <ul
      className={`space-y-2.5 text-sm leading-relaxed text-foreground/75 [&>li]:relative [&>li]:pl-5 [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:top-[0.55em] [&>li]:before:h-1.5 [&>li]:before:w-1.5 [&>li]:before:bg-accent ${
        mono ? "font-mono text-[13px]" : ""
      }`}
    >
      {children}
    </ul>
  );
}

function HullFairPage() {
  const { event } = Route.useLoaderData();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [activeSection, setActiveSection] = useState("");
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

  // Keep the section nav docked under the site header, whatever its height
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".pwa-nav");
    if (!header) return;
    const update = () => setHeaderHeight(Math.round(header.getBoundingClientRect().height));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  // Highlight the section currently being read
  useEffect(() => {
    const sections = SECTION_NAV.map((item) => document.getElementById(item.id)).filter(
      (el): el is HTMLElement => !!el,
    );
    if (!sections.length) return;
    const onScroll = () => {
      const line = headerHeight + 120;
      let current = "";
      for (const el of sections) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
      }
      setActiveSection(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [headerHeight]);

  // Keep the active pill in view on small screens
  useEffect(() => {
    if (!activeSection) return;
    const pill = document.querySelector<HTMLElement>(`[data-hf-nav="${activeSection}"]`);
    const track = pill?.parentElement;
    if (!pill || !track) return;
    track.scrollTo({
      left: pill.offsetLeft - track.clientWidth / 2 + pill.clientWidth / 2,
      behavior: "smooth",
    });
  }, [activeSection]);

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

  const quickFacts: { label: string; value: ReactNode; icon: LucideIcon; tone?: string }[] = [
    { label: "Dates", value: dateSummary, icon: CalendarDays },
    { label: "Hours", value: "Times Vary · Until 11pm", icon: Clock },
    { label: "Sunday Rule", value: "Closed Sunday 11th", icon: TriangleAlert, tone: "text-accent" },
    { label: "Admission", value: "Free Entry", icon: Ticket, tone: "text-emerald-400" },
    { label: "Location", value: event?.address || "Walton St, HU3 6JU", icon: MapPin },
    { label: "Best Parking", value: "Priory Park & Ride", icon: ParkingCircle },
  ];

  return (
    <PublicLayout>
      <div style={{ "--hf-offset": `${headerHeight + 68}px` } as React.CSSProperties}>
        {/* 1. Hero Banner */}
        <div className="relative bg-black text-white overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-60 scale-105"
            style={{
              backgroundImage: `url('${heroImage}')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />

          <div className="relative max-w-7xl mx-auto px-4 pt-10 pb-8 md:pt-20 md:pb-12">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-accent mb-5">
              <Link to="/" className="hover:underline">
                Home
              </Link>
              <span className="text-white/40">/</span>
              <span>Annual Traditions</span>
              <span className="text-white/40">/</span>
              <span className="text-white">Hull Fair Superhub</span>
            </div>

            <div className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 px-3 py-1.5 bg-accent text-accent-foreground font-mono text-[11px] font-bold uppercase tracking-widest mb-5">
              <span>Complete 2026 Guide</span>
              <span>•</span>
              <span>One of Europe's Largest Travelling Fairs</span>
            </div>

            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-display uppercase tracking-tight leading-[0.9] mb-6">
              {eventTitle}
            </h1>

            <p className="text-lg md:text-2xl text-white/85 max-w-3xl leading-relaxed mb-8">
              {eventDescription}
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-10">
              <a
                href="#map"
                className="inline-flex items-center gap-2 px-5 py-3 bg-accent text-accent-foreground text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors"
              >
                <MapIcon className="h-4 w-4" />
                Explore the Map
              </a>
              <a
                href="#parking"
                className="inline-flex items-center gap-2 px-5 py-3 border border-white/40 text-white text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
              >
                Jump to Parking →
              </a>
              <ShareMenu title={`${eventTitle} Complete Guide`} text={eventDescription} />
              <SaveButton kind="story" id="hull-fair-hub" slug="hull-fair" title={eventTitle} />
            </div>

            {/* Quick Facts Grid */}
            <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border-t border-l border-white/15">
              {quickFacts.map((fact) => (
                <div
                  key={fact.label}
                  className="flex flex-col gap-1.5 border-r border-b border-white/15 bg-black/40 backdrop-blur-sm p-4"
                >
                  <dt className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-white/60">
                    <fact.icon className="h-3.5 w-3.5 text-accent" />
                    {fact.label}
                  </dt>
                  <dd
                    className={`font-bold text-sm md:text-[15px] leading-snug ${fact.tone || "text-white"}`}
                  >
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* 2. Quick Navigation Bar */}
        <nav
          aria-label="Hull Fair guide sections"
          className="sticky z-30 bg-background/95 backdrop-blur border-b-2 border-foreground"
          style={{ top: headerHeight }}
        >
          <div className="relative max-w-7xl mx-auto">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none px-4 py-2.5 whitespace-nowrap text-[11px] font-bold uppercase tracking-wider xl:justify-center">
              <span className="hidden 2xl:inline text-muted-foreground font-mono text-[10px] mr-2">
                Jump to:
              </span>
              {SECTION_NAV.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    data-hf-nav={item.id}
                    aria-current={isActive ? "true" : undefined}
                    className={`inline-flex shrink-0 items-center gap-1.5 px-2.5 py-2 border transition-colors ${
                      isActive
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground hover:bg-foreground/5"
                    }`}
                  >
                    <item.icon className={`h-3.5 w-3.5 ${isActive ? "text-accent" : ""}`} />
                    {item.label}
                  </a>
                );
              })}
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent md:hidden" />
          </div>
        </nav>

        {/* Interactive Fairground Map */}
        <section
          id="map"
          className="relative z-0 scroll-mt-[var(--hf-offset,5rem)] max-w-6xl mx-auto px-2 sm:px-4 pt-10 md:pt-14"
        >
          <div className="flex flex-wrap items-end justify-between gap-3 px-2 sm:px-0 mb-5">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-foreground/60 mb-2">
                <span className="h-2 w-2 bg-accent" />
                Interactive Fairground Map
              </div>
              <h2 className="text-3xl md:text-5xl font-display uppercase leading-[1.05]">
                Hull Fair 2026 Map
              </h2>
            </div>
            <Link className={LINK_CLASS} to="/hull-fair-map">
              Open full map{" "}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <InteractiveFairMap compact />
        </section>

        {/* Main Content Area */}
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 space-y-14 md:space-y-20">
          {/* Intro */}
          <section>
            <p className="text-xl md:text-[1.7rem] md:leading-[1.45] text-foreground font-serif leading-relaxed first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-6xl md:first-letter:text-7xl first-letter:leading-[0.85] first-letter:text-foreground">
              With over <strong>250 rides</strong> and an array of stalls and attractions, Hull City
              Council describes <strong>Hull Fair</strong> as one of Europe’s largest travelling
              funfairs. With a history stretching back more than 700 years, this annual spectacle
              transforms West Hull into an electric carnival of neon, laughter, screams, and the
              aroma of hot patties, roasted nuts, and spun sugar.
            </p>
            <div className="mt-6">
              <Link
                className={LINK_CLASS}
                to="/$taxonomy/$slug"
                params={{ taxonomy: "history", slug: "hull-fair-history" }}
              >
                📖 Discover the 700-year story: Read the History of Hull Fair →
              </Link>
            </div>
          </section>

          <figure className="border-2 border-foreground bg-foreground overflow-hidden">
            <div className="aspect-[16/10] md:aspect-[16/9] overflow-hidden">
              <img
                src={heroImage}
                alt="Illuminated thrill rides at Hull Fair on Walton Street"
                width={2438}
                height={1836}
                loading="lazy"
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
          <section id="dates" className={SECTION_CLASS}>
            <SectionHeader
              index="01"
              eyebrow="Schedule & Opening Times"
              title="When is Hull Fair 2026?"
            />
            <p className={`${BODY_CLASS} mb-6`}>
              Hull Fair 2026 runs from <strong>Friday 9 October to Saturday 17 October 2026</strong>
              . Gates open at 4:00 PM on Friday 9 October, 12:00 PM on Saturdays, and 2:00 PM Monday
              to Friday, operating until 11:00 PM. The fair is closed on Sunday 11 October.
            </p>

            <div className="flex gap-4 bg-amber-500/10 border-l-4 border-amber-500 p-5 mb-8">
              <TriangleAlert className="hidden sm:block h-5 w-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-300" />
              <div>
                <div className="font-bold text-amber-900 dark:text-amber-200">
                  The Sunday Closure Rule (Sunday 11 October 2026)
                </div>
                <div className="text-sm leading-relaxed text-amber-900/85 dark:text-amber-300/90 mt-1.5">
                  The official schedule confirms that{" "}
                  <strong>Hull Fair does not open on Sunday</strong>. All rides, game stalls, and
                  food vendors remain closed all day on Sunday 11 October. Trading resumes promptly
                  at 2:00 PM on Monday 12 October.
                </div>
              </div>
            </div>

            <table className="w-full text-left text-sm border border-border bg-card">
              <thead className="hidden sm:table-header-group bg-foreground text-background text-[11px] font-mono uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 font-bold">Day & Date</th>
                  <th className="px-4 py-3 font-bold">Opening Time</th>
                  <th className="px-4 py-3 font-bold">Closing Time</th>
                  <th className="px-4 py-3 font-bold">Atmosphere</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {OPENING_TIMES.map((row) => (
                  <tr
                    key={row.day}
                    className={`grid grid-cols-2 gap-x-4 gap-y-1 px-4 py-3.5 sm:table-row sm:p-0 ${
                      row.closed
                        ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 font-bold"
                        : "sm:hover:bg-foreground/[0.03]"
                    }`}
                  >
                    <td className="col-span-2 font-bold text-base sm:text-sm sm:px-4 sm:py-3.5">
                      {row.day}
                    </td>
                    <td
                      data-label="Opens"
                      className="sm:px-4 sm:py-3.5 before:content-[attr(data-label)] before:mr-2 before:text-[10px] before:font-mono before:uppercase before:tracking-wider before:text-foreground/50 sm:before:hidden"
                    >
                      {row.open}
                    </td>
                    <td
                      data-label="Closes"
                      className="sm:px-4 sm:py-3.5 before:content-[attr(data-label)] before:mr-2 before:text-[10px] before:font-mono before:uppercase before:tracking-wider before:text-foreground/50 sm:before:hidden"
                    >
                      {row.close}
                    </td>
                    <td
                      className={`col-span-2 text-[13px] sm:text-sm sm:px-4 sm:py-3.5 ${
                        row.closed ? "" : "text-foreground/65"
                      }`}
                    >
                      {row.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Section 2: Getting There — Walking, Buses, Taxis & Parking */}
          <section id="travel" className={SECTION_CLASS}>
            <SectionHeader
              index="02"
              eyebrow="Transit & Arrival Guide"
              title="Getting to Hull Fair: Walk, Bus, Taxi or Drive"
            />
            <p className={`${BODY_CLASS} mb-8`}>
              Walton Street and surrounding residential roads are closed to general traffic. Whether
              you are arriving by train at Hull Paragon Interchange, catching a dedicated fair bus,
              taking a cab, or driving to a Park & Ride, here is how to reach Walton Street
              smoothly.
            </p>

            {/* Walking Route from Station */}
            <div className="border-2 border-foreground bg-card mb-6">
              <div className="flex flex-wrap items-center gap-2 bg-foreground text-background px-5 md:px-6 py-3 text-[11px] font-mono uppercase tracking-wider font-bold">
                <span>🚶 The Insider Choice</span>
                <span className="text-background/40">•</span>
                <span>1.3 Miles · 20–25 Mins Walk</span>
              </div>
              <div className="p-5 md:p-6">
                <h3 className="font-display text-2xl md:text-3xl uppercase mb-3">
                  Walking Route from Hull Paragon Interchange
                </h3>
                <p className={`${BODY_CLASS} mb-6`}>
                  Arriving in Hull by train or coach? Walking from Hull Paragon Interchange down to
                  the MKM Stadium and Walton Street is completely flat, well-lit, and very often{" "}
                  <strong>faster than sitting in gridlocked Anlaby Road traffic</strong>.
                </p>
                <ol className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border border border-border mb-5">
                  {[
                    {
                      title: "Step 1: Exit Station",
                      text: "Exit main station entrance onto Ferensway, turn right and head toward Anlaby Road (A1105).",
                    },
                    {
                      title: "Step 2: Head West",
                      text: "Walk west straight along Anlaby Road past Hull Royal Infirmary and under the railway arches.",
                    },
                    {
                      title: "Step 3: Enter West Park",
                      text: "Turn right into West Park through the stadium gates, which leads directly onto Walton Street.",
                    },
                  ].map((step, i) => (
                    <li key={step.title} className="bg-background p-4 md:p-5">
                      <div
                        className="font-display text-4xl leading-none text-accent mb-2"
                        aria-hidden="true"
                      >
                        {i + 1}
                      </div>
                      <div className="font-bold text-sm text-foreground mb-1.5">{step.title}</div>
                      <div className="text-sm leading-relaxed text-foreground/70">{step.text}</div>
                    </li>
                  ))}
                </ol>
                <div className="text-sm text-foreground/70">
                  💡{" "}
                  <em>
                    Tip: Follow the steady stream of fairgoers and illuminated big wheel visible
                    across West Park. Wide pavements all the way make this easy for pushchairs.
                  </em>
                </div>
              </div>
            </div>

            {/* Buses & Taxis Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className={CARD_CLASS}>
                <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-foreground/60 font-bold mb-2">
                  <Bus className="h-4 w-4 text-accent" />
                  Public Transit
                </div>
                <h3 className="font-display text-2xl uppercase mb-2">Buses from the Interchange</h3>
                <p className="text-sm leading-relaxed text-foreground/75 mb-4">
                  Both major bus operators run high-frequency services between Hull Paragon
                  Interchange and the fairground:
                </p>
                <BulletList>
                  <li>
                    <strong>East Yorkshire Buses:</strong> Runs frequent special Hull Fair shuttles
                    from the Interchange, plus regular services <strong>56, 57, and 66</strong>{" "}
                    dropping on Anlaby Road.
                  </li>
                  <li>
                    <strong>Stagecoach:</strong> Frequent services <strong>2, 3, 4, and 5</strong>{" "}
                    along Anlaby Road directly to the West Park gates.
                  </li>
                  <li>
                    <strong>Late Departures:</strong> Return buses run regularly until after the
                    fair shuts at 11:00 PM.
                  </li>
                </BulletList>
              </div>

              <div className={CARD_CLASS}>
                <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-foreground/60 font-bold mb-2">
                  <Car className="h-4 w-4 text-accent" />
                  Taxis & Private Hire
                </div>
                <h3 className="font-display text-2xl uppercase mb-2">Taxis & Drop-Off Zones</h3>
                <p className="text-sm leading-relaxed text-foreground/75 mb-4">
                  Road closures change access near Walton Street. We have not verified dedicated
                  fairground taxi drop-off points for 2026; agree a safe legal stop with your
                  driver.
                </p>
                <BulletList>
                  <li>
                    <strong>Hull Paragon:</strong> A taxi rank is available at the interchange.
                  </li>
                  <li>
                    <strong>Before travelling:</strong> Check the council's current road-closure
                    information and allow extra time.
                  </li>
                  <li>
                    <strong>Pick-up:</strong> Arrange a location with your driver that does not
                    block residential access or a temporary closure.
                  </li>
                </BulletList>
              </div>
            </div>

            <div id="parking" className="scroll-mt-[var(--hf-offset,5rem)]">
              <h3 className="flex items-center gap-3 font-display text-2xl md:text-3xl uppercase mb-5">
                <ParkingCircle className="h-7 w-7 text-accent shrink-0" />
                Official Park & Ride and Car Parking
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="relative border-2 border-foreground bg-card p-5 md:p-6">
                  <div className="inline-block bg-accent text-accent-foreground px-2 py-1 text-[11px] font-mono uppercase tracking-wider font-bold mb-3">
                    Top Recommendation
                  </div>
                  <h4 className="font-display text-2xl uppercase mb-2">Priory Park & Ride</h4>
                  <p className="text-sm leading-relaxed text-foreground/75 mb-4">
                    Located off the A63 at Henry Boot Way (<strong>HU4 7DY</strong>), with more than
                    650 free parking spaces and frequent Hull Fair bus services.
                  </p>
                  <BulletList mono>
                    <li>
                      <strong>Frequency:</strong> Buses every 10–15 mins
                    </li>
                    <li>
                      <strong>Fare:</strong> Parking is free; bus fares apply
                    </li>
                    <li>
                      <strong>Postcode:</strong> HU4 7DY
                    </li>
                  </BulletList>
                </div>

                <div className={CARD_CLASS}>
                  <div className="inline-block border border-border px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-foreground/60 font-bold mb-3">
                    Second Park & Ride
                  </div>
                  <h4 className="font-display text-2xl uppercase mb-2">
                    Humber Bridge Park & Ride
                  </h4>
                  <p className="text-sm leading-relaxed text-foreground/75 mb-4">
                    Located at Ferriby Road, Hessle (<strong>HU13 0JG</strong>). Ideal for visitors
                    travelling across the Humber Bridge or from the West.
                  </p>
                  <BulletList mono>
                    <li>
                      <strong>Frequency:</strong> Buses every 10–15 mins
                    </li>
                    <li>
                      <strong>Hours:</strong> Open until 11:00 PM daily
                    </li>
                    <li>
                      <strong>Postcode:</strong> HU13 0JG
                    </li>
                  </BulletList>
                </div>
              </div>

              <div className={`${CARD_CLASS} mb-6`}>
                <div className="inline-block border border-border px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-foreground/60 font-bold mb-3">
                  Closest Paid Parking
                </div>
                <h4 className="font-display text-2xl uppercase mb-2">
                  MKM Stadium Car Park (HU3 6HU)
                </h4>
                <p className="text-sm leading-relaxed text-foreground/75 mb-2">
                  Situated inside West Park directly next to Walton Street. Dedicated parking is
                  provided on non-match days. Entry is via Walton Street / Anlaby Road.
                </p>
                <p className="text-[13px] leading-relaxed text-foreground/60">
                  Spaces fill quickly on Friday and Saturday evenings; check Hull City Council's
                  event notices for current vehicle charges.
                </p>
              </div>

              <div className="flex gap-4 border-2 border-dashed border-rose-500/50 bg-rose-500/5 p-5 md:p-6 mb-8">
                <ShieldAlert className="hidden sm:block h-5 w-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                <div>
                  <h4 className="font-bold text-rose-700 dark:text-rose-400 uppercase text-sm tracking-wide mb-1.5">
                    Street Permit Zones: Check Before Parking
                  </h4>
                  <p className="text-sm leading-relaxed text-foreground/75">
                    Road closures and permit-only parking apply on Walton Street and specified
                    nearby roads, including parts of Lowther Street, Walliker Street, Paisley
                    Street, Lonsdale Street, Sandringham Street, Granville Street, Perry Street,
                    Ruskin Street, Arthur Street and Little Anlaby Road. Check Hull City Council's
                    current restriction times and signs before parking.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-4">
                <Link className={LINK_CLASS} to="/guides/guide-to-parking-at-hull-fair">
                  Read our in-depth Guide to Parking at Hull Fair →
                </Link>
                <span className="hidden sm:inline text-muted-foreground/40">•</span>
                <Link
                  className={LINK_CLASS}
                  to="/$taxonomy/$slug"
                  params={{ taxonomy: "travel", slug: "hull-fair-buses-2026" }}
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
          <section id="rides" className={SECTION_CLASS}>
            <SectionHeader
              index="03"
              eyebrow="Attractions & Costs"
              title="Hull Fair 2026 Ride Costs"
            />
            <p className={`${BODY_CLASS} mb-8`}>
              Admission to the fairground is free, while rides and games are priced individually by
              their operators. Official 2026 prices have not been published, so treat prices seen in
              older guides as historic and check the displayed cost before joining a queue.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
              {[
                {
                  emoji: "🧸",
                  title: "Children's Rides",
                  price: "Typically £2.50–£3.50",
                  text: "Teacups, mini roller coasters, funhouses, toy carousels, inflatables, and gentle train rides.",
                },
                {
                  emoji: "🎡",
                  title: "Family Classics",
                  price: "Typically £3.50–£5.00",
                  text: "Dodgems (bumper cars), Waltzers, Giant Observation Wheel, Ghost Train, Sizzler, and Helter Skelter.",
                },
                {
                  emoji: "🚀",
                  title: "Extreme Thrill Rides",
                  price: "Typically £4.00–£7.00",
                  text: "Air, Reverse Bungee, Giant Booster, XXL Speed, AtmosFear, and 50-metre drop towers.",
                },
              ].map((tier) => (
                <div key={tier.title} className="flex flex-col border border-border bg-card">
                  <div className="flex items-center gap-3 p-5 pb-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-accent/20 text-2xl">
                      {tier.emoji}
                    </div>
                    <h3 className="font-display text-xl uppercase leading-tight">{tier.title}</h3>
                  </div>
                  <div className="border-y border-border bg-foreground text-background px-5 py-3 font-mono font-bold text-base">
                    {tier.price}
                  </div>
                  <p className="p-5 pt-4 text-sm leading-relaxed text-foreground/75">{tier.text}</p>
                </div>
              ))}
            </div>

            <div className="bg-amber-500/10 border-l-4 border-amber-500 p-5 md:p-6 mb-8">
              <div className="font-bold text-lg text-amber-900 dark:text-amber-200 mb-4">
                Realistic Budget Guide
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm leading-relaxed text-amber-900/85 dark:text-amber-300/90">
                <div>
                  <strong>Per Child (4–10 rides):</strong>
                  <br />
                  £25–£45 for rides plus £10–£15 for food
                </div>
                <div>
                  <strong>Family of 4 Evening:</strong>
                  <br />
                  Budget £80–£130 including food, games, and rides
                </div>
                <div>
                  <strong>Game Stalls:</strong>
                  <br />
                  Hook-a-Duck, Darts, Hoopla typically £3–£5 per go
                </div>
              </div>
              <p className="text-[13px] leading-relaxed text-amber-900/75 dark:text-amber-400/80 mt-4 pt-4 border-t border-amber-500/30">
                These are estimated historical benchmarks only. All prices are set by individual
                operators and must be confirmed at each attraction before paying.
              </p>
            </div>

            <Link className={LINK_CLASS} to="/guides/hull-fair-ride-prices-2026">
              Read our detailed Hull Fair ride prices and budgeting guide →
            </Link>
          </section>

          {/* Section 4: Food Bucket List */}
          <section id="food" className={SECTION_CLASS}>
            <SectionHeader
              index="04"
              eyebrow="Culinary Traditions"
              title="The Legendary Hull Fair Food Bucket List"
            />
            <p className={`${BODY_CLASS} mb-8`}>
              Half the magic of Hull Fair is the unmistakable smell of frying onions, hot sugar, and
              steaming patties. Here are the authentic Hull Fair culinary essentials you must try:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {[
                {
                  emoji: "🥔",
                  title: "1. Bob Carver’s Patties & Chips",
                  text: "The quintessential Hull delicacy. A seasoned patty made from mashed potato infused with sage and onion, dipped in batter and deep-fried golden. Served piping hot with chips, salt, and lashings of chip spice.",
                },
                {
                  emoji: "🍯",
                  title: "2. Wright’s Brandy Snaps & Fresh Cream",
                  text: "Crisp, golden-brown rolled ginger-molasses wafer cylinders filled on the spot with sweet whipped fresh dairy cream. A cherished staple for generations of fairgoers.",
                },
                {
                  emoji: "🔴",
                  title: "3. Pomegranates with Pins & Spoons",
                  text: "A unique Hull Fair tradition dating back to when exotic Mediterranean fruits were unloaded at Hull Docks each autumn. Fairgoers pick ruby-red seeds straight from the cut fruit using pins or small plastic spoons.",
                },
                {
                  emoji: "🌰",
                  title: "4. Hot Roasted Chestnuts & Toffee Apples",
                  text: "Roasted over open coal drums and served in paper bags to warm your hands against the autumn evening chill.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex gap-4 border border-border bg-card p-5 md:p-6"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-accent/20 text-3xl">
                    {item.emoji}
                  </div>
                  <div>
                    <h3 className="font-display text-xl md:text-2xl uppercase leading-tight mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-foreground/75">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 5: Family, Safety & Practicalities */}
          <section id="family" className={SECTION_CLASS}>
            <SectionHeader
              index="05"
              eyebrow="Visitor Advice"
              title="Family, Dogs, Toilets & Practical Tips"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className={CARD_CLASS}>
                <h3 className="font-bold uppercase text-sm tracking-wide mb-2">
                  🕒 Quieter Times for Families
                </h3>
                <p className="text-sm leading-relaxed text-foreground/75">
                  Weekday afternoons (Monday to Thursday, 2:00 PM to 5:00 PM) are significantly
                  quieter than Friday and Saturday evenings. Pushchairs are manageable along Walton
                  Street, though expect a crowd at peak hours regardless of day.
                </p>
              </div>

              <div className={CARD_CLASS}>
                <h3 className="font-bold uppercase text-sm tracking-wide mb-2">
                  🪪 If a Child Gets Separated
                </h3>
                <p className="text-sm leading-relaxed text-foreground/75">
                  Agree a fixed meeting point before entering — a recognisable landmark works better
                  than trying to phone in a noisy crowd. Tell children to find a uniformed event
                  steward or police officer, and keep a current photo of them on your phone. Write
                  your mobile number on a child's wrist with a marker pen or ask a steward for a
                  child ID wristband on arrival.
                </p>
              </div>

              <div className={CARD_CLASS}>
                <h3 className="font-bold uppercase text-sm tracking-wide mb-2">
                  💳 Cash, Cards & Mobile Signal
                </h3>
                <p className="text-sm leading-relaxed text-foreground/75">
                  Many operators accept contactless payment, but mobile network congestion across
                  Walton Street (100,000+ visitors) regularly causes card terminals to buffer or
                  fail. On-site temporary ATMs carry a £2.50 to £3.50 withdrawal fee and queue badly
                  on Friday and Saturday nights. Withdraw cash from a high-street bank or ATM{" "}
                  <strong>before</strong> you arrive.
                </p>
              </div>

              <div className={CARD_CLASS}>
                <h3 className="font-bold uppercase text-sm tracking-wide mb-2">
                  🚻 Toilets & Baby Changing
                </h3>
                <p className="text-sm leading-relaxed text-foreground/75">
                  The official 2026 layout shows two public toilet blocks: one on the Walton Street
                  side of the fairground, and one on the north-east perimeter by the railway
                  boundary. Ask an event steward on site for accessible and baby-changing
                  facilities.
                </p>
                <div className="mt-4">
                  <Link className={LINK_CLASS} to="/hull-fair-map">
                    🗺️ Locate toilets on the interactive map →
                  </Link>
                </div>
              </div>

              <div className={CARD_CLASS}>
                <h3 className="font-bold uppercase text-sm tracking-wide mb-2">
                  🐕 Dogs at Hull Fair
                </h3>
                <p className="text-sm leading-relaxed text-foreground/75">
                  Pet dogs are strongly discouraged. The fairground creates serious hazards for
                  animals — extreme noise levels, strobe lighting, dense crowds, discarded wooden
                  food skewers on the ground, and hot cooking grease. Registered assistance and
                  guide dogs are of course permitted. All other dog owners should leave their pets
                  safely at home.
                </p>
              </div>

              <div className={CARD_CLASS}>
                <h3 className="font-bold uppercase text-sm tracking-wide mb-2">
                  ♿ Accessibility & Blue Badges
                </h3>
                <p className="text-sm leading-relaxed text-foreground/75">
                  Walton Street is largely paved. Individual rides and stalls have their own
                  boarding arrangements; ask staff at each attraction. Blue Badge holders should
                  check Hull City Council's current parking guidance before travelling, as standard
                  arrangements may not apply during road closures.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6: Interactive FAQs */}
          <section id="faqs" className={SECTION_CLASS}>
            <SectionHeader
              index="06"
              eyebrow="Quick Answers & Verification"
              title="Frequently Asked Questions"
            />

            <div className="border border-border bg-card divide-y divide-border">
              {HULL_FAIR_FAQS.map((f, i) => (
                <details key={i} className="group" open={i === 0}>
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4 md:px-6 md:py-5 font-bold text-base md:text-lg text-foreground hover:bg-foreground/[0.03] transition-colors [&::-webkit-details-marker]:hidden">
                    <span>{f.question}</span>
                    <ChevronDown className="h-5 w-5 shrink-0 mt-0.5 text-foreground/50 transition-transform duration-200 group-open:rotate-180 group-open:text-accent" />
                  </summary>
                  <p className="px-5 pb-5 md:px-6 md:pb-6 -mt-1 text-[15px] md:text-base text-foreground/75 leading-relaxed max-w-3xl">
                    {f.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* Newsletter Signup */}
          <section className="relative overflow-hidden bg-foreground text-background p-8 md:p-12">
            <div
              className="absolute -right-10 -top-10 h-48 w-48 rounded-full border-[24px] border-accent/15"
              aria-hidden="true"
            />
            <div className="relative max-w-xl">
              <div className="text-[11px] font-mono uppercase tracking-widest text-accent mb-2">
                Stay In The Loop
              </div>
              <h3 className="font-display text-3xl md:text-5xl uppercase mb-3 text-background">
                Get Hull Fair Updates
              </h3>
              <p className="text-background/75 text-[15px] leading-relaxed mb-6">
                Subscribe to the free HU NOW weekly digest for Hull Fair updates and what's on
                across Hull and East Yorkshire.
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
                    aria-label="Email address"
                    required
                    className="px-4 py-3.5 bg-background text-foreground text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3.5 bg-accent text-accent-foreground text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors"
                  >
                    Subscribe Free
                  </button>
                </form>
              )}
            </div>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
