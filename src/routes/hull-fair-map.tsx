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
      {/* Top Header / Breadcrumb */}
      <div className="bg-zinc-950 text-white border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/hull-fair"
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Hull Fair Guide</span>
            </Link>

            <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Walton Street Fairground · 9–17 October 2026</span>
            </div>
          </div>

          <div className="mt-4 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 text-xs font-mono uppercase tracking-widest font-bold mb-2">
              <Sparkles className="h-3 w-3" />
              Interactive Fairground Map
            </div>
            <h1 className="text-3xl md:text-5xl font-display uppercase tracking-tight text-white leading-tight">
              Hull Fair 2026 Map
            </h1>
            <p className="mt-2 text-sm md:text-base text-zinc-300 leading-relaxed">
              Pinch to zoom and tap pins to discover over 100 rides, stalls, and facilities mapped across Walton Street. Filter by category, search specific attractions, or switch to list view.
            </p>
          </div>
        </div>
      </div>

      {/* Main Map Interactive Section */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 md:py-8">
        <InteractiveFairMap />

        {/* Helpful Map Guides & Area Breakdown */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Key Entrances */}
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-border">
            <div className="flex items-center gap-2 text-accent font-mono text-xs uppercase tracking-wider font-bold mb-3">
              <MapPin className="h-4 w-4" />
              <span>Entrances & Access</span>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              Getting Onto the Fairground
            </h3>
            <ul className="text-xs text-muted-foreground space-y-2 leading-relaxed">
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
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-border">
            <div className="flex items-center gap-2 text-accent font-mono text-xs uppercase tracking-wider font-bold mb-3">
              <Compass className="h-4 w-4" />
              <span>Key Facilities</span>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              Toilets & Welfare Hubs
            </h3>
            <ul className="text-xs text-muted-foreground space-y-2 leading-relaxed">
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
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-border">
            <div className="flex items-center gap-2 text-accent font-mono text-xs uppercase tracking-wider font-bold mb-3">
              <Clock className="h-4 w-4" />
              <span>Dates & Hours</span>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              Fairground Schedule
            </h3>
            <div className="text-xs text-muted-foreground space-y-2 leading-relaxed">
              <p>
                <strong className="text-foreground">Fri 9 Oct:</strong> 4:00 PM – 11:00 PM (Opening Night)
              </p>
              <p>
                <strong className="text-foreground">Saturdays (10 & 17 Oct):</strong> 12:00 Noon – 11:00 PM
              </p>
              <p>
                <strong className="text-foreground">Mon–Fri (12–16 Oct):</strong> 2:00 PM – 11:00 PM
              </p>
              <p className="text-amber-500 font-bold">
                Closed Sunday 11 October.
              </p>
            </div>
          </div>
        </div>

        {/* Back Link to Complete Guide */}
        <div className="mt-8 p-6 rounded-2xl bg-foreground/5 border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-base font-bold text-foreground">
              Planning your entire visit to Hull Fair?
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Read our complete guide covering bus routes, park & ride locations, ride prices, food history, and family tips.
            </p>
          </div>
          <Link
            to="/hull-fair"
            className="shrink-0 px-5 py-2.5 rounded-xl bg-foreground text-background font-bold text-xs uppercase tracking-widest hover:bg-foreground/90 transition-colors"
          >
            Read Complete Guide →
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
