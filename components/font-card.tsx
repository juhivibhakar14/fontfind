"use client";

import Link from "next/link";
import { slug, type Font } from "@/lib/fonts/data";

export default function FontCard({
  font,
  sim,
  label,
  text,
  weight,
  onPreview,
}: {
  font: Font;
  sim?: number;
  label?: string;
  text: string;
  weight?: number;
  onPreview: (f: Font) => void;
}) {
  return (
    <article className="flex h-full min-w-0 flex-col rounded-2xl border border-line bg-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2 min-w-0">
        <span
          className="text-5xl sm:text-6xl leading-none select-none"
          style={{
            fontFamily: `'${font.family}',${font.fallback}`,
            fontWeight: weight || 400,
          }}
          aria-hidden="true"
        >
          Aa
        </span>
        {label ? (
          <span className="shrink-0 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent whitespace-nowrap">
            {label}
          </span>
        ) : sim !== undefined ? (
          <span className="shrink-0 rounded-full bg-line/60 px-2.5 py-0.5 text-xs font-medium text-mute whitespace-nowrap">
            {sim}% match
          </span>
        ) : null}
      </div>

      <h3 className="mt-3 font-semibold text-base text-ink truncate min-w-0" title={font.family}>
        {font.family}
      </h3>

      <div className="mt-2.5 flex-1 min-h-[3.6rem] max-h-[3.6rem] overflow-hidden py-0.5">
        <p
          className="line-clamp-2 break-words text-lg sm:text-xl leading-snug"
          style={{
            fontFamily: `'${font.family}',${font.fallback}`,
            fontWeight: weight || 400,
          }}
        >
          {text}
        </p>
      </div>

      <p
        className="mt-3 text-xs text-mute truncate min-w-0"
        title={`${font.category} · ${font.weights.length} weight${font.weights.length > 1 ? "s" : ""} · Google Fonts`}
      >
        {font.category} · {font.weights.length} weight{font.weights.length > 1 ? "s" : ""} · Google
        Fonts
      </p>

      <div className="mt-auto pt-4 flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={() => onPreview(font)}
          className="min-h-[44px] inline-flex items-center justify-center rounded-xl border border-line bg-bg px-4 py-2.5 text-sm font-medium whitespace-nowrap hover:border-ink active:scale-[0.98] active:bg-line/40 transition-all flex-1 sm:flex-initial"
        >
          Preview
        </button>
        <Link
          href={`/fonts/${slug(font.family)}`}
          className="min-h-[44px] inline-flex items-center justify-center rounded-xl border border-line bg-bg px-4 py-2.5 text-sm font-medium whitespace-nowrap text-accent hover:border-ink active:scale-[0.98] active:bg-line/40 transition-all flex-1 sm:flex-initial"
        >
          Details &amp; pairings →
        </Link>
      </div>
    </article>
  );
}
