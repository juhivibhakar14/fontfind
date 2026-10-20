import type { Font } from "@/lib/fonts/data";

export interface FontFeatures {
  aspect: number;
  density: number;
  strokeThickness: number;
  hProfile: Float32Array;
  vProfile: Float32Array;
  serifScore: number;
  xHeightRatio: number;
  isEmpty: boolean;
  boxWidth: number;
  boxHeight: number;
}

export type EstimatedCategory =
  | "Sans Serif"
  | "Serif"
  | "Monospace"
  | "Script/Handwriting"
  | "Display";

export type WeightClass = "Thin" | "Regular" | "Bold" | "Black";
export type WidthClass = "Condensed" | "Normal" | "Wide";
export type MatchLabel = "Strong match" | "Good match" | "Weak match";

export interface StyleEstimate {
  category: EstimatedCategory;
  categoryConfidence: "high" | "low";
  allowedCategories: string[];
  weightClass: WeightClass;
  allowedWeights: WeightClass[];
  widthClass: WidthClass;
  summary: string;
}

export const MATCH_THRESHOLDS = {
  strong: 0.18,
  good: 0.35,
};

export function getMatchLabel(distance: number): MatchLabel {
  if (!Number.isFinite(distance)) return "Weak match";
  if (distance <= MATCH_THRESHOLDS.strong) return "Strong match";
  if (distance <= MATCH_THRESHOLDS.good) return "Good match";
  return "Weak match";
}

export const FEATURE_WEIGHTS = {
  aspect: 0.22,
  density: 0.18,
  strokeThickness: 0.16,
  hProfile: 0.18,
  vProfile: 0.14,
  serif: 0.08,
  xHeight: 0.04,
};

const H_POINTS = 64;
const V_POINTS = 32;

/**
 * Computes optimal global threshold using Otsu's method.
 */
export function computeOtsuThreshold(L: Float32Array): number {
  const hist = new Int32Array(256);
  const total = L.length;
  for (let i = 0; i < total; i++) {
    const v = Math.min(255, Math.max(0, Math.round(L[i])));
    hist[v]++;
  }

  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * hist[i];

  let sumB = 0;
  let wB = 0;
  let maxVar = 0;
  let threshold = 128;

  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (wB === 0) continue;
    const wF = total - wB;
    if (wF === 0) break;

    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const betweenVar = wB * wF * (mB - mF) * (mB - mF);

    if (betweenVar > maxVar) {
      maxVar = betweenVar;
      threshold = t;
    }
  }
  return threshold;
}

function blur1D(arr: Float32Array): Float32Array {
  const n = arr.length;
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const prev = i > 0 ? arr[i - 1] : arr[i];
    const next = i < n - 1 ? arr[i + 1] : arr[i];
    out[i] = prev * 0.25 + arr[i] * 0.5 + next * 0.25;
  }
  return out;
}

function resampleProfile(src: number[] | Float32Array, targetLen: number): Float32Array {
  const n = src.length;
  const out = new Float32Array(targetLen);
  if (n === 0) return out;
  if (n === 1) {
    out.fill(src[0]);
    return out;
  }

  for (let i = 0; i < targetLen; i++) {
    const pos = (i / (targetLen - 1)) * (n - 1);
    const low = Math.floor(pos);
    const high = Math.min(n - 1, low + 1);
    const frac = pos - low;
    out[i] = (1 - frac) * src[low] + frac * src[high];
  }
  return blur1D(out);
}

/**
 * Extracts typographic features from a binary mask (1 = ink, 0 = background).
 */
