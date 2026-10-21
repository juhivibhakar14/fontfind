# TypeMatcher – Font Style Matcher & Typography Discovery

TypeMatcher is a private, client-side web application for identifying fonts and discovering typography from images. Built with Next.js 15 (App Router), TypeScript, and Tailwind CSS, all image analysis and font matching runs entirely inside the user's browser without uploading images to any remote server.

## How Font Identification Works

When an image is loaded, TypeMatcher extracts letterform shapes, stroke contrast, density, and aspect ratios locally using HTML Canvas. An optional Tesseract.js OCR pass reads the visible sample text, which is then rendered across candidate fonts to compare multidimensional typographic feature vectors. Candidates are classified into matching style and weight brackets, ranked by calibrated geometric distance, and labeled with honest match confidence levels.

## Getting Started

### Prerequisites

- Node.js 18.18+ or 20+
- npm (or compatible package manager)

### Installation

```bash
npm install
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev`: Starts the Next.js local development server.
- `npm run build`: Compiles and optimizes the production build.
- `npm run start`: Starts the Next.js production server.
- `npm run lint`: Runs ESLint with Next.js core web vitals and TypeScript rules.
- `npm run lint:fix`: Automatically fixes fixable ESLint warnings and errors.
- `npm run format`: Formats all code and styles using Prettier.
- `npm run format:check`: Validates formatting against Prettier standards.
- `npm run typecheck`: Runs the TypeScript compiler (`tsc --noEmit`) to verify types.

## Folder Structure

```text
typematcher/
├── app/                  # Next.js App Router pages and metadata routes
│   ├── fonts/            # Font explorer and individual font slug SSG pages
│   ├── privacy/          # Privacy policy page
│   ├── test-fonts/       # Dev-only visual style verification suite (404 in prod)
│   ├── sitemap.ts        # Dynamic XML sitemap generator
│   └── robots.ts         # Search engine crawl directives
├── components/           # Reusable UI components (header, footer, preview, cards)
├── lib/                  # Pure utility helpers, font definitions, and image processing
│   ├── fonts/            # Font catalog data, metadata, and Google Fonts API client
│   ├── imageProcessing.ts# Feature extraction, Otsu thresholding, and style estimation
│   ├── seo.ts            # Site metadata constants and helpers
│   └── types.ts          # Centralized domain and service TypeScript types
├── services/             # Application services (font identification engine)
└── public/               # Static assets
```

## Environment Variables

Copy `.env.example` to `.env.local` to configure local variables:

- `NEXT_PUBLIC_SITE_URL`: Production canonical site URL (e.g., `https://typematcher.com`).
- `GOOGLE_FONTS_API_KEY`: Optional Google Fonts API key for dynamic font fetching.
- `NEXT_PUBLIC_GSC_VERIFICATION`: Optional Google Search Console meta verification token.
- `SITEMAP_FONT_LIMIT`: Optional maximum number of font pages in sitemap.xml (default: 50).
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`: Optional cookieless analytics domain (e.g. `yourdomain.com`).
- `NEXT_PUBLIC_ADS`: Optional display ads toggle (`on` to enable ad slots).
- `NEXT_PUBLIC_ADSENSE_CLIENT`: Optional Google AdSense client ID for `/ads.txt`.
- `NEXT_PUBLIC_CONTACT_EMAIL`: Optional support and privacy contact email address.
- `NEXT_PUBLIC_DEBUG`: Optional debug toggle (`on` to display in-browser diagnostics).
