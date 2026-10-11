/** Reserved space for future display ads. Fixed min-height prevents layout shift. Renders nothing visible until enabled. */
export default function AdSlot({id,className=""}:{id:string;className?:string}){
 if(process.env.NEXT_PUBLIC_ADS!=="on")return <div aria-hidden data-ad-slot={id} className={`min-h-0 ${className}`}/>;
 return <aside aria-label="Advertisement" data-ad-slot={id} className={`my-12 flex min-h-[100px] items-center justify-center rounded-xl border border-dashed border-line text-xs text-mute ${className}`}>Advertisement</aside>}
