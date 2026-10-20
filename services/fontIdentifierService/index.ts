import type { Font } from "@/lib/fonts/data";
import {
  extractImageFeatures,
  renderCandidateFeatures,
  computeFeatureDistance,
  getMatchLabel,
  estimateStyle,
  getFamilyPrefix,
  loadAndVerifyFonts,
  type StyleEstimate,
  type MatchLabel,
  type WeightClass,
} from "@/lib/imageProcessing";

export interface FontMatch {
  font: Font;
  matchLabel: MatchLabel;
  rawDistance: number;
  secondaryDistance?: number;
  style: string;
  weight: number;
}

export interface DebugInfo {
  ocrText: string;
  textSource: "manual" | "auto" | "fallback";
  candidatesTotal: number;
  candidatesLoaded: number;
  candidatesStage1Count: number;
  estimatedCategory: string;
  estimatedWeight: string;
  estimatedWidth: string;
  styleSummary: string;
  isOrderAscending: boolean;
  top10: Array<{ family: string; distance: number; secondary: number; label: MatchLabel }>;
}

export interface IdentifyResult {
  matches: FontMatch[];
  similar: FontMatch[];
  isMock: boolean;
  text?: string;
  textSource?: "manual" | "auto" | "fallback";
  styleEstimate?: StyleEstimate;
  needsTextPrompt?: boolean;
  unloadedCount?: number;
  error?: string;
  debug?: DebugInfo;
}

export interface IdentifyOptions {
  overrideText?: string;
  allowFallbackText?: boolean;
  onProgress?: (loaded: number, total: number) => void;
  debug?: boolean;
}

export interface FontIdentifierService {
  identify(
    image: Blob,
    candidates: Font[],
    options?: IdentifyOptions
  ): Promise<IdentifyResult>;
}

let sharedWorker: any = null;
let workerPromise: Promise<any> | null = null;
let isOcrBusy = false;

async function getSharedWorker() {
  if (sharedWorker) return sharedWorker;
  if (!workerPromise) {
    workerPromise = (async () => {
      try {
        const { createWorker } = await import("tesseract.js");
        const w = await createWorker("eng");
        sharedWorker = w;
        return w;
      } catch (err) {
        workerPromise = null;
        sharedWorker = null;
        throw err;
      }
    })();
  }
  return workerPromise;
}

function fontSupportsWeight(font: Font, allowedWeights: WeightClass[]): boolean {
  for (const w of font.weights) {
    if (w <= 300 && allowedWeights.includes("Thin")) return true;
    if ((w === 400 || w === 500) && allowedWeights.includes("Regular")) return true;
    if ((w === 600 || w === 700) && allowedWeights.includes("Bold")) return true;
    if (w >= 800 && allowedWeights.includes("Black")) return true;
  }
  return false;
}

