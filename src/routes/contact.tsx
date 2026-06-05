import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { submitContact } from "@/lib/public.functions";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & News Tips — HU NOW" },
      {
        name: "description",
        content: "Send HU NOW a news tip, press release, or general enquiry.",
      },
    ],
  }),
  component: Contact,
});

const ENQUIRY_TYPES = [
  {
    value: "news-tip",
    label: "News tip",
    description: "Something happening in Hull we should cover",
  },
  {
    value: "press-release",
    label: "Press release",
    description: "Official announcement or event information",
  },
  {
    value: "general",
    label: "General enquiry",
    description: "Anything else — partnerships, corrections, feedback",
  },
] as const;

type EnquiryType = "news-tip" | "press-release" | "general";

function Contact() {
  const [enquiryType, setEnquiryType] = useState<EnquiryType>("news-tip");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSending(true);
    setError("");
    try {
      await submitContact({
        data: {
          name: String(fd.get("name")),
          email: String(fd.get("email")),
          enquiryType,
          subject: String(fd.get("subject")),
          message: String(fd.get("message")),
        },
      });
      setDone(true);
    } catch {
      setError("Something went wrong — please try again or email us directly.");
    } finally {
      setSending(false);
    }
  };

  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 py-20">
        <div className="font-mono text-[10px] uppercase text-accent mb-4">Get in touch</div>
        <h1 className="font-display text-6xl md:text-8xl uppercase leading-none mb-6">
          Send us a story
        </h1>
        <p className="text-xl text-muted-foreground mb-16 max-w-xl">
          Got a news tip, press release, or something Hull needs to know about? We read everything.
        </p>

        {done ? (
          <div className="border-2 border-foreground p-10 text-center">
            <div className="font-display text-4xl uppercase mb-3">Thanks</div>
            <p className="text-muted-foreground">We'll be in touch if we take it further.</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-8">
            {/* Enquiry type */}
            <div>
              <div className="font-mono text-[10px] uppercase mb-3">What are you sending?</div>
              <div className="grid md:grid-cols-3 gap-3">
                {ENQUIRY_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setEnquiryType(t.value)}
                    className={`text-left p-4 border-2 transition-colors ${
                      enquiryType === t.value
                        ? "border-foreground bg-foreground text-background"
                        : "border-foreground/20 hover:border-foreground"
                    }`}
                  >
                    <div className="font-bold text-sm uppercase tracking-wide mb-1">{t.label}</div>
                    <div
                      className={`text-xs leading-snug ${enquiryType === t.value ? "text-background/70" : "text-muted-foreground"}`}
                    >
                      {t.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Contact details */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[10px] uppercase mb-2">Your name</label>
                <input
                  name="name"
                  required
                  placeholder="Jane Smith"
                  className="w-full border-2 border-foreground px-4 py-3 font-mono text-sm focus:outline-none focus:border-accent bg-transparent"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase mb-2">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="jane@example.com"
                  className="w-full border-2 border-foreground px-4 py-3 font-mono text-sm focus:outline-none focus:border-accent bg-transparent"
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block font-mono text-[10px] uppercase mb-2">Subject</label>
              <input
                name="subject"
                required
                placeholder={
                  enquiryType === "news-tip"
                    ? "e.g. New venue opening on Humber Street"
                    : enquiryType === "press-release"
                      ? "e.g. Hull Truck Theatre announces spring season"
                      : "e.g. Question about advertising"
                }
                className="w-full border-2 border-foreground px-4 py-3 font-mono text-sm focus:outline-none focus:border-accent bg-transparent"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block font-mono text-[10px] uppercase mb-2">
                {enquiryType === "press-release" ? "Press release / details" : "Message"}
              </label>
              <textarea
                name="message"
                required
                minLength={10}
                rows={8}
                placeholder={
                  enquiryType === "news-tip"
                    ? "Tell us what you know — who, what, where, when. Include any links or sources."
                    : enquiryType === "press-release"
                      ? "Paste your press release or provide the key details. Include contact info for follow-up."
                      : "How can we help?"
                }
                className="w-full border-2 border-foreground px-4 py-3 font-mono text-sm focus:outline-none focus:border-accent bg-transparent resize-none"
              />
            </div>

            {error && <p className="text-sm font-bold text-red-600">{error}</p>}

            <button
              disabled={sending}
              className="bg-foreground text-background px-10 py-4 font-bold uppercase tracking-widest text-xs hover:bg-accent disabled:opacity-50 transition-colors"
            >
              {sending ? "Sending…" : "Send"}
            </button>
          </form>
        )}

        {/* Direct contact */}
        <div className="mt-20 pt-10 border-t border-border">
          <div className="font-mono text-[10px] uppercase text-muted-foreground mb-2">
            Other ways to reach us
          </div>
          <p className="text-sm text-muted-foreground">
            You can also email us directly at{" "}
            <a href="mailto:hello@hunow.co.uk" className="underline hover:text-accent">
              hello@hunow.co.uk
            </a>{" "}
            or find us on social media.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
