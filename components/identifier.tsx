"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ImagePlus, RotateCw, ClipboardPaste, AlertCircle, Bug } from "lucide-react";
import { fontIdentifierService, type IdentifyResult } from "@/services/fontIdentifierService";
import { useGoogleFonts } from "@/lib/useGoogleFonts";
import { slug, css, type Font } from "@/lib/fonts/data";
import FontCard from "./font-card";
import FontPreview, { CopyBtn } from "./font-preview";
import AdSlot from "./ad-slot";

async function rotated(b: Blob, deg: number) {
  if (!deg) return b;
  const m = await createImageBitmap(b);
  const sw = deg % 180 !== 0;
  const c = document.createElement("canvas");
  c.width = sw ? m.height : m.width;
  c.height = sw ? m.width : m.height;
  const x = c.getContext("2d")!;
  x.translate(c.width / 2, c.height / 2);
  x.rotate((deg * Math.PI) / 180);
  x.drawImage(m, -m.width / 2, -m.height / 2);
  m.close();
  return new Promise<Blob>((r) =>
    c.toBlob((blob) => {
      c.width = 0;
      c.height = 0;
      r(blob!);
    }, "image/png")
  );
}

const OK = ["image/jpeg", "image/png", "image/webp"];
const MAX = 10 * 1024 * 1024;
const SAMPLE = "The quick brown fox jumps over the lazy dog.";

