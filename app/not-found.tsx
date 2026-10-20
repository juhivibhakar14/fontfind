import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <p className="font-display text-8xl font-bold tracking-tight text-accent">404</p>
      <h1 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">Page not found</h1>
      <p className="mx-auto mt-3 max-w-md text-mute">
        The font, page, or resource you are looking for doesn't exist or has been moved.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-xl bg-ink px-5 py-2.5 text-sm font-medium text-bg hover:opacity-90 transition-opacity"
        >
          Match a Font
        </Link>
        <Link
          href="/fonts"
          className="rounded-xl border border-line bg-card px-5 py-2.5 text-sm font-medium hover:border-ink transition-colors"
        >
          Explore All Fonts
        </Link>
      </div>
    </div>
  );
}
