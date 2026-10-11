import FaqAccordion from "./faq-accordion";

export const FAQ: [string, string][] = [
  [
    "How does FontFind identify a font?",
    "It reads the text in your image, then compares its letter shapes with hundreds of Google Fonts right in your browser and ranks the closest matches."
  ],
  [
    "How accurate is it?",
    "It is a shape-comparison estimate, so treat results as strong candidates. Clear, large, horizontal text on a plain background works best."
  ],
  [
    "Is my image uploaded anywhere?",
    "No. Matching happens on your device. Only the open-source text-recognition files and the Google Fonts previews are downloaded."
  ],
  [
    "Can I use the fonts for free?",
    "Every font shown is from Google Fonts, which are open source and free for personal and commercial use. Always check each font's licence."
  ],
  [
    "What image formats and sizes are supported?",
    "FontFind supports JPG, JPEG, PNG, and WEBP formats up to 10 MB. You can also paste directly from your clipboard with Ctrl/Cmd+V."
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
          "FontFind reads and compares the letter shapes",
          "Preview matches, then copy the CSS"
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
          Everything you need to know about font identification, privacy, and licensing.
        </p>

        <FaqAccordion items={FAQ} />
      </div>
    </section>
  );
}
