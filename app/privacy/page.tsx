import { meta } from "@/lib/seo";

export const metadata = meta(
  "Privacy Policy – TypeMatcher",
  "TypeMatcher processes all images locally inside your browser. No uploaded images are sent to or stored on external servers.",
  "/privacy",
);

export default function PrivacyPage() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

  return (
    <article className="mx-auto max-w-2xl px-4 pt-14 leading-relaxed">
      <h1 className="font-display text-4xl font-semibold">Privacy Policy</h1>

      <p className="mt-4 text-mute">
        Last updated: October 2026. TypeMatcher is built with privacy-first principles.
      </p>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold text-ink">In-Browser Image Processing</h2>
        <p>
          Images you upload or paste are processed entirely inside your browser using client-side
          Canvas APIs and in-browser Optical Character Recognition (OCR). Your images are{" "}
          <strong>never uploaded to our servers</strong> and never leave your device.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold text-ink">Public CDNs and External Requests</h2>
        <p>
          To perform style comparison and display font previews, your browser downloads open-source
          font files and OCR models from public Content Delivery Networks (CDNs), including Google
          Fonts and jsDelivr.
        </p>
        <p className="text-sm text-mute">
          These CDNs receive standard HTTP network requests (which inherently include your IP
          address and browser user-agent header), but they never receive your uploaded images or
          analyzed text.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold text-ink">Analytics</h2>
        <p>
          We may use privacy-friendly, cookieless analytics (such as Plausible) to measure aggregate
          website traffic. No cookies are stored, no persistent identifiers are created, and no
          personal information is tracked or shared.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold text-ink">Advertising</h2>
        <p>
          By default, display advertisements are disabled. If advertising is enabled on the site,
          Google AdSense and its advertising partners may use cookies or web beacons to serve ads
          based on previous visits. You can manage personalized ad preferences through Google&apos;s
          Ad Settings.
        </p>
      </section>

      {contactEmail && (
        <section className="mt-8 space-y-3">
          <h2 className="text-xl font-semibold text-ink">Contact</h2>
          <p>
            If you have questions or concerns regarding our privacy practices, please contact us at:
          </p>
          <p>
            <a
              href={`mailto:${contactEmail}`}
              className="font-medium text-ink underline underline-offset-4 hover:opacity-80"
            >
              {contactEmail}
            </a>
          </p>
        </section>
      )}
    </article>
  );
}
