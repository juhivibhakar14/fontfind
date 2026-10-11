"use client";
import {useState,useEffect} from "react";import {X,Copy,Check} from "lucide-react";
import {type Font,css,importUrl} from "@/lib/fonts/data";
export function CopyBtn({text,label}:{text:string;label:string}){const [ok,set]=useState(false);
 return <button onClick={async()=>{await navigator.clipboard.writeText(text);set(true);setTimeout(()=>set(false),1500)}} className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm hover:border-ink">{ok?<Check className="h-3.5 w-3.5"/>:<Copy className="h-3.5 w-3.5"/>}{ok?"Copied":label}</button>}
export default function FontPreview({font,onClose}:{font:Font;onClose:()=>void}){
 const [text,setText]=useState("Your brand deserves better typography.");const [size,setSize]=useState(44);const [w,setW]=useState(font.weights.includes(400)?400:font.weights[0]);
 const [ls,setLs]=useState(0);const [lh,setLh]=useState(1.3);const [tf,setTf]=useState("none");const [al,setAl]=useState("left");const [use,setUse]=useState(false);useEffect(()=>{const l=document.createElement("link");l.rel="stylesheet";l.href=importUrl(font);document.head.appendChild(l)},[font]);
 const rule=`font-family: '${font.family}', ${font.fallback};\nfont-weight: ${w};`;
 const sl=(l:string,v:number,s:(n:number)=>void,min:number,max:number,step=1)=><label className="flex flex-col gap-1 text-xs text-mute">{l}: {v}<input type="range" min={min} max={max} step={step} value={v} onChange={e=>s(+e.target.value)} className="accent-[var(--accent)]"/></label>;
 return <div role="dialog" aria-modal="true" aria-label={`${font.family} preview`} className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" onClick={onClose}>
 <div className="max-h-[92vh] w-full max-w-3xl overflow-auto rounded-t-2xl border border-line bg-card p-5 sm:rounded-2xl" onClick={e=>e.stopPropagation()}>
 <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">{font.family}</h2><button onClick={onClose} aria-label="Close" className="rounded-md p-1.5 hover:bg-line"><X className="h-4 w-4"/></button></div>
 <textarea value={text} onChange={e=>setText(e.target.value)} aria-label="Preview text" placeholder="Type your text..." rows={2} className="mt-4 w-full rounded-lg border border-line bg-transparent p-3 text-sm"/>
 <div className="my-5 min-h-[140px] break-words" style={{fontFamily:`'${font.family}',${font.fallback}`,fontSize:size,fontWeight:w,letterSpacing:`${ls}px`,lineHeight:lh,textTransform:tf as any,textAlign:al as any}}>{text||"Type your text..."}</div>
 <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{sl("Size",size,setSize,12,120)}{sl("Weight",w,setW,font.weights[0],font.weights[font.weights.length-1],100)}{sl("Spacing",ls,setLs,-2,12,0.5)}{sl("Line height",lh,setLh,1,2,0.1)}</div>
 <div className="mt-4 flex flex-wrap gap-2 text-sm">
 <select aria-label="Case" value={tf} onChange={e=>setTf(e.target.value)} className="rounded-lg border border-line bg-card px-2 py-1.5"><option value="none">Normal case</option><option value="uppercase">Uppercase</option><option value="lowercase">Lowercase</option></select>
 <select aria-label="Alignment" value={al} onChange={e=>setAl(e.target.value)} className="rounded-lg border border-line bg-card px-2 py-1.5"><option>left</option><option>center</option><option>right</option></select></div>
 <div className="mt-5 flex flex-wrap gap-2"><CopyBtn text={font.family} label="Copy Font Name"/><CopyBtn text={rule} label="Copy Code"/><button onClick={()=>setUse(!use)} className="rounded-lg bg-ink px-3 py-1.5 text-sm text-bg">Use Font</button></div>
 {use&&<pre className="mt-3 overflow-auto rounded-lg border border-line p-3 text-xs">{`<link rel="stylesheet" href="${importUrl(font)}">\n\n/* CSS */\n${rule}`}</pre>}
 </div></div>}