export function extractFeaturesFromMask(
  mask: Uint8Array,
  bw: number,
  bh: number
): FontFeatures {
  const emptyFeatures: FontFeatures = {
    aspect: 1,
    density: 0,
    strokeThickness: 0,
    hProfile: new Float32Array(H_POINTS),
    vProfile: new Float32Array(V_POINTS),
    serifScore: 0,
    xHeightRatio: 0.5,
    isEmpty: true,
    boxWidth: bw,
    boxHeight: bh,
  };

  if (bw < 2 || bh < 2) return emptyFeatures;

  const rawColInk = new Float32Array(bw);
  const rawRowInk = new Float32Array(bh);
  let totalInk = 0;
  let edgePixels = 0;

  let topTerminals = 0;
  let botTerminals = 0;

  for (let y = 0; y < bh; y++) {
    for (let x = 0; x < bw; x++) {
      const idx = y * bw + x;
      if (mask[idx] === 1) {
        totalInk++;
        rawColInk[x]++;
        rawRowInk[y]++;

        const isEdge =
          x === 0 ||
          x === bw - 1 ||
          y === 0 ||
          y === bh - 1 ||
          mask[idx - 1] === 0 ||
          mask[idx + 1] === 0 ||
          mask[idx - bw] === 0 ||
          mask[idx + bw] === 0;

        if (isEdge) {
          edgePixels++;
        }

        if (y < bh * 0.18) {
          if (x > 0 && x < bw - 1 && mask[idx - 1] === 1 && mask[idx + 1] === 1) {
            topTerminals++;
          }
        }
        if (y > bh * 0.82) {
          if (x > 0 && x < bw - 1 && mask[idx - 1] === 1 && mask[idx + 1] === 1) {
            botTerminals++;
          }
        }
      }
    }
  }

  if (totalInk < 15) return emptyFeatures;

  for (let x = 0; x < bw; x++) rawColInk[x] /= bh;
  for (let y = 0; y < bh; y++) rawRowInk[y] /= bw;

  const hProfile = resampleProfile(rawColInk, H_POINTS);
  const vProfile = resampleProfile(rawRowInk, V_POINTS);

  const aspect = bw / Math.max(1, bh);
  const density = totalInk / Math.max(1, bw * bh);
  const strokeThickness = totalInk / Math.max(1, edgePixels);
  const serifScore = Math.min(1, (topTerminals + botTerminals) / Math.max(1, totalInk * 0.3));

  let xHeightY = Math.round(bh * 0.4);
  let maxGrad = 0;
  for (let y = Math.round(bh * 0.2); y < Math.round(bh * 0.65); y++) {
    const grad = Math.abs(rawRowInk[y] - rawRowInk[Math.min(bh - 1, y + 2)]);
    if (grad > maxGrad) {
      maxGrad = grad;
      xHeightY = y;
    }
  }
  const xHeightRatio = Math.max(0.3, Math.min(0.85, 1 - xHeightY / Math.max(1, bh)));

  return {
    aspect,
    density,
    strokeThickness,
    hProfile,
    vProfile,
    serifScore,
    xHeightRatio,
    isEmpty: false,
    boxWidth: bw,
    boxHeight: bh,
  };
}

function analyzeHProfile(hProfile: Float32Array): {
  minValley: number;
  valleysCount: number;
  peakPeriodStdDev: number;
} {
  const n = hProfile.length;
  let minValley = 1.0;
  let valleysCount = 0;
  const peaks: number[] = [];

  for (let i = 2; i < n - 2; i++) {
    const val = hProfile[i];
    if (val < minValley) minValley = val;
    if (val < 0.05) valleysCount++;

    if (
      val > 0.12 &&
      val >= hProfile[i - 1] &&
      val >= hProfile[i + 1] &&
      val > hProfile[i - 2] &&
      val > hProfile[i + 2]
    ) {
      peaks.push(i);
    }
  }

  let peakPeriodStdDev = 999;
  if (peaks.length >= 3) {
    const diffs: number[] = [];
    for (let i = 1; i < peaks.length; i++) {
      diffs.push(peaks[i] - peaks[i - 1]);
    }
    const mean = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    const variance = diffs.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / diffs.length;
    peakPeriodStdDev = Math.sqrt(variance);
  }

  return { minValley, valleysCount, peakPeriodStdDev };
}

/**
 * Estimates typographic style (category, weight class, width class) from image features.
 */
