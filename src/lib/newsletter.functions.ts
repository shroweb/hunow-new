import process from "node:process";

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const newsletterSegmentSchema = z.enum(["all", "events", "offers", "businesses"]);

const selectedSchema = z.object({
  articles: z.array(z.string()),
  events: z.array(z.string()),
  offers: z.array(z.string()),
  listings: z.array(z.string()),
});

const issueSchema = z.object({
  subject: z.string().min(1),
  intro: z.string().min(1),
  segment: newsletterSegmentSchema.default("all"),
  selected: selectedSchema,
  scheduledFor: z.string().optional().nullable(),
});

const testSendSchema = issueSchema.extend({
  testEmail: z.string().email(),
});

function siteUrl() {
  return (process.env.SITE_URL || "https://hunow.co.uk").replace(/\/$/, "");
}

async function renderIssue(data: z.infer<typeof issueSchema>, unsubscribeUrl?: string) {
  const { getNewsletterBuilderData } = await import("./db.server");
  const { renderNewsletterTemplate } = await import("./newsletter-template.server");
  const builder = await getNewsletterBuilderData();
  const issue = {
    articles: builder.articles.filter((item) => data.selected.articles.includes(item.id)),
    events: builder.events.filter((item) => data.selected.events.includes(item.id)),
    offers: builder.offers.filter((item) => data.selected.offers.includes(item.id)),
    listings: builder.listings.filter((item) => data.selected.listings.includes(item.id)),
  };

  return renderNewsletterTemplate({
    subject: data.subject,
    intro: data.intro,
    issue,
    unsubscribeUrl,
  });
}

async function sendResendEmail(input: { to: string; subject: string; html: string; text: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set. Add it in Vercel/env before sending.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.NEWSLETTER_FROM || "HU NOW <hello@hunow.co.uk>",
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend failed: ${response.status} ${body}`);
  }
}

export const getNewsletterBuilder = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdmin } = await import("./auth.server");
  const { getNewsletterBuilderData, getNewsletterCampaignHistory } = await import("./db.server");
  const { renderNewsletterTemplate } = await import("./newsletter-template.server");
  await requireAdmin();
  const [builder, campaigns] = await Promise.all([
    getNewsletterBuilderData(),
    getNewsletterCampaignHistory(),
  ]);
  const suggestedSelection = {
    articles: builder.articles.slice(0, 4).map((item) => item.id),
    events: builder.events.slice(0, 4).map((item) => item.id),
    offers: builder.offers.slice(0, 3).map((item) => item.id),
    listings: builder.listings.slice(0, 3).map((item) => item.id),
  };
  const preview = renderNewsletterTemplate({
    subject: "This week in Hull",
    intro: "The best events, stories and offers to know about this week.",
    issue: {
      articles: builder.articles.filter((item) => suggestedSelection.articles.includes(item.id)),
      events: builder.events.filter((item) => suggestedSelection.events.includes(item.id)),
      offers: builder.offers.filter((item) => suggestedSelection.offers.includes(item.id)),
      listings: builder.listings.filter((item) => suggestedSelection.listings.includes(item.id)),
    },
  });
  return { ...builder, campaigns, suggestedSelection, preview };
});

export const renderNewsletterIssue = createServerFn({ method: "POST" })
  .inputValidator(issueSchema)
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    await requireAdmin();
    return renderIssue(data);
  });

export const saveNewsletterDraft = createServerFn({ method: "POST" })
  .inputValidator(issueSchema)
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    const { saveNewsletterCampaign } = await import("./db.server");
    await requireAdmin();
    const rendered = await renderIssue(data);
    const isScheduled = Boolean(data.scheduledFor);
    const id = await saveNewsletterCampaign({
      subject: data.subject,
      intro: data.intro,
      segment: data.segment,
      selected: data.selected,
      html: rendered.html,
      text: rendered.text,
      status: isScheduled ? "scheduled" : "draft",
      scheduledFor: data.scheduledFor,
    });
    return { ok: true, id, status: isScheduled ? "scheduled" : "draft" };
  });

export const sendNewsletterTest = createServerFn({ method: "POST" })
  .inputValidator(testSendSchema)
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    const { recordAnalyticsEvent } = await import("./db.server");
    await requireAdmin();
    const rendered = await renderIssue(data, `${siteUrl()}/newsletter`);
    await sendResendEmail({
      to: data.testEmail,
      subject: `[TEST] ${data.subject}`,
      html: rendered.html,
      text: rendered.text,
    });
    await recordAnalyticsEvent({
      eventType: "newsletter_test_send",
      path: "/admin/newsletter",
      label: data.testEmail,
    });
    return { ok: true };
  });

export const sendNewsletterCampaign = createServerFn({ method: "POST" })
  .inputValidator(issueSchema)
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    const { getNewsletterRecipients, recordAnalyticsEvent, saveNewsletterCampaign } =
      await import("./db.server");
    await requireAdmin();

    const recipients = await getNewsletterRecipients(data.segment);
    const rendered = await renderIssue(data);

    for (const recipient of recipients) {
      const unsubscribeUrl = `${siteUrl()}/unsubscribe?token=${recipient.unsubscribeToken}`;
      await sendResendEmail({
        to: recipient.email,
        subject: data.subject,
        html: rendered.html.replaceAll("{{unsubscribeUrl}}", unsubscribeUrl),
        text: rendered.text.replaceAll("{{unsubscribeUrl}}", unsubscribeUrl),
      });
    }

    const id = await saveNewsletterCampaign({
      subject: data.subject,
      intro: data.intro,
      segment: data.segment,
      selected: data.selected,
      html: rendered.html,
      text: rendered.text,
      status: "sent",
      recipientCount: recipients.length,
      sentAt: new Date().toISOString(),
    });
    await recordAnalyticsEvent({
      eventType: "newsletter_send",
      path: "/admin/newsletter",
      label: `${data.segment}:${recipients.length}`,
    });
    return { ok: true, id, recipients: recipients.length };
  });
