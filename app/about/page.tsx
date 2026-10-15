import { meta } from "@/lib/seo";
import Link from "next/link";

export const metadata = meta(
  "About FontFind",
  "FontFind is a private, client-side font identification and typography discovery tool.",
  "/about"
);

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 pt-14 leading-relaxed">
      <h1 className="font-display text-4xl font-semibold">About FontFind</h1>
      
      <p className="mt-4 text-mute">
        FontFind is a fast, focused typography identification and font discovery
        tool designed for web designers, developers, and visual creators.
      </p>

      <section className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold text-ink">What We Do</h2>
        <p>
          Ever spotted a beautiful font in a logo, website mockup, or graphic banner
          and wondered what typeface was used? FontFind helps you identify unknown
          typefaces in seconds and find matching alternatives available in the
          open-source Google Fonts catalog.
        </p>
        <p>
          In addition to font identification, FontFind provides an interactive
          specimen tester, typographic mood pairings, and category filters so you
          can test and discover the perfect type combination for your next project.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold text-ink">Private &amp; Client-Side</h2>
        <p>
          Unlike traditional font identification tools that require uploading your
          images to remote cloud servers, FontFind operates entirely inside your
          browser. Optical Character Recognition (OCR) and letterform shape
          comparisons run directly on your device.
        </p>
        <p>
          Your images never leave your computer, ensuring absolute privacy for
          confidential mockups, unreleased brand assets, and personal projects.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold text-ink">Get Started</h2>
        <p>
          Try our tools today:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-mute">
          <li>
            <Link href="/" className="font-medium text-ink underline underline-offset-4 hover:opacity-80">
              Font Identifier
            </Link>{" "}
            — Upload an image or paste a screenshot to identify fonts.
          </li>
          <li>
            <Link href="/fonts" className="font-medium text-ink underline underline-offset-4 hover:opacity-80">
              Explore Fonts
            </Link>{" "}
            — Filter and preview Google Fonts with live specimen controls.
          </li>
        </ul>
      </section>
    </article>
  );
}