export function estimateStyle(features: FontFeatures, textLength = 6): StyleEstimate {
  if (features.isEmpty) {
    return {
      category: "Sans Serif",
      categoryConfidence: "low",
      allowedCategories: ["Sans Serif", "Serif", "Display", "Monospace", "Script/Handwriting"],
      weightClass: "Regular",
      allowedWeights: ["Thin", "Regular", "Bold", "Black"],
      widthClass: "Normal",
      summary: "regular, normal-width sans serif",
    };
  }

  // 1. Weight Class estimation from density and strokeThickness
  let weightClass: WeightClass = "Regular";
  let allowedWeights: WeightClass[] = ["Thin", "Regular", "Bold"];

  if (features.density < 0.27 || features.strokeThickness < 2.1) {
    weightClass = "Thin";
    allowedWeights = ["Thin", "Regular"];
  } else if (features.density >= 0.52 || features.strokeThickness >= 4.6) {
    weightClass = "Black";
    allowedWeights = ["Bold", "Black"];
  } else if (features.density >= 0.38 || features.strokeThickness >= 3.2) {
    weightClass = "Bold";
    allowedWeights = ["Regular", "Bold", "Black"];
  } else {
    weightClass = "Regular";
    allowedWeights = ["Thin", "Regular", "Bold"];
  }

  // 2. Width Class estimation from character-normalized aspect ratio
  const safeLength = Math.max(2, textLength);
  const charAspect = features.aspect / safeLength;
  let widthClass: WidthClass = "Normal";

  if (charAspect < 0.44) {
    widthClass = "Condensed";
  } else if (charAspect > 0.72) {
    widthClass = "Wide";
  } else {
    widthClass = "Normal";
  }

  // 3. Category estimation across 5 categories
  const hMetrics = analyzeHProfile(features.hProfile);
  let category: EstimatedCategory = "Sans Serif";
  let categoryConfidence: "high" | "low" = "high";
  let allowedCategories: string[] = ["Sans Serif"];

  const isConnectedCursive = safeLength >= 4 && hMetrics.minValley > 0.05 && hMetrics.valleysCount < 2;
  const isScriptMetrics = widthClass === "Wide" && features.density < 0.38 && features.xHeightRatio < 0.62;

  if (isConnectedCursive || isScriptMetrics) {
    category = "Script/Handwriting";
    categoryConfidence = "high";
    allowedCategories = ["Script", "Handwriting", "Script/Handwriting"];
  } else if (features.serifScore >= 0.20) {
    category = "Serif";
    if (features.serifScore >= 0.28) {
      categoryConfidence = "high";
      allowedCategories = ["Serif"];
    } else {
      categoryConfidence = "low";
      allowedCategories = ["Serif", "Sans Serif"];
    }
  } else if (hMetrics.peakPeriodStdDev < 2.4 && charAspect >= 0.48 && charAspect <= 0.76) {
    category = "Monospace";
    categoryConfidence = "high";
    allowedCategories = ["Monospace"];
  } else if (features.density >= 0.52 || charAspect < 0.40) {
    category = "Display";
    categoryConfidence = "low";
    allowedCategories = ["Display", "Sans Serif"];
  } else {
    category = "Sans Serif";
    if (features.serifScore < 0.14) {
      categoryConfidence = "high";
      allowedCategories = ["Sans Serif"];
    } else {
      categoryConfidence = "low";
      allowedCategories = ["Sans Serif", "Serif"];
    }
  }

  const categoryName =
    category === "Script/Handwriting" ? "script" : category.toLowerCase();
  const summary = `${weightClass.toLowerCase()}, ${widthClass.toLowerCase()}-width ${categoryName}`;

  return {
    category,
    categoryConfidence,
    allowedCategories,
    weightClass,
    allowedWeights,
    widthClass,
    summary,
  };
}

/**
 * Crops and extracts typographic features from an input image/canvas without stretching.
 */
