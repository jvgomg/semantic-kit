---
title: "Google"
lastVerified: 2026-02-03
lastUpdated: 2026-02-03
---

# Google

How Google crawls, renders, and indexes web content.

Google is unique among web consumers in that it **renders JavaScript**. Most other crawlers (AI bots, content extractors) only see static HTML. This has significant implications for how you build websites.

## Key Concepts

### Two-Wave Indexing

Google uses a two-phase approach [^google-js-seo]:

**Wave 1 (Immediate):** Googlebot fetches the raw HTML and indexes static content immediately. Links are discovered and queued for crawling.

**Wave 2 (Deferred):** Pages requiring JavaScript are queued for the Web Rendering Service (WRS), which uses headless Chromium to execute JavaScript and capture the rendered DOM.

This means JavaScript-rendered content **is** indexed, but with a delay. Critical content should be in static HTML for fastest indexing.

### What Googlebot Sees

Googlebot reads the **DOM after rendering**, not just source HTML [^google-js-seo]. This means:

- JavaScript-injected content is indexed
- Dynamically modified meta tags are respected
- Client-side rendered content is captured

However, there are limits:
- 15MB file size limit - content beyond this is ignored
- Rendering resources are finite - complex JavaScript may timeout
- Some patterns fail - infinite scrolls, user-triggered content

### HTML Structure Signals

Google uses semantic HTML to understand content hierarchy [^google-js-seo]:

| Element | Signal |
|---------|--------|
| `<title>` | Primary signal for page topic |
| `<h1>` through `<h6>` | Content structure and importance |
| `<main>`, `<article>`, `<section>` | Semantic regions |
| `<nav>`, `<footer>`, `<aside>` | Non-primary content indicators |

Well-structured HTML helps Google understand what matters on your page.

### Structured Data

Google extracts structured data from JSON-LD, Microdata, and RDFa markup. This enables rich results (recipes, events, FAQs) in search results.

See [[google-structured-data]] for format requirements and validation.

## Related Pages

### Google-Specific
- [[googlebot]] - Crawler behavior and identification
- [[google-javascript-rendering]] - WRS details and limitations
- [[google-structured-data]] - Rich results and JSON-LD requirements

### Cross-Cutting Topics
- [[semantic-html]] - How HTML structure affects Google indexing
- [[structured-data]] - General structured data concepts
- [[content-extraction]] - How extraction compares to Google's approach

## Official Resources

- [Google Search Central](https://developers.google.com/search) - Official documentation
- [Google Search Central Blog](https://developers.google.com/search/blog) - Announcements
- [Search Console](https://search.google.com/search-console) - Site monitoring

## References

[^google-js-seo]:
  - **Source**: Google Search Central
  - **Title**: "JavaScript SEO Basics"
  - **URL**: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
  - **Accessed**: 2026-02-03
  - **Supports**: Two-wave indexing process, JavaScript rendering behavior
