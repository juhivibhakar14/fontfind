"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { css, importUrl, pairsWithCurated, slug, type Font } from "@/lib/fonts/data";
import { similarTo } from "@/lib/imageProcessing";
import { useGoogleFonts } from "@/lib/useGoogleFonts";
import { CopyBtn } from "./font-preview";
import AdSlot from "./ad-slot";

export default function FontDetail({ font, fonts }: { font: Font; fonts: Font[] }) {
  const [text, setText] = useState("Your brand deserves better typography.");
  const [sim, setSim] = useState<{ font: Font; pct: number }[]>([]);
  const pairs = pairsWithCurated(font, fonts);

  useGoogleFonts([font, ...pairs, ...sim.map((s) => s.font)]);

  useEffect(() => {
    let ok = true;
    similarTo(font, fonts.slice(0, 150)).then((r) => ok && setSim(r.slice(0, 6)));
    return () => {
      ok = false;
    };
  }, [font, fonts]);

  const ff = (f: Font) => ({ fontFamily: `'${f.family}',${f.fallback}` });

  return (
    <div className="mx-auto max-w-5xl px-4 pt-12">
      <Link href="/fonts" className="text-sm text-mute hover:text-ink">
        ← All fonts
      </Link>

      <h1
        className="mt-3 font-display text-[clamp(2.25rem,6vw,3.75rem)] font-semibold tracking-tight leading-tight truncate min-w-0"
        title={font.family}
      >
        {font.family}
      </h1>
      <p className="text-sm text-mute mt-1">
        {font.category} · {font.weights.length} weights · Google Fonts · {font.moods.join(", ")}
      </p>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-label="Specimen text"
        className="mt-6 w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent"
      />

      <p className="mt-6 break-words text-[clamp(2rem,6vw,4.5rem)] leading-tight" style={ff(font)}>
        {text || "Aa"}
      </p>

      <p className="mt-4 break-words text-lg sm:text-xl leading-relaxed text-mute" style={ff(font)}>
        ABCDEFGHIJKLMNOPQRSTUVWXYZ
        <br />
        abcdefghijklmnopqrstuvwxyz 0123456789
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <CopyBtn text={font.family} label="Copy Font Name" />
        <CopyBtn text={css(font)} label="Copy Code" />
        <CopyBtn text={`<link rel="stylesheet" href="${importUrl(font)}">`} label="Copy embed" />
      </div>

      <AdSlot id="font-page" />

      <h2 className="mt-12 text-2xl font-semibold">{font.family} font pairings</h2>
      <div className="mt-4 grid gap-4 items-stretch sm:grid-cols-2 lg:grid-cols-3">
        {pairs.map((b) => (
          <Link
            key={b.family}
            href={`/fonts/${slug(b.family)}`}
            className="flex h-full min-w-0 flex-col rounded-2xl border border-line bg-card p-4 sm:p-5 hover:border-ink transition-colors"
          >
            <p
              className="text-xl sm:text-2xl font-semibold leading-tight truncate min-w-0"
              style={ff(font)}
              title="Design with intent"
            >
              Design with intent
            </p>
            <div className="mt-2.5 flex-1 min-h-[3rem] max-h-[3.5rem] overflow-hidden py-0.5">
              <p className="line-clamp-2 break-words text-sm leading-snug text-mute" style={ff(b)}>
                Body text in {b.family} stays quiet and readable.
              </p>
            </div>
            <p
              className="mt-auto pt-3 text-xs text-mute truncate min-w-0"
              title={`${font.family} + ${b.family}`}
            >
              {font.family} + {b.family}
            </p>
          </Link>
        ))}
      </div>

      <h2 className="mt-12 text-2xl font-semibold">Fonts in a similar style to {font.family}</h2>
      <p className="text-sm text-mute mt-1">
        Closest matches ranked by comparing letterform style and proportions in your browser.
      </p>

      <div className="mt-4 grid gap-4 items-stretch sm:grid-cols-2 lg:grid-cols-3">
        {sim.length === 0 && <p className="text-mute">Comparing shapes…</p>}
        {sim.map((s) => (
          <Link
            key={s.font.family}
            href={`/fonts/${slug(s.font.family)}`}
            className="flex h-full min-w-0 flex-col rounded-2xl border border-line bg-card p-4 sm:p-5 hover:border-ink transition-colors"
          >
            <p className="text-4xl leading-none select-none" style={ff(s.font)}>
              Aa
            </p>
            <p
              className="mt-3 font-semibold text-base text-ink truncate min-w-0"
              title={s.font.family}
            >
              {s.font.family}
            </p>
            <p className="mt-auto pt-2 text-xs text-mute truncate min-w-0">
              Closest match · {s.font.category}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
