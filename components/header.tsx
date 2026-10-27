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
  const renderNavLink = (href: string, label: string, mobileLabel?: string) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        aria-current={isActive ? "page" : undefined}
        className={`min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-full px-3 py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors active:scale-95 ${
          isActive
            ? "bg-accent/15 text-accent font-semibold"
            : "text-mute hover:text-ink hover:bg-line/40 active:bg-line/60"
        }`}
      >
        <span className="sm:hidden">{mobileLabel || label}</span>
        <span className="hidden sm:inline">{label}</span>
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-md pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-3 sm:px-4 gap-2">
        <Link
          href="/"
          className="min-h-[44px] inline-flex items-center font-display text-lg sm:text-xl font-semibold tracking-tight shrink-0 focus-visible:outline-none"
          aria-label="TypeMatcher home"
        >
          Type<span className="italic text-accent">Matcher</span>
        </Link>
        <nav className="flex items-center gap-2" aria-label="Main">
          {renderNavLink("/", "Match Font", "Match")}
          {renderNavLink("/fonts", "Explore Fonts", "Explore")}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-full text-mute hover:text-ink hover:bg-line/40 active:bg-line/60 transition-colors shrink-0"
          >
            <Sun className="hidden h-5 w-5 dark:block" />
            <Moon className="h-5 w-5 dark:hidden" />
          </button>
        </nav>
      </div>
    </header>
  );
}
