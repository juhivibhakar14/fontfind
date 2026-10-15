import { meta } from "@/lib/seo";

export const metadata = meta(
  "Contact Us",
  "Get in touch with the FontFind team for inquiries, feedback, or support.",
  "/contact"
);

export default function ContactPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 pt-14 leading-relaxed">
      <h1 className="font-display text-4xl font-semibold">Contact Us</h1>

      <p className="mt-4 text-mute">
        Have questions, feedback, or suggestions for improving FontFind? We would
        love to hear from you.
      </p>

      <section className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold text-ink">Email Support</h2>
        <p>
          For general inquiries, bug reports, or feature requests, feel free to
          email us at:
        </p>
        <p className="text-lg">
          <a
            href="mailto:contact@fontfind.example"
            className="font-medium text-ink underline underline-offset-4 hover:opacity-80"
          >
            contact@fontfind.example
          </a>
        </p>
        <p className="text-sm text-mute">
          We usually review and reply to messages within 1–2 business days.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold text-ink">Bug Reports &amp; Feedback</h2>
        <p>
          If you encounter an issue identifying a specific font or notice a rendering
          bug, please include:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-mute">
          <li>Your browser name and version</li>
          <li>Your device / operating system</li>
          <li>A brief description of what you expected versus what occurred</li>
        </ul>
      </section>
    </article>
  );
}
