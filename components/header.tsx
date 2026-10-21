"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
export default function Header() {
  const pathname = usePathname();
  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch {
      // Ignore localStorage access failure (e.g. private mode)
    }
  };
  const renderNavLink = (href: string, label: string) => (
    <Link
      href={href}
      aria-current={pathname === href ? "page" : undefined}
      className={`rounded-md px-2 py-1 text-sm ${pathname === href ? "text-ink" : "text-mute hover:text-ink"}`}
    >
      {label}
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
          {renderNavLink("/", "Match Font")}
          {renderNavLink("/fonts", "Explore Fonts")}
          <button
            onClick={toggleTheme}
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
