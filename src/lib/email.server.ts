import process from "node:process";

const SITE_NAME = "HU NOW";
const SITE_URL = (process.env.SITE_URL ?? "https://hunow.co.uk").replace(/\/$/, "");

async function send(to: string, subject: string, html: string, text: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // In development, log to console so emails are visible without Resend
    if (process.env.NODE_ENV !== "production") {
      console.info(`[Email → ${to}] ${subject}\n${text}`);
      return;
    }
    throw new Error("RESEND_API_KEY is not configured. Add it to send transactional emails.");
  }

  const from = process.env.EMAIL_FROM ?? `${SITE_NAME} <hello@hunow.co.uk>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, html, text }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend transactional failed: ${res.status} ${body}`);
  }
}

function layout(title: string, body: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
<style>body{font-family:sans-serif;background:#f5f0eb;margin:0;padding:20px}
.wrap{max-width:560px;margin:0 auto;background:#fff;border:2px solid #070c27;padding:32px}
h1{font-size:24px;text-transform:uppercase;letter-spacing:2px;margin:0 0 24px}
p{font-size:15px;line-height:1.6;color:#444;margin:0 0 16px}
a.btn{display:inline-block;background:#070c27;color:#fff;padding:12px 24px;font-weight:700;text-transform:uppercase;letter-spacing:1px;font-size:12px;text-decoration:none}
.footer{margin-top:32px;padding-top:16px;border-top:1px solid #e0d9d0;font-size:11px;color:#999}
</style></head><body><div class="wrap">
<div style="font-family:monospace;font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#c9943a;margin-bottom:8px">${SITE_NAME}</div>
${body}
<div class="footer">You received this email from ${SITE_NAME} · <a href="${SITE_URL}" style="color:#999">${SITE_URL}</a></div>
</div></body></html>`;
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const html = layout(
    "Reset your password",
    `<h1>Reset your password</h1>
<p>Click the button below to set a new password. This link expires in 1 hour.</p>
<p><a class="btn" href="${resetUrl}">Reset password →</a></p>
<p style="font-size:13px;color:#999">If you didn't request a reset, ignore this email — your password won't change.</p>`,
  );
  const text = `Reset your password\n\nClick the link below to set a new password (expires in 1 hour):\n${resetUrl}\n\nIf you didn't request this, ignore the email.`;
  await send(to, `[${SITE_NAME}] Reset your password`, html, text);
}

export async function sendWelcomeEmail(to: string, name: string) {
  const html = layout(
    `Welcome to ${SITE_NAME}`,
    `<h1>Welcome to ${SITE_NAME}</h1>
<p>Hi ${name} — you're in.</p>
<p>Save your favourite places and events, leave reviews, and get the most out of Hull's independent city guide.</p>
<p><a class="btn" href="${SITE_URL}">Explore ${SITE_NAME} →</a></p>`,
  );
  const text = `Welcome to ${SITE_NAME}, ${name}!\n\nYou're now registered. Visit us at ${SITE_URL}`;
  // Fire-and-forget — don't block signup if this fails
  await send(to, `Welcome to ${SITE_NAME}`, html, text).catch((err) =>
    console.warn("[email] Welcome email failed:", err),
  );
}

export async function sendAdminAlert(subject: string, body: string) {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  if (adminEmails.length === 0) return;

  const html = layout(
    subject,
    `<h1>${subject}</h1><p style="white-space:pre-wrap">${body}</p>
<p><a class="btn" href="${SITE_URL}/admin">Open admin →</a></p>`,
  );
  const text = `${subject}\n\n${body}\n\nAdmin: ${SITE_URL}/admin`;

  // Send to each admin; ignore individual failures
  await Promise.allSettled(
    adminEmails.map((email) => send(email, `[${SITE_NAME}] ${subject}`, html, text)),
  );
}