export default function Identifier({ fonts }: { fonts: Font[] }) {
  const [file, setFile] = useState<Blob | null>(null);
  const [url, setUrl] = useState("");
  const [rot, setRot] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ loaded: number; total: number } | null>(null);
  const [res, setRes] = useState<IdentifyResult | null>(null);
  const [err, setErr] = useState("");
  const [prev, setPrev] = useState<Font | null>(null);
  const [overrideText, setOverrideText] = useState("");
  const [isDebug, setIsDebug] = useState(false);
  const inp = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      setIsDebug(p.get("debug") === "1" || process.env.NEXT_PUBLIC_DEBUG === "on");
    }
  }, []);

  const all = res ? [...res.matches, ...res.similar].map((m) => m.font) : [];
  useGoogleFonts(all);

  const load = useCallback((f: Blob) => {
    setErr("");
    setRes(null);
    setOverrideText("");
    if (!OK.includes(f.type)) return setErr("Use a JPG, PNG or WEBP image.");
    if (f.size > MAX) return setErr("That image is over 10 MB. Try a smaller one.");
    setUrl((u) => {
      if (u) URL.revokeObjectURL(u);
      return URL.createObjectURL(f);
    });
    setFile(f);
    setRot(0);
    setZoom(1);
  }, []);

  useEffect(() => {
    const h = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (items) {
        for (let idx = 0; idx < items.length; idx++) {
          if (items[idx].type.startsWith("image/")) {
            const f = items[idx].getAsFile();
            if (f) {
              load(f);
              break;
            }
          }
        }
      }
    };
    window.addEventListener("paste", h);
    return () => window.removeEventListener("paste", h);
  }, [load]);

  const paste = async () => {
    try {
      for (const it of await navigator.clipboard.read()) {
        const t = it.types.find((t) => t.startsWith("image/"));
        if (t) return load(await it.getType(t));
      }
      setErr("No image found on your clipboard.");
    } catch {
      setErr("Press Ctrl/Cmd+V to paste an image.");
    }
  };

  const clear = () => {
    if (inp.current) inp.current.value = "";
    if (url) URL.revokeObjectURL(url);
    setFile(null);
    setUrl("");
    setRes(null);
    setErr("");
    setOverrideText("");
    setProgress(null);
  };

  const run = async (customText?: string, allowFallback = false) => {
    if (busy || !file) return;
    setBusy(true);
    setErr("");
    setProgress({ loaded: 0, total: Math.min(300, fonts.length) });
    try {
      const textToUse = (customText !== undefined ? customText : overrideText).trim();
      const processedImage = await rotated(file, rot);
      const r = await fontIdentifierService.identify(processedImage, fonts, {
        overrideText: textToUse || undefined,
        allowFallbackText: allowFallback,
        debug: isDebug,
        onProgress: (loaded, total) => setProgress({ loaded, total }),
      });
      setRes(r);
      if (r.text) setOverrideText(r.text);
    } catch (e: any) {
      setErr(e?.message || "We couldn't analyze the style from this image. Try uploading a clearer image with larger text.");
    } finally {
      setBusy(false);
    }
  };

  const example = async () => {
    const c = document.createElement("canvas");
    c.width = 800;
    c.height = 240;
    const x = c.getContext("2d")!;
    x.fillStyle = "#fff";
    x.fillRect(0, 0, 800, 240);
    x.fillStyle = "#111";
    x.font = "bold 64px sans-serif";
    x.fillText("Hello, Typography", 40, 140);
    c.toBlob((b) => {
      c.width = 0;
      c.height = 0;
      if (b) {
        load(b);
        setOverrideText("Hello, Typography");
      }
    }, "image/png");
  };

  return (
    <div>
      <section className="mx-auto max-w-4xl px-4 pt-14 text-center sm:pt-20">
        <h1 className="font-display text-[clamp(1.75rem,4.5vw,3.75rem)] font-semibold tracking-tight leading-tight sm:whitespace-nowrap">
          What Font Is This?
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base sm:text-lg text-mute">
          Upload a screenshot, logo, poster, or design and find fonts that look similar.
        </p>
      </section>

      <section className="mx-auto mt-10 max-w-3xl px-4" aria-label="Font identifier tool">
        {!file ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f) load(f);
            }}
            className="rounded-3xl border-2 border-dashed border-line bg-card p-6 text-center sm:p-14"
          >
            <p className="font-display text-3xl">Aa</p>
            <p className="mt-3 text-xl font-medium">Drop an image here</p>
            <p className="text-mute">or</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => inp.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm text-bg whitespace-nowrap"
              >
                <ImagePlus className="h-4 w-4" />
                Browse Image
              </button>
              <button
                type="button"
                onClick={paste}
                className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm hover:border-ink whitespace-nowrap"
              >
                <ClipboardPaste className="h-4 w-4" />
                Paste Image
              </button>
              <button
                type="button"
                onClick={example}
                className="rounded-lg border border-line px-4 py-2 text-sm hover:border-ink whitespace-nowrap"
              >
                Try an example
              </button>
            </div>
            <input
              ref={inp}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              hidden
              onChange={(e) => e.target.files?.[0] && load(e.target.files[0])}
            />
            <p className="mt-5 text-xs text-mute">
              JPG, JPEG, PNG, WEBP · up to 10 MB · Your image stays in your browser.{" "}
              <Link href="/privacy" className="underline">
                Privacy
              </Link>
            </p>
          </div>
        ) : (
          <div className="rounded-3xl border border-line bg-card p-4">
            <div className="flex h-64 items-center justify-center overflow-hidden rounded-2xl border border-line bg-bg">
              <img
                src={url}
                alt="Uploaded text sample to analyze"
                className="max-h-full max-w-full transition-transform"
                style={{ transform: `rotate(${rot}deg) scale(${zoom})` }}
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setRot((rot + 90) % 360)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm hover:border-ink whitespace-nowrap shrink-0"
              >
                <RotateCw className="h-3.5 w-3.5" />
                Rotate
              </button>
              <label className="flex min-w-[140px] flex-1 items-center gap-2 text-sm text-mute">
                Zoom
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(+e.target.value)}
                  className="flex-1 accent-[var(--accent)]"
                />
              </label>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <span className="text-mute shrink-0">Replace image:</span>
              <button type="button" onClick={() => inp.current?.click()} className="underline underline-offset-4 whitespace-nowrap">
                Upload new
              </button>
              <button type="button" onClick={paste} className="underline underline-offset-4 whitespace-nowrap">
                Paste
              </button>
              <button type="button" onClick={example} className="underline underline-offset-4 whitespace-nowrap">
                Example
              </button>
              <button type="button" onClick={clear} className="text-mute underline underline-offset-4 whitespace-nowrap sm:ml-auto">
                ← Start over
              </button>
            </div>

            <div className="mt-4">
              <label htmlFor="text-override-input" className="block text-xs font-medium text-mute mb-1">
                Text in image (optional — leave blank to auto-detect with OCR):
              </label>
              <input
                id="text-override-input"
                type="text"
                value={overrideText}
                onChange={(e) => setOverrideText(e.target.value)}
                placeholder="e.g. COFFEE, VOGUE, MINIMAL..."
                className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-mute focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <input
              ref={inp}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              hidden
              onChange={(e) => e.target.files?.[0] && load(e.target.files[0])}
            />
            <button
              type="button"
              onClick={() => run()}
              disabled={busy}
              className="mt-4 w-full rounded-xl bg-accent py-3 font-medium text-[var(--ai)] disabled:opacity-60 transition-opacity"
            >
              {busy ? "Analyzing Style…" : "Find Matching Fonts"}
            </button>
            {busy && (
              <div role="status" className="mt-3">
                <p className="text-sm text-mute">
                  {progress && progress.loaded > 0
                    ? `Comparing ${progress.loaded} of ${progress.total} fonts...`
                    : "Reading text and analyzing letterforms..."}
                </p>
                <div className="mt-2 h-1 overflow-hidden rounded bg-line">
                  <div
                    className="h-full rounded bg-accent transition-all duration-300"
                    style={{
                      width:
                        progress && progress.total > 0
                          ? `${Math.min(100, Math.round((progress.loaded / progress.total) * 100))}%`
                          : "35%",
                      animation: progress && progress.loaded > 0 ? "none" : "sweep 1.1s ease-in-out infinite",
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {err && (
          <div role="alert" className="mt-4 rounded-xl border border-line p-4">
            <p className="font-medium text-ink">
              {res === null && file ? "We couldn't analyze the font style" : "Something's off"}
            </p>
            <p className="text-sm text-mute mt-0.5">{err}</p>
          </div>
        )}

        {!file && !err && (
          <p className="mt-6 text-center text-sm text-mute">
            <b className="text-ink">No image yet.</b> Upload a screenshot and let&apos;s find matching typography.
          </p>
        )}
      </section>

      {/* When fewer than 20 fonts could load */}
      {res && res.error && (
        <section className="mx-auto mt-8 max-w-3xl px-4">
          <div role="alert" className="rounded-2xl border border-red-500/30 bg-card p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-ink text-base">Fonts could not be loaded</h3>
                <p className="mt-1 text-sm text-mute">{res.error}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* When OCR cannot extract text and none was typed, prompt user explicitly */}
      {res && res.needsTextPrompt && (
        <section className="mx-auto mt-8 max-w-3xl px-4">
          <div className="rounded-2xl border border-line bg-card p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-ink text-base">
                  We couldn&apos;t read the letters automatically
                </h3>
                <p className="mt-1 text-xs text-mute leading-relaxed">
                  Automatic OCR couldn&apos;t extract text from this image clearly. Type the word or letters visible in the image so we can compare their shapes with Google Fonts:
                </p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row items-center">
                  <input
                    type="text"
                    value={overrideText}
                    onChange={(e) => setOverrideText(e.target.value)}
                    placeholder="Type the exact text in your image..."
                    aria-label="Text in image"
                    className="flex-1 w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-mute focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <button
                    type="button"
                    disabled={busy || !overrideText.trim()}
                    onClick={() => run(overrideText.trim())}
                    className="w-full sm:w-auto rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-95 disabled:opacity-50"
                  >
                    {busy ? "Comparing…" : "Find Matching Style"}
                  </button>
                </div>
                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={() => run(undefined, true)}
                    className="text-xs text-mute underline hover:text-ink"
                  >
                    or compare with sample text anyway →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3) HONEST LABELS & STYLE HEADINGS */}
      {res && !res.needsTextPrompt && !res.error && res.matches.length > 0 && (
        <section className="mx-auto mt-14 max-w-6xl px-4" aria-live="polite">
          {/* One-line style summary */}
          {res.styleEstimate && (
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-4 py-1.5 text-xs text-mute mb-3 shadow-sm">
              <span className="text-mute/80">Looks like:</span>
              <b className="text-ink capitalize font-medium">{res.styleEstimate.summary}</b>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl font-semibold">Closest style matches</h2>
              <p className="text-xs text-mute mt-0.5">
                Compared against text: <b className="text-ink">&ldquo;{res.text}&rdquo;</b>
                {res.unloadedCount !== undefined && res.unloadedCount > 0 && (
                  <span className="ml-1 text-mute/80">({res.unloadedCount} fonts skipped due to network)</span>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                clear();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="rounded-lg border border-line px-3 py-1.5 text-sm hover:border-ink"
            >
              Try another image
            </button>
          </div>

          <p className="text-sm text-mute mt-2">
            Fonts in the open-source Google Fonts catalog with letterforms, weight, and proportions closest to your image.
          </p>

          <ol className="mt-5 grid gap-4 items-stretch">
            {res.matches.map((m) => (
              <li key={m.font.family} className="flex h-full min-w-0 flex-col rounded-2xl border border-line bg-card p-4 sm:p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 min-w-0">
                  <h3
                    className="text-lg sm:text-xl font-semibold text-ink truncate min-w-0 max-w-full sm:max-w-[70%]"
                    title={m.font.family}
                  >
                    {m.font.family}
                  </h3>
                  <span
                    className={`shrink-0 rounded-full px-3 py-0.5 text-xs font-semibold whitespace-nowrap ${
                      m.matchLabel === "Strong match"
                        ? "bg-accent/15 text-accent border border-accent/30"
                        : m.matchLabel === "Good match"
                        ? "bg-ink/10 text-ink border border-line"
                        : "bg-mute/10 text-mute border border-line"
                    }`}
                  >
                    {m.matchLabel}
                  </span>
                </div>
                <div className="my-3 flex-1 min-h-[4.2rem] max-h-[4.5rem] overflow-hidden py-0.5">
                  <p
                    className="line-clamp-2 break-words text-[clamp(1.375rem,4vw,2rem)] leading-snug"
                    style={{ fontFamily: `'${m.font.family}',${m.font.fallback}` }}
                  >
                    {res.text || SAMPLE}
                  </p>
                </div>
                <p className="text-xs text-mute truncate min-w-0" title={`${m.font.category} · Google Fonts`}>
                  {m.font.category} · Google Fonts
                </p>
                <div className="mt-auto pt-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPrev(m.font)}
                    className="inline-flex items-center rounded-lg border border-line px-3 py-1.5 text-sm whitespace-nowrap hover:border-ink transition-colors"
                  >
                    Preview
                  </button>
                  <CopyBtn text={m.font.family} label="Copy Name" />
                  <CopyBtn text={css(m.font)} label="Copy Code" />
                  <Link
                    href={`/fonts/${slug(m.font.family)}`}
                    className="inline-flex items-center rounded-lg border border-line px-3 py-1.5 text-sm whitespace-nowrap text-accent hover:border-ink transition-colors sm:ml-auto"
                  >
                    Details &amp; pairings →
                  </Link>
                </div>
              </li>
            ))}
          </ol>

          {/* 4) Diagnostics Debug Panel (?debug=1) */}
          {isDebug && res.debug && (
            <div className="mt-8 rounded-2xl border border-line bg-card p-5 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-line pb-2 mb-3">
                <span className="inline-flex items-center gap-1.5 font-semibold text-ink uppercase tracking-wider">
                  <Bug className="h-4 w-4 text-accent" />
                  Debug Diagnostics (?debug=1)
                </span>
                <span className="rounded bg-accent/10 px-2 py-0.5 text-accent font-medium">Active</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 text-mute">
                <div>
                  <b>OCR Text:</b> <span className="text-ink">&ldquo;{res.debug.ocrText}&rdquo;</span> ({res.debug.textSource})
                </div>
                <div>
                  <b>Estimated Style:</b> <span className="text-ink capitalize">{res.debug.styleSummary}</span>
                </div>
                <div>
                  <b>Stage 1 Candidates:</b> <span className="text-ink">{res.debug.candidatesStage1Count}</span> retained of {res.debug.candidatesLoaded}
                </div>
                <div>
                  <b>Estimated Classification:</b> <span className="text-ink">{res.debug.estimatedCategory} · {res.debug.estimatedWeight} · {res.debug.estimatedWidth}</span>
                </div>
              </div>
              {!res.debug.isOrderAscending && (
                <div
                  role="alert"
                  className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm font-semibold text-red-500"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>WARNING: Displayed candidates are not sorted in ascending order of distance!</span>
                </div>
              )}
              <p className="font-semibold text-ink mb-1">Top 10 Ranked Candidates (Stage 2 Weighted Distance):</p>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-line text-mute">
                      <th className="py-1 pr-3">#</th>
                      <th className="py-1 pr-3">Font Family</th>
                      <th className="py-1 pr-3">Raw Distance</th>
                      <th className="py-1 pr-3">Secondary Dist</th>
                      <th className="py-1">Match Label</th>
                    </tr>
                  </thead>
                  <tbody>
                    {res.debug.top10.map((item, idx) => (
                      <tr key={item.family} className="border-b border-line/40">
                        <td className="py-1 pr-3 text-mute">{idx + 1}</td>
                        <td className="py-1 pr-3 font-medium text-ink">{item.family}</td>
                        <td className="py-1 pr-3 text-accent font-mono">{item.distance.toFixed(4)}</td>
                        <td className="py-1 pr-3 text-mute font-mono">
                          {Number.isFinite(item.secondary) ? item.secondary.toFixed(4) : "—"}
                        </td>
                        <td className="py-1 font-semibold">{item.label}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <AdSlot id="home-results" />

          {/* 3) "More fonts in a similar style" */}
          <h2 className="mt-12 text-2xl font-semibold">More fonts in a similar style</h2>
          <div className="mt-5 grid gap-4 items-stretch sm:grid-cols-2 lg:grid-cols-3">
            {res.similar.map((m) => (
              <FontCard
                key={m.font.family}
                font={m.font}
                label={m.matchLabel}
                text={res.text || "The quick brown fox"}
                onPreview={setPrev}
              />
            ))}
          </div>
        </section>
      )}

      {prev && <FontPreview font={prev} onClose={() => setPrev(null)} />}
    </div>
  );
}
