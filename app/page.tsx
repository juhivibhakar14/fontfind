import Identifier from "@/components/identifier";import Faq,{FAQ} from "@/components/faq";import {meta,SITE} from "@/lib/seo";import {getFonts} from "@/lib/fonts/api";
export const metadata=meta("TypeMatcher – Font Style Matcher & Free Font Finder","Upload a screenshot, logo or poster to find fonts that share the same typographic style, weight, and proportions.","/");
export default async function Page(){const fonts=await getFonts();
 const app={"@context":"https://schema.org","@type":"WebApplication",name:"TypeMatcher",url:SITE,applicationCategory:"DesignApplication",operatingSystem:"Any",offers:{"@type":"Offer",price:"0",priceCurrency:"USD"}};
 const faq={"@context":"https://schema.org","@type":"FAQPage",mainEntity:FAQ.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))};
 return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify([app,faq])}}/><Identifier fonts={fonts}/><Faq/></>}

