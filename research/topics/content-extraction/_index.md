---
title: "Content Extraction"
lastVerified: 2026-02-03
lastUpdated: 2026-02-03
---

# Content Extraction

How systems identify and extract the "main content" from web pages, separating it from navigation, ads, and other peripheral elements.

## The Problem

When consuming web pages, systems need to answer: **what content actually matters?**

A typical web page contains:
- Navigation menus
- Headers and footers
- Sidebars and ads
- Social sharing widgets
- Cookie notices
- **The actual content** (article text, product info, etc.)

Different consumers solve this differently:
- **Google** uses semantic HTML signals and renders JavaScript
- **AI crawlers** use extraction algorithms on static HTML (likely Readability-style)
- **AI answer engines** (Perplexity) use LLM-based snippet extraction based on query relevance
- **AI agents** (Claude computer use) see the full visual page via screenshots
- **Reader modes** use heuristics to find "article-like" content

See [[ai-crawler-behavior]] for detailed comparison of these approaches.

## The Two-Step Process

Most content extraction follows this pattern:

```
Raw HTML → Content Extraction → Clean HTML → Format Conversion → Output
            (Readability)                      (Turndown)
```

**Step 1: Content Extraction** identifies the main content container, removing boilerplate.

**Step 2: Format Conversion** transforms the cleaned HTML into the target format (markdown, plain text, etc.).

Problems can occur at either step:
- Extraction failures: wrong content selected, important sections removed
- Conversion failures: HTML patterns that don't map cleanly to output format

## Key Algorithms

### Readability-style Algorithms

Score DOM elements based on text characteristics:
- Character count (more text = higher score)
- Comma frequency (indicates flowing prose)
- Link density (high link density = likely navigation)

Scores "bubble up" to parent elements. The highest-scoring container becomes "main content."

See [[mozilla-readability]] for the most widely-used implementation.

### Selector-based Extraction

Use CSS selectors to target known content containers:
- `<main>`, `<article>` elements
- Classes like `.content`, `.post-body`
- Site-specific rules for known domains

[[firecrawl]] uses this approach with Cheerio.

## Implementations

| Tool | Approach | Used By |
|------|----------|---------|
| [[mozilla-readability]] | Scoring algorithm | Firefox, Jina Reader |
| [[postlight-parser]] | Scoring + site rules | Mercury Reader (legacy) |
| Cheerio + selectors | Selector-based | Firecrawl |
| [[turndown]] | HTML→Markdown | Most services |

## Implications

### For Developers

- Use semantic HTML (`<main>`, `<article>`) to help extractors
- Keep main content in a clear container, separate from navigation
- Avoid mixing content and navigation in the same parent elements
- Test with multiple extraction tools - results vary

### What Extractors Ignore

- ARIA attributes (designed for screen readers, not extractors)
- CSS-hidden content (behavior varies)
- JavaScript-rendered content (for static-only extractors)
- Navigation menus, headers, footers (by design)

### When Navigation Matters

While content extractors deliberately exclude navigation, links may still be valuable:

- **AI agents** that need to navigate further on a site
- **RAG systems** that want to crawl related pages
- **Site structure analysis** for understanding content relationships

[[jina-reader]] addresses this with the `X-With-Links-Summary` header, which appends extracted links to the output without including them in the main content.

## Related Pages

- [[reader-mode]] - How browser reader modes work
- [[mozilla-readability]] - The most common extraction algorithm
- [[postlight-parser]] - Extraction with site-specific rules
- [[turndown]] - HTML to markdown conversion
- [[jina-reader]] - How Jina's service works
- [[firecrawl]] - Selector-based extraction
- [[ai-crawler-behavior]] - How AI crawlers use extraction
- [[streaming-ssr]] - Hidden content in modern frameworks
- [[structured-data]] - Machine-readable markup (separate from extraction)
