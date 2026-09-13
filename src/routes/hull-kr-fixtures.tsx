import { createFileRoute } from "@tanstack/react-router";
import { FixtureLandingPage } from "@/components/fixtures/FixtureLandingPage";
import { FIXTURE_TEAMS } from "@/lib/fixture-pages";

export const Route = createFileRoute("/hull-kr-fixtures")({
  loader: async () => {
    const { getStoreFromDatabase } = await import("@/lib/store.functions");
    const store = await getStoreFromDatabase().catch(() => null);
    return { events: store?.events ?? [] };
  },
  head: () => ({
    meta: [
      { title: "Hull KR Fixtures: Upcoming Matches & Kick-Off Times — HU NOW" },
      { name: "description", content: FIXTURE_TEAMS["hull-kr"].description },
    ],
    links: [{ rel: "canonical", href: "https://www.hunow.co.uk/hull-kr-fixtures" }],
  }),
  component: HullKrFixturesPage,
});

function HullKrFixturesPage() {
  return <FixtureLandingPage team="hull-kr" events={Route.useLoaderData().events} />;
}
