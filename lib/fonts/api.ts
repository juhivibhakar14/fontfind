import {FONTS,type Font,type Cat,type Mood} from "./data";
const CAT:Record<string,Cat>={"sans-serif":"Sans Serif",serif:"Serif",display:"Display",monospace:"Monospace",handwriting:"Handwriting"};
const MOOD:Record<Cat,Mood[]>={"Sans Serif":["Modern","Minimal","Professional"],Serif:["Elegant","Professional"],Display:["Playful","Retro","Luxury"],Monospace:["Modern","Professional"],Handwriting:["Playful"],Script:["Elegant","Luxury","Retro"]};
/** Google Fonts Developer API (free key: GOOGLE_FONTS_API_KEY). Cached 24h; falls back to the curated list. Top 600 by popularity keeps the client payload small. */
export async function getFonts():Promise<Font[]>{const key=process.env.GOOGLE_FONTS_API_KEY;if(!key)return FONTS;
 try{const r=await fetch(`https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity&key=${key}`,{next:{revalidate:86400}});if(!r.ok)return FONTS;
  const known=new Map(FONTS.map(f=>[f.family,f]));
  return ((await r.json()).items as any[]).slice(0,600).map((i):Font=>{const k=known.get(i.family);if(k)return k;
   let category=CAT[i.category]??"Sans Serif";if(category==="Handwriting"&&/script|vibes|allura|satisfy|sacramento|parisienne|cookie|yellowtail/i.test(i.family))category="Script";
   const weights=[...new Set((i.variants as string[]).map(v=>v==="regular"?400:/^\d+$/.test(v)?+v:0).filter(Boolean))].sort((a,b)=>a-b);
   return{family:i.family,category,moods:MOOD[category],weights:weights.length?weights:[400],fallback:category==="Serif"?"serif":category==="Monospace"?"monospace":/Hand|Script/.test(category)?"cursive":"sans-serif"}})}catch{return FONTS}}
