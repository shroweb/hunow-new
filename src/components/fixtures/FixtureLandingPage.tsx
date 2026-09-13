import { Link } from "@tanstack/react-router";
import { CalendarDays, MapPin, RefreshCw } from "lucide-react";
import { AdSlot } from "@/components/AdSlot";
import { EventCard } from "@/components/cards";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { FIXTURE_TEAMS, eventMatchesFixtureTeam, type FixtureTeam } from "@/lib/fixture-pages";
import type { EventItem } from "@/types";

export function FixtureLandingPage({ team, events }: { team: FixtureTeam; events: EventItem[] }) {
  const config = FIXTURE_TEAMS[team];
  const today = new Date().toISOString().slice(0, 10);
  const fixtures = events
    .filter(
      (event) =>
        (event.endDate || event.startDate) >= today && eventMatchesFixtureTeam(event, team),
    )
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  return (
    <PublicLayout>
      <header className="border-b-2 border-foreground bg-foreground text-background">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="font-mono text-xs uppercase tracking-[0.25em] text-accent mb-4">
            {config.sport} · Fixtures
          </div>
          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl uppercase leading-none mb-6">
            {config.name} Fixtures
          </h1>
          <p className="max-w-3xl text-lg md:text-xl text-background/75 leading-relaxed">
            {config.description}
          </p>
          <div className="flex flex-wrap gap-5 mt-8 text-xs font-mono uppercase">
            <span className="flex items-center gap-2">
              <MapPin className="size-4 text-accent" /> {config.venue}
            </span>
            <span className="flex items-center gap-2">
              <RefreshCw className="size-4 text-accent" /> Automatically updated
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <AdSlot placement={`${config.name} Category`} />
      </div>

      <main className="max-w-7xl mx-auto px-4 py-10 md:py-14">
        <div className="flex items-end justify-between gap-4 border-b-2 border-foreground pb-4 mb-8">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Next matches
            </div>
            <h2 className="font-display text-4xl uppercase">Upcoming fixtures</h2>
          </div>
          <span className="font-mono text-xs uppercase text-muted-foreground">
            {fixtures.length} listed
          </span>
        </div>

        {fixtures.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
            {fixtures.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed border-border py-16 px-6 text-center">
            <CalendarDays className="size-10 mx-auto mb-4 text-muted-foreground" />
            <h2 className="font-display text-3xl uppercase mb-2">Fixtures coming soon</h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              There are no upcoming fixtures in the feed yet. Check back after the next schedule
              update.
            </p>
          </div>
        )}

        <aside className="mt-14 border-t border-border pt-8 text-sm text-muted-foreground">
          Fixture dates and kick-off times can change. Confirm final details with the club or
          competition before travelling. Browse all{" "}
          <Link to="/whats-on" className="underline">
            Hull events
          </Link>
          .
        </aside>
      </main>
    </PublicLayout>
  );
}
