import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { subscribeNewsletter } from "@/lib/public.functions";

export const Route = createFileRoute("/newsletter")({
  head: () => ({
    meta: [
      { title: "Newsletter — HU NOW" },
      { name: "description", content: "Get Hull's best events, food guides and hidden gems every Thursday." },
    ],
  }),
  component: Newsletter,
});

function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    try {
      await subscribeNewsletter({ data: { email } });
      setDone(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 py-20">
        <div className="font-mono text-[10px] uppercase text-accent mb-4 tracking-widest">Every Thursday</div>
        <h1 className="font-display text-6xl md:text-8xl uppercase leading-none mb-6">
          Hull in your inbox
        </h1>
        <p className="text-xl text-muted-foreground mb-12 max-w-xl">
          The week's best events, new openings, food guides and stories — written for people who actually live here. Free, every Thursday afternoon.
        </p>

        {done ? (
          <div className="border-2 border-foreground p-10">
            <div className="font-display text-4xl uppercase mb-2">You're in.</div>
            <p className="text-muted-foreground">First issue lands this Thursday. Check your spam if it doesn't show.</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-0 max-w-md">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 bg-white border-2 border-foreground px-6 py-4 font-mono text-sm focus:outline-none focus:border-accent"
            />
            <button
              disabled={sending}
              className="bg-foreground text-background px-8 py-4 font-bold uppercase tracking-widest text-xs hover:bg-accent transition-colors disabled:opacity-50 border-2 border-foreground"
            >
              {sending ? "…" : "Subscribe"}
            </button>
          </form>
        )}

        <div className="mt-16 pt-10 border-t border-border">
          <div className="font-mono text-[10px] uppercase text-muted-foreground mb-6 tracking-widest">What you'll get</div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "What's on", body: "The week's best events — gigs, markets, openings, family days — chosen by us, not an algorithm." },
              { title: "Where to go", body: "New places to eat and drink, hidden gems, and honest takes on what's actually worth your time." },
              { title: "Hull stories", body: "Long reads and local news about the city, its people and what's changing." },
            ].map((item) => (
              <div key={item.title} className="border border-border p-5">
                <div className="font-display text-xl uppercase mb-2">{item.title}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