export const browserService: FontIdentifierService = {
  async identify(image, candidates, options = {}) {
    const { overrideText, allowFallbackText = false, onProgress, debug = false } = options;
    let text = overrideText?.trim() || "";
    let textSource: "manual" | "auto" | "fallback" = "manual";

    // Step 1: Run OCR if text was not manually provided
    if (!text) {
      if (!isOcrBusy) {
        isOcrBusy = true;
        try {
          const w = await getSharedWorker();
          const { data } = await w.recognize(image);
          const cleaned = data.text
            .replace(/[^a-zA-Z0-9 ]/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 30);
          if (cleaned.length >= 2) {
            text = cleaned;
            textSource = "auto";
          }
        } catch (err) {
          console.warn("OCR recognition error:", err);
        } finally {
          isOcrBusy = false;
        }
      }
    }

    // Step 2: Handle OCR failure explicitly
    if (!text) {
      if (allowFallbackText) {
        text = "Typography";
        textSource = "fallback";
      } else {
        return {
          matches: [],
          similar: [],
          isMock: false,
          text: "",
          needsTextPrompt: true,
        };
      }
    }

    // Step 3: Extract typographic shape features from the cropped input image
    let bmp: ImageBitmap | null = null;
    let targetFeatures;
    try {
      bmp = await createImageBitmap(image);
      targetFeatures = extractImageFeatures(bmp, bmp.width, bmp.height);
    } finally {
      bmp?.close();
    }

    if (targetFeatures.isEmpty) {
      return {
        matches: [],
        similar: [],
        isMock: false,
        text,
        textSource,
        needsTextPrompt: true,
      };
    }

    // 1) Style classification
    const styleEstimate = estimateStyle(targetFeatures, text.length);

    // Candidate pool up to 300
    const pool = candidates.slice(0, 300);
    const { loaded, failed } = await loadAndVerifyFonts(pool, text, onProgress);

    if (loaded.length < 20) {
      return {
        matches: [],
        similar: [],
        isMock: false,
        text,
        textSource,
        styleEstimate,
        error: "Fonts could not be loaded. Check your connection.",
        unloadedCount: failed.length,
      };
    }

    const verifiedPool = pool.filter((f) => loaded.includes(f.family));

    // 2) TWO-STAGE RANKING
    // Stage 1: Filter candidates by category and weight class within 1 step
    const matchCategory = (f: Font): boolean => {
      const cat = f.category;
      if (styleEstimate.allowedCategories.includes(cat)) return true;
      if (
        (styleEstimate.allowedCategories.includes("Script/Handwriting") ||
          styleEstimate.allowedCategories.includes("Script") ||
          styleEstimate.allowedCategories.includes("Handwriting")) &&
        (cat === "Script" || cat === "Handwriting")
      ) {
        return true;
      }
      return false;
    };

    let stage1Candidates = verifiedPool.filter(
      (f) => matchCategory(f) && fontSupportsWeight(f, styleEstimate.allowedWeights)
    );

    // If too restrictive (< 5 candidates), loosen weight filter within the SAME matching category first
    if (stage1Candidates.length < 5) {
      stage1Candidates = verifiedPool.filter((f) => matchCategory(f));
    }
    // Only if the matching category itself has fewer than 3 verified candidates, allow all verified fonts
    if (stage1Candidates.length < 3) {
      stage1Candidates = verifiedPool;
    }

function getCandidateRenderWeight(font: Font, targetWeight: WeightClass): number {
  const targetW =
    targetWeight === "Thin"
      ? 300
      : targetWeight === "Bold"
      ? 700
      : targetWeight === "Black"
      ? 800
      : 400;

  let closest = 400;
  let minDiff = 9999;
  for (const w of font.weights) {
    const diff = Math.abs(w - targetW);
    if (diff < minDiff) {
      minDiff = diff;
      closest = w;
    }
  }
  return closest;
}

    const candidatesStage1Count = stage1Candidates.length;

    // Stage 2: Rank remaining candidates by weighted feature distance
    const scored = stage1Candidates
      .map((font) => {
        const weight = getCandidateRenderWeight(font, styleEstimate.weightClass);
        const candidateFeatures = renderCandidateFeatures(
          text,
          font.family,
          font.fallback,
          targetFeatures.boxHeight,
          weight
        );
        const { distance: d, secondary } = computeFeatureDistance(
          targetFeatures,
          candidateFeatures
        );
        const safeD = Number.isFinite(d) ? d : Infinity;
        const safeSec = Number.isFinite(secondary) ? secondary : Infinity;
        return {
          font,
          d: safeD,
          secondary: safeSec,
          weight,
          matchLabel: getMatchLabel(safeD),
        };
      })
      .filter((item) => Number.isFinite(item.d) && item.d < 100)
      .sort((a, b) => {
        // Break ties with secondary feature distance ascending, never list order
        if (Math.abs(a.d - b.d) < 1e-5) {
          if (Math.abs(a.secondary - b.secondary) < 1e-5) return 0;
          return a.secondary < b.secondary ? -1 : 1;
        }
        return a.d - b.d;
      });

    if (!scored.length) {
      throw new Error("No candidate fonts could be compared.");
    }

    // Diversity: Ensure no near-duplicate family prefixes in top matches
    const seenRoots = new Set<string>();
    const diverseMatches: typeof scored = [];

    for (const item of scored) {
      const root = getFamilyPrefix(item.font.family);
      if (!seenRoots.has(root)) {
        seenRoots.add(root);
        diverseMatches.push(item);
      }
      if (diverseMatches.length >= 9) break;
    }

    // Fill remaining if diversity filter was overly aggressive
    if (diverseMatches.length < 9) {
      for (const item of scored) {
        if (!diverseMatches.includes(item)) {
          diverseMatches.push(item);
        }
        if (diverseMatches.length >= 9) break;
      }
    }

    // Ensure diverseMatches is sorted strictly ascending by distance
    diverseMatches.sort((a, b) => {
      if (Math.abs(a.d - b.d) < 1e-5) {
        if (Math.abs(a.secondary - b.secondary) < 1e-5) return 0;
        return a.secondary < b.secondary ? -1 : 1;
      }
      return a.d - b.d;
    });

    const toMatch = (item: (typeof scored)[0]): FontMatch => ({
      font: item.font,
      matchLabel: item.matchLabel,
      rawDistance: Number(item.d.toFixed(4)),
      secondaryDistance: Number(item.secondary.toFixed(4)),
      style: "Regular",
      weight: item.weight,
    });

    const topMatches = diverseMatches.slice(0, 3).map(toMatch);
    const similarMatches = diverseMatches.slice(3, 9).map(toMatch);

    const displayedMatches = diverseMatches.slice(0, 10);
    const top10Debug = displayedMatches.map((s) => ({
      family: s.font.family,
      distance: Number(s.d.toFixed(4)),
      secondary: Number(s.secondary.toFixed(4)),
      label: s.matchLabel,
    }));

    let isOrderAscending = true;
    for (let i = 1; i < top10Debug.length; i++) {
      if (top10Debug[i].distance < top10Debug[i - 1].distance - 1e-4) {
        isOrderAscending = false;
        break;
      }
    }

    const debugInfo: DebugInfo = {
      ocrText: text,
      textSource,
      candidatesTotal: pool.length,
      candidatesLoaded: loaded.length,
      candidatesStage1Count,
      estimatedCategory: styleEstimate.category,
      estimatedWeight: styleEstimate.weightClass,
      estimatedWidth: styleEstimate.widthClass,
      styleSummary: styleEstimate.summary,
      isOrderAscending,
      top10: top10Debug,
    };

    if (debug) {
      console.log(`[TypeMatcher Debug] OCR Text: "${text}" (${textSource})`);
      console.log(`[TypeMatcher Debug] Estimated Style: ${styleEstimate.summary}`);
      console.log(
        `[TypeMatcher Debug] Stage 1 Filter: ${candidatesStage1Count} of ${loaded.length} candidates retained`
      );
      console.log(
        `[TypeMatcher Debug] Displayed Order Ascending Check: ${isOrderAscending ? "PASS ✓" : "FAIL ⚠️"}`
      );
      console.log("[TypeMatcher Debug] Top 10 Ranked Candidates (Displayed Order):");
      console.table(top10Debug);
    }

    return {
      isMock: false,
      text,
      textSource,
      styleEstimate,
      matches: topMatches,
      similar: similarMatches,
      unloadedCount: failed.length,
      debug: debugInfo,
    };
  },
};

export const fontIdentifierService: FontIdentifierService = browserService;
