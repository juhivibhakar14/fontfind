"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { type Font, importUrl } from "@/lib/fonts/data";
import CopyBtn from "@/components/copy-btn";

export { CopyBtn };

export default function FontPreview({ font, onClose }: { font: Font; onClose: () => void }) {
  const [text, setText] = useState("Your brand deserves better typography.");
  const [size, setSize] = useState(44);
  const [weight, setWeight] = useState(font.weights.includes(400) ? 400 : font.weights[0]);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.3);
  const [textTransform, setTextTransform] = useState<"none" | "uppercase" | "lowercase">("none");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("left");
  const [showEmbed, setShowEmbed] = useState(false);

  // Lock background scroll when modal/bottom sheet is open
  useEffect(() => {
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = origOverflow;
    };
  }, []);

  useEffect(() => {
    const linkElement = document.createElement("link");
    linkElement.rel = "stylesheet";
    linkElement.href = importUrl(font);
    document.head.appendChild(linkElement);
    return () => {
      linkElement.remove();
    };
  }, [font]);

  const rule = `font-family: '${font.family}', ${font.fallback};\nfont-weight: ${weight};`;

  const renderSlider = (
    label: string,
    value: number,
    setValue: (n: number) => void,
    min: number,
    max: number,
    step = 1,
    unit = "px",
  ) => (
    <label className="flex flex-col gap-1.5 min-w-0">
      <div className="flex items-center justify-between text-xs text-mute">
        <span className="font-medium text-ink truncate">{label}</span>
        <span className="tabular-nums font-mono text-[11px] bg-line/50 px-1.5 py-0.5 rounded text-ink">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(+e.target.value)}
        className="w-full h-6 py-2 accent-[var(--accent)] cursor-pointer"
      />
    </label>
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${font.family} preview`}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90dvh] w-full max-w-3xl overflow-y-auto rounded-t-3xl sm:rounded-3xl border-t sm:border border-line bg-card p-5 sm:p-6 flex flex-col shadow-2xl pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile bottom-sheet drag handle */}
        <div
          className="w-12 h-1.5 rounded-full bg-line/80 mx-auto mb-3 shrink-0 sm:hidden"
          aria-hidden="true"
        />

        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold truncate" title={font.family}>
              {font.family}
            </h2>
            <p className="text-xs text-mute mt-0.5">
              {font.category} · {font.weights.length} weights
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-full text-mute hover:text-ink hover:bg-line/40 active:scale-95 transition-all shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="Preview text"
          placeholder="Type your text..."
          rows={2}
          autoComplete="off"
          enterKeyHint="done"
          className="mt-4 w-full rounded-xl border border-line bg-bg p-3.5 text-base sm:text-sm text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-accent"
        />

        <div
          className="my-5 min-h-[120px] break-words py-1 overflow-hidden"
          style={{
            fontFamily: `'${font.family}',${font.fallback}`,
            fontSize: `${size}px`,
            fontWeight: weight,
            letterSpacing: `${letterSpacing}px`,
            lineHeight: lineHeight,
            textTransform,
            textAlign,
          }}
        >
          {text || "Type your text..."}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4 bg-bg/50 p-3 sm:p-4 rounded-2xl border border-line/60">
          {renderSlider("Size", size, setSize, 12, 120, 1, "px")}
          {renderSlider(
            "Weight",
            weight,
            setWeight,
            font.weights[0],
            font.weights[font.weights.length - 1],
            100,
            "",
          )}
          {renderSlider("Spacing", letterSpacing, setLetterSpacing, -2, 12, 0.5, "px")}
          {renderSlider("Line height", lineHeight, setLineHeight, 1, 2, 0.1, "")}
        </div>

        <div className="mt-4 flex flex-wrap gap-2.5">
          <select
            aria-label="Case"
            value={textTransform}
            onChange={(e) => setTextTransform(e.target.value as "none" | "uppercase" | "lowercase")}
            className="min-h-[44px] rounded-xl border border-line bg-card px-3.5 py-2 text-base sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent flex-1 sm:flex-initial"
          >
            <option value="none">Normal case</option>
            <option value="uppercase">Uppercase</option>
            <option value="lowercase">Lowercase</option>
          </select>
          <select
            aria-label="Alignment"
            value={textAlign}
            onChange={(e) => setTextAlign(e.target.value as "left" | "center" | "right")}
            className="min-h-[44px] rounded-xl border border-line bg-card px-3.5 py-2 text-base sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent flex-1 sm:flex-initial"
          >
            <option value="left">Left align</option>
            <option value="center">Center align</option>
            <option value="right">Right align</option>
          </select>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          <CopyBtn text={font.family} label="Copy Name" className="flex-1 sm:flex-initial" />
          <CopyBtn text={rule} label="Copy CSS" className="flex-1 sm:flex-initial" />
          <button
            type="button"
            onClick={() => setShowEmbed(!showEmbed)}
            className="min-h-[44px] inline-flex items-center justify-center rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-bg whitespace-nowrap hover:opacity-90 active:scale-95 transition-all flex-1 sm:flex-initial"
          >
            {showEmbed ? "Hide Embed" : "Use Font"}
          </button>
        </div>

        {showEmbed && (
          <pre className="mt-3 overflow-x-auto rounded-xl border border-line bg-bg p-3.5 text-xs text-ink leading-relaxed">
            {`<link rel="stylesheet" href="${importUrl(font)}">\n\n/* CSS */\n${rule}`}
          </pre>
        )}
      </div>
    </div>
  );
}
