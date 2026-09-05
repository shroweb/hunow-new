import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { buildSeoMeta } from "@/lib/seo-meta";

export const Route = createFileRoute("/about")({
  head: () =>
    buildSeoMeta({
      title: "About HU NOW — Hull's Independent Guide",
      description:
        "HU NOW is Kingston upon Hull's independent hyper-local guide covering live events, food & drink, arts, grassroots culture and civic news across East Yorkshire.",
      path: "/about",
    }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        <div className="text-[10px] font-mono uppercase tracking-widest text-accent mb-4">
          Independent Journalism & City Guide
        </div>
        <h1 className="text-5xl md:text-7xl font-display uppercase tracking-tight leading-none mb-8">
          ABOUT <span className="text-accent">HU NOW</span>
        </h1>

        <div className="prose prose-lg dark:prose-invert space-y-6 text-foreground/90 font-serif leading-relaxed">
          <p className="text-2xl text-foreground font-sans font-medium leading-snug">
            HU NOW is an independent digital magazine and city guide dedicated to Kingston upon Hull
            and the surrounding East Riding of Yorkshire.
          </p>

          <p>
            From the cobbled streets of Old Town and the bustling Fruit Market to the vibrant communities
            of the Avenues and East Park, our mission is simple: to celebrate the people, independent businesses,
            creators, and cultural movements shaping modern Hull.
          </p>

          <h2 className="font-sans font-bold text-2xl uppercase tracking-tight text-foreground pt-6 border-t border-border">
            What We Cover
          </h2>
          <ul className="space-y-2 font-sans text-base">
            <li>
              <strong>What's On & Live Events:</strong> Comprehensive listings from MKM Stadium matchdays and Connexin Live arena shows to intimate gigs at The New Adelphi Club and Hull Truck Theatre.
            </li>
            <li>
              <strong>Food & Drink:</strong> Uncompromising reviews and curated guides to Hull’s thriving culinary scene — from award-winning Old Town pubs to Humber Street street food and Sunday roasts.
            </li>
            <li>
              <strong>Culture & Heritage:</strong> In-depth coverage of flagship annual traditions including Hull Fair, Freedom Festival, Humber Street Sesh, and Pride in Hull.
            </li>
            <li>
              <strong>Civic Data:</strong> Real-time public infrastructure monitoring including the Humber Bridge status, River Humber tides at Victoria Pier, and local meteorological feeds.
            </li>
          </ul>

          <div className="pt-8 border-t border-border flex flex-wrap gap-4 font-sans not-prose">
            <Link
              to="/contact"
              className="px-6 py-3 bg-foreground text-background text-xs font-bold uppercase tracking-widest hover:bg-accent hover:text-background transition-colors"
            >
              Contact the Editorial Team
            </Link>
            <Link
              to="/advertise"
              className="px-6 py-3 border border-border text-foreground text-xs font-bold uppercase tracking-widest hover:border-foreground transition-colors"
            >
              Partner With Us
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
