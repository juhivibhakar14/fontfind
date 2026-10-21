import FaqAccordion from "./faq-accordion";

export const FAQ: [string, string][] = [
  [
    "How does TypeMatcher find matching fonts?",
    "It analyzes the letter shapes, stroke weight, and proportions in your image, then compares them with hundreds of open-source Google Fonts right in your browser to find the closest style matches."
  ],
  [
    "Does it identify the exact font?",
    "TypeMatcher provides typographic style matching rather than an exact identification guarantee. It finds fonts that share the same category, weight class, and letterform proportions. Clear, large, horizontal text on a plain background works best."
  ],
  [
    "What kind of screenshots work best for font matching?",
    "For the most accurate matches, upload a high-contrast screenshot cropped closely around 1 to 4 clear words (such as a headline, title, or logo). Avoid full-page screenshots with navigation bars, icons, profile photos, or busy background photos, as these confuse the typographic analyzer."
  ],
  [
    "Is my image uploaded anywhere?",
    "No. Matching happens entirely on your device. Only the open-source text-recognition files and Google Fonts previews are downloaded to your browser."
  ],
  [
    "Can I use the fonts for free?",
    "Every font shown is from Google Fonts, which are open source and free for personal and commercial use. Always check each font's license."
  ],
  [
    "What image formats and sizes are supported?",
    "TypeMatcher supports JPG, JPEG, PNG, and WEBP formats up to 10 MB. You can also paste directly from your clipboard with Ctrl/Cmd+V."
  ],
  [
    "Can I copy CSS or preview the font before downloading?",
    "Yes! Each matched font includes live in-browser preview options, one-click font family copying, and ready-to-use CSS font-face code."
  ]
];

export default function Faq() {
  return (
    <section className="mx-auto mt-24 max-w-3xl px-4" aria-labelledby="how">
      <h2 id="how" className="font-display text-3xl font-semibold">
        How it works
      </h2>
      <ol className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          "Upload or paste an image of the text",
          "TypeMatcher analyzes letterform style and proportions",
          "Preview closest matches, then copy the CSS"
        ].map((s, i) => (
          <li
            key={i}
            className="rounded-xl border border-line bg-card p-4 text-sm"
          >
            <b className="text-accent">{i + 1}.</b> {s}
          </li>
        ))}
      </ol>

      <div className="mt-14">
        <h2 className="font-display text-3xl font-semibold">
          Frequently asked questions
        </h2>
        <p className="mt-2 text-sm text-mute">
          Everything you need to know about font style matching, privacy, and licensing.
        </p>

        <FaqAccordion items={FAQ} />
      </div>
    </section>
  );
}

