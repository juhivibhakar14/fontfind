# TypeMatcher – Font Style Matcher & Typography Discovery

A private, client-side typography style matching and font discovery application built with Next.js 15, TypeScript, and Tailwind CSS.

## Features
- **In-Browser Style Matching**: Analyzes letterform shapes, weight, and proportions completely client-side. No images ever leave the browser.
- **Style Classification**: Estimates category (Sans Serif, Serif, Monospace, Script/Handwriting, Display), weight class (Thin, Regular, Bold, Black), and width class (Condensed, Normal, Wide).
- **Two-Stage Ranking**:
  - *Stage 1*: Filters candidates matching the estimated category and weight class within one step.
  - *Stage 2*: Ranks candidates by calibrated weighted typographic feature distance with family diversity enforcement (no duplicate family prefixes in top matches).
- **Honest Match Labels**: Categorizes results as "Strong match", "Good match", or "Weak match" based on absolute distance thresholds.
- **Specimen Explorer & Pairings**: Live specimen testing, curated pairings, and CSS copying for open-source Google Fonts.
- **Debug Mode**: Add `?debug=1` to the URL or set `NEXT_PUBLIC_DEBUG=on` to inspect OCR text, estimated style classification, and raw candidate distances.
- **Dev Test Suite**: `/test-fonts` verifies 8 test images across typographic styles in development (returns 404 in production).

## Development
```bash
npm install
npm run dev
```

## Environment Variables
- `NEXT_PUBLIC_SITE_URL`: Canonical site URL for SEO, canonical tags, and sitemap.
- `GOOGLE_FONTS_API_KEY`: Optional Google Fonts API key for dynamic font fetching.
- `NEXT_PUBLIC_GSC_VERIFICATION`: Optional Google Search Console verification code.
- `SITEMAP_FONT_LIMIT`: Optional limit on number of font pages listed in sitemap (default: 50).
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`: Optional cookieless analytics domain (e.g. plausible.io).
- `NEXT_PUBLIC_ADS`: Optional display ads toggle (`on` to enable ad slots).
- `NEXT_PUBLIC_ADSENSE_CLIENT`: Optional Google AdSense client ID for `/ads.txt`.
- `NEXT_PUBLIC_CONTACT_EMAIL`: Optional support and privacy contact email.
