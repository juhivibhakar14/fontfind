"use client";

import { useState } from "react";
import Link from "next/link";
import { FONTS } from "@/lib/fonts/data";
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
    text: "ELEGANT LIGHT",
    fontString: '300 64px "Raleway", sans-serif',
  },
  {
    id: "regular-sans",
    name: "3. Regular Sans-Serif",
    family: "Inter",
    category: "Sans Serif",
    weight: 400,
    text: "CLEAN INTERFACE",
    fontString: '400 64px "Inter", sans-serif',
  },
  {
    id: "serif-contrast",
    name: "4. High-Contrast Serif",
    family: "Playfair Display",
    category: "Serif",
    weight: 400,
    text: "EDITORIAL SERIF",
    fontString: '400 64px "Playfair Display", serif',
  },
  {
    id: "slab-serif",
    name: "5. Bold Slab Serif",
    family: "Bitter",
    category: "Serif",
    weight: 700,
    text: "SLAB HEADLINE",
    fontString: 'bold 64px "Bitter", serif',
  },
  {
    id: "monospace",
    name: "6. Fixed-Pitch Monospace",
    family: "Space Mono",
    category: "Monospace",
    weight: 400,
    text: "TERMINAL_CODE",
    fontString: '400 64px "Space Mono", monospace',
  },
  {
    id: "script",
    name: "7. Flowing Script",
    family: "Pacifico",
    category: "Script",
    weight: 400,
    text: "Handcrafted",
    fontString: '400 64px "Pacifico", cursive',
  },
  {
    id: "condensed-display",
    name: "8. Condensed Display",
    family: "Bebas Neue",
    category: "Display",
    weight: 400,
    text: "POSTER IMPACT",
    fontString: '400 64px "Bebas Neue", sans-serif',
  },
];

interface TestResult {
  testCase: TestCase;
  imageUrl: string;
  estimatedStyle: string;
  matches: FontMatch[];
  top5Categories: string[];
  allTop5CorrectCategory: boolean;
  top3Families: string[];
  distancesNonDecreasing: boolean;
  labelsNeverStronger: boolean;
  isTrueFontInTop5: boolean;
}

function isCategoryMatch(expectedCat: string, candidateCat: string): boolean {
  if (expectedCat === "Script" || expectedCat === "Handwriting") {
    return candidateCat === "Script" || candidateCat === "Handwriting";
  }
  if (expectedCat === "Display") {
    return candidateCat === "Display" || candidateCat === "Sans Serif";
  }
  return expectedCat.toLowerCase() === candidateCat.toLowerCase();
}

