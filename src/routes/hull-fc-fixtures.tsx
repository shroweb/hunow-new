import { createFileRoute } from "@tanstack/react-router";
import { FixtureLandingPage } from "@/components/fixtures/FixtureLandingPage";
import { FIXTURE_TEAMS } from "@/lib/fixture-pages";

export const Route = createFileRoute("/hull-fc-fixtures")({
  loader: async () => {
    const { getStoreFromDatabase } = await import("@/lib/store.functions");
    const store = await getStoreFromDatabase().catch(() => null);
    return { events: store?.events ?? [] };
  },
  head: () => ({
    meta: [
      { title: "Hull FC Fixtures: Upcoming Matches & Kick-Off Times — HU NOW" },
      { name: "description", content: FIXTURE_TEAMS["hull-fc"].description },
    ],
    links: [{ rel: "canonical", href: "https://www.hunow.co.uk/hull-fc-fixtures" }],
  }),
  component: HullFcFixturesPage,
});

function HullFcFixturesPage() {
  return <FixtureLandingPage team="hull-fc" events={Route.useLoaderData().events} />;
}
