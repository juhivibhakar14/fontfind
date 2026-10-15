import type { Font } from "@/lib/fonts/data";
import {
  extractImageFeatures,
  renderCandidateFeatures,
  computeFeatureDistance,
  computeAbsoluteSimilarity,
  loadAndVerifyFonts,
} from "@/lib/imageProcessing";

export interface FontMatch {
  font: Font;
  similarity: number;
  rawDistance: number;
  style: string;
  weight: number;
}

export interface DebugInfo {
  ocrText: string;
  textSource: "manual" | "auto" | "fallback";
  candidatesTotal: number;
  candidatesLoaded: number;
  top10: Array<{ family: string; distance: number; similarity: number }>;
}

export interface IdentifyResult {
  matches: FontMatch[];
  similar: FontMatch[];
  isMock: boolean;
  text?: string;
  textSource?: "manual" | "auto" | "fallback";
  needsTextPrompt?: boolean;
  isWeakMatch?: boolean;
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
    // If OCR failed and user hasn't confirmed text, prompt unless fallback is explicitly permitted
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

    // Step 3: Extract typographic shape features from the cropped input text
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

    // Step 4: Use candidate pool of up to 300 fonts
    const pool = candidates.slice(0, 300);
    const { loaded, failed } = await loadAndVerifyFonts(pool, text, onProgress);

    // If fewer than 20 fonts loaded successfully, halt and alert user
    if (loaded.length < 20) {
      return {
        matches: [],
        similar: [],
        isMock: false,
        text,
        textSource,
        error: "Fonts could not be loaded. Check your connection.",
        unloadedCount: failed.length,
      };
    }

    // Only compare candidate fonts verified to render their distinct web glyphs
    const activeCandidates = pool.filter((f) => loaded.includes(f.family));

    // Step 5: Render confirmed text in each verified candidate font at matching height
    const scored = activeCandidates
      .map((font) => {
        const candidateFeatures = renderCandidateFeatures(
          text,
          font.family,
          font.fallback,
          targetFeatures.boxHeight
        );
        const { distance: d, secondary } = computeFeatureDistance(targetFeatures, candidateFeatures);
        return {
          font,
          d,
          secondary,
          similarity: computeAbsoluteSimilarity(d),
        };
      })
      .sort((a, b) => {
        // Tie-breaker: never preserve original list order on exact/near ties
        if (Math.abs(a.d - b.d) < 1e-5) {
          return a.secondary - b.secondary;
        }
        return a.d - b.d;
      });

    if (!scored.length) {
      throw new Error("No candidate fonts could be compared.");
    }

    const bestDistance = scored[0].d;
    const isWeakMatch = bestDistance > 0.40;

    const toMatch = (item: (typeof scored)[0]): FontMatch => ({
      font: item.font,
      similarity: item.similarity,
      rawDistance: Number(item.d.toFixed(4)),
      style: "Regular",
      weight: 400,
    });

    const top10Debug = scored.slice(0, 10).map((s) => ({
      family: s.font.family,
      distance: Number(s.d.toFixed(4)),
      similarity: s.similarity,
    }));

    const debugInfo: DebugInfo = {
      ocrText: text,
      textSource,
      candidatesTotal: pool.length,
      candidatesLoaded: loaded.length,
      top10: top10Debug,
    };

    if (debug) {
      console.log(`[FontFind Debug] OCR Text: "${text}" (${textSource})`);
      console.log(`[FontFind Debug] Candidates: ${pool.length} tested, ${loaded.length} loaded`);
      console.log("[FontFind Debug] Top 10 matches (raw distance):");
      console.table(top10Debug);
    }

    return {
      isMock: false,
      text,
      textSource,
      isWeakMatch,
      matches: scored.slice(0, 3).map(toMatch),
      similar: scored.slice(3, 9).map(toMatch),
      unloadedCount: failed.length,
      debug: debugInfo,
    };
  },
};

export const fontIdentifierService: FontIdentifierService = browserService;
