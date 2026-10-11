import "./globals.css";import type {Metadata} from "next";import {Fraunces,Instrument_Sans} from "next/font/google";
import Header from "@/components/header";import Footer from "@/components/footer";import {SITE} from "@/lib/seo";
const display=Fraunces({subsets:["latin"],variable:"--f-display",display:"swap"});const sans=Instrument_Sans({subsets:["latin"],variable:"--f-sans",display:"swap"});
export const metadata:Metadata={metadataBase:new URL(SITE),verification:{google:process.env.NEXT_PUBLIC_GSC_VERIFICATION},title:{default:"FontFind",template:"%s | FontFind"}};
export default function Root({children}:{children:React.ReactNode}){
 return <html lang="en" suppressHydrationWarning className={`${display.variable} ${sans.variable}`}><head>
 {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN&&<script defer data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN} src="https://plausible.io/js/script.js"/>}
 <script dangerouslySetInnerHTML={{__html:`try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme:dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`}}/></head>
 <body className="font-sans antialiased"><Header/><main>{children}</main><Footer/></body></html>}
