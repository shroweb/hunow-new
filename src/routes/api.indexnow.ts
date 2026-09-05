import { createFileRoute } from "@tanstack/react-router";
import { submitUrlsToIndexNow } from "@/lib/indexnow";

export const Route = createFileRoute("/api/indexnow")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { getDatabaseStore } = await import("@/lib/db.server");
          const store = await getDatabaseStore().catch(() => null);
          const articles = (store?.articles ?? []).filter((a) => !a.seo?.noIndex && a.status === "published");
          const events = (store?.events ?? []).filter((e) => e.status === "published");
          const listings = store?.listings ?? [];

          const urls = [
            "https://www.hunow.co.uk/",
            "https://www.hunow.co.uk/hull-fair",
            "https://www.hunow.co.uk/humber-street-sesh",
            "https://www.hunow.co.uk/freedom-festival",
            "https://www.hunow.co.uk/christmas-lights-switch-on",
            "https://www.hunow.co.uk/hull-pride",
            "https://www.hunow.co.uk/whats-on",
            "https://www.hunow.co.uk/stories",
            "https://www.hunow.co.uk/places",
            "https://www.hunow.co.uk/offers",
            ...articles.map((a) => `https://www.hunow.co.uk/stories/${a.slug}`),
            ...events.map((e) => `https://www.hunow.co.uk/events/${e.slug}`),
            ...listings.map((l) => `https://www.hunow.co.uk/places/${l.slug}`),
          ];

          const result = await submitUrlsToIndexNow(urls);
          return new Response(JSON.stringify(result), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
        }
      },
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const urls = Array.isArray(body.urls) ? body.urls : [];
          const result = await submitUrlsToIndexNow(urls);
          return new Response(JSON.stringify(result), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
        }
      },
    },
  },
});