export function extractImageFeatures(src: CanvasImageSource, sw: number, sh: number): FontFeatures {
  const k = Math.min(1, 1000 / Math.max(sw, 1));
  const w = Math.max(1, Math.round(sw * k));
  const h = Math.max(1, Math.round(sh * k));

  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(src, 0, 0, w, h);

  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;
  const L = new Float32Array(w * h);

  let borderLSum = 0;
  let borderCount = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const alpha = d[idx * 4 + 3];
      let lum: number;
      if (alpha < 128) {
        lum = 255;
      } else {
        lum = 0.299 * d[idx * 4] + 0.587 * d[idx * 4 + 1] + 0.114 * d[idx * 4 + 2];
      }
      L[idx] = lum;

      if (x < 3 || x >= w - 3 || y < 3 || y >= h - 3) {
        borderLSum += lum;
        borderCount++;
      }
    }
  }

  const otsuThr = computeOtsuThreshold(L);
  const borderAvgL = borderCount > 0 ? borderLSum / borderCount : 255;
  const isLightBg = borderAvgL >= otsuThr;

  const rawMask = new Uint8Array(w * h);
  const rowInk = new Int32Array(h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const isInk = isLightBg ? L[idx] < otsuThr : L[idx] > otsuThr;
      if (isInk) {
        rawMask[idx] = 1;
        rowInk[y]++;
      }
    }
  }

  let bestY0 = 0;
  let bestY1 = h - 1;
  let maxBandInk = 0;
  let inBand = false;
  let bandStart = 0;
  let curBandInk = 0;
  const minRowInk = Math.max(2, Math.round(w * 0.005));

  for (let y = 0; y < h; y++) {
    if (rowInk[y] > minRowInk) {
      if (!inBand) {
        inBand = true;
        bandStart = y;
        curBandInk = 0;
      }
      curBandInk += rowInk[y];
    } else {
      if (inBand) {
        inBand = false;
        if (curBandInk > maxBandInk) {
          maxBandInk = curBandInk;
          bestY0 = bandStart;
          bestY1 = y - 1;
        }
      }
    }
  }
  if (inBand && curBandInk > maxBandInk) {
    bestY0 = bandStart;
    bestY1 = h - 1;
  }

  let x0 = w;
  let x1 = -1;
  for (let y = bestY0; y <= bestY1; y++) {
    for (let x = 0; x < w; x++) {
      if (rawMask[y * w + x] === 1) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
      }
    }
  }

  if (x1 <= x0) {
    x0 = 0;
    x1 = w - 1;
  }

  const bw = x1 - x0 + 1;
  const bh = bestY1 - bestY0 + 1;
  const croppedMask = new Uint8Array(bw * bh);

  for (let y = 0; y < bh; y++) {
    for (let x = 0; x < bw; x++) {
      croppedMask[y * bw + x] = rawMask[(bestY0 + y) * w + (x0 + x)];
    }
  }

  c.width = 0;
  c.height = 0;

  return extractFeaturesFromMask(croppedMask, bw, bh);
}

let measureCtx: CanvasRenderingContext2D | null = null;
function getMeasureContext(): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") return null;
  if (!measureCtx) {
    const c = document.createElement("canvas");
    c.width = 1;
    c.height = 1;
    measureCtx = c.getContext("2d");
  }
  return measureCtx;
}

export const verifiedFontsCache = new Set<string>();

/**
 * Checks if a candidate font family has loaded and renders distinct glyphs on canvas.
 */
export function verifyFontLoaded(family: string, testString = "MWQgypq190"): boolean {
  if (typeof document === "undefined" || !document.fonts) return false;
  if (verifiedFontsCache.has(family)) return true;

  try {
    const ctx = getMeasureContext();
    if (!ctx) return false;

    ctx.font = `72px serif`;
    const serifWidth = ctx.measureText(testString).width;

    ctx.font = `72px monospace`;
    const monoWidth = ctx.measureText(testString).width;

    ctx.font = `72px "${family}", serif`;
    const candidateSerif = ctx.measureText(testString).width;

    ctx.font = `72px "${family}", monospace`;
    const candidateMono = ctx.measureText(testString).width;

    const isSerifFallback = Math.abs(candidateSerif - serifWidth) < 0.05;
    const isMonoFallback = Math.abs(candidateMono - monoWidth) < 0.05;

    if (isSerifFallback && isMonoFallback) {
      return false;
    }

    if (document.fonts.check && !document.fonts.check(`72px "${family}"`, testString)) {
      return false;
    }

    verifiedFontsCache.add(family);
    return true;
  } catch {
    return false;
  }
}

/**
 * Loads and verifies a candidate font list in batches of 20.
 */
