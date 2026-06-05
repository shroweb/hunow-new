import { img } from "@/data/seed";
import { articlePath } from "@/lib/taxonomy";
import type { Article, EventItem, Listing, Offer } from "@/types";

export interface NewsletterIssue {
  articles: Article[];
  events: EventItem[];
  offers: Offer[];
  listings: Listing[];
}

export interface NewsletterTemplateInput {
  subject: string;
  intro: string;
  issue: NewsletterIssue;
  unsubscribeUrl?: string;
}

const SITE_URL = (process.env.SITE_URL || "https://hunow.co.uk").replace(/\/$/, "");

function absoluteUrl(path: string) {
  if (!path) return SITE_URL;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function imageUrl(image: string, width = 1200, height = 760) {
  const source = img(image, width, height);
  return absoluteUrl(source);
}

function escapeHtml(value: string | number | undefined | null) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function textDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

function button(label: string, href: string) {
  return `<a href="${escapeHtml(absoluteUrl(href))}" class="button">${escapeHtml(label)}</a>`;
}

function articleCard(article: Article, featured = false) {
  const href = articlePath(article);
  return `
    <tr>
      <td class="${featured ? "feature-card" : "item-card"}">
        <a href="${escapeHtml(absoluteUrl(href))}">
          <img src="${escapeHtml(imageUrl(article.featuredImage, 1200, 720))}" alt="${escapeHtml(article.title)}" />
        </a>
        <div class="eyebrow">${escapeHtml(article.category)}</div>
        <h2>${escapeHtml(article.title)}</h2>
        <p>${escapeHtml(article.excerpt)}</p>
        ${button("Read story", href)}
      </td>
    </tr>
  `;
}

function eventRow(event: EventItem) {
  return `
    <tr>
      <td class="split-image">
        <img src="${escapeHtml(imageUrl(event.featuredImage, 720, 520))}" alt="${escapeHtml(event.title)}" />
      </td>
      <td class="split-copy">
        <div class="eyebrow">${escapeHtml(event.category)} · ${escapeHtml(textDate(event.startDate))}</div>
        <h3>${escapeHtml(event.title)}</h3>
        <p>${escapeHtml(event.locationName)} · ${escapeHtml(event.price)}</p>
        ${button("View event", `/events/${event.slug}`)}
      </td>
    </tr>
  `;
}

function listingRow(listing: Listing) {
  return `
    <tr>
      <td class="split-image">
        <img src="${escapeHtml(imageUrl(listing.featuredImage, 720, 520))}" alt="${escapeHtml(listing.name)}" />
      </td>
      <td class="split-copy">
        <div class="eyebrow">${escapeHtml(listing.category)} · ${escapeHtml(listing.area)}</div>
        <h3>${escapeHtml(listing.name)}</h3>
        <p>${escapeHtml(listing.description)}</p>
        ${button("View place", `/places/${listing.slug}`)}
      </td>
    </tr>
  `;
}

function offerRow(offer: Offer) {
  return `
    <tr>
      <td class="offer-card">
        <div class="eyebrow">Offer · ${escapeHtml(offer.businessName)}</div>
        <h3>${escapeHtml(offer.title)}</h3>
        <p>${escapeHtml(offer.description)}</p>
        ${button("Get offer", "/offers")}
      </td>
    </tr>
  `;
}

function section(title: string, body: string) {
  if (!body.trim()) return "";
  return `
    <tr><td class="section-title">${escapeHtml(title)}</td></tr>
    ${body}
  `;
}

export function renderNewsletterTemplate({
  subject,
  intro,
  issue,
  unsubscribeUrl = "{{unsubscribeUrl}}",
}: NewsletterTemplateInput) {
  const lead = issue.articles[0];
  const remainingArticles = issue.articles.slice(1);
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(subject)}</title>
    <style>
      body { margin: 0; background: #f5f0e7; color: #080d2d; font-family: Arial, Helvetica, sans-serif; }
      table { border-collapse: collapse; }
      img { display: block; width: 100%; max-width: 100%; border: 0; }
      a { color: #080d2d; }
      .wrap { width: 100%; background: #f5f0e7; padding: 28px 0; }
      .shell { width: 640px; max-width: 94%; margin: 0 auto; border: 3px solid #080d2d; background: #fffaf1; }
      .masthead { padding: 28px 30px 18px; border-bottom: 3px solid #080d2d; }
      .logo { font-family: Impact, "Arial Black", sans-serif; font-size: 38px; line-height: 1; letter-spacing: 0; }
      .kicker { color: #dcae3a; font-family: "Courier New", monospace; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; }
      .hero { padding: 34px 30px 26px; border-bottom: 3px solid #080d2d; }
      .hero h1 { margin: 8px 0 18px; font-family: Impact, "Arial Black", sans-serif; font-size: 58px; line-height: .9; text-transform: uppercase; letter-spacing: 0; }
      .hero p, p { color: #343a56; font-size: 17px; line-height: 1.55; margin: 0 0 18px; }
      .section-title { padding: 28px 30px 12px; color: #dcae3a; font-family: "Courier New", monospace; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; }
      .feature-card, .item-card, .offer-card { padding: 0 30px 28px; }
      .feature-card img, .item-card img { border: 3px solid #080d2d; margin-bottom: 18px; }
      .eyebrow { color: #dcae3a; font-family: "Courier New", monospace; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
      h2, h3 { margin: 0 0 10px; font-family: Impact, "Arial Black", sans-serif; line-height: .95; text-transform: uppercase; letter-spacing: 0; }
      h2 { font-size: 38px; }
      h3 { font-size: 28px; }
      .button { display: inline-block; background: #080d2d; color: #fffaf1 !important; border: 3px solid #080d2d; padding: 13px 18px; font-size: 12px; font-weight: 800; text-transform: uppercase; text-decoration: none; letter-spacing: 2px; }
      .split-image { width: 44%; padding: 0 0 24px 30px; vertical-align: top; }
      .split-image img { border: 3px solid #080d2d; }
      .split-copy { width: 56%; padding: 0 30px 24px 18px; vertical-align: top; }
      .offer-card { border-top: 1px solid #d8d1c5; }
      .footer { padding: 24px 30px 30px; border-top: 3px solid #080d2d; color: #555b71; font-size: 12px; line-height: 1.5; }
      @media (max-width: 560px) {
        .hero h1 { font-size: 44px; }
        .split-image, .split-copy { display: block; width: auto; padding: 0 24px 18px; }
        .masthead, .hero, .feature-card, .item-card, .offer-card, .section-title, .footer { padding-left: 24px; padding-right: 24px; }
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <table class="shell" role="presentation" width="640" align="center">
        <tr>
          <td class="masthead">
            <div class="logo">HU NOW</div>
            <div class="kicker">Hull's weekly edit</div>
          </td>
        </tr>
        <tr>
          <td class="hero">
            <div class="kicker">Newsletter</div>
            <h1>${escapeHtml(subject)}</h1>
            <p>${escapeHtml(intro)}</p>
            ${button("Explore HU NOW", "/")}
          </td>
        </tr>
        ${lead ? section("Lead story", articleCard(lead, true)) : ""}
        ${section("More stories", remainingArticles.map((article) => articleCard(article)).join(""))}
        ${section("What's on", issue.events.map(eventRow).join(""))}
        ${section("Offers", issue.offers.map(offerRow).join(""))}
        ${section("Places to know", issue.listings.map(listingRow).join(""))}
        <tr>
          <td class="footer">
            You are receiving this because you subscribed to HU NOW. 
            <a href="${escapeHtml(unsubscribeUrl)}">Unsubscribe</a>.
          </td>
        </tr>
      </table>
    </div>
  </body>
</html>`;

  const text = [
    subject,
    "",
    intro,
    "",
    ...issue.articles.map(
      (item) => `${item.title}\n${item.excerpt}\n${absoluteUrl(articlePath(item))}`,
    ),
    issue.events.length ? "\nWhat's On" : "",
    ...issue.events.map(
      (item) =>
        `${item.title} at ${item.locationName} (${textDate(item.startDate)})\n${absoluteUrl(`/events/${item.slug}`)}`,
    ),
    issue.offers.length ? "\nOffers" : "",
    ...issue.offers.map((item) => `${item.title} from ${item.businessName}\n${item.description}`),
    issue.listings.length ? "\nPlaces" : "",
    ...issue.listings.map(
      (item) =>
        `${item.name} (${item.category}, ${item.area})\n${absoluteUrl(`/places/${item.slug}`)}`,
    ),
    "",
    `Unsubscribe: ${unsubscribeUrl}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  return { html, text };
}
