import { writeFileSync } from "node:fs";
import { renderNewsletterTemplate } from "../src/lib/newsletter-template.server";
import { seedArticles, seedEvents, seedListings, seedOffers } from "../src/data/seed";

// Silence DB import side-effects by setting a dummy DATABASE_URL
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://dummy/dummy";
process.env.SITE_URL = "http://localhost:8082";

const { html } = renderNewsletterTemplate({
  subject: "This Week in Hull",
  intro: "The best events, stories and offers to explore this week.",
  issue: {
    articles: seedArticles.slice(0, 5),
    events: seedEvents.slice(0, 4),
    offers: (seedOffers ?? []).slice(0, 4),
    listings: seedListings.slice(0, 3),
  },
  template: "weekly",
});

const out = "/tmp/newsletter-preview.html";
writeFileSync(out, html);
console.log(`Written to ${out}`);
