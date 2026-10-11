"use client";
import {useEffect} from "react";import type {Font} from "@/lib/fonts/data";
/** Batches up to 20 families per stylesheet request. Pass only visible fonts. */
export function useGoogleFonts(fonts:Font[]){const k=fonts.map(f=>f.family).join("|");
 useEffect(()=>{for(let i=0;i<fonts.length;i+=20){const u="https://fonts.googleapis.com/css2?"+fonts.slice(i,i+20).map(f=>"family="+f.family.replace(/ /g,"+")).join("&")+"&display=swap";if(document.querySelector(`link[href="${u}"]`))continue;const l=document.createElement("link");l.rel="stylesheet";l.href=u;document.head.appendChild(l)}},[k]);}
