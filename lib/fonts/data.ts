export type Cat="Serif"|"Sans Serif"|"Display"|"Monospace"|"Handwriting"|"Script";
export type Mood="Modern"|"Minimal"|"Elegant"|"Luxury"|"Playful"|"Professional"|"Retro";
export interface Font{family:string;category:Cat;moods:Mood[];weights:number[];fallback:string}
const f=(family:string,category:Cat,moods:Mood[],weights:number[]):Font=>({family,category,moods,weights,fallback:category==="Serif"?"serif":category==="Monospace"?"monospace":category==="Handwriting"||category==="Script"?"cursive":"sans-serif"});
export const FONTS:Font[]=[
f("Poppins","Sans Serif",["Modern","Playful"],[300,400,500,600,700]),
f("Montserrat","Sans Serif",["Modern","Professional"],[300,400,500,600,700]),
f("Inter","Sans Serif",["Minimal","Professional","Modern"],[300,400,500,600,700]),
f("Lato","Sans Serif",["Professional","Minimal"],[300,400,700]),
f("Source Sans 3","Sans Serif",["Professional","Minimal"],[300,400,600,700]),
f("DM Sans","Sans Serif",["Minimal","Modern"],[400,500,700]),
f("Work Sans","Sans Serif",["Modern","Minimal"],[300,400,500,600,700]),
f("Raleway","Sans Serif",["Elegant","Modern"],[300,400,500,600,700]),
f("Nunito","Sans Serif",["Playful","Minimal"],[300,400,600,700]),
f("Playfair Display","Serif",["Elegant","Luxury"],[400,500,600,700]),
f("Merriweather","Serif",["Professional"],[300,400,700]),
f("Lora","Serif",["Elegant","Professional"],[400,500,600,700]),
f("Cormorant Garamond","Serif",["Elegant","Luxury"],[300,400,500,600,700]),
f("DM Serif Display","Serif",["Luxury","Elegant"],[400]),
f("Bebas Neue","Display",["Modern","Retro"],[400]),
f("Abril Fatface","Display",["Luxury","Retro"],[400]),
f("Righteous","Display",["Retro","Playful"],[400]),
f("Fredoka","Display",["Playful"],[400,500,600,700]),
f("JetBrains Mono","Monospace",["Modern","Professional"],[400,500,700]),
f("Space Mono","Monospace",["Retro","Playful"],[400,700]),
f("Caveat","Handwriting",["Playful"],[400,500,700]),
f("Kalam","Handwriting",["Playful"],[300,400,700]),
f("Pacifico","Script",["Retro","Playful"],[400]),
f("Great Vibes","Script",["Elegant","Luxury"],[400]),
];
export const byName=(n:string)=>FONTS.find(x=>x.family===n)!;
export const css=(f:Font)=>`font-family: '${f.family}', ${f.fallback};`;
export const importUrl=(f:Font)=>`https://fonts.googleapis.com/css2?family=${f.family.replace(/ /g,"+")}${f.weights.length>1?":wght@"+f.weights.join(";"):""}&display=swap`;

const BODY=["Inter","Lato","Open Sans","Source Sans 3","Work Sans","DM Sans","Nunito Sans","Roboto","Karla","Mulish"],SER=["Lora","Merriweather","Source Serif 4","Libre Baskerville","PT Serif","Crimson Text","EB Garamond","Playfair Display"];
/** Rule-based pairing: contrast categories (sans heading → serif body, otherwise → neutral sans), rotated per font for variety. */
export function pairsFor(f:Font,list:Font[]):Font[]{const pool=(f.category==="Sans Serif"?SER:BODY).filter(n=>n!==f.family&&list.some(x=>x.family===n));
 const r=[...f.family].reduce((a,c)=>a+c.charCodeAt(0),0)%Math.max(1,pool.length);return [...pool.slice(r),...pool.slice(0,r)].slice(0,6).map(n=>list.find(x=>x.family===n)!)}

export const slug=(n:string)=>n.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
/** Hand-picked pairings, shown before the rule-based ones. */
export const CURATED:Record<string,string[]>={"Playfair Display":["Inter","Lato","Source Sans 3"],"Montserrat":["Merriweather","Lora"],"Poppins":["Lora","Merriweather"],"Inter":["Playfair Display","Lora"],"Lora":["Montserrat","Raleway"],"Bebas Neue":["Lato","Work Sans"],"DM Serif Display":["DM Sans","Inter"],"Cormorant Garamond":["Raleway","Montserrat"]};
export function pairsWithCurated(f:Font,list:Font[]):Font[]{const c=(CURATED[f.family]??[]).map(n=>list.find(x=>x.family===n)).filter(Boolean) as Font[];return [...c,...pairsFor(f,list).filter(x=>!c.includes(x))].slice(0,6)}
