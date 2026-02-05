---
title: "Google JavaScript Rendering"
lastVerified: 2026-02-03
lastUpdated: 2026-02-03
---

# Google JavaScript Rendering

Google's Web Rendering Service (WRS) executes JavaScript to index dynamic content, making Google unique among major crawlers.

## How It Works

Google uses a two-wave indexing process [^google-js-seo]:

### Wave 1: Static HTML

Googlebot fetches the raw HTML and immediately indexes:
- Static text content
- Links for crawl queue
- Meta tags and structured data

### Wave 2: Rendered Content

Pages requiring JavaScript are queued for the Web Rendering Service:
- WRS uses headless Chromium (evergreen, always up-to-date)
- JavaScript is executed and the final DOM is captured
- Rendered content is indexed

This means JavaScript content **is** indexed, but with a delay. Critical content should be in static HTML for fastest indexing.

## Limitations

| Constraint | Limit |
|------------|-------|
| Page size | 15MB maximum |
| Rendering timeout | Resources are finite; complex JS may timeout |
| User interactions | Click events, infinite scroll not triggered |
| Authentication | Cannot log in or fill forms |

## What WRS Sees

WRS reads the **DOM after rendering**, not source HTML:

- JavaScript-injected content is indexed
- Dynamically modified meta tags are respected
- Client-side rendered content is captured

However:
- Content behind clicks or scrolls is invisible
- Lazy-loaded images need proper `<noscript>` fallbacks
- Single-page apps need proper routing for crawlability

## Testing

Use these tools to see what Googlebot sees:

- [URL Inspection Tool](https://search.google.com/search-console) - Shows rendered HTML in Search Console
- [Rich Results Test](https://search.google.com/test/rich-results) - Tests JavaScript rendering

## Related Pages

- [[google]] - Google ecosystem overview
- [[googlebot]] - Crawler identification and verification
- [[ai-crawler-behavior]] - Why AI crawlers don't render JavaScript
- [[streaming-ssr]] - Hidden content in SSR frameworks

## Official Resources

- [JavaScript SEO Basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Fix Search-related JavaScript problems](https://developers.google.com/search/docs/crawling-indexing/javascript/fix-search-javascript)

## References

[^google-js-seo]:
  - **Source**: Google Search Central
  - **Title**: "JavaScript SEO Basics"
  - **URL**: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
  - **Accessed**: 2026-02-03
  - **Supports**: Two-wave indexing, WRS behavior, rendering limitations
