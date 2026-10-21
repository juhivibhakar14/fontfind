import type { Font } from "@/lib/fonts/data";
import {
  extractImageFeatures,
  renderCandidateFeatures,
  computeFeatureDistance,
  getMatchLabel,
  estimateStyle,
  getFamilyPrefix,
  loadAndVerifyFonts,
  type FontFeatures,
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
  identify(image: Blob, candidates: Font[], options?: IdentifyOptions): Promise<IdentifyResult>;
}

import type { Worker } from "tesseract.js";

let sharedWorker: Worker | null = null;
let workerPromise: Promise<Worker> | null = null;
let isOcrBusy = false;

export async function terminateSharedWorker(): Promise<void> {
  if (sharedWorker) {
    try {
      await sharedWorker.terminate();
    } catch {
      // Ignore termination errors
    } finally {
      sharedWorker = null;
      workerPromise = null;
      isOcrBusy = false;
    }
  }
}

async function getSharedWorker(): Promise<Worker> {
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

export function preloadOcrWorker() {
  getSharedWorker().catch(() => {});
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

async function prepareImageForOcr(image: Blob): Promise<Blob> {
  let bmp: ImageBitmap | null = null;
  try {
    bmp = await createImageBitmap(image);
    const w = bmp.width;
    const h = bmp.height;
    if (w < 2 || h < 2) return image;

    const scale = Math.min(2, Math.max(1, 1200 / Math.max(w, h)));
    const targetW = Math.round(w * scale);
    const targetH = Math.round(h * scale);

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return image;

    ctx.drawImage(bmp, 0, 0, targetW, targetH);
    const imgData = ctx.getImageData(0, 0, targetW, targetH);
    const d = imgData.data;

    let borderLumSum = 0;
    let borderCount = 0;
    for (let y = 0; y < targetH; y += 4) {
      for (let x = 0; x < targetW; x += 4) {
        if (x < 10 || x >= targetW - 10 || y < 10 || y >= targetH - 10) {
          const idx = (y * targetW + x) * 4;
          const lum = 0.299 * d[idx] + 0.587 * d[idx + 1] + 0.114 * d[idx + 2];
          borderLumSum += lum;
          borderCount++;
        }
      }
    }
    const avgBorderLum = borderCount > 0 ? borderLumSum / borderCount : 255;
    const isDarkBg = avgBorderLum < 128;

    // If dark background, invert so text is dark on white for higher OCR accuracy
    if (isDarkBg) {
      for (let i = 0; i < d.length; i += 4) {
        d[i] = 255 - d[i];
        d[i + 1] = 255 - d[i + 1];
        d[i + 2] = 255 - d[i + 2];
      }
      ctx.putImageData(imgData, 0, 0);
    }

    return await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob ?? image), "image/png");
    });
  } catch {
    return image;
  } finally {
    bmp?.close();
  }
}

