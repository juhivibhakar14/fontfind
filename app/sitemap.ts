import {SITE} from "@/lib/seo";import {getFonts} from "@/lib/fonts/api";import {slug} from "@/lib/fonts/data";
export default async function sitemap(){const f=await getFonts();return [...["","/fonts","/privacy"].map(p=>({url:SITE+p})),...f.slice(0,Number(process.env.SITEMAP_FONT_LIMIT??50)).map(x=>({url:`${SITE}/fonts/${slug(x.family)}`}))]}