export default function TestFontsClient() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [allUniqueTop3, setAllUniqueTop3] = useState<boolean | null>(null);

  // Pre-load all test fonts into document
  const testFonts = TEST_CASES.map((tc) => FONTS.find((f) => f.family === tc.family)!).filter(Boolean);
  useGoogleFonts(testFonts);

  const runSuite = async () => {
    setRunning(true);
    setResults([]);
    setAllUniqueTop3(null);
    const logs: string[] = [];
    const addLog = (msg: string) => {
      logs.push(msg);
      setLogMessages([...logs]);
      console.log(`[TestFonts] ${msg}`);
    };

    addLog("Starting 8-image font style matching verification test suite...");

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

      // Run style identification
      const res = await fontIdentifierService.identify(blob, FONTS, {
        overrideText: tc.text,
        debug: true,
      });

      const allMatches = [...res.matches, ...res.similar];

      // Verification Check (1): Distances are non-decreasing in displayed order
      let distancesNonDecreasing = true;
      for (let i = 1; i < allMatches.length; i++) {
        if (allMatches[i].rawDistance < allMatches[i - 1].rawDistance - 1e-4) {
          distancesNonDecreasing = false;
          break;
        }
      }

      // Verification Check (2): Match labels never get stronger down the list
      const labelScore = (l: string) => (l === "Strong match" ? 3 : l === "Good match" ? 2 : 1);
      let labelsNeverStronger = true;
      for (let i = 1; i < allMatches.length; i++) {
        if (labelScore(allMatches[i].matchLabel) > labelScore(allMatches[i - 1].matchLabel)) {
          labelsNeverStronger = false;
          break;
        }
      }

      // Verification Check (3): True font appears in the top 5
      const top5 = allMatches.slice(0, 5);
      const isTrueFontInTop5 = top5.some(
        (m) =>
          m.font.family.toLowerCase() === tc.family.toLowerCase() ||
          m.font.family.toLowerCase().startsWith(tc.family.toLowerCase())
      );

      const top5Categories = top5.map((m) => m.font.category);
      const allTop5CorrectCategory = top5.every((m) => isCategoryMatch(tc.category, m.font.category));
      const top3Families = res.matches.map((m) => m.font.family);
      const estimatedStyle = res.styleEstimate?.summary || "unknown";

      addLog(
        `[Result] ${tc.name}: Estimated: "${estimatedStyle}". Matches: ${top3Families.join(", ")}`
      );
      addLog(
        `[Verification] (1) Distances non-decreasing: ${distancesNonDecreasing ? "PASS ✓" : "FAIL ✗"} | ` +
        `(2) Labels monotonic: ${labelsNeverStronger ? "PASS ✓" : "FAIL ✗"} | ` +
        `(3) True font in Top 5: ${isTrueFontInTop5 ? `PASS (${tc.family}) ✓` : `FAIL (${tc.family}) ✗`}`
      );

      suiteResults.push({
        testCase: tc,
        imageUrl,
        estimatedStyle,
        matches: allMatches,
        top5Categories,
        allTop5CorrectCategory,
        top3Families,
        distancesNonDecreasing,
        labelsNeverStronger,
        isTrueFontInTop5,
      });
    }

    // Check if different test images produced different top-3 results
    const top3Keys = suiteResults.map((r) => r.top3Families.join(" > "));
    const uniqueTop3Count = new Set(top3Keys).size;
    const isDistinct = uniqueTop3Count === suiteResults.length;
    setAllUniqueTop3(isDistinct);

    addLog(
      `Diversity Verification: ${uniqueTop3Count} distinct top-3 lists out of ${suiteResults.length} test images. ${
        isDistinct ? "ALL TOP-3 LISTS ARE VISIBLY DISTINCT! ✓" : "Some lists matched."
      }`
    );

    console.table(
      suiteResults.map((r) => ({
        TestCase: r.testCase.name,
        TrueFont: r.testCase.family,
        "(1) Distances Non-Decreasing": r.distancesNonDecreasing ? "PASS ✓" : "FAIL ✗",
        "(2) Labels Monotonic": r.labelsNeverStronger ? "PASS ✓" : "FAIL ✗",
        "(3) True Font in Top 5": r.isTrueFontInTop5 ? "PASS ✓" : "FAIL ✗",
        EstimatedStyle: r.estimatedStyle,
        Top1Match: r.matches[0]?.font.family,
        MatchLabel: r.matches[0]?.matchLabel,
        Distance: r.matches[0]?.rawDistance,
      }))
    );

    setResults(suiteResults);
    setRunning(false);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Link href="/" className="text-sm text-mute hover:text-ink">
        ← Back to TypeMatcher
      </Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-semibold">Font Style Matching Test Suite</h1>
          <p className="mt-2 text-mute text-sm max-w-2xl">
            Renders 8 distinct test images across typographic categories (Sans, Serif, Monospace, Script, Display)
            and weights (Thin, Regular, Bold). Validates style classification, category accuracy for the top 5 candidates,
            and confirms that different images produce different top-3 matches.
          </p>
        </div>
        <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
          Dev Only (404 in Prod)
        </span>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={runSuite}
          disabled={running}
          className="rounded-xl bg-accent px-6 py-2.5 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {running ? "Running 8 Test Cases…" : "Run 8-Image Test Suite"}
        </button>
      </div>

      {allUniqueTop3 !== null && (
        <div
          role="status"
          className={`mt-6 rounded-2xl border p-4 ${
            allUniqueTop3
              ? "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
              : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
          }`}
        >
          <p className="font-semibold text-sm">
            {allUniqueTop3
              ? "✓ Diversity Test Passed: All 8 test images produced visibly different top-3 match lists."
              : "⚠ Some test images produced overlapping top-3 lists."}
          </p>
        </div>
      )}

      {logMessages.length > 0 && (
        <div className="mt-8 rounded-2xl border border-line bg-card p-4 font-mono text-xs">
          <p className="font-semibold text-ink mb-2 uppercase tracking-wide">Test Output Log:</p>
          <div className="space-y-1 text-mute max-h-64 overflow-y-auto">
            {logMessages.map((msg, i) => (
              <div key={i}>{msg}</div>
            ))}
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-10 space-y-6">
          <h2 className="text-2xl font-semibold">Test Results (8 Categories &amp; Weights)</h2>
          {results.map((r) => (
            <div key={r.testCase.id} className="rounded-2xl border border-line bg-card p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-ink">{r.testCase.name}</h3>
                  <p className="text-xs text-mute mt-0.5">
                    Rendered with: <b>{r.testCase.family}</b> ({r.testCase.category}, weight {r.testCase.weight}) ·
                    Estimated style: <b className="text-ink capitalize">{r.estimatedStyle}</b>
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    r.allTop5CorrectCategory
                      ? "bg-green-500/10 text-green-600 border border-green-500/30"
                      : "bg-amber-500/10 text-amber-600 border border-amber-500/30"
                  }`}
                >
                  {r.allTop5CorrectCategory
                    ? "Top 5 in Correct Category ✓"
                    : `Partial Category Match (${r.matches.slice(0, 5).filter((m) => isCategoryMatch(r.testCase.category, m.font.category)).length}/5)`}
                </span>
              </div>

              <div className="mb-4 overflow-hidden rounded-xl border border-line bg-white p-2">
                <img src={r.imageUrl} alt={r.testCase.name} className="h-16 w-full object-contain" />
              </div>

              <div className="mb-4 flex flex-wrap gap-2 text-xs">
                <span
                  className={`rounded-md px-2.5 py-1 font-mono font-medium ${
                    r.distancesNonDecreasing
                      ? "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20"
                      : "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20"
                  }`}
                >
                  (1) Non-Decreasing Distances: {r.distancesNonDecreasing ? "PASS ✓" : "FAIL ✗"}
                </span>
                <span
                  className={`rounded-md px-2.5 py-1 font-mono font-medium ${
                    r.labelsNeverStronger
                      ? "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20"
                      : "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20"
                  }`}
                >
                  (2) Monotonic Labels: {r.labelsNeverStronger ? "PASS ✓" : "FAIL ✗"}
                </span>
                <span
                  className={`rounded-md px-2.5 py-1 font-mono font-medium ${
                    r.isTrueFontInTop5
                      ? "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20"
                      : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                  }`}
                >
                  (3) True Font in Top 5: {r.isTrueFontInTop5 ? `PASS (${r.testCase.family}) ✓` : `FAIL ✗`}
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold text-mute uppercase tracking-wide mb-2">
                  Top 3 Closest Style Matches:
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
                        <span className="text-xs font-semibold text-accent">{m.matchLabel}</span>
                      </div>
                      <p className="font-semibold text-ink mt-1">{m.font.family}</p>
                      <p className="text-xs text-mute">
                        {m.font.category} · dist: {m.rawDistance.toFixed(4)}
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
