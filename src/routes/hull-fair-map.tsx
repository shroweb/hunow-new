import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { InteractiveFairMap } from "@/components/hull-fair/InteractiveFairMap";
import { buildSeoMeta } from "@/lib/seo-meta";
import { MapPin, ArrowLeft, Clock, Calendar, Sparkles, AlertCircle, Compass } from "lucide-react";

export const Route = createFileRoute("/hull-fair-map")({
  head: () => {
    const base = buildSeoMeta({
      title: "Hull Fair 2026 Interactive Map — Walton Street Rides, Stalls & Facilities",
      description:
        "Interactive mobile digital map of Hull Fair 2026. Explore and search 100+ thrill rides, roller coasters, family rides, funhouses, famous food stalls, and toilets on Walton Street.",
      path: "/hull-fair-map",
    });
    return {
      ...base,
      links: [
        ...base.links,
        { rel: "stylesheet", href: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" },
      ],
    };
  },
  component: HullFairMapPage,
});

function HullFairMapPage() {
  return (
    <PublicLayout>
      {/* Top Header / Breadcrumb - seamlessly matched to HU NOW design */}
      <div className="bg-foreground text-background border-b-2 border-foreground">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/hull-fair"
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-accent hover:underline transition-colors font-bold"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Hull Fair Guide</span>
            </Link>

            <div className="flex items-center gap-2 text-[11px] font-mono text-background/80">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Walton Street Fairground · 9–17 October 2026</span>
            </div>
          </div>

          <div className="mt-4 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30 text-[11px] font-mono uppercase tracking-widest font-bold mb-2">
              <Sparkles className="h-3 w-3" />
              Interactive Fairground Map
            </div>
            <h1 className="text-3xl md:text-5xl font-display uppercase tracking-tight text-background leading-tight">
              Hull Fair 2026 Map
            </h1>
            <p className="mt-2 text-sm md:text-base text-background/85 leading-relaxed">
              Explore Walton Street's official 2026 layout. Pinch to zoom, tap pins to check thrill levels and height limits, search rides, or filter by category.
            </p>
          </div>
        </div>
      </div>

      {/* Main Map Interactive Section */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 md:py-8">
        <InteractiveFairMap />

        {/* Helpful Map Guides & Area Breakdown - High Contrast Clean Theme Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Key Entrances */}
          <div className="p-6 rounded-2xl bg-card border-2 border-foreground/15 shadow-sm hover:border-foreground/30 transition-all">
            <div className="flex items-center gap-2 text-accent font-mono text-xs uppercase tracking-wider font-bold mb-3">
              <MapPin className="h-4 w-4" />
              <span>Entrances & Access</span>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-3 font-display tracking-tight">
              Getting Onto the Fairground
            </h3>
            <ul className="text-xs text-foreground/80 space-y-2.5 leading-relaxed">
              <li>
                <strong className="text-foreground">Spring Bank West Entrance:</strong> Best for visitors arriving from northern bus routes or walking via Chanterlands Avenue.
              </li>
              <li>
                <strong className="text-foreground">Walton Street Central:</strong> The heart of the food stalls, Bob Carvers patties, and main pedestrian artery.
              </li>
              <li>
                <strong className="text-foreground">Anlaby Road / MKM Stadium:</strong> Recommended entrance for park-and-ride buses and walkers coming from Hull Paragon Interchange.
              </li>
            </ul>
          </div>

          {/* Card 2: Essential Facilities */}
          <div className="p-6 rounded-2xl bg-card border-2 border-foreground/15 shadow-sm hover:border-foreground/30 transition-all">
            <div className="flex items-center gap-2 text-accent font-mono text-xs uppercase tracking-wider font-bold mb-3">
              <Compass className="h-4 w-4" />
              <span>Key Facilities</span>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-3 font-display tracking-tight">
              Toilets & Welfare Hubs
            </h3>
            <ul className="text-xs text-foreground/80 space-y-2.5 leading-relaxed">
              <li>
                <strong className="text-foreground">Central Walton Toilets:</strong> Dedicated male, female, accessible cubicles and baby-changing units.
              </li>
              <li>
                <strong className="text-foreground">North Boundary Toilets:</strong> Located along the railway line edge near major thrill rides.
              </li>
              <li>
                <strong className="text-foreground">First Aid & Welfare Hub:</strong> Operated by St John Ambulance and Humberside Police near the Walton Street centre post.
              </li>
            </ul>
          </div>

          {/* Card 3: Opening Hours & Advice */}
          <div className="p-6 rounded-2xl bg-card border-2 border-foreground/15 shadow-sm hover:border-foreground/30 transition-all">
            <div className="flex items-center gap-2 text-accent font-mono text-xs uppercase tracking-wider font-bold mb-3">
              <Clock className="h-4 w-4" />
              <span>Dates & Hours</span>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-3 font-display tracking-tight">
              Fairground Schedule
            </h3>
            <div className="text-xs text-foreground/80 space-y-2.5 leading-relaxed">
              <p>
                <strong className="text-foreground">Fri 9 Oct:</strong> 4:00 PM – 11:00 PM (Opening Night)
              </p>
              <p>
                <strong className="text-foreground">Saturdays (10 & 17 Oct):</strong> 12:00 Noon – 11:00 PM
              </p>
              <p>
                <strong className="text-foreground">Mon–Fri (12–16 Oct):</strong> 2:00 PM – 11:00 PM
              </p>
              <p className="inline-block px-2 py-1 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold border border-amber-500/20">
                Closed Sunday 11 October
              </p>
            </div>
          </div>
        </div>

        {/* Back Link to Complete Guide */}
        <div className="mt-8 p-6 rounded-2xl bg-card border-2 border-foreground/20 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div>
            <h4 className="text-base font-bold text-foreground font-display">
              Planning your entire visit to Hull Fair?
            </h4>
            <p className="text-xs text-foreground/75 mt-0.5">
              Read our complete guide covering bus routes, park & ride locations, ride prices, food history, and family tips.
            </p>
          </div>
          <Link
            to="/hull-fair"
            className="shrink-0 px-6 py-2.5 rounded-xl bg-foreground text-background font-bold text-xs uppercase tracking-widest hover:bg-foreground/90 transition-colors shadow-sm"
          >
            Read Complete Guide →
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
