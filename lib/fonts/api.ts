import {FONTS,type Font,type Cat,type Mood} from "./data";
const CAT:Record<string,Cat>={"sans-serif":"Sans Serif",serif:"Serif",display:"Display",monospace:"Monospace",handwriting:"Handwriting"};
const MOOD:Record<Cat,Mood[]>={"Sans Serif":["Modern","Minimal","Professional"],Serif:["Elegant","Professional"],Display:["Playful","Retro","Luxury"],Monospace:["Modern","Professional"],Handwriting:["Playful"],Script:["Elegant","Luxury","Retro"]};
let cachedFonts: Font[] | null = null;

export async function getFonts(): Promise<Font[]> {
  if (cachedFonts) return cachedFonts;
  const key = process.env.GOOGLE_FONTS_API_KEY;
  if (!key) {
    cachedFonts = FONTS;
    return cachedFonts;
  }
  try {
    const r = await fetch(
      `https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity&key=${key}`,
      { next: { revalidate: 86400 } }
    );
    if (!r.ok) {
      cachedFonts = FONTS;
      return cachedFonts;
    }
    const known = new Map(FONTS.map((f) => [f.family, f]));
    const data = await r.json();
    const items = (data.items as any[]) || [];
    const list: Font[] = items.slice(0, 600).map((i): Font => {
      const k = known.get(i.family);
      if (k) return k;
      let category = CAT[i.category] ?? "Sans Serif";
      if (
        category === "Handwriting" &&
        /script|vibes|allura|satisfy|sacramento|parisienne|cookie|yellowtail/i.test(
          i.family
        )
      ) {
        category = "Script";
      }
      const weights = [
        ...new Set(
          (i.variants as string[])
            .map((v) => (v === "regular" ? 400 : /^\d+$/.test(v) ? +v : 0))
            .filter(Boolean)
        ),
      ].sort((a, b) => a - b);
      return {
        family: i.family,
        category,
        moods: MOOD[category] ?? ["Modern"],
        weights: weights.length ? weights : [400],
        fallback:
          category === "Serif"
            ? "serif"
            : category === "Monospace"
            ? "monospace"
            : /Hand|Script/.test(category)
            ? "cursive"
            : "sans-serif",
      };
    });
    cachedFonts = list;
    return cachedFonts;
  } catch {
    cachedFonts = FONTS;
    return cachedFonts;
  }
}
