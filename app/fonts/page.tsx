import Explorer from "@/components/explorer";import {meta} from "@/lib/seo";import {getFonts} from "@/lib/fonts/api";
export const metadata=meta("Font Explorer – Similar Fonts & Font Pairing","Search fonts, preview your own text and find font combinations that work together.","/fonts");
export default async function Page(){return <Explorer fonts={await getFonts()}/>}
