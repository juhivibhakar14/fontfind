"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqAccordionProps {
  items: [string, string][];
}

export default function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="mt-6 flex flex-col gap-3">
      {items.map(([q, a], i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={q}
            className={`group rounded-2xl border transition-all duration-200 ${
              isOpen
                ? "border-accent/40 bg-card shadow-sm ring-1 ring-accent/20"
                : "border-line bg-card/60 hover:border-line/80 hover:bg-card"
            }`}
          >
            <button
              type="button"
              id={`faq-question-${i}`}
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${i}`}
              onClick={() => toggle(i)}
              className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <span
                className={`text-base font-medium transition-colors sm:text-lg ${
                  isOpen ? "text-accent" : "text-ink"
                }`}
              >
                {q}
              </span>
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-line/40 text-mute transition-all duration-300 group-hover:bg-line/70 group-hover:text-ink ${
                  isOpen
                    ? "rotate-180 bg-accent/10 text-accent"
                    : "rotate-0"
                }`}
                aria-hidden="true"
              >
                <ChevronDown className="h-4 w-4" />
              </span>
            </button>

            <div
              id={`faq-answer-${i}`}
              role="region"
              aria-labelledby={`faq-question-${i}`}
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                isOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="border-t border-line/40 px-5 pb-5 pt-3 text-sm leading-relaxed text-mute sm:text-base">
                  {a}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
