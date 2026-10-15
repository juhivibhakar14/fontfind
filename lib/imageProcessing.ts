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

/**
 * 1D box/gaussian blur [0.25, 0.5, 0.25] for profile smoothing.
 */
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

/**
 * Resamples a numeric profile to target length using linear interpolation.
 */
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
 * Extracts typographic features from a binary mask (1 = ink, 0 = background)
 * with dimensions bw × bh.
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

        // Check if pixel is on an edge (has at least 1 background neighbor)
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

        // Detect serif presence at top/bottom stroke ends
        if (y < bh * 0.18) {
          // Check horizontal expansion relative to stroke column
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

  // Normalize column & row projections
  for (let x = 0; x < bw; x++) rawColInk[x] /= bh;
  for (let y = 0; y < bh; y++) rawRowInk[y] /= bw;

  const hProfile = resampleProfile(rawColInk, H_POINTS);
  const vProfile = resampleProfile(rawRowInk, V_POINTS);

  const aspect = bw / Math.max(1, bh);
  const density = totalInk / Math.max(1, bw * bh);
  const strokeThickness = totalInk / Math.max(1, edgePixels);
  const serifScore = Math.min(1, (topTerminals + botTerminals) / Math.max(1, totalInk * 0.3));

  // Estimate x-height ratio from vertical projection inflection
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

/**
 * Crops and extracts typographic features from an input image/canvas without stretching.
 * Automatically identifies text polarity (light-on-dark vs dark-on-light) using Otsu.
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
  let totalLSum = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const alpha = d[idx * 4 + 3];
      let lum: number;
      if (alpha < 128) {
        lum = 255; // Treat transparent as white background
      } else {
        lum = 0.299 * d[idx * 4] + 0.587 * d[idx * 4 + 1] + 0.114 * d[idx * 4 + 2];
      }
      L[idx] = lum;
      totalLSum += lum;

      if (x < 3 || x >= w - 3 || y < 3 || y >= h - 3) {
        borderLSum += lum;
        borderCount++;
      }
    }
  }

  const otsuThr = computeOtsuThreshold(L);
  const borderAvgL = borderCount > 0 ? borderLSum / borderCount : 255;
  // If border is brighter than threshold, background is light and ink is dark
  const isLightBg = borderAvgL >= otsuThr;

  // Binarize
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

  // Find dominant text band vertically
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

  // Horizontal bounds in dominant band
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
 * Compares test string width against serif, monospace, and sans-serif fallbacks.
 * If width matches fallback for both serif and monospace, treats as NOT loaded.
 */
export function verifyFontLoaded(family: string, testString = "MWQgypq190"): boolean {
  if (typeof document === "undefined" || !document.fonts) return false;
  if (verifiedFontsCache.has(family)) return true;

  try {
    const ctx = getMeasureContext();
    if (!ctx) return false;

    // 1. Measure fallback widths
    ctx.font = `72px serif`;
    const serifWidth = ctx.measureText(testString).width;

    ctx.font = `72px monospace`;
    const monoWidth = ctx.measureText(testString).width;

    // 2. Measure candidate font
    ctx.font = `72px "${family}", serif`;
    const candidateSerif = ctx.measureText(testString).width;

    ctx.font = `72px "${family}", monospace`;
    const candidateMono = ctx.measureText(testString).width;

    // If candidate width matches fallback width for BOTH serif and monospace,
    // the web font is not loaded (silently falling back)
    const isSerifFallback = Math.abs(candidateSerif - serifWidth) < 0.05;
    const isMonoFallback = Math.abs(candidateMono - monoWidth) < 0.05;

    if (isSerifFallback && isMonoFallback) {
      return false;
    }

    // 3. Check document.fonts.check if available
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
 * Reports progress through callback.
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

  // Batch append stylesheets (up to 20 per request)
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

  // Request explicit font loading
  for (let i = 0; i < unverified.length; i += 20) {
    const chunk = unverified.slice(i, i + 20);
    const promises = chunk.map((f) =>
      document.fonts
        .load(`72px "${f.family}"`, text)
        .catch(() => null)
    );
    await Promise.race([Promise.all(promises), new Promise((r) => setTimeout(r, 1200))]);
    if (onBatchLoaded) {
      onBatchLoaded(Math.min(fonts.length, (i + 20)), fonts.length);
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
const MAX_FEATURES_CACHE = 250;

/**
 * Renders confirmed text in candidate font at same target height as target text
 * and extracts its typographic features without stretching.
 */
export function renderCandidateFeatures(
  text: string,
  family: string,
  fallback = "sans-serif",
  targetHeight = 64
): FontFeatures {
  const cacheKey = `${family}::${text}::${targetHeight}`;
  const cached = featuresCache.get(cacheKey);
  if (cached) return cached;

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
  ctx.font = `${fontSize}px "${family}", ${fallback}`;
  ctx.textBaseline = "middle";
  ctx.fillText(text, 20, canvasH / 2);

  const imgData = ctx.getImageData(0, 0, canvasW, canvasH);
  const d = imgData.data;

  // Find exact rendered text bounding box
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
 * Never lets ties silently preserve list order.
 */
export function computeFeatureDistance(a: FontFeatures, b: FontFeatures): { distance: number; secondary: number } {
  if (a.isEmpty || b.isEmpty) return { distance: 1.0, secondary: 1.0 };

  const W = FEATURE_WEIGHTS;

  const aspectDiff = Math.abs(Math.log(Math.max(1e-3, a.aspect) / Math.max(1e-3, b.aspect)));
  const densityDiff = Math.abs(a.density - b.density);
  const strokeDiff = Math.abs(a.strokeThickness - b.strokeThickness) / Math.max(0.5, (a.strokeThickness + b.strokeThickness) / 2);

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

  // Secondary distance used to break ties deterministically
  const secondary = densityDiff * 0.5 + hDiff * 0.5;

  return { distance: mainDist, secondary };
}

/**
 * Maps physical distance to an absolute similarity percentage.
 * Does not force arbitrary 97% on top match.
 */
export function computeAbsoluteSimilarity(d: number): number {
  if (d <= 0.08) return Math.round(96 - d * 75);
  if (d <= 0.16) return Math.round(90 - (d - 0.08) * 100);
  if (d <= 0.28) return Math.round(82 - (d - 0.16) * 100);
  if (d <= 0.42) return Math.round(70 - (d - 0.28) * 90);
  if (d <= 0.55) return Math.round(57 - (d - 0.42) * 80);
  return Math.max(20, Math.round(46 - (d - 0.55) * 50));
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
  return computeAbsoluteSimilarity(d);
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
      return { font, candidate, d, secondary, pct: computeAbsoluteSimilarity(d) };
    })
    .sort((a, b) => {
      if (Math.abs(a.d - b.d) < 1e-5) return a.secondary - b.secondary;
      return a.d - b.d;
    });

  return r.map((x) => ({ font: x.candidate, pct: x.pct }));
}
