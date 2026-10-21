export type Cat = "Serif" | "Sans Serif" | "Display" | "Monospace" | "Handwriting" | "Script";
export type Mood =
  "Modern" | "Minimal" | "Elegant" | "Luxury" | "Playful" | "Professional" | "Retro";
export interface Font {
  family: string;
  category: Cat;
  moods: Mood[];
  weights: number[];
  fallback: string;
}
const f = (family: string, category: Cat, moods: Mood[], weights: number[]): Font => ({
  family,
  category,
  moods,
  weights,
  fallback:
    category === "Serif"
      ? "serif"
      : category === "Monospace"
        ? "monospace"
        : category === "Handwriting" || category === "Script"
          ? "cursive"
          : "sans-serif",
});

export const FONTS: Font[] = [
  // Sans Serif (38 fonts)
  f("Poppins", "Sans Serif", ["Modern", "Playful"], [300, 400, 500, 600, 700]),
  f("Montserrat", "Sans Serif", ["Modern", "Professional"], [300, 400, 500, 600, 700]),
  f("Inter", "Sans Serif", ["Minimal", "Professional", "Modern"], [300, 400, 500, 600, 700]),
  f("Roboto", "Sans Serif", ["Modern", "Professional"], [300, 400, 500, 700]),
  f("Open Sans", "Sans Serif", ["Minimal", "Professional"], [300, 400, 600, 700]),
  f("Lato", "Sans Serif", ["Professional", "Minimal"], [300, 400, 700]),
  f("Source Sans 3", "Sans Serif", ["Professional", "Minimal"], [300, 400, 600, 700]),
  f("DM Sans", "Sans Serif", ["Minimal", "Modern"], [400, 500, 700]),
  f("Work Sans", "Sans Serif", ["Modern", "Minimal"], [300, 400, 500, 600, 700]),
  f("Raleway", "Sans Serif", ["Elegant", "Modern"], [300, 400, 500, 600, 700]),
  f("Nunito", "Sans Serif", ["Playful", "Minimal"], [300, 400, 600, 700]),
  f("Plus Jakarta Sans", "Sans Serif", ["Modern", "Professional"], [400, 500, 600, 700]),
  f("Outfit", "Sans Serif", ["Modern", "Minimal"], [300, 400, 500, 600, 700]),
  f("Manrope", "Sans Serif", ["Modern", "Professional"], [400, 500, 600, 700]),
  f("Figtree", "Sans Serif", ["Modern", "Playful"], [400, 500, 600, 700]),
  f("Barlow", "Sans Serif", ["Modern", "Professional"], [400, 500, 600, 700]),
  f("Cabin", "Sans Serif", ["Modern", "Professional"], [400, 500, 600, 700]),
  f("Quicksand", "Sans Serif", ["Playful", "Minimal"], [400, 500, 600, 700]),
  f("Karla", "Sans Serif", ["Minimal", "Modern"], [400, 700]),
  f("Heebo", "Sans Serif", ["Modern", "Minimal"], [400, 500, 700]),
  f("Mulish", "Sans Serif", ["Minimal", "Professional"], [300, 400, 600, 700]),
  f("Jost", "Sans Serif", ["Modern", "Minimal"], [400, 500, 600, 700]),
  f("PT Sans", "Sans Serif", ["Professional"], [400, 700]),
  f("Ubuntu", "Sans Serif", ["Modern", "Playful"], [300, 400, 500, 700]),
  f("Rubik", "Sans Serif", ["Modern", "Playful"], [400, 500, 600, 700]),
  f("Lexend", "Sans Serif", ["Minimal", "Modern"], [400, 500, 600, 700]),
  f("Fira Sans", "Sans Serif", ["Modern", "Professional"], [400, 500, 600, 700]),
  f("Mukta", "Sans Serif", ["Modern", "Minimal"], [400, 500, 600, 700]),
  f("Kanit", "Sans Serif", ["Modern", "Playful"], [300, 400, 500, 600, 700]),
  f("Titillium Web", "Sans Serif", ["Modern", "Professional"], [300, 400, 600, 700]),
  f("Noto Sans", "Sans Serif", ["Professional", "Minimal"], [400, 600, 700]),
  f("Overpass", "Sans Serif", ["Modern", "Professional"], [400, 600, 700]),
  f("Exo 2", "Sans Serif", ["Modern", "Retro"], [400, 600, 700]),
  f("Questrial", "Sans Serif", ["Minimal", "Modern"], [400]),
  f("Syne", "Sans Serif", ["Modern", "Luxury"], [400, 700]),
  f("Urbanist", "Sans Serif", ["Minimal", "Modern"], [400, 600, 700]),
  f("Archivo", "Sans Serif", ["Modern", "Professional"], [400, 600, 700]),
  f("Space Grotesk", "Sans Serif", ["Modern", "Retro"], [400, 600, 700]),

  // Serif (26 fonts)
  f("Playfair Display", "Serif", ["Elegant", "Luxury"], [400, 500, 600, 700]),
  f("Merriweather", "Serif", ["Professional"], [300, 400, 700]),
  f("Lora", "Serif", ["Elegant", "Professional"], [400, 500, 600, 700]),
  f("Cormorant Garamond", "Serif", ["Elegant", "Luxury"], [300, 400, 500, 600, 700]),
  f("DM Serif Display", "Serif", ["Luxury", "Elegant"], [400]),
  f("PT Serif", "Serif", ["Professional"], [400, 700]),
  f("EB Garamond", "Serif", ["Elegant", "Luxury"], [400, 500, 600, 700]),
  f("Noto Serif", "Serif", ["Professional", "Elegant"], [400, 700]),
  f("Libre Baskerville", "Serif", ["Elegant", "Professional"], [400, 700]),
  f("Cinzel", "Serif", ["Luxury", "Elegant"], [400, 600, 700]),
  f("Bitter", "Serif", ["Professional"], [400, 600, 700]),
  f("Source Serif 4", "Serif", ["Professional", "Elegant"], [400, 600, 700]),
  f("Bodoni Moda", "Serif", ["Luxury", "Elegant"], [400, 600, 700]),
  f("Crimson Text", "Serif", ["Elegant", "Professional"], [400, 600, 700]),
  f("Arvo", "Serif", ["Modern", "Retro"], [400, 700]),
  f("Castoro", "Serif", ["Elegant"], [400]),
  f("Prata", "Serif", ["Luxury", "Elegant"], [400]),
  f("Spectral", "Serif", ["Elegant", "Professional"], [400, 600, 700]),
  f("Zilla Slab", "Serif", ["Modern", "Professional"], [400, 600, 700]),
  f("Frank Ruhl Libre", "Serif", ["Elegant"], [400, 700]),
  f("Vollkorn", "Serif", ["Professional", "Elegant"], [400, 600, 700]),
  f("Cardo", "Serif", ["Elegant"], [400, 700]),
  f("Rozha One", "Serif", ["Luxury", "Retro"], [400]),
  f("Newsreader", "Serif", ["Elegant", "Professional"], [400, 600, 700]),
  f("Faustina", "Serif", ["Professional"], [400, 600, 700]),
  f("Baskervville", "Serif", ["Elegant"], [400]),

  // Display (22 fonts)
  f("Bebas Neue", "Display", ["Modern", "Retro"], [400]),
  f("Abril Fatface", "Display", ["Luxury", "Retro"], [400]),
  f("Righteous", "Display", ["Retro", "Playful"], [400]),
  f("Fredoka", "Display", ["Playful"], [400, 500, 600, 700]),
  f("Oswald", "Display", ["Modern", "Professional"], [400, 600, 700]),
  f("Lobster", "Display", ["Playful", "Retro"], [400]),
  f("Comfortaa", "Display", ["Playful", "Modern"], [400, 600, 700]),
  f("Alfa Slab One", "Display", ["Retro", "Playful"], [400]),
  f("Bangers", "Display", ["Playful", "Retro"], [400]),
  f("Anton", "Display", ["Modern", "Retro"], [400]),
  f("Shrikhand", "Display", ["Retro", "Playful"], [400]),
  f("Permanent Marker", "Display", ["Playful", "Retro"], [400]),
  f("Bungee", "Display", ["Playful", "Retro"], [400]),
  f("Titan One", "Display", ["Playful", "Retro"], [400]),
  f("Cinzel Decorative", "Display", ["Luxury", "Elegant"], [400, 700]),
  f("Ultra", "Display", ["Retro", "Playful"], [400]),
  f("Monoton", "Display", ["Retro"], [400]),
  f("Rye", "Display", ["Retro"], [400]),
  f("Faster One", "Display", ["Retro", "Playful"], [400]),
  f("Creepster", "Display", ["Playful"], [400]),
  f("Bungee Shade", "Display", ["Retro", "Playful"], [400]),
  f("Chango", "Display", ["Playful"], [400]),

  // Monospace (12 fonts)
  f("JetBrains Mono", "Monospace", ["Modern", "Professional"], [400, 500, 700]),
  f("Space Mono", "Monospace", ["Retro", "Playful"], [400, 700]),
  f("Roboto Mono", "Monospace", ["Modern", "Professional"], [400, 500, 700]),
  f("Inconsolata", "Monospace", ["Modern", "Professional"], [400, 600, 700]),
  f("Source Code Pro", "Monospace", ["Modern", "Professional"], [400, 600, 700]),
  f("Fira Code", "Monospace", ["Modern", "Professional"], [400, 600, 700]),
  f("IBM Plex Mono", "Monospace", ["Modern", "Professional"], [400, 600, 700]),
  f("Anonymous Pro", "Monospace", ["Retro"], [400, 700]),
  f("Cousine", "Monospace", ["Professional"], [400, 700]),
  f("VT323", "Monospace", ["Retro", "Playful"], [400]),
  f("Share Tech Mono", "Monospace", ["Modern", "Retro"], [400]),
  f("Major Mono Display", "Monospace", ["Modern", "Playful"], [400]),

  // Handwriting & Script (18 fonts)
  f("Caveat", "Handwriting", ["Playful"], [400, 500, 700]),
  f("Kalam", "Handwriting", ["Playful"], [300, 400, 700]),
  f("Shadows Into Light", "Handwriting", ["Playful"], [400]),
  f("Indie Flower", "Handwriting", ["Playful"], [400]),
  f("Patrick Hand", "Handwriting", ["Playful"], [400]),
  f("Gloria Hallelujah", "Handwriting", ["Playful"], [400]),
  f("Amatic SC", "Handwriting", ["Playful", "Retro"], [400, 700]),
  f("Just Another Hand", "Handwriting", ["Playful"], [400]),
  f("Pacifico", "Script", ["Retro", "Playful"], [400]),
  f("Great Vibes", "Script", ["Elegant", "Luxury"], [400]),
  f("Dancing Script", "Script", ["Playful", "Elegant"], [400, 600, 700]),
  f("Satisfy", "Script", ["Playful", "Elegant"], [400]),
  f("Sacramento", "Script", ["Elegant"], [400]),
  f("Yellowtail", "Script", ["Retro", "Playful"], [400]),
  f("Parisienne", "Script", ["Elegant", "Luxury"], [400]),
  f("Alex Brush", "Script", ["Elegant", "Luxury"], [400]),
  f("Courgette", "Script", ["Elegant", "Playful"], [400]),
  f("Allura", "Script", ["Elegant", "Luxury"], [400]),
];

