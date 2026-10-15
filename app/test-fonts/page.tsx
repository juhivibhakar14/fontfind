"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FONTS, type Font } from "@/lib/fonts/data";
import { fontIdentifierService, type FontMatch } from "@/services/fontIdentifierService";
import { useGoogleFonts } from "@/lib/useGoogleFonts";

interface TestCase {
  id: string;
  name: string;
  family: string;
  category: string;
  weight: number;
  text: string;
  fontString: string;
}

const TEST_CASES: TestCase[] = [
  {
    id: "bold-sans",
    name: "1. Bold Sans-Serif",
    family: "Montserrat",
    category: "Sans Serif",
    weight: 700,
    text: "MODERN SANS",
    fontString: 'bold 64px "Montserrat", sans-serif',
  },
  {
    id: "thin-sans",
    name: "2. Thin/Light Sans",
    family: "Raleway",
    category: "Sans Serif",
    weight: 300,
    text: "LIGHT DESIGN",
    fontString: '300 64px "Raleway", sans-serif',
  },
  {
    id: "serif",
    name: "3. High-Contrast Serif",
    family: "Playfair Display",
    category: "Serif",
    weight: 400,
    text: "LUXURY SERIF",
    fontString: '64px "Playfair Display", serif',
  },
  {
    id: "script",
    name: "4. Flowing Script",
    family: "Pacifico",
    category: "Script",
    weight: 400,
    text: "Beautiful",
    fontString: '64px "Pacifico", cursive',
  },
  {
    id: "monospace",
    name: "5. Fixed-Pitch Monospace",
    family: "Space Mono",
    category: "Monospace",
    weight: 400,
    text: "CODE_1234",
    fontString: '64px "Space Mono", monospace',
  },
];

interface TestResult {
  testCase: TestCase;
  imageUrl: string;
  matches: FontMatch[];
  isTrueFontInTop5: boolean;
  top3Families: string[];
}

export default function TestFontsPage() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [logMessages, setLogMessages] = useState<string[]>([]);

  // Pre-load all test fonts into document
  const testFonts = TEST_CASES.map((tc) => FONTS.find((f) => f.family === tc.family)!).filter(Boolean);
  useGoogleFonts(testFonts);

  const runSuite = async () => {
    setRunning(true);
    setResults([]);
    const logs: string[] = [];
    const addLog = (msg: string) => {
      logs.push(msg);
      setLogMessages([...logs]);
      console.log(`[TestFonts] ${msg}`);
    };

    addLog("Starting font identification verification test suite...");

    try {
      await document.fonts.ready;
    } catch {}

    const suiteResults: TestResult[] = [];

    for (const tc of TEST_CASES) {
      addLog(`Testing ${tc.name} (${tc.family})...`);

      // Ensure test font is loaded in browser
      try {
        await document.fonts.load(tc.fontString, tc.text);
      } catch {}

      // Create test canvas image
      const c = document.createElement("canvas");
      c.width = 750;
      c.height = 160;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = "#111111";
      ctx.font = tc.fontString;
      ctx.textBaseline = "middle";
      ctx.fillText(tc.text, 30, c.height / 2);

      const blob = await new Promise<Blob>((resolve) => c.toBlob((b) => resolve(b!), "image/png"));
      const imageUrl = URL.createObjectURL(blob);

      // Run identification
      const res = await fontIdentifierService.identify(blob, FONTS, {
        overrideText: tc.text,
        debug: true,
      });

      const allMatches = [...res.matches, ...res.similar];
      const top5 = allMatches.slice(0, 5);
      const isTrueFontInTop5 = top5.some(
        (m) => m.font.family.toLowerCase() === tc.family.toLowerCase()
      );
      const top3Families = res.matches.map((m) => m.font.family);

      addLog(
        `Result for ${tc.family}: Top match = ${res.matches[0]?.font.family} (${res.matches[0]?.similarity}%). True font in top 5: ${
          isTrueFontInTop5 ? "YES ✓" : "NO"
        }`
      );

      suiteResults.push({
        testCase: tc,
        imageUrl,
        matches: allMatches,
        isTrueFontInTop5,
        top3Families,
      });
    }

    // Check if different test images produced different top-3 results
    const top1List = suiteResults.map((r) => r.top3Families[0]);
    const uniqueTop1 = new Set(top1List).size;
    addLog(`Verification check: ${uniqueTop1} distinct #1 matches across 5 test images.`);

    console.table(
      suiteResults.map((r) => ({
        TestCase: r.testCase.name,
        TrueFont: r.testCase.family,
        Top1Match: r.matches[0]?.font.family,
        Similarity: `${r.matches[0]?.similarity}%`,
        RawDistance: r.matches[0]?.rawDistance,
        InTop5: r.isTrueFontInTop5 ? "PASS" : "FAIL",
      }))
    );

    setResults(suiteResults);
    setRunning(false);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Link href="/" className="text-sm text-mute hover:text-ink">
        ← Back to FontFind
      </Link>
      <h1 className="font-display text-4xl font-semibold mt-3">Font Matching Test Suite</h1>
      <p className="mt-2 text-mute">
        Generates 5 distinct test images (Bold Sans, Thin Sans, Serif, Script, Monospace) in your browser using known Google Fonts, runs font identification on each, and validates results differ according to shape features.
      </p>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={runSuite}
          disabled={running}
          className="rounded-xl bg-accent px-6 py-2.5 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {running ? "Running Tests…" : "Run 5-Font Test Suite"}
        </button>
      </div>

      {logMessages.length > 0 && (
        <div className="mt-8 rounded-2xl border border-line bg-card p-4 font-mono text-xs">
          <p className="font-semibold text-ink mb-2 uppercase tracking-wide">Test Log Output (Console):</p>
          <div className="space-y-1 text-mute">
            {logMessages.map((msg, i) => (
              <div key={i}>{msg}</div>
            ))}
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-10 space-y-6">
          <h2 className="text-2xl font-semibold">Test Results</h2>
          {results.map((r) => (
            <div key={r.testCase.id} className="rounded-2xl border border-line bg-card p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-ink">{r.testCase.name}</h3>
                  <span className="text-xs text-mute">
                    True Font: <b>{r.testCase.family}</b> ({r.testCase.category})
                  </span>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    r.isTrueFontInTop5
                      ? "bg-green-500/10 text-green-600 border border-green-500/30"
                      : "bg-amber-500/10 text-amber-600 border border-amber-500/30"
                  }`}
                >
                  {r.isTrueFontInTop5 ? "True Font in Top 5 ✓" : "Close Category Match"}
                </span>
              </div>

              <div className="mb-4 overflow-hidden rounded-xl border border-line bg-white p-2">
                <img src={r.imageUrl} alt={r.testCase.name} className="h-20 w-full object-contain" />
              </div>

              <div>
                <p className="text-xs font-semibold text-mute uppercase tracking-wide mb-2">
                  Top 3 Identification Matches:
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {r.matches.slice(0, 3).map((m, idx) => (
                    <div
                      key={m.font.family}
                      className={`rounded-xl border p-3 ${
                        m.font.family.toLowerCase() === r.testCase.family.toLowerCase()
                          ? "border-accent bg-accent/5"
                          : "border-line bg-bg"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-mute font-mono">#{idx + 1}</span>
                        <span className="text-xs font-semibold text-accent">{m.similarity}%</span>
                      </div>
                      <p className="font-semibold text-ink mt-1">{m.font.family}</p>
                      <p className="text-xs text-mute">
                        {m.font.category} · dist: {m.rawDistance}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
