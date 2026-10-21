"use client";

import { useState } from "react";
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? `Copied ${label}` : label}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm whitespace-nowrap hover:border-ink transition-colors ${className}`}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-accent" />
          <span className="text-accent">Copied</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5 text-mute" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

export default CopyBtn;
