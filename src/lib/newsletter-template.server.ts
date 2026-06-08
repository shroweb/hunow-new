import { img } from "@/data/seed";
import { articlePath } from "@/lib/taxonomy";
import type { Article, EventItem, Listing, Offer } from "@/types";

export interface NewsletterIssue {
  articles: Article[];
  events: EventItem[];
  listings: Listing[];
  offers: Offer[];
}

export type NewsletterTemplateKind = "weekly" | "events" | "offers" | "business";

export interface NewsletterTemplateInput {
  subject: string;
  intro?: string;
  issue: NewsletterIssue;
  unsubscribeUrl?: string;
  template?: NewsletterTemplateKind;
}

const SITE_URL = (process.env.SITE_URL || "https://hunow.co.uk").replace(/\/$/, "");

function absoluteUrl(path: string) {
  if (!path) return SITE_URL;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function imageUrl(image: string, width = 1200, height = 760) {
  const source = img(image, width, height);
  const resolved = absoluteUrl(source);
  // Proxy external images so all URLs in the email come from the sending domain
  if (resolved.startsWith("http") && !resolved.startsWith(SITE_URL)) {
    return `${SITE_URL}/api/image-proxy?url=${encodeURIComponent(resolved)}`;
  }
  return resolved;
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

function button(label: string, href: string, style = "") {
  const base =
    "display:inline-block;background:#080d2d;color:#fffaf1;border:3px solid #080d2d;padding:12px 20px;font-size:11px;font-weight:800;text-transform:uppercase;text-decoration:none;letter-spacing:2px;font-family:Arial,Helvetica,sans-serif;";
  return `<a href="${escapeHtml(absoluteUrl(href))}" style="${base}${style}">${escapeHtml(label)}</a>`;
}

function goldButton(label: string, href: string) {
  return button(label, href, "background:#dcae3a;color:#080d2d;border-color:#dcae3a;");
}

function articleCard(article: Article) {
  const href = articlePath(article);
  return `
    <tr>
      <td style="padding:0 36px 32px;">
        <a href="${escapeHtml(absoluteUrl(href))}">
          <img src="${escapeHtml(imageUrl(article.featuredImage, 1200, 720))}" alt="${escapeHtml(article.title)}" style="display:block;width:100%;max-width:100%;border:3px solid #080d2d;margin-bottom:20px;" />
        </a>
        <div style="color:#dcae3a;font-family:'Courier New',monospace;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">${escapeHtml(article.category)}</div>
        <h2 style="margin:0 0 12px;font-family:Impact,'Arial Black',sans-serif;font-size:36px;line-height:.93;text-transform:uppercase;color:#080d2d;">${escapeHtml(article.title)}</h2>
        <p style="color:#343a56;font-size:16px;line-height:1.6;margin:0 0 20px;">${escapeHtml(article.excerpt)}</p>
        ${button("Read story", href)}
      </td>
    </tr>
  `;
}

function articleGridCell(article: Article, side: "left" | "right") {
  const href = articlePath(article);
  const pad = side === "left" ? "padding-right:10px;" : "padding-left:10px;";
  return `
    <td class="grid-col" style="width:50%;${pad}vertical-align:top;">
      <a href="${escapeHtml(absoluteUrl(href))}">
        <img src="${escapeHtml(imageUrl(article.featuredImage, 560, 380))}" alt="${escapeHtml(article.title)}" style="display:block;width:100%;max-width:100%;border:3px solid #080d2d;margin-bottom:12px;" />
      </a>
      <div style="color:#dcae3a;font-family:'Courier New',monospace;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px;">${escapeHtml(article.category)}</div>
      <h3 style="margin:0 0 8px;font-family:Impact,'Arial Black',sans-serif;font-size:22px;line-height:.93;text-transform:uppercase;color:#080d2d;">${escapeHtml(article.title)}</h3>
      <p style="color:#343a56;font-size:14px;line-height:1.5;margin:0 0 14px;">${escapeHtml(article.excerpt)}</p>
      ${button("Read story", href)}
    </td>
  `;
}

function articleGrid(articles: Article[]) {
  const rows: string[] = [];
  for (let i = 0; i < articles.length; i += 2) {
    const bt = i === 0 ? "" : "border-top:1px solid #d8d1c5;";
    const a = articles[i];
    const b = articles[i + 1];
    rows.push(`
      <tr>
        <td style="padding:22px 36px;${bt}">
          <table width="100%" role="presentation" style="border-collapse:collapse;">
            <tr>
              ${articleGridCell(a, "left")}
              ${b ? articleGridCell(b, "right") : `<td class="grid-col" style="width:50%;"></td>`}
            </tr>
          </table>
        </td>
      </tr>
    `);
  }
  return rows;
}

function offerGridCell(offer: Offer, side: "left" | "right", gold = false) {
  const pad = side === "left" ? "padding-right:7px;" : "padding-left:7px;";
  const bg = gold ? "#dcae3a" : "#080d2d";
  const titleColor = gold ? "#080d2d" : "#fffaf1";
  const metaColor = gold ? "#2a2410" : "#b8bdd0";
  const paraColor = gold ? "#2a2410" : "#b8bdd0";
  const cta = gold
    ? button("Get offer", "/offers", "background:#080d2d;color:#fffaf1;border-color:#080d2d;")
    : goldButton("Get offer", "/offers");
  return `
    <td class="grid-col" style="width:50%;${pad}vertical-align:top;">
      <table width="100%" role="presentation" style="border-collapse:collapse;background:${bg};">
        <tr>
          <td style="padding:18px 20px 22px;">
            <div style="color:${metaColor};font-family:'Courier New',monospace;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">Offer · ${escapeHtml(offer.businessName)}</div>
            <h3 style="margin:0 0 10px;font-family:Impact,'Arial Black',sans-serif;font-size:20px;line-height:.93;text-transform:uppercase;color:${titleColor};">${escapeHtml(offer.title)}</h3>
            <p style="color:${paraColor};font-size:13px;line-height:1.5;margin:0 0 16px;">${escapeHtml(offer.description)}</p>
            ${cta}
          </td>
        </tr>
      </table>
    </td>
  `;
}

function offerGrid(offers: Offer[], gold = false) {
  const rows: string[] = [];
  for (let i = 0; i < offers.length; i += 2) {
    const pt = i === 0 ? "4px" : "0";
    const a = offers[i];
    const b = offers[i + 1];
    rows.push(`
      <tr>
        <td style="padding:${pt} 36px 14px;">
          <table width="100%" role="presentation" style="border-collapse:collapse;">
            <tr>
              ${offerGridCell(a, "left", gold)}
              ${b ? offerGridCell(b, "right", gold) : `<td class="grid-col" style="width:50%;padding-left:7px;"></td>`}
            </tr>
          </table>
        </td>
      </tr>
    `);
  }
  return rows;
}

function eventRow(event: EventItem, first = false) {
  const borderTop = first ? "" : "border-top:1px solid #d8d1c5;";
  return `
    <tr>
      <td style="padding:0 36px;${borderTop}">
        <table width="100%" role="presentation" style="border-collapse:collapse;">
          <tr>
            <td style="width:38%;padding:20px 16px 20px 0;vertical-align:top;">
              <img src="${escapeHtml(imageUrl(event.featuredImage, 560, 420))}" alt="${escapeHtml(event.title)}" style="display:block;width:100%;max-width:100%;border:3px solid #080d2d;" />
            </td>
            <td style="padding:20px 0 20px 0;vertical-align:top;">
              <div style="color:#dcae3a;font-family:'Courier New',monospace;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">${escapeHtml(event.category)} · ${escapeHtml(textDate(event.startDate))}</div>
              <h3 style="margin:0 0 8px;font-family:Impact,'Arial Black',sans-serif;font-size:22px;line-height:.93;text-transform:uppercase;color:#080d2d;">${escapeHtml(event.title)}</h3>
              <p style="color:#343a56;font-size:14px;line-height:1.5;margin:0 0 14px;">${escapeHtml(event.locationName)} · ${escapeHtml(event.price)}</p>
              ${button("View event", `/events/${event.slug}`)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

function listingRow(listing: Listing, first = false) {
  const borderTop = first ? "" : "border-top:1px solid #d8d1c5;";
  return `
    <tr>
      <td style="padding:0 36px;${borderTop}">
        <table width="100%" role="presentation" style="border-collapse:collapse;">
          <tr>
            <td style="width:38%;padding:20px 16px 20px 0;vertical-align:top;">
              <img src="${escapeHtml(imageUrl(listing.featuredImage, 560, 420))}" alt="${escapeHtml(listing.name)}" style="display:block;width:100%;max-width:100%;border:3px solid #080d2d;" />
            </td>
            <td style="padding:20px 0 20px 0;vertical-align:top;">
              <div style="color:#dcae3a;font-family:'Courier New',monospace;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">${escapeHtml(listing.category)} · ${escapeHtml(listing.area)}</div>
              <h3 style="margin:0 0 8px;font-family:Impact,'Arial Black',sans-serif;font-size:22px;line-height:.93;text-transform:uppercase;color:#080d2d;">${escapeHtml(listing.name)}</h3>
              <p style="color:#343a56;font-size:14px;line-height:1.5;margin:0 0 14px;">${escapeHtml(listing.description)}</p>
              ${button("View place", `/places/${listing.slug}`)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

function sectionHeader(title: string) {
  return `<tr><td style="padding:22px 36px 14px;border-top:3px solid #080d2d;"><span style="font-family:Impact,'Arial Black',sans-serif;font-size:22px;text-transform:uppercase;letter-spacing:1px;color:#080d2d;">${escapeHtml(title)}</span></td></tr>`;
}

function section(title: string, rows: string[]) {
  if (!rows.length || !rows.join("").trim()) return "";
  return sectionHeader(title) + rows.join("");
}

function eventDateRange(events: EventItem[]): string {
  if (!events.length) return "";
  const dates = events
    .map((e) => new Date(e.startDate))
    .filter((d) => !Number.isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());
  if (!dates.length) return "";
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }).format(
      d,
    );
  return dates.length === 1 || fmt(dates[0]) === fmt(dates[dates.length - 1])
    ? fmt(dates[0])
    : `${fmt(dates[0])} – ${fmt(dates[dates.length - 1])}`;
}

const templateConfigs: Record<
  NewsletterTemplateKind,
  {
    kicker: (issue: NewsletterIssue) => string;
    defaultIntro: (issue: NewsletterIssue) => string;
    heroBg: string;
    heroColor: string;
    heroParaColor: string;
    cta: string;
    ctaHref: string;
    ctaStyle: string;
    sections: (issue: NewsletterIssue, lead?: Article, rest?: Article[]) => string;
  }
> = {
  weekly: {
    kicker: () => "This week in Hull",
    defaultIntro: (issue) =>
      `${issue.articles.length} stories, ${issue.events.length} events and the best of Hull this week.`,
    heroBg: "#fffaf1",
    heroColor: "#080d2d",
    heroParaColor: "#343a56",
    cta: "Explore HU NOW",
    ctaHref: "/",
    ctaStyle: "",
    sections: (issue, lead, rest = []) =>
      [
        lead ? `${sectionHeader("Lead story")}${articleCard(lead)}` : "",
        rest.length ? `${sectionHeader("More stories")}${articleGrid(rest).join("")}` : "",
        section(
          "What's on",
          issue.events.map((e, i) => eventRow(e, i === 0)),
        ),
        issue.offers.length ? `${sectionHeader("Offers")}${offerGrid(issue.offers).join("")}` : "",
        section(
          "Places to know",
          issue.listings.map((l, i) => listingRow(l, i === 0)),
        ),
      ].join(""),
  },
  events: {
    kicker: (issue) => {
      const range = eventDateRange(issue.events);
      return range ? `What's on · ${range}` : "What's on in Hull";
    },
    defaultIntro: (issue) =>
      `${issue.events.length} things to do in Hull${issue.events.length ? " — handpicked for you" : ""}.`,
    heroBg: "#080d2d",
    heroColor: "#fffaf1",
    heroParaColor: "#c8ccd8",
    cta: "See all events",
    ctaHref: "/events",
    ctaStyle: "background:#dcae3a;color:#080d2d;border-color:#dcae3a;",
    sections: (issue, lead, rest = []) => {
      const articles = [lead, ...rest].filter(Boolean) as Article[];
      return [
        section(
          "This week",
          issue.events.map((e, i) => eventRow(e, i === 0)),
        ),
        articles.length ? `${sectionHeader("Event reads")}${articleGrid(articles).join("")}` : "",
        section(
          "Places nearby",
          issue.listings.map((l, i) => listingRow(l, i === 0)),
        ),
        issue.offers.length
          ? `${sectionHeader("Good deals")}${offerGrid(issue.offers).join("")}`
          : "",
      ].join("");
    },
  },
  offers: {
    kicker: (issue) =>
      issue.offers.length
        ? `${issue.offers.length} deal${issue.offers.length !== 1 ? "s" : ""} worth leaving the house for`
        : "Deals worth leaving the house for",
    defaultIntro: (issue) =>
      `Exclusive offers from Hull's independents${issue.offers.length ? ` — ${issue.offers.length} active right now` : ""}.`,
    heroBg: "#dcae3a",
    heroColor: "#080d2d",
    heroParaColor: "#2a2410",
    cta: "Browse offers",
    ctaHref: "/offers",
    ctaStyle: "background:#080d2d;color:#fffaf1;border-color:#080d2d;",
    sections: (issue, lead, rest = []) => {
      const articles = [lead, ...rest].filter(Boolean) as Article[];
      return [
        issue.offers.length
          ? `${sectionHeader("Active offers")}${offerGrid(issue.offers, true).join("")}`
          : "",
        section(
          "Places with perks",
          issue.listings.map((l, i) => listingRow(l, i === 0)),
        ),
        articles.length
          ? `${sectionHeader("Food & drink reads")}${articleGrid(articles).join("")}`
          : "",
        section(
          "Also happening",
          issue.events.map((e, i) => eventRow(e, i === 0)),
        ),
      ].join("");
    },
  },
  business: {
    kicker: () => "For Hull independents",
    defaultIntro: (issue) =>
      `${issue.listings.length} places, ${issue.offers.length} offers and ${issue.events.length} events for Hull business owners this week.`,
    heroBg: "#f4f7f2",
    heroColor: "#080d2d",
    heroParaColor: "#343a56",
    cta: "View business tools",
    ctaHref: "/business/listings",
    ctaStyle: "background:#4a8f51;border-color:#4a8f51;",
    sections: (issue) =>
      [
        section(
          "Featured places",
          issue.listings.map((l, i) => listingRow(l, i === 0)),
        ),
        issue.offers.length
          ? `${sectionHeader("Current offers")}${offerGrid(issue.offers).join("")}`
          : "",
        section(
          "Networking & events",
          issue.events.map((e, i) => eventRow(e, i === 0)),
        ),
      ].join(""),
  },
};

export function renderNewsletterTemplate({
  subject,
  intro,
  issue,
  unsubscribeUrl = "{{unsubscribeUrl}}",
  template = "weekly",
}: NewsletterTemplateInput) {
  const config = templateConfigs[template];
  const lead = issue.articles[0];
  const rest = issue.articles.slice(1);
  const kicker = config.kicker(issue);
  const resolvedIntro = intro || config.defaultIntro(issue);

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(subject)}</title>
    <style>
      body { margin: 0; padding: 0; background: #f5f0e7; color: #080d2d; font-family: Arial, Helvetica, sans-serif; -webkit-text-size-adjust: 100%; }
      table { border-collapse: collapse; }
      img { display: block; width: 100%; max-width: 100%; border: 0; height: auto; }
      a { color: inherit; }
      @media (max-width: 560px) {
        .shell { width: 100% !important; }
        .hero-h1 { font-size: 44px !important; line-height: .9 !important; }
        .split-td { display: block !important; width: 100% !important; box-sizing: border-box; }
        .split-img-td { padding: 20px 24px 0 !important; }
        .split-copy-td { padding: 14px 24px 22px !important; }
        .pad { padding-left: 24px !important; padding-right: 24px !important; }
        .grid-col { display: block !important; width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; box-sizing: border-box; }
        .grid-col + .grid-col { padding-top: 20px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#f5f0e7;">
    <div style="width:100%;background:#f5f0e7;padding:36px 0;">
      <table class="shell" role="presentation" width="640" align="center" style="width:640px;max-width:94%;margin:0 auto;border:3px solid #080d2d;background:#fffaf1;border-collapse:collapse;">

        <!-- Masthead -->
        <tr>
          <td class="pad" style="padding:22px 36px;border-bottom:3px solid #080d2d;">
            <div style="font-family:Impact,'Arial Black',sans-serif;font-size:42px;line-height:1;letter-spacing:0;color:#080d2d;">HU NOW</div>
          </td>
        </tr>

        <!-- Hero -->
        <tr>
          <td class="pad" style="padding:36px 36px 32px;border-bottom:3px solid #080d2d;background:${escapeHtml(config.heroBg)};">
            <div style="color:#dcae3a;font-family:'Courier New',monospace;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2.5px;margin-bottom:14px;">${escapeHtml(kicker)}</div>
            <h1 class="hero-h1" style="margin:0 0 22px;font-family:Impact,'Arial Black',sans-serif;font-size:62px;line-height:.88;text-transform:uppercase;letter-spacing:0;color:${escapeHtml(config.heroColor)};">${escapeHtml(subject)}</h1>
            <p style="color:${escapeHtml(config.heroParaColor)};font-size:17px;line-height:1.6;margin:0 0 26px;">${escapeHtml(resolvedIntro)}</p>
            ${button(config.cta, config.ctaHref, config.ctaStyle)}
          </td>
        </tr>

        <!-- Content -->
        ${config.sections(issue, lead, rest)}

        <!-- Footer -->
        <tr>
          <td class="pad" style="padding:24px 36px 32px;border-top:3px solid #080d2d;color:#6b7280;font-size:13px;line-height:1.6;">
            You are receiving this because you subscribed to HU NOW.
            <a href="${escapeHtml(unsubscribeUrl)}" style="color:#6b7280;">Unsubscribe</a>.
          </td>
        </tr>

      </table>
    </div>
  </body>
</html>`;

  const text = [
    subject,
    config.kicker,
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
