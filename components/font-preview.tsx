"use client";

import { useState, useEffect } from "react";
import { type Font, css, importUrl } from "@/lib/fonts/data";

function CopyIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function CopyBtn({ text, label }: { text: string; label: string }) {
  const [ok, set] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        set(true);
        setTimeout(() => set(false), 1500);
      }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm whitespace-nowrap hover:border-ink transition-colors"
    >
      {ok ? <CheckIcon /> : <CopyIcon />}
      {ok ? "Copied" : label}
    </button>
  );
}

export default function FontPreview({ font, onClose }: { font: Font; onClose: () => void }) {
  const [text, setText] = useState("Your brand deserves better typography.");
  const [size, setSize] = useState(44);
  const [w, setW] = useState(font.weights.includes(400) ? 400 : font.weights[0]);
  const [ls, setLs] = useState(0);
  const [lh, setLh] = useState(1.3);
  const [tf, setTf] = useState("none");
  const [al, setAl] = useState("left");
  const [use, setUse] = useState(false);

  useEffect(() => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = importUrl(font);
    document.head.appendChild(l);
  }, [font]);

  const rule = `font-family: '${font.family}', ${font.fallback};\nfont-weight: ${w};`;
  const sl = (
    l: string,
    v: number,
    s: (n: number) => void,
    min: number,
    max: number,
    step = 1
  ) => (
    <label className="flex flex-col gap-1 text-xs text-mute min-w-0">
      <span className="truncate">{l}: {v}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={v}
        onChange={(e) => s(+e.target.value)}
        className="w-full accent-[var(--accent)]"
      />
    </label>
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${font.family} preview`}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl border border-line bg-card p-4 sm:p-6 sm:rounded-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold truncate" title={font.family}>
            {font.family}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 hover:bg-line transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="Preview text"
          placeholder="Type your text..."
          rows={2}
          className="mt-4 w-full rounded-lg border border-line bg-transparent p-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
        />

        <div
          className="my-5 min-h-[140px] break-words py-1 overflow-hidden"
          style={{
            fontFamily: `'${font.family}',${font.fallback}`,
            fontSize: size,
            fontWeight: w,
            letterSpacing: `${ls}px`,
            lineHeight: lh,
            textTransform: tf as any,
            textAlign: al as any,
          }}
        >
          {text || "Type your text..."}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
          {sl("Size", size, setSize, 12, 120)}
          {sl("Weight", w, setW, font.weights[0], font.weights[font.weights.length - 1], 100)}
          {sl("Spacing", ls, setLs, -2, 12, 0.5)}
          {sl("Line height", lh, setLh, 1, 2, 0.1)}
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <select
            aria-label="Case"
            value={tf}
            onChange={(e) => setTf(e.target.value)}
            className="rounded-lg border border-line bg-card px-2.5 py-1.5 text-xs sm:text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="none">Normal case</option>
            <option value="uppercase">Uppercase</option>
            <option value="lowercase">Lowercase</option>
          </select>
          <select
            aria-label="Alignment"
            value={al}
            onChange={(e) => setAl(e.target.value)}
            className="rounded-lg border border-line bg-card px-2.5 py-1.5 text-xs sm:text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <CopyBtn text={font.family} label="Copy Font Name" />
          <CopyBtn text={rule} label="Copy Code" />
          <button
            type="button"
            onClick={() => setUse(!use)}
            className="inline-flex items-center rounded-lg bg-ink px-3 py-1.5 text-sm font-medium text-bg whitespace-nowrap hover:opacity-90 transition-opacity"
          >
            Use Font
          </button>
        </div>

        {use && (
          <pre className="mt-3 overflow-x-auto rounded-lg border border-line p-3 text-xs">
            {`<link rel="stylesheet" href="${importUrl(font)}">\n\n/* CSS */\n${rule}`}
          </pre>
        )}
      </div>
    </div>
  );
}