export const browserService: FontIdentifierService = {
  async identify(image, candidates, options = {}) {
    const { overrideText, allowFallbackText = true, onProgress, debug = false } = options;
    let text = overrideText?.trim() || "";
    let textSource: "manual" | "auto" | "fallback" = "manual";

    // Step 1: Run OCR if text was not manually provided
    if (!text) {
      if (!isOcrBusy) {
        isOcrBusy = true;
        try {
          const w = await getSharedWorker();
          const preparedBlob = await prepareImageForOcr(image);
          const { data } = await w.recognize(preparedBlob);
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

    // Step 2: Handle OCR failure gracefully with sample text fallback
    let needsTextPrompt = false;
    if (!text) {
      text = "Typography";
      textSource = "fallback";
      needsTextPrompt = false;
    }

    // Step 3: Extract typographic shape features from the cropped input image
    let bmp: ImageBitmap | null = null;
    let targetFeatures: FontFeatures;
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

    if (loaded.length < 5) {
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

    // TWO-STAGE RANKING
    // Stage 1: Filter and prioritize candidates by category & weight
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

    function getCandidateRenderWeight(font: Font, features: typeof targetFeatures): number {
      let targetW = 400;
      if (features.strokeThickness < 0.055 || features.density < 0.24) {
        targetW = 300;
      } else if (features.strokeThickness >= 0.13 || features.density >= 0.5) {
        targetW = 800;
      } else if (features.strokeThickness >= 0.09 || features.density >= 0.36) {
        targetW = 700;
      } else if (features.strokeThickness >= 0.075 || features.density >= 0.3) {
        targetW = 500;
      } else {
        targetW = 400;
      }

      let closest = font.weights[0] || 400;
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

    const stage1Candidates = verifiedPool.filter((f) => matchCategory(f));
    const candidatesStage1Count =
      stage1Candidates.length > 0 ? stage1Candidates.length : verifiedPool.length;

    // Stage 2: Rank candidates by typographic feature distance with category affinity
    const scored = verifiedPool
      .map((font) => {
        const weight = getCandidateRenderWeight(font, targetFeatures);
        const candidateFeatures = renderCandidateFeatures(
          text,
          font.family,
          font.fallback,
          targetFeatures.boxHeight,
          weight,
        );
        const { distance: rawD, secondary } = computeFeatureDistance(
          targetFeatures,
          candidateFeatures,
        );
        const safeRawD = Number.isFinite(rawD) ? rawD : Infinity;
        const safeSec = Number.isFinite(secondary) ? secondary : Infinity;

        // Apply category affinity adjustment to prioritize classified style while keeping closest letterforms
        const isCat = matchCategory(font);
        let categoryAdjustment = 0;
        if (!isCat) {
          const isFontScript = font.category === "Script" || font.category === "Handwriting";
          const isTargetScript = styleEstimate.category === "Script/Handwriting";
          if (isFontScript && !isTargetScript) {
            // Strong penalty: prevent cursive/script fonts from appearing for standard text
            categoryAdjustment = 1.5;
          } else if (!isFontScript && isTargetScript) {
            categoryAdjustment = 0.5;
          } else if (styleEstimate.category === "Serif" && font.category === "Sans Serif") {
            categoryAdjustment = 0.12;
          } else if (styleEstimate.category === "Sans Serif" && font.category === "Serif") {
            categoryAdjustment = 0.12;
          } else {
            categoryAdjustment = styleEstimate.categoryConfidence === "high" ? 0.08 : 0.04;
          }
        }
        const finalD = safeRawD + categoryAdjustment;

        return {
          font,
          rawD: safeRawD,
          d: finalD,
          secondary: safeSec,
          weight,
          matchLabel: getMatchLabel(safeRawD),
        };
      })
      .filter((item) => Number.isFinite(item.d) && item.d < 100)
      .sort((a, b) => {
        if (Math.abs(a.d - b.d) < 1e-5) {
          if (Math.abs(a.secondary - b.secondary) < 1e-5) return 0;
          return a.secondary < b.secondary ? -1 : 1;
        }
        return a.d - b.d;
      });

    if (!scored.length) {
      throw new Error("No candidate fonts could be compared.");
    }

    // Prioritize candidates matching the classified style
    const isTargetScript = styleEstimate.category === "Script/Handwriting";
    const categoryScored = scored.filter((item) => matchCategory(item.font));
    const nonCategoryScored = isTargetScript
      ? scored.filter((item) => !matchCategory(item.font))
      : scored.filter(
          (item) =>
            !matchCategory(item.font) &&
            item.font.category !== "Script" &&
            item.font.category !== "Handwriting",
        );

    // Candidates ordered with matching category first so top 3 always match classified style
    const candidateOrder = [...categoryScored, ...nonCategoryScored];

    // Diversity: Ensure no near-duplicate family prefixes in top matches
    const seenRoots = new Set<string>();
    const diverseMatches: typeof scored = [];

    for (const item of candidateOrder) {
      const root = getFamilyPrefix(item.font.family);
      if (!seenRoots.has(root)) {
        seenRoots.add(root);
        diverseMatches.push(item);
      }
      if (diverseMatches.length >= 9) break;
    }

    // Fill remaining if diversity filter was overly aggressive
    if (diverseMatches.length < 9) {
      for (const item of candidateOrder) {
        if (!diverseMatches.includes(item)) {
          diverseMatches.push(item);
        }
        if (diverseMatches.length >= 9) break;
      }
    }

    const toMatch = (item: (typeof scored)[0]): FontMatch => ({
      font: item.font,
      matchLabel: item.matchLabel,
      rawDistance: Number(item.rawD.toFixed(4)),
      secondaryDistance: Number(item.secondary.toFixed(4)),
      style:
        item.weight >= 800
          ? "Black"
          : item.weight >= 700
            ? "Bold"
            : item.weight >= 600
              ? "SemiBold"
              : item.weight <= 300
                ? "Light"
                : "Regular",
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
        `[TypeMatcher Debug] Stage 1 Filter: ${candidatesStage1Count} of ${loaded.length} candidates retained`,
      );
      console.log(
        `[TypeMatcher Debug] Displayed Order Ascending Check: ${isOrderAscending ? "PASS ✓" : "FAIL ⚠️"}`,
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
