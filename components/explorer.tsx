"use client";

import { useMemo, useState } from "react";
import {
  pairsWithCurated as pairsFor,
  css,
  type Cat,
  type Mood,
  type Font,
} from "@/lib/fonts/data";
import { useGoogleFonts } from "@/lib/useGoogleFonts";
import FontCard from "./font-card";
import FontPreview, { CopyBtn } from "./font-preview";
import AdSlot from "./ad-slot";

const CATS: Cat[] = ["Serif", "Sans Serif", "Display", "Monospace", "Handwriting", "Script"];
const MOODS: Mood[] = [
  "Modern",
  "Minimal",
  "Elegant",
  "Luxury",
  "Playful",
  "Professional",
  "Retro",
];
const STEP = 24;

export default function Explorer({ fonts }: { fonts: Font[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Cat | null>(null);
  const [mood, setMood] = useState<Mood | null>(null);
  const [text, setText] = useState("The quick brown fox jumps over the lazy dog.");
  const [prev, setPrev] = useState<Font | null>(null);
  const [head, setHead] = useState("Playfair Display");
  const [n, setN] = useState(STEP);

  const list = useMemo(
    () =>
      fonts.filter(
        (f) =>
          f.family.toLowerCase().includes(q.toLowerCase()) &&
          (!cat || f.category === cat) &&
          (!mood || f.moods.includes(mood)),
      ),
    [fonts, q, cat, mood],
  );

  const shown = list.slice(0, n);
  const h = fonts.find((f) => f.family === head);
  const pairs = h ? pairsFor(h, fonts) : [];

  useGoogleFonts(h ? [...shown, h, ...pairs] : shown);

  const chip = (l: string, on: boolean, fn: () => void) => (
    <button
      key={l}
      type="button"
      onClick={() => {
        fn();
        setN(STEP);
      }}
      aria-pressed={on}
      className={`min-h-[44px] shrink-0 snap-start inline-flex items-center justify-center rounded-full border px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-all active:scale-95 ${
        on
          ? "border-ink bg-ink text-bg font-semibold shadow-sm"
          : "border-line bg-card text-mute hover:border-line/80 hover:text-ink active:bg-line/40"
      }`}
    >
      {l}
    </button>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:pt-14 pb-16">
      <h1 className="font-display text-[clamp(2rem,6vw,4rem)] font-semibold tracking-tight leading-tight sm:whitespace-nowrap">
        Explore Fonts
      </h1>
      <p className="mt-2 sm:mt-3 text-base sm:text-lg text-mute">
        Find the perfect font for your next design.
      </p>

      {/* Search & preview inputs with iOS 16px zoom prevention */}
      <div className="mt-6 sm:mt-8 grid gap-3 sm:grid-cols-2">
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setN(STEP);
          }}
          placeholder="Search fonts..."
          aria-label="Search fonts"
          autoComplete="off"
          autoCorrect="off"
          enterKeyHint="search"
          className="min-h-[44px] w-full rounded-xl border border-line bg-card px-3.5 py-2.5 text-base sm:text-sm text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="Preview text for all fonts"
          autoComplete="off"
          enterKeyHint="done"
          className="min-h-[44px] w-full rounded-xl border border-line bg-card px-3.5 py-2.5 text-base sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {/* Horizontally scrollable single row with scroll-snap and hidden scrollbar on mobile */}
      <div
        className="mt-4 -mx-4 px-4 overflow-x-auto no-scrollbar flex items-center gap-2 snap-x snap-mandatory sm:flex-wrap sm:mx-0 sm:px-0"
        role="group"
        aria-label="Category filters"
      >
        <button
          type="button"
          onClick={() => {
            setCat(null);
            setN(STEP);
          }}
          className={`min-h-[44px] shrink-0 snap-start inline-flex items-center justify-center rounded-full border px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-all active:scale-95 ${
            !cat
              ? "border-ink bg-ink text-bg font-semibold shadow-sm"
              : "border-line bg-card text-mute hover:text-ink active:bg-line/40"
          }`}
        >
          All Categories
        </button>
        {CATS.map((c) => chip(c, cat === c, () => setCat(cat === c ? null : c)))}
      </div>

      <div
        className="mt-2.5 -mx-4 px-4 overflow-x-auto no-scrollbar flex items-center gap-2 snap-x snap-mandatory sm:flex-wrap sm:mx-0 sm:px-0"
        role="group"
        aria-label="Style filters"
      >
        <button
          type="button"
          onClick={() => {
            setMood(null);
            setN(STEP);
          }}
          className={`min-h-[44px] shrink-0 snap-start inline-flex items-center justify-center rounded-full border px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-all active:scale-95 ${
            !mood
              ? "border-ink bg-ink text-bg font-semibold shadow-sm"
              : "border-line bg-card text-mute hover:text-ink active:bg-line/40"
          }`}
        >
          All Moods
        </button>
        {MOODS.map((m) => chip(m, mood === m, () => setMood(mood === m ? null : m)))}
      </div>

      <p className="mt-5 text-sm text-mute">
        Showing {shown.length} of {list.length} fonts
      </p>

      {/* Font grid: 1 col below 480px, 2 cols from 480px (xs:), 3 cols from 1024px (lg:) */}
      <div className="mt-4 grid gap-4 items-stretch xs:grid-cols-2 lg:grid-cols-3">
        {shown.map((f) => (
          <FontCard key={f.family} font={f} text={text} onPreview={setPrev} />
        ))}
      </div>

      {list.length === 0 && (
        <p className="mt-8 text-mute">No fonts match. Clear a filter or try another search.</p>
      )}

      {shown.length < list.length && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setN(n + STEP)}
            className="min-h-[44px] w-full sm:w-auto rounded-xl border border-line bg-card px-6 py-2.5 text-sm font-medium hover:border-ink active:scale-95 transition-all shadow-sm"
          >
            Load more fonts
          </button>
        </div>
      )}

      <AdSlot id="fonts-grid" />

      <section className="mt-16" aria-labelledby="pair">
        <h2 id="pair" className="text-2xl font-semibold">
          Find a Font Pair
        </h2>
        <label className="mt-4 flex flex-wrap items-center gap-2 text-sm text-mute">
          <span>Heading font</span>
          <input
            list="fl"
            value={head}
            onChange={(e) => setHead(e.target.value)}
            className="min-h-[44px] w-64 max-w-full rounded-xl border border-line bg-card px-3.5 py-2 text-base sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </label>
        <datalist id="fl">
          {fonts.map((f) => (
            <option key={f.family} value={f.family} />
          ))}
        </datalist>

        {!h && <p className="mt-4 text-mute">Pick a font from the list to see pairings.</p>}

        <div className="mt-5 grid gap-4 items-stretch xs:grid-cols-2 md:grid-cols-3">
          {h &&
            pairs.map((b) => (
              <article
                key={b.family}
                className="flex h-full min-w-0 flex-col rounded-2xl border border-line bg-card p-4 sm:p-5"
              >
                <h3
                  className="text-xl sm:text-2xl font-semibold leading-tight truncate min-w-0"
                  style={{ fontFamily: `'${h.family}',${h.fallback}` }}
                  title="Design with intent"
                >
                  Design with intent
                </h3>
                <div className="mt-2.5 flex-1 min-h-[3.2rem] max-h-[3.5rem] overflow-hidden py-0.5">
                  <p
                    className="line-clamp-2 break-words text-sm leading-snug text-mute"
                    style={{ fontFamily: `'${b.family}',${b.fallback}` }}
                  >
                    Good pairings give headings a voice and let body text stay quiet and readable.
                  </p>
                </div>
                <p
                  className="mt-3 text-xs text-mute truncate min-w-0"
                  title={`${h.family} + ${b.family}`}
                >
                  {h.family} + {b.family}
                </p>
                <div className="mt-auto pt-4 flex items-center gap-2">
                  <CopyBtn label="Copy Code" text={`h1,h2,h3 { ${css(h)} }\nbody { ${css(b)} }`} />
                </div>
              </article>
            ))}
        </div>
      </section>

      {prev && <FontPreview font={prev} onClose={() => setPrev(null)} />}
    </div>
  );
}
