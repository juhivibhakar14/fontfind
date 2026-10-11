import Link from "next/link";
export default function Footer(){return <footer className="mt-24 border-t border-line py-8 text-sm text-mute"><div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-4 px-4">
<p>FontFind — Find the font. Find your style.</p><nav className="flex gap-4" aria-label="Footer"><Link href="/">Identify Font</Link><Link href="/fonts">Explore Fonts</Link><Link href="/privacy">Privacy</Link></nav></div></footer>}