export async function loadAndVerifyFonts(
  fonts: { family: string }[],
  text: string,
  onBatchLoaded?: (loadedCount: number, totalCount: number) => void
): Promise<{ loaded: string[]; failed: string[] }> {
  if (typeof document === "undefined") {
    return { loaded: fonts.map((f) => f.family), failed: [] };
  }

  const unverified = fonts.filter((f) => !verifiedFontsCache.has(f.family));

  for (let i = 0; i < unverified.length; i += 20) {
    const chunk = unverified.slice(i, i + 20);
    const url =
      "https://fonts.googleapis.com/css2?" +
      chunk.map((f) => "family=" + f.family.replace(/ /g, "+")).join("&") +
      "&display=swap";

    if (!document.querySelector(`link[href="${url}"]`)) {
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = url;
      document.head.appendChild(l);
    }
  }

  for (let i = 0; i < unverified.length; i += 20) {
    const chunk = unverified.slice(i, i + 20);
    const promises = chunk.map((f) =>
      document.fonts.load(`72px "${f.family}"`, text).catch(() => null)
    );
    await Promise.race([Promise.all(promises), new Promise((r) => setTimeout(r, 1200))]);
    if (onBatchLoaded) {
      onBatchLoaded(Math.min(fonts.length, i + 20), fonts.length);
    }
  }

  try {
    await document.fonts.ready;
  } catch {}

  const loaded: string[] = [];
  const failed: string[] = [];

  for (const f of fonts) {
    if (verifyFontLoaded(f.family, text)) {
      loaded.push(f.family);
    } else {
      failed.push(f.family);
    }
  }

  return { loaded, failed };
}

const featuresCache = new Map<string, FontFeatures>();
const MAX_FEATURES_CACHE = 400;

/**
 * Renders confirmed text in candidate font at target height and extracts features.
 */
export function renderCandidateFeatures(
  text: string,
  family: string,
  fallback = "sans-serif",
  targetHeight = 64,
  weight = 400
): FontFeatures {
  const cacheKey = `${family}::${text}::${targetHeight}::${weight}`;
  const cached = featuresCache.get(cacheKey);
  if (cached && !cached.isEmpty) return cached;

  const fontSize = Math.max(28, Math.min(96, Math.round(targetHeight * 0.85)));
  const canvasW = Math.max(600, text.length * fontSize * 1.2);
  const canvasH = Math.max(120, fontSize * 2.2);

  const c = document.createElement("canvas");
  c.width = canvasW;
  c.height = canvasH;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvasW, canvasH);
  ctx.fillStyle = "#000000";
  ctx.font = `${weight} ${fontSize}px "${family}", ${fallback}`;
  ctx.textBaseline = "middle";
  ctx.fillText(text, 20, canvasH / 2);

  const imgData = ctx.getImageData(0, 0, canvasW, canvasH);
  const d = imgData.data;

  let minX = canvasW,
    maxX = -1,
    minY = canvasH,
    maxY = -1;

  for (let y = 0; y < canvasH; y++) {
    for (let x = 0; x < canvasW; x++) {
      const idx = (y * canvasW + x) * 4;
      const lum = 0.299 * d[idx] + 0.587 * d[idx + 1] + 0.114 * d[idx + 2];
      if (lum < 200) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX <= minX || maxY <= minY) {
    c.width = 0;
    c.height = 0;
    return extractFeaturesFromMask(new Uint8Array(1), 1, 1);
  }

  const bw = maxX - minX + 1;
  const bh = maxY - minY + 1;
  const mask = new Uint8Array(bw * bh);

  for (let y = 0; y < bh; y++) {
    for (let x = 0; x < bw; x++) {
      const idx = ((minY + y) * canvasW + (minX + x)) * 4;
      const lum = 0.299 * d[idx] + 0.587 * d[idx + 1] + 0.114 * d[idx + 2];
      mask[y * bw + x] = lum < 200 ? 1 : 0;
    }
  }

  c.width = 0;
  c.height = 0;

  const features = extractFeaturesFromMask(mask, bw, bh);

  if (featuresCache.size >= MAX_FEATURES_CACHE) {
    featuresCache.clear();
  }
  featuresCache.set(cacheKey, features);
  return features;
}

/**
 * Computes calibrated visual and typographic distance between target and candidate.
 */
