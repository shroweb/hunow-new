import { getFixtureMatchup, teamInitials } from "@/lib/fixture-artwork";
import type { EventItem } from "@/types";

export function FixtureArtwork({ event, hero = false }: { event: EventItem; hero?: boolean }) {
  const matchup = getFixtureMatchup(event);
  if (!matchup) return null;

  return (
    <div
      role="img"
      aria-label={`${matchup.home} versus ${matchup.away}`}
      className="relative w-full h-full overflow-hidden bg-[#070c27] text-white isolate"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(240,178,48,0.22),transparent_42%)]" />
      <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-br from-[#17245d] to-[#070c27] [clip-path:polygon(0_0,100%_0,82%_100%,0_100%)]" />
      <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-bl from-[#35114f] to-[#070c27] [clip-path:polygon(18%_0,100%_0,100%_100%,0_100%)]" />
      <div
        className={`relative h-full grid grid-cols-[1fr_auto_1fr] items-center ${hero ? "gap-2 px-4 md:gap-6 md:px-16" : "gap-2 px-4"}`}
      >
        <Team team={matchup.home} hero={hero} />
        <div
          className={`rounded-full border-2 border-accent bg-[#070c27] text-accent font-display grid place-items-center ${hero ? "size-12 text-xl md:size-20 md:text-3xl" : "size-11 text-lg"}`}
        >
          VS
        </div>
        <Team team={matchup.away} hero={hero} />
      </div>
    </div>
  );
}

function Team({ team, hero }: { team: string; hero: boolean }) {
  return (
    <div className="min-w-0 text-center flex flex-col items-center">
      <div
        className={`rounded-full border border-white/30 bg-white/10 grid place-items-center font-display text-accent mb-2 ${hero ? "size-16 text-3xl md:size-28 md:text-5xl" : "size-14 text-2xl"}`}
      >
        {teamInitials(team)}
      </div>
      <div
        className={`font-display uppercase leading-none text-balance ${hero ? "text-xl md:text-5xl" : "text-base md:text-xl"}`}
      >
        {team}
      </div>
    </div>
  );
}
