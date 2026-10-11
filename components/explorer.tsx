"use client";
import {useMemo,useState} from "react";import {pairsWithCurated as pairsFor,css,type Cat,type Mood,type Font} from "@/lib/fonts/data";
import {useGoogleFonts} from "@/lib/useGoogleFonts";import FontCard from "./font-card";import FontPreview,{CopyBtn} from "./font-preview";import AdSlot from "./ad-slot";
const CATS:Cat[]=["Serif","Sans Serif","Display","Monospace","Handwriting","Script"],MOODS:Mood[]=["Modern","Minimal","Elegant","Luxury","Playful","Professional","Retro"],STEP=24;
export default function Explorer({fonts}:{fonts:Font[]}){
 const [q,setQ]=useState("");const [cat,setCat]=useState<Cat|null>(null);const [mood,setMood]=useState<Mood|null>(null);const [text,setText]=useState("The quick brown fox jumps over the lazy dog.");
 const [prev,setPrev]=useState<Font|null>(null);const [head,setHead]=useState("Playfair Display");const [n,setN]=useState(STEP);
 const list=useMemo(()=>fonts.filter(f=>f.family.toLowerCase().includes(q.toLowerCase())&&(!cat||f.category===cat)&&(!mood||f.moods.includes(mood))),[fonts,q,cat,mood]);
 const shown=list.slice(0,n);const h=fonts.find(f=>f.family===head);const pairs=h?pairsFor(h,fonts):[];
 useGoogleFonts(h?[...shown,h,...pairs]:shown);
 const chip=(l:string,on:boolean,fn:()=>void)=><button key={l} onClick={()=>{fn();setN(STEP)}} aria-pressed={on} className={`rounded-full border px-3 py-1 text-sm ${on?"border-ink bg-ink text-bg":"border-line text-mute hover:text-ink"}`}>{l}</button>;
 return <div className="mx-auto max-w-6xl px-4 pt-14">
 <h1 className="font-display text-5xl font-semibold tracking-tight sm:text-6xl">Explore Fonts</h1><p className="mt-3 text-lg text-mute">Find the perfect font for your next design.</p>
 <div className="mt-8 grid gap-3 sm:grid-cols-2"><input type="search" value={q} onChange={e=>{setQ(e.target.value);setN(STEP)}} placeholder="Search fonts..." aria-label="Search fonts" className="rounded-lg border border-line bg-card px-3 py-2"/>
 <input value={text} onChange={e=>setText(e.target.value)} aria-label="Preview text for all fonts" className="rounded-lg border border-line bg-card px-3 py-2"/></div>
 <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Category">{CATS.map(c=>chip(c,cat===c,()=>setCat(cat===c?null:c)))}</div>
 <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Style">{MOODS.map(m=>chip(m,mood===m,()=>setMood(mood===m?null:m)))}</div>
 <p className="mt-6 text-sm text-mute">Showing {shown.length} of {list.length} fonts</p>
 <div className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{shown.map(f=><FontCard key={f.family} font={f} text={text} onPreview={setPrev}/>)}</div>
 {list.length===0&&<p className="mt-8 text-mute">No fonts match. Clear a filter or try another search.</p>}
 {shown.length<list.length&&<div className="mt-6 text-center"><button onClick={()=>setN(n+STEP)} className="rounded-lg border border-line px-5 py-2 hover:border-ink">Load more fonts</button></div>}
 <AdSlot id="fonts-grid"/>
 <section className="mt-16" aria-labelledby="pair"><h2 id="pair" className="text-2xl font-semibold">Find a Font Pair</h2>
 <label className="mt-4 block text-sm text-mute">Heading font<input list="fl" value={head} onChange={e=>setHead(e.target.value)} className="ml-3 w-64 rounded-lg border border-line bg-card px-3 py-1.5 text-ink"/></label>
 <datalist id="fl">{fonts.map(f=><option key={f.family} value={f.family}/>)}</datalist>
 {!h&&<p className="mt-4 text-mute">Pick a font from the list to see pairings.</p>}
 <div className="mt-5 grid gap-4 md:grid-cols-3">{h&&pairs.map(b=><article key={b.family} className="rounded-2xl border border-line bg-card p-5">
  <h3 className="text-2xl" style={{fontFamily:`'${h.family}',${h.fallback}`}}>Design with intent</h3><p className="mt-2 text-sm" style={{fontFamily:`'${b.family}',${b.fallback}`}}>Good pairings give headings a voice and let body text stay quiet and readable.</p>
  <p className="mt-3 text-xs text-mute">{h.family} + {b.family}</p><div className="mt-3"><CopyBtn label="Copy Code" text={`h1,h2,h3 { ${css(h)} }\nbody { ${css(b)} }`}/></div></article>)}</div></section>
 {prev&&<FontPreview font={prev} onClose={()=>setPrev(null)}/>}</div>}
