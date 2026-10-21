"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
export default function Header() {
  const p = usePathname();
  const toggle = () => {
    const d = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("theme", d ? "dark" : "light");
    } catch {}
  };
  const nav = (h: string, l: string) => (
    <Link
      href={h}
      aria-current={p === h ? "page" : undefined}
      className={`rounded-md px-2 py-1 text-sm ${p === h ? "text-ink" : "text-mute hover:text-ink"}`}
    >
      {l}
    </Link>
  );
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="font-display text-xl font-semibold tracking-tight"
          aria-label="TypeMatcher home"
        >
          Type<span className="italic text-accent">Matcher</span>
        </Link>
        <nav className="flex items-center gap-1" aria-label="Main">
          {nav("/", "Match Font")}
          {nav("/fonts", "Explore Fonts")}
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="ml-2 rounded-md p-2 text-mute hover:text-ink"
          >
            <Sun className="hidden h-4 w-4 dark:block" />
            <Moon className="h-4 w-4 dark:hidden" />
          </button>
        </nav>
      </div>
    </header>
  );
}
