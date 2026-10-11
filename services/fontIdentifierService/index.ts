import type {Font} from "@/lib/fonts/data";
import {normalize,renderInk,distance,loadFonts} from "@/lib/imageProcessing";
export interface FontMatch{font:Font;similarity:number;style:string;weight:number}
export interface IdentifyResult{matches:FontMatch[];similar:FontMatch[];isMock:boolean;text?:string}
export interface FontIdentifierService{identify(image:Blob,candidates:Font[]):Promise<IdentifyResult>}
/** In-browser pipeline: decode → OCR (tesseract.js) → binarise + auto-crop → render the OCR text in each candidate font → rank by shape distance.
 *  Similarity % is relative ranking among candidates, not a probability. Swap for an ML model by implementing the same interface. */
export const browserService:FontIdentifierService={async identify(image,candidates){
 const bmp=await createImageBitmap(image);let text="Hamburgefonstiv";
 try{const {createWorker}=await import("tesseract.js");const w=await createWorker("eng");const {data}=await w.recognize(image);await w.terminate();const t=data.text.replace(/\s+/g," ").trim().slice(0,24);if(t.length>=3)text=t}catch{}
 const target=normalize(bmp,bmp.width,bmp.height);const pool=candidates.slice(0,150);await loadFonts(pool);
 const r=pool.map(font=>({font,d:distance(target,renderInk(text,font.family))})).sort((a,b)=>a.d-b.d);
 if(!r.length)throw new Error("no candidates");const best=r[0].d,worst=r[r.length-1].d;
 const m=(x:typeof r[0]):FontMatch=>({font:x.font,similarity:Math.round(60+37*(worst-x.d)/Math.max(1e-6,worst-best)),style:"Regular",weight:400});
 return{isMock:false,text,matches:r.slice(0,3).map(m),similar:r.slice(3,9).map(m)}}};
export const fontIdentifierService:FontIdentifierService=browserService;
