"use client";

import { useState, useRef, useEffect } from "react";
import { Check, Copy } from "lucide-react";

export function CopyBtn({
  text,
  label = "Copy Name",
  className = "",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? `Copied ${label}` : label}
      className={`min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-all active:scale-95 ${
        copied
          ? "border-accent bg-accent/10 text-accent font-semibold"
          : "border-line bg-card text-ink hover:border-ink hover:bg-line/20 active:bg-line/40"
      } ${className}`}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-accent shrink-0" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 text-mute shrink-0" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

export default CopyBtn;
