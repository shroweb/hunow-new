import { createFileRoute } from "@tanstack/react-router";
import { FixtureLandingPage } from "@/components/fixtures/FixtureLandingPage";
import { FIXTURE_TEAMS } from "@/lib/fixture-pages";

export const Route = createFileRoute("/hull-city-fixtures")({
  loader: async () => {
    const { getStoreFromDatabase } = await import("@/lib/store.functions");
    const store = await getStoreFromDatabase().catch(() => null);
    return { events: store?.events ?? [] };
  },
  head: () => ({
    meta: [
      { title: "Hull City Fixtures: Upcoming Matches & Kick-Off Times — HU NOW" },
      { name: "description", content: FIXTURE_TEAMS["hull-city"].description },
    ],
    links: [{ rel: "canonical", href: "https://www.hunow.co.uk/hull-city-fixtures" }],
  }),
  component: HullCityFixturesPage,
});

function HullCityFixturesPage() {
  return <FixtureLandingPage team="hull-city" events={Route.useLoaderData().events} />;
}
