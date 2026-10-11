# FontFind
`npm install && npm run dev`. Set `NEXT_PUBLIC_SITE_URL` for canonicals/sitemap and `NEXT_PUBLIC_ADS=on` to reveal AdSlots.
Identification is a **mock** (`services/fontIdentifierService/index.ts`) — implement `FontIdentifierService` with a real model/API.
Identification: in-browser OCR (tesseract.js) + shape comparison (`lib/imageProcessing.ts`). Per-font pages: `/fonts/[slug]`. Optional env: GOOGLE_FONTS_API_KEY, NEXT_PUBLIC_PLAUSIBLE_DOMAIN.
Identification: in-browser OCR (tesseract.js) + shape comparison (lib/imageProcessing.ts). Per-font pages: /fonts/[slug]. Optional env: GOOGLE_FONTS_API_KEY, NEXT_PUBLIC_PLAUSIBLE_DOMAIN.
