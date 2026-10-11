import type {Font} from "@/lib/fonts/data";
export const W=128,H=32;export interface Ink{px:Float32Array;aspect:number}
/** Thresholds to ink/paper (auto-detects light-on-dark), auto-crops to the ink box, resamples to W×H. Runs fully in the browser. */
export function normalize(src:CanvasImageSource,sw:number,sh:number):Ink{
 const k=Math.min(1,900/sw),w=Math.max(1,Math.round(sw*k)),h=Math.max(1,Math.round(sh*k));
 const c=document.createElement("canvas");c.width=w;c.height=h;const x=c.getContext("2d",{willReadFrequently:true})!;x.fillStyle="#fff";x.fillRect(0,0,w,h);x.drawImage(src,0,0,w,h);
 const d=x.getImageData(0,0,w,h).data,L=new Float32Array(w*h);let mn=255,mx=0,sum=0;
 for(let i=0;i<w*h;i++){const l=.299*d[i*4]+.587*d[i*4+1]+.114*d[i*4+2];L[i]=l;mn=Math.min(mn,l);mx=Math.max(mx,l);sum+=l}
 const thr=(mn+mx)/2,dark=sum/(w*h)>thr,out=x.createImageData(w,h);let x0=w,y0=h,x1=-1,y1=-1;
 for(let y=0;y<h;y++)for(let q=0;q<w;q++){const i=y*w+q;if(dark?L[i]<thr:L[i]>thr){out.data[i*4+3]=255;x0=Math.min(x0,q);x1=Math.max(x1,q);y0=Math.min(y0,y);y1=Math.max(y1,y)}}
 const px=new Float32Array(W*H);if(x1<x0)return{px,aspect:1};
 const b=document.createElement("canvas");b.width=w;b.height=h;b.getContext("2d")!.putImageData(out,0,0);
 const o=document.createElement("canvas");o.width=W;o.height=H;const ox=o.getContext("2d",{willReadFrequently:true})!;ox.drawImage(b,x0,y0,x1-x0+1,y1-y0+1,0,0,W,H);
 const od=ox.getImageData(0,0,W,H).data;for(let i=0;i<W*H;i++)px[i]=od[i*4+3]/255;return{px,aspect:(x1-x0+1)/(y1-y0+1)}}
export function renderInk(text:string,family:string):Ink{const c=document.createElement("canvas");c.width=900;c.height=140;const x=c.getContext("2d")!;x.fillStyle="#fff";x.fillRect(0,0,900,140);x.fillStyle="#000";x.font=`72px "${family}"`;x.textBaseline="middle";x.fillText(text,20,70);return normalize(c,900,140)}
export function distance(a:Ink,b:Ink){let s=0;for(let i=0;i<a.px.length;i++)s+=Math.abs(a.px[i]-b.px[i]);return s/a.px.length+.15*Math.abs(Math.log(a.aspect/b.aspect))}
export async function loadFonts(fonts:{family:string}[]){const ls:Promise<unknown>[]=[];
 for(let i=0;i<fonts.length;i+=20){const l=document.createElement("link");l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?"+fonts.slice(i,i+20).map(f=>"family="+f.family.replace(/ /g,"+")).join("&")+"&display=swap";ls.push(new Promise(r=>{l.onload=l.onerror=()=>r(0)}));document.head.appendChild(l)}
 await Promise.race([Promise.all(ls).then(()=>Promise.all(fonts.map(f=>document.fonts.load(`72px "${f.family}"`,"Hamburgefonstiv")))),new Promise(r=>setTimeout(r,12000))])}
/** Fonts ranked by glyph-shape distance to `font` (rendered specimen comparison, in-browser). */
export async function similarTo(font:Font,pool:Font[]){const T="Hamburgefonstiv";await loadFonts([font,...pool]);const t=renderInk(T,font.family);
 const r=pool.filter(f=>f.family!==font.family).map(f=>({font:f,d:distance(t,renderInk(T,f.family))})).sort((a,b)=>a.d-b.d);const best=r[0]?.d??0,worst=r[r.length-1]?.d??1;
 return r.map(x=>({...x,pct:Math.round(60+37*(worst-x.d)/Math.max(1e-6,worst-best))}))}
