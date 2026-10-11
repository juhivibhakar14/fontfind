import Identifier from "@/components/identifier";import Faq,{FAQ} from "@/components/faq";import {meta,SITE} from "@/lib/seo";import {getFonts} from "@/lib/fonts/api";
export const metadata=meta("Font Identifier – What Font Is This? Identify Font from Image","Upload a screenshot, logo or poster to find the font behind the text and discover similar fonts you can use.","/");
export default async function Page(){const fonts=await getFonts();
 const app={"@context":"https://schema.org","@type":"WebApplication",name:"FontFind",url:SITE,applicationCategory:"DesignApplication",operatingSystem:"Any",offers:{"@type":"Offer",price:"0",priceCurrency:"USD"}};
 const faq={"@context":"https://schema.org","@type":"FAQPage",mainEntity:FAQ.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))};
 return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify([app,faq])}}/><Identifier fonts={fonts}/><Faq/></>}
