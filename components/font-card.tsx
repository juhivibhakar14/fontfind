"use client";
import Link from "next/link";
import {slug,type Font} from "@/lib/fonts/data";
export default function FontCard({font,sim,text,onPreview}:{font:Font;sim?:number;text:string;onPreview:(f:Font)=>void}){
 return <article className="flex flex-col rounded-2xl border border-line bg-card p-5">
 <div className="flex items-baseline justify-between"><span className="text-6xl leading-none" style={{fontFamily:`'${font.family}',${font.fallback}`}} aria-hidden>Aa</span>{sim!==undefined&&<span className="text-sm text-mute">{sim}% similar</span>}</div>
 <h3 className="mt-4 font-semibold">{font.family}</h3>
 <p className="mt-2 line-clamp-3 flex-1 text-lg" style={{fontFamily:`'${font.family}',${font.fallback}`}}>{text}</p>
 <p className="mt-3 text-xs text-mute">{font.category} · {font.weights.length} weight{font.weights.length>1?"s":""} · Google Fonts</p>
 <button onClick={()=>onPreview(font)} className="mt-3 self-start rounded-lg border border-line px-3 py-1.5 text-sm hover:border-ink">Preview</button> <Link href={`/fonts/${slug(font.family)}`} className="ml-2 text-sm text-accent underline">Details &amp; similar</Link></article>}
