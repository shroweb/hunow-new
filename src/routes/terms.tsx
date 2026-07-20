import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — HU NOW" },
      { name: "description", content: "Terms and conditions for using HU NOW." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <PublicLayout>
      <div className="max-w-2xl mx-auto px-6 py-16 md:py-24">
        <h1 className="font-display text-5xl md:text-6xl uppercase mb-2">Terms &amp; Conditions</h1>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-12">
          Last updated: June 2025
        </p>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground/80 leading-relaxed">
          <section>
            <h2 className="font-display text-2xl uppercase text-foreground mb-3">
              1. About HU NOW
            </h2>
            <p>
              HU NOW (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is an independent Hull
              city guide operated as a sole trader based in Hull, UK. These terms govern your use of
              the HU NOW website and mobile application (collectively, &ldquo;the Service&rdquo;).
              By using the Service you agree to these terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl uppercase text-foreground mb-3">
              2. User accounts
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You must be 13 years of age or older to create an account.</li>
              <li>You are responsible for keeping your password secure.</li>
              <li>
                You must not share your account or use another person's account without their
                permission.
              </li>
              <li>
                You must provide accurate information when registering. We may suspend accounts
                found to contain false information.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl uppercase text-foreground mb-3">
              3. Loyalty programme
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>The HU NOW loyalty card is issued free of charge and has no monetary value.</li>
              <li>
                Points are awarded when you redeem an offer from a participating business. Points
                balances are indicative and may be adjusted in cases of suspected fraud or technical
                error.
              </li>
              <li>
                Tier benefits (Bronze, Silver, Gold) are for illustrative purposes during the
                current phase; specific perks may change as the programme develops.
              </li>
              <li>
                HU NOW reserves the right to modify, suspend, or terminate the loyalty programme at
                any time with reasonable notice.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl uppercase text-foreground mb-3">
              4. Business listings &amp; offers
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Listings and offers are published in good faith based on information provided by
                businesses. HU NOW does not guarantee the accuracy or availability of any listed
                offer.
              </li>
              <li>
                Offers are subject to the individual business&apos;s own terms and conditions. HU
                NOW is not a party to any transaction between a user and a business.
              </li>
              <li>
                Businesses are responsible for the accuracy of their own listing information,
                including offer validity dates and redemption conditions.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl uppercase text-foreground mb-3">
              5. User-generated content
            </h2>
            <p>
              When you submit a review, comment, or any other content (&ldquo;UGC&rdquo;) to the
              Service you grant HU NOW a non-exclusive, royalty-free, worldwide licence to publish,
              edit, and display that content on the Service.
            </p>
            <p className="mt-3">You must not submit content that:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Is defamatory, abusive, harassing, or hateful.</li>
              <li>Infringes any third-party intellectual property rights.</li>
              <li>Contains personal data about other individuals without their consent.</li>
              <li>Is spam, advertising, or off-topic promotion.</li>
            </ul>
            <p className="mt-3">
              We reserve the right to remove any UGC at our discretion without notice.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl uppercase text-foreground mb-3">
              6. Intellectual property
            </h2>
            <p>
              All editorial content, branding, and original design elements on the Service are owned
              by or licensed to HU NOW. You may not reproduce, redistribute, or create derivative
              works from our content without prior written permission.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl uppercase text-foreground mb-3">
              7. Disclaimer of warranties
            </h2>
            <p>
              The Service is provided &ldquo;as is&rdquo; without warranties of any kind, express or
              implied. We do not warrant that the Service will be uninterrupted, error-free, or free
              of viruses.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl uppercase text-foreground mb-3">
              8. Limitation of liability
            </h2>
            <p>
              To the fullest extent permitted by law, HU NOW shall not be liable for any indirect,
              incidental, or consequential loss arising from your use of the Service. Our total
              liability for any claim shall not exceed £100.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl uppercase text-foreground mb-3">
              9. Governing law
            </h2>
            <p>
              These terms are governed by the laws of England and Wales. Any disputes shall be
              subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl uppercase text-foreground mb-3">
              10. Changes to these terms
            </h2>
            <p>
              We may update these terms from time to time. Material changes will be communicated by
              updating the &ldquo;Last updated&rdquo; date above. Continued use of the Service after
              a change constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl uppercase text-foreground mb-3">11. Contact</h2>
            <p>
              Questions about these terms?{" "}
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
