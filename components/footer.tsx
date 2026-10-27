import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line py-8 text-sm text-mute">
      <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-4 px-4">
        <div>
          <p className="font-medium text-ink">TypeMatcher — Created by Juhi</p>
          <p className="mt-1 text-xs text-mute">
            Find the font. Find your style. All fonts are open source from Google Fonts. Always
            check each font&apos;s license before commercial use.
          </p>
        </div>
        <nav className="flex flex-wrap items-center gap-4" aria-label="Footer">
          <Link href="/">Identify Font</Link>
          <Link href="/fonts">Explore Fonts</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
      </div>
    </footer>
  );
}