export const css = (f: Font) => `font-family: '${f.family}', ${f.fallback};`;
export const importUrl = (f: Font) =>
  `https://fonts.googleapis.com/css2?family=${f.family.replace(/ /g, "+")}${f.weights.length > 1 ? ":wght@" + f.weights.join(";") : ""}&display=swap`;

const BODY = [
    "Inter",
    "Lato",
    "Open Sans",
    "Source Sans 3",
    "Work Sans",
    "DM Sans",
    "Nunito Sans",
    "Roboto",
    "Karla",
    "Mulish",
  ],
  SER = [
    "Lora",
    "Merriweather",
    "Source Serif 4",
    "Libre Baskerville",
    "PT Serif",
    "Crimson Text",
    "EB Garamond",
    "Playfair Display",
  ];
/** Rule-based pairing: contrast categories (sans heading → serif body, otherwise → neutral sans), rotated per font for variety. */
export function pairsFor(f: Font, list: Font[]): Font[] {
  const pool = (f.category === "Sans Serif" ? SER : BODY).filter(
    (n) => n !== f.family && list.some((x) => x.family === n),
  );
  const r = [...f.family].reduce((a, c) => a + c.charCodeAt(0), 0) % Math.max(1, pool.length);
  return [...pool.slice(r), ...pool.slice(0, r)]
    .slice(0, 6)
    .map((n) => list.find((x) => x.family === n)!);
}

export const slug = (n: string) =>
  n
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
/** Hand-picked pairings, shown before the rule-based ones. */
export const CURATED: Record<string, string[]> = {
  "Playfair Display": ["Inter", "Lato", "Source Sans 3"],
  Montserrat: ["Merriweather", "Lora"],
  Poppins: ["Lora", "Merriweather"],
  Inter: ["Playfair Display", "Lora"],
  Lora: ["Montserrat", "Raleway"],
  "Bebas Neue": ["Lato", "Work Sans"],
  "DM Serif Display": ["DM Sans", "Inter"],
  "Cormorant Garamond": ["Raleway", "Montserrat"],
};
export function pairsWithCurated(f: Font, list: Font[]): Font[] {
  const c = (CURATED[f.family] ?? [])
    .map((n) => list.find((x) => x.family === n))
    .filter(Boolean) as Font[];
  return [...c, ...pairsFor(f, list).filter((x) => !c.includes(x))].slice(0, 6);
}
