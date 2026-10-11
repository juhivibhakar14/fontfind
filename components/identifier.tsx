"use client";
import {useCallback,useEffect,useRef,useState} from "react";import {ImagePlus,RotateCw,Trash2,ClipboardPaste} from "lucide-react";
import {fontIdentifierService,type IdentifyResult} from "@/services/fontIdentifierService";
import {useGoogleFonts} from "@/lib/useGoogleFonts";import FontCard from "./font-card";import FontPreview,{CopyBtn} from "./font-preview";
import AdSlot from "./ad-slot";import {css,type Font} from "@/lib/fonts/data";
async function rotated(b:Blob,deg:number){if(!deg)return b;const m=await createImageBitmap(b),sw=deg%180!==0,c=document.createElement("canvas");c.width=sw?m.height:m.width;c.height=sw?m.width:m.height;const x=c.getContext("2d")!;x.translate(c.width/2,c.height/2);x.rotate(deg*Math.PI/180);x.drawImage(m,-m.width/2,-m.height/2);return new Promise<Blob>(r=>c.toBlob(b=>r(b!),"image/png"))}
const OK=["image/jpeg","image/png","image/webp"],MAX=10*1024*1024,SAMPLE="The quick brown fox jumps over the lazy dog.";
export default function Identifier({fonts}:{fonts:Font[]}){
 const [file,setFile]=useState<Blob|null>(null);const [url,setUrl]=useState("");const [rot,setRot]=useState(0);const [zoom,setZoom]=useState(1);
 const [busy,setBusy]=useState(false);const [res,setRes]=useState<IdentifyResult|null>(null);const [err,setErr]=useState("");const [prev,setPrev]=useState<Font|null>(null);const inp=useRef<HTMLInputElement>(null);
 const all=res?[...res.matches,...res.similar].map(m=>m.font):[];useGoogleFonts(all);
 const load=useCallback((f:Blob)=>{setErr("");setRes(null);if(!OK.includes(f.type))return setErr("Use a JPG, PNG or WEBP image.");if(f.size>MAX)return setErr("That image is over 10 MB. Try a smaller one.");
  setUrl(u=>{if(u)URL.revokeObjectURL(u);return URL.createObjectURL(f)});setFile(f);setRot(0);setZoom(1)},[]);
 useEffect(()=>{const h=(e:ClipboardEvent)=>{const i=[...(e.clipboardData?.items??[])].find(x=>x.type.startsWith("image/"));const f=i?.getAsFile();if(f)load(f)};window.addEventListener("paste",h);return()=>window.removeEventListener("paste",h)},[load]);
 const paste=async()=>{try{for(const it of await navigator.clipboard.read()){const t=it.types.find(t=>t.startsWith("image/"));if(t)return load(await it.getType(t))}setErr("No image found on your clipboard.")}catch{setErr("Press Ctrl/Cmd+V to paste an image.")}};
 const clear=()=>{if(inp.current)inp.current.value="";setFile(null);setUrl("");setRes(null);setErr("")};
 const run=async()=>{if(!file)return;setBusy(true);setErr("");try{const r=await fontIdentifierService.identify(await rotated(file,rot),fonts);setRes(r)}catch{setErr("We couldn't identify the font. Try uploading a clearer image with larger text.")}setBusy(false)};
 const example=async()=>{const c=document.createElement("canvas");c.width=800;c.height=240;const x=c.getContext("2d")!;x.fillStyle="#fff";x.fillRect(0,0,800,240);x.fillStyle="#111";x.font="bold 64px sans-serif";x.fillText("Hello, Typography",40,140);c.toBlob(b=>b&&load(b),"image/png")};
 return <div>
 <section className="mx-auto max-w-3xl px-4 pt-14 text-center sm:pt-20"><h1 className="font-display text-5xl font-semibold tracking-tight sm:text-7xl">What Font Is This?</h1>
 <p className="mx-auto mt-5 max-w-xl text-lg text-mute">Upload a screenshot, logo, poster, or design and find fonts that look similar.</p></section>
 <section className="mx-auto mt-10 max-w-3xl px-4" aria-label="Font identifier tool">
 {!file?<div onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];f&&load(f)}} className="rounded-3xl border-2 border-dashed border-line bg-card p-8 text-center sm:p-14">
  <p className="font-display text-3xl">Aa</p><p className="mt-3 text-xl font-medium">Drop an image here</p><p className="text-mute">or</p>
  <div className="mt-3 flex flex-wrap justify-center gap-2"><button onClick={()=>inp.current?.click()} className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-bg"><ImagePlus className="h-4 w-4"/>Browse Image</button>
  <button onClick={async()=>{try{for(const i of await navigator.clipboard.read()){const t=i.types.find(t=>t.startsWith("image/"));if(t)return load(await i.getType(t))}setErr("No image found on your clipboard.")}catch{setErr("Press Ctrl/Cmd+V to paste an image.")}}} className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2"><ClipboardPaste className="h-4 w-4"/>Paste Image</button>
  <button onClick={example} className="rounded-lg border border-line px-4 py-2">Try an example</button></div>
  <input ref={inp} type="file" accept=".jpg,.jpeg,.png,.webp" hidden onChange={e=>e.target.files?.[0]&&load(e.target.files[0])}/>
  <p className="mt-5 text-xs text-mute">JPG, JPEG, PNG, WEBP · up to 10 MB · Your image stays in your browser. <a href="/privacy" className="underline">Privacy</a></p></div>
  :<div className="rounded-3xl border border-line bg-card p-4"><div className="flex h-64 items-center justify-center overflow-hidden rounded-2xl border border-line bg-bg"><img src={url} alt="Uploaded text sample to identify" className="max-h-full max-w-full transition-transform" style={{transform:`rotate(${rot}deg) scale(${zoom})`}}/></div>
  <div className="mt-3 flex flex-wrap items-center gap-3"><button onClick={()=>setRot((rot+90)%360)} className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm"><RotateCw className="h-3.5 w-3.5"/>Rotate</button>
  <label className="flex min-w-[160px] flex-1 items-center gap-2 text-sm text-mute">Zoom<input type="range" min={1} max={3} step={0.1} value={zoom} onChange={e=>setZoom(+e.target.value)} className="flex-1 accent-[var(--accent)]"/></label></div>
  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"><span className="text-mute">Replace image:</span><button onClick={()=>inp.current?.click()} className="underline underline-offset-4">Upload new</button><button onClick={paste} className="underline underline-offset-4">Paste</button><button onClick={example} className="underline underline-offset-4">Example</button><button onClick={clear} className="ml-auto text-mute underline underline-offset-4">← Start over</button></div>
  <input ref={inp} type="file" accept=".jpg,.jpeg,.png,.webp" hidden onChange={e=>e.target.files?.[0]&&load(e.target.files[0])}/>
  <button onClick={run} disabled={busy} className="mt-4 w-full rounded-xl bg-accent py-3 font-medium text-[var(--ai)] disabled:opacity-60">{busy?"Analyzing…":"Identify Font"}</button>
  {busy&&<div role="status" className="mt-3"><p className="text-sm text-mute">Analyzing typography...</p><div className="mt-2 h-1 overflow-hidden rounded bg-line"><div className="h-full w-1/3 rounded bg-accent" style={{animation:"sweep 1.1s ease-in-out infinite"}}/></div></div>}</div>}
 {err&&<div role="alert" className="mt-4 rounded-xl border border-line p-4"><p className="font-medium">{res===null&&file?"We couldn't identify the font":"Something's off"}</p><p className="text-sm text-mute">{err}</p></div>}
 {!file&&!err&&<p className="mt-6 text-center text-sm text-mute"><b className="text-ink">No image yet.</b> Upload a screenshot and let's find its font.</p>}
 </section>
 {res&&<section className="mx-auto mt-14 max-w-6xl px-4" aria-live="polite"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-2xl font-semibold">Possible font matches</h2><button onClick={()=>{clear();window.scrollTo({top:0,behavior:"smooth"})}} className="rounded-lg border border-line px-3 py-1.5 text-sm">Try another image</button></div><p className="text-mute">We found {res.matches.length} fonts that closely resemble your image.</p>
  <p className="mt-2 rounded-lg border border-line p-3 text-sm text-mute">{res.isMock?"Demo mode: placeholder results.":"Estimated in your browser by comparing letter shapes"+(res.text?` (read as “${res.text}”)`:"")+". Percentages rank similarity; they are not a guarantee. Clearer, larger text works best."}</p>
  <ol className="mt-5 grid gap-4">{res.matches.map(m=><li key={m.font.family} className="rounded-2xl border border-line bg-card p-5"><div className="flex flex-wrap items-baseline justify-between gap-2"><h3 className="text-lg font-semibold">{m.font.family}</h3><span className="text-sm text-accent">{m.similarity}% similarity · Possible match</span></div>
   <p className="my-3 text-3xl" style={{fontFamily:`'${m.font.family}',${m.font.fallback}`}}>{SAMPLE}</p>
   <p className="text-xs text-mute">{m.font.category} · {m.style} · {m.weight}</p>
   <div className="mt-3 flex flex-wrap gap-2"><button onClick={()=>setPrev(m.font)} className="rounded-lg border border-line px-3 py-1.5 text-sm hover:border-ink">Preview</button><CopyBtn text={m.font.family} label="Copy Name"/><CopyBtn text={css(m.font)} label="Copy Code"/></div></li>)}</ol>
  <AdSlot id="home-results"/>
  <h2 className="mt-12 text-2xl font-semibold">Similar Fonts</h2><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{res.similar.map(m=><FontCard key={m.font.family} font={m.font} sim={m.similarity} text="The quick brown fox" onPreview={setPrev}/>)}</div></section>}
 {prev&&<FontPreview font={prev} onClose={()=>setPrev(null)}/>}
 </div>}
