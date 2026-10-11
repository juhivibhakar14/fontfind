# SEO From Scratch — a guide for FontFind

## 1. What SEO is
SEO (search engine optimisation) means making it easy for Google to **find, understand and trust** your pages, so it shows them to people searching for what you offer. It has three parts:

| Part | Question it answers | Your status |
|---|---|---|
| **Technical** | Can Google crawl my site quickly and without errors? | Mostly built in (sitemap, robots, canonicals, fast pages) |
| **Content / on-page** | Does each page clearly match what people search for? | Titles, headings, FAQ done; font pages need unique text |
| **Authority** | Do other sites link to me and mention me? | Not started. This is the slow part |

## 2. How Google works (3 steps)
1. **Crawl:** Google's bot follows links and your sitemap to discover pages.
2. **Index:** it reads each page and stores it. Not every page gets indexed.
3. **Rank:** when someone searches, Google picks the best-matching indexed pages.

A brand-new site usually takes days to weeks to get indexed and months to earn real traffic. This is normal. Don't panic or keep rewriting.

## 3. Keywords and search intent
A **keyword** is what people type. **Intent** is what they want. Your main intent is "I have an image and want to know the font". Related intents: similar fonts, font pairings, "is X font free".

How to research for free:
- Type your idea into Google and read the **autocomplete** and **People also ask** boxes.
- Look at who ranks for "what font is this". Those are your competitors. Ask: what do they do that I could do better or more simply?
- After launch, Search Console shows the real queries you appear for. This is the best research source.
- Prefer specific phrases ("fonts similar to Montserrat") over huge ones ("fonts"). Big terms are dominated by established sites.

## 4. Day-1 setup (do these in order)
1. Deploy on your real domain over HTTPS. Set `NEXT_PUBLIC_SITE_URL` to it.
2. **Google Search Console** (search.google.com/search-console): add your domain. Verify by DNS, or paste the meta-tag code into `NEXT_PUBLIC_GSC_VERIFICATION` in `.env`.
3. In Search Console → Sitemaps, submit `https://yourdomain.com/sitemap.xml`.
4. In Search Console → URL Inspection, paste your homepage and click **Request indexing**.
5. Repeat for **Bing Webmaster Tools** (it can import from Google Search Console).
6. Turn on privacy-friendly analytics (`NEXT_PUBLIC_PLAUSIBLE_DOMAIN`).

## 5. On-page checklist (per page)
- **Title tag:** unique, roughly 50–60 characters, main phrase near the front.
- **Meta description:** unique, roughly 150–160 characters, written to make people click. It doesn't directly affect ranking but affects clicks.
- **One H1** that says what the page is. Use H2/H3 for sections.
- **Descriptive image alt text** and meaningful link text ("fonts similar to Lora", not "click here").
- **Internal links:** link related pages to each other so Google can discover them and understand the structure.
- **Clean URLs:** `/fonts/poppins`, short, lowercase.
- **Canonical URL:** tells Google the preferred address of a page (already set).
- **Structured data:** helps Google understand pages (WebApplication and FAQ are set).
Already done in this project: titles, descriptions, canonicals, Open Graph, sitemap, robots, structured data.

## 6. Technical health
- **Core Web Vitals** measure loading (LCP), responsiveness (INP) and layout shift (CLS). Test with PageSpeed Insights (pagespeed.web.dev) and Lighthouse in Chrome DevTools. Aim for "good" on mobile.
- Keep JavaScript small, lazy-load, and never let ads or fonts push content around.
- Make sure the site works on a phone. Google judges the mobile version.
- Don't leave `noindex` tags or a blocking `robots.txt` in place by accident.

## 7. Content: the most important section for FontFind
- **Thin or duplicate pages hurt.** 600 near-identical font pages with the same template and no unique text are exactly what Google may refuse to index. Your sitemap therefore starts with only the top 50 fonts (`SITEMAP_FONT_LIMIT` in `.env`). Raise it gradually as Search Console shows those pages getting indexed.
- **Add unique, useful text to each font page:** 2–3 original sentences on what the font feels like, where it works well (logos, body text, posters), what it pairs with, and a few honest alternatives. Hand-write them for the top fonts first. Mass-generated filler is a known way to get ignored.
- Answer the searcher's question fast: the tool, the result and the copy button should be visible without scrolling.
- Update pages when you improve them. Don't publish for the sake of publishing.

## 8. Authority (links)
Links from other sites act like votes of trust. Earn them honestly:
- Launch posts: Product Hunt, "Show HN" on Hacker News, relevant subreddits (read each community's self-promotion rules first).
- Answer real questions on design forums and Q&A sites, mentioning the tool only where it truly helps.
- Get listed in "free tools for designers" roundups and directories.
- Share a genuinely useful by-product, such as a font-pairing cheat sheet, that people want to cite.
- **Never buy links or use link-exchange schemes.** It can get the site penalised.

## 9. Measuring (Search Console basics)
- **Impressions:** how often you appeared. **Clicks:** how often people visited.
- **CTR:** clicks ÷ impressions. Low CTR with high impressions means your title or description needs work.
- **Average position:** 1–10 is page one.
- **Pages report:** shows which pages are indexed and why others aren't.
Check weekly, not daily. Change one thing at a time so you know what worked.

## 10. Common beginner mistakes
- Keyword stuffing (repeating phrases unnaturally).
- Publishing thousands of low-value pages at once.
- Forgetting to set the real domain, so canonicals point to the wrong place.
- Expecting results in days.
- Chasing every trend instead of improving the core tool.

## 11. A realistic 90-day plan
**Weeks 1–2:** deploy, set up Search Console and Bing, submit sitemap, request indexing, test on mobile, fix any Search Console errors.
**Weeks 3–6:** write unique text for the top 20 fonts, launch on Product Hunt / Hacker News / a design community, improve the homepage FAQ based on real questions.
**Weeks 7–12:** read Search Console queries, rewrite titles with low CTR, add pages that match real queries, raise `SITEMAP_FONT_LIMIT` as pages get indexed, consider ads only once you have steady traffic.

## Glossary
**Crawl** – bot visiting pages. **Index** – Google's stored copy. **SERP** – search results page. **Canonical** – preferred URL. **Backlink** – link from another site. **CTR** – click-through rate. **Schema** – structured data. **Core Web Vitals** – Google's page-experience speed metrics.
