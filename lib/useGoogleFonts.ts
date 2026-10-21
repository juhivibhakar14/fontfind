"use client";

import { useEffect } from "react";
import type { Font } from "@/lib/fonts/data";

/** Batches up to 20 families per stylesheet request with their supported weights. */
export function useGoogleFonts(fonts: Font[]) {
  const k = fonts.map((f) => f.family).join("|");

  useEffect(() => {
    for (let i = 0; i < fonts.length; i += 20) {
      const slice = fonts.slice(i, i + 20);
      const u =
        "https://fonts.googleapis.com/css2?" +
        slice
          .map((f) => {
            const weights = f.weights && f.weights.length > 0 ? f.weights.join(";") : "400;700";
            return `family=${f.family.replace(/ /g, "+")}:wght@${weights}`;
          })
          .join("&") +
        "&display=swap";

      if (document.querySelector(`link[href="${u}"]`)) continue;
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = u;
      document.head.appendChild(l);
    }
  }, [k]);
}
