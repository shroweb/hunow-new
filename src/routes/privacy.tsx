import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — HU NOW" },
      { name: "description", content: "How HU NOW collects, uses, and protects your personal data." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <PublicLayout>
      <div className="max-w-2xl mx-auto px-6 py-16 md:py-24">
        <h1 className="font-display text-5xl md:text-6xl uppercase mb-2">Privacy Policy</h1>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-12">
          Last updated: June 2025
        </p>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground/80 leading-relaxed">

          <section>
            <h2 className="font-display text-2xl uppercase text-foreground mb-3">Who we are</h2>
            <p>
              HU NOW is an independent Hull city guide operated as a sole trader based in Hull, UK.
              We can be contacted at{" "}
              <a href="mailto:hello@hunow.co.uk" className="underline">
                hello@hunow.co.uk
              </a>
              . For the purposes of UK GDPR, we are the data controller for the personal data described
              in this policy.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl uppercase text-foreground mb-3">What data we collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Account data</strong> — name, email address, and password hash when you create
                an account.
              </li>
              <li>
                <strong>Profile data</strong> — optional avatar image and short biography if you choose
                to add them.
              </li>
              <li>
                <strong>Loyalty card data</strong> — a unique card token, points balance, and redemption
                history tied to your account.
              </li>
              <li>
                <strong>Usage data</strong> — pages viewed, search terms entered, and saved items. This
                is stored in our own database and is not shared with third-party analytics services unless
                you have consented.
              </li>
              <li>
                <strong>Push notification tokens</strong> — if you opt in to push notifications, your
                browser's push subscription endpoint is stored so we can send you updates. You can
                withdraw consent at any time via your browser settings or your account page.
              </li>
              <li>
                <strong>Business enquiries</strong> — if you submit a claim or contact form, we retain
                your message and contact details to respond to your enquiry.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl uppercase text-foreground mb-3">How we use your data</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To provide and maintain your account and loyalty card.</li>
              <li>To send transactional emails such as password resets (via Resend).</li>
              <li>To send push notifications you have opted in to.</li>
              <li>To send the HU NOW newsletter if you have subscribed — you can unsubscribe at any time.</li>
              <li>To moderate user-generated content such as reviews and comments.</li>
              <li>To improve the site based on aggregated, anonymised usage patterns.</li>
            </ul>
            <p className="mt-4">
              Our legal basis is <strong>contract</strong> (account and loyalty card), <strong>legitimate
              interests</strong> (usage analytics, moderation), and <strong>consent</strong> (newsletter,
              push notifications).
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl uppercase text-foreground mb-3">Who we share data with</h2>
            <p>We do not sell your personal data. We share data only with:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>
                <strong>Vercel</strong> — our hosting provider. Data is processed in EU/UK-adjacent
                regions. See{" "}
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Vercel's privacy policy
                </a>
                .
              </li>
              <li>
                <strong>Resend</strong> — used to send transactional and newsletter emails. See{" "}
                <a
                  href="https://resend.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Resend's privacy policy
                </a>
                .
              </li>
              <li>
                <strong>Neon / PostgreSQL</strong> — our database provider for storing your account
                data.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl uppercase text-foreground mb-3">How long we keep data</h2>
            <p>
              Account data is retained for as long as your account is active. If you delete your account,
              your personal data is removed within 30 days. Anonymised usage statistics may be retained
              indefinitely.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl uppercase text-foreground mb-3">Your rights</h2>
            <p>Under UK GDPR you have the right to:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Access the personal data we hold about you.</li>
              <li>Correct inaccurate data.</li>
              <li>Request erasure of your data ("right to be forgotten").</li>
              <li>Object to or restrict processing.</li>
              <li>Data portability — receive your data in a machine-readable format.</li>
              <li>Withdraw consent at any time where processing is based on consent.</li>
            </ul>
            <p className="mt-4">
              To exercise any of these rights, email{" "}
              <a href="mailto:hello@hunow.co.uk" className="underline">
                hello@hunow.co.uk
              </a>
              . We will respond within 30 days. You also have the right to lodge a complaint with the{" "}
              <a
                href="https://ico.org.uk/make-a-complaint/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Information Commissioner's Office (ICO)
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl uppercase text-foreground mb-3">Cookies</h2>
            <p>
              HU NOW uses a single session cookie to keep you signed in. We do not use third-party
              advertising or tracking cookies. If you use the site without an account, no persistent
              cookies are set.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl uppercase text-foreground mb-3">Changes to this policy</h2>
            <p>
              We may update this policy from time to time. Material changes will be communicated by
              updating the "Last updated" date above. Continued use of the site after a change
              constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl uppercase text-foreground mb-3">Contact</h2>
            <p>
              Questions about this policy?{" "}
              <a href="mailto:hello@hunow.co.uk" className="underline">
                hello@hunow.co.uk
              </a>
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