export function computeFeatureDistance(
  a: FontFeatures,
  b: FontFeatures
): { distance: number; secondary: number } {
  if (a.isEmpty || b.isEmpty) return { distance: Infinity, secondary: Infinity };

  const W = FEATURE_WEIGHTS;

  const aspectDiff = Math.abs(Math.log(Math.max(1e-3, a.aspect) / Math.max(1e-3, b.aspect)));
  const densityDiff = Math.abs(a.density - b.density);
  const strokeDiff =
    Math.abs(a.strokeThickness - b.strokeThickness) /
    Math.max(0.5, (a.strokeThickness + b.strokeThickness) / 2);

  let hDiff = 0;
  for (let i = 0; i < H_POINTS; i++) {
    hDiff += Math.abs(a.hProfile[i] - b.hProfile[i]);
  }
  hDiff /= H_POINTS;

  let vDiff = 0;
  for (let i = 0; i < V_POINTS; i++) {
    vDiff += Math.abs(a.vProfile[i] - b.vProfile[i]);
  }
  vDiff /= V_POINTS;

  const serifDiff = Math.abs(a.serifScore - b.serifScore);
  const xHeightDiff = Math.abs(a.xHeightRatio - b.xHeightRatio);

  const mainDist =
    aspectDiff * W.aspect +
    densityDiff * W.density +
    strokeDiff * W.strokeThickness +
    hDiff * W.hProfile +
    vDiff * W.vProfile +
    serifDiff * W.serif +
    xHeightDiff * W.xHeight;

  if (!Number.isFinite(mainDist)) {
    return { distance: Infinity, secondary: Infinity };
  }

  const secondary = densityDiff * 0.5 + hDiff * 0.5;

  return { distance: mainDist, secondary: Number.isFinite(secondary) ? secondary : Infinity };
}

/**
 * Extracts the base root prefix of a font family to ensure top result diversity
 * (e.g., "Noto Sans JP" -> "noto sans", "DM Serif Display" -> "dm serif").
 */
export function getFamilyPrefix(family: string): string {
  const cleaned = family.toLowerCase().trim();
  const tokens = cleaned.split(/\s+/);
  if (tokens.length >= 2 && (tokens[0] === "noto" || tokens[0] === "dm" || tokens[0] === "source" || tokens[0] === "libre" || tokens[0] === "ibm" || tokens[0] === "pt")) {
    return `${tokens[0]} ${tokens[1]}`;
  }
  return tokens[0];
}

// Backward-compatible exports
export const W = 128, H = 32;
export interface Ink { px: Float32Array; aspect: number; }
export function normalize(src: CanvasImageSource, sw: number, sh: number) {
  const f = extractImageFeatures(src, sw, sh);
  return { px: f.hProfile, aspect: f.aspect, isEmpty: f.isEmpty };
}
export function renderInk(text: string, family: string, fallback = "sans-serif") {
  const f = renderCandidateFeatures(text, family, fallback);
  return { px: f.hProfile, aspect: f.aspect, isEmpty: f.isEmpty };
}
export function distance(a: any, b: any) {
  return Math.abs(a.aspect - b.aspect);
}
export function computeSimilarity(d: number) {
  if (d <= 0.08) return Math.round(96 - d * 75);
  if (d <= 0.16) return Math.round(90 - (d - 0.08) * 100);
  if (d <= 0.28) return Math.round(82 - (d - 0.16) * 100);
  return Math.max(20, Math.round(55 - d * 50));
}
export async function loadFonts(fonts: { family: string }[], text = "Hamburgefonstiv") {
  return loadAndVerifyFonts(fonts, text);
}
export async function similarTo(font: Font, pool: Font[]) {
  const T = "Hamburgefonstiv";
  await loadAndVerifyFonts([font, ...pool], T);
  const tf = renderCandidateFeatures(T, font.family, font.fallback);
  const r = pool
    .filter((f) => f.family !== font.family)
    .map((candidate) => {
      const cf = renderCandidateFeatures(T, candidate.family, candidate.fallback);
      const { distance: d, secondary } = computeFeatureDistance(tf, cf);
      return { font, candidate, d, secondary, pct: computeSimilarity(d) };
    })
    .sort((a, b) => {
      if (Math.abs(a.d - b.d) < 1e-5) {
        if (Math.abs(a.secondary - b.secondary) < 1e-5) return 0;
        return a.secondary < b.secondary ? -1 : 1;
      }
      return a.d - b.d;
    });

  return r.map((x) => ({ font: x.candidate, pct: x.pct }));
}
