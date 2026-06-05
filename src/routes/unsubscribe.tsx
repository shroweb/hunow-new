import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { unsubscribeNewsletter } from "@/lib/public.functions";

export const Route = createFileRoute("/unsubscribe")({
  validateSearch: (search) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  loaderDeps: ({ search }) => ({ token: search.token }),
  loader: async ({ deps }) => {
    if (!deps.token) return { ok: false, email: undefined };
    return unsubscribeNewsletter({ data: { token: deps.token } });
  },
  head: () => ({
    meta: [{ title: "Unsubscribe — HU NOW" }],
  }),
  component: Unsubscribe,
});

function Unsubscribe() {
  const result = Route.useLoaderData();

  return (
    <PublicLayout>
      <main className="max-w-3xl mx-auto px-4 py-20">
        <div className="font-mono text-[10px] uppercase text-accent mb-4 tracking-widest">
          Newsletter
        </div>
        <h1 className="font-display text-6xl md:text-8xl uppercase leading-none mb-6">
          {result.ok ? "You're unsubscribed" : "Link expired"}
        </h1>
        <p className="text-xl text-muted-foreground max-w-xl">
          {result.ok
            ? "No more HU NOW newsletters will be sent to this address."
            : "This unsubscribe link is no longer active. If you still receive newsletters, use the latest link in the footer."}
        </p>
      </main>
    </PublicLayout>
  );
}
