"use client";
import {useEffect,useState} from "react";import Link from "next/link";
import {css,importUrl,pairsWithCurated,slug,type Font} from "@/lib/fonts/data";import {similarTo} from "@/lib/imageProcessing";import {useGoogleFonts} from "@/lib/useGoogleFonts";
import {CopyBtn} from "./font-preview";import AdSlot from "./ad-slot";
export default function FontDetail({font,fonts}:{font:Font;fonts:Font[]}){
 const [text,setText]=useState("Your brand deserves better typography.");const [sim,setSim]=useState<{font:Font;pct:number}[]>([]);const pairs=pairsWithCurated(font,fonts);
 useGoogleFonts([font,...pairs,...sim.map(s=>s.font)]);
 useEffect(()=>{let ok=true;similarTo(font,fonts.slice(0,150)).then(r=>ok&&setSim(r.slice(0,6)));return()=>{ok=false}},[font,fonts]);
 const ff=(f:Font)=>({fontFamily:`'${f.family}',${f.fallback}`});
 return <div className="mx-auto max-w-5xl px-4 pt-12"><Link href="/fonts" className="text-sm text-mute hover:text-ink">← All fonts</Link>
 <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">{font.family}</h1><p className="text-mute">{font.category} · {font.weights.length} weights · Google Fonts · {font.moods.join(", ")}</p>
 <input value={text} onChange={e=>setText(e.target.value)} aria-label="Specimen text" className="mt-6 w-full rounded-lg border border-line bg-card px-3 py-2"/>
 <p className="mt-6 break-words text-5xl leading-tight sm:text-7xl" style={ff(font)}>{text||"Aa"}</p>
 <p className="mt-4 text-xl" style={ff(font)}>ABCDEFGHIJKLMNOPQRSTUVWXYZ<br/>abcdefghijklmnopqrstuvwxyz 0123456789</p>
 <div className="mt-6 flex flex-wrap gap-2"><CopyBtn text={font.family} label="Copy Font Name"/><CopyBtn text={css(font)} label="Copy Code"/><CopyBtn text={`<link rel="stylesheet" href="${importUrl(font)}">`} label="Copy embed"/></div>
 <AdSlot id="font-page"/>
 <h2 className="mt-12 text-2xl font-semibold">{font.family} font pairings</h2><div className="mt-4 grid gap-4 sm:grid-cols-3">{pairs.map(b=><Link key={b.family} href={`/fonts/${slug(b.family)}`} className="rounded-2xl border border-line bg-card p-5"><p className="text-2xl" style={ff(font)}>Design with intent</p><p className="mt-2 text-sm" style={ff(b)}>Body text in {b.family} stays quiet and readable.</p><p className="mt-3 text-xs text-mute">{font.family} + {b.family}</p></Link>)}</div>
 <h2 className="mt-12 text-2xl font-semibold">Fonts similar to {font.family}</h2><p className="text-sm text-mute">Ranked by comparing rendered letter shapes in your browser.</p>
 <div className="mt-4 grid gap-4 sm:grid-cols-3">{sim.length===0&&<p className="text-mute">Comparing shapes…</p>}{sim.map(s=><Link key={s.font.family} href={`/fonts/${slug(s.font.family)}`} className="rounded-2xl border border-line bg-card p-5"><p className="text-3xl" style={ff(s.font)}>Aa</p><p className="mt-2 font-medium">{s.font.family}</p><p className="text-xs text-mute">{s.pct}% similar · {s.font.category}</p></Link>)}</div></div>}
