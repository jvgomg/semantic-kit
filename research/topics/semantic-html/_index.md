---
title: "Semantic HTML"
lastVerified: 2026-02-03
lastUpdated: 2026-02-04
---

# Semantic HTML

How HTML structure communicates meaning to browsers, assistive technologies, search engines, and content extractors.

## What It Means

Semantic HTML uses elements that convey meaning about the content they contain, rather than just how it should look:

```html
<!-- Non-semantic -->
<div class="header">...</div>
<div class="nav">...</div>
<div class="article">...</div>

<!-- Semantic -->
<header>...</header>
<nav>...</nav>
<article>...</article>
```

Both render the same visually, but semantic elements tell consumers what the content *is*.

## Why It Matters

| Consumer | How They Use Semantic HTML |
|----------|---------------------------|
| **Screen readers** | Navigate by landmarks, announce element roles |
| **Search engines** | Understand content structure and importance |
| **Content extractors** | Identify main content vs. navigation |
| **Browser features** | Reader mode, outline generation |

## Key Concepts

### Landmarks

ARIA landmark roles identify page regions for assistive technology navigation. HTML5 sectioning elements map to these roles automatically.

See [[landmarks]] for the full mapping and best practices.

### Document Outline

Heading hierarchy (`<h1>` through `<h6>`) creates a navigable structure for screen reader users and indicates content importance to search engines.

See [[document-outline]] for heading best practices.

### Semantic Elements

HTML5 introduced elements that describe their content's purpose: `<article>`, `<main>`, `<nav>`, `<aside>`, `<section>`, `<header>`, `<footer>`.

See [[semantic-elements]] for when to use each element.

## Implications

### For Search Engines

Google uses semantic HTML to understand content structure [^google-js-seo]:

| Element | Signal |
|---------|--------|
| `<title>` | Primary page topic |
| `<h1>` through `<h6>` | Content hierarchy |
| `<main>`, `<article>` | Primary content |
| `<nav>`, `<footer>`, `<aside>` | Non-primary content |

### For Content Extraction

[[mozilla-readability]] and similar algorithms use semantic elements as signals:

- `<article>` and `<main>` suggest content containers
- `<nav>`, `<aside>`, `<footer>` are typically excluded
- Heading hierarchy helps identify article boundaries

### For Accessibility

Proper semantic HTML is foundational to accessibility:

- Landmarks enable skip navigation
- Headings provide document outline
- Proper element usage reduces need for ARIA

See [[accessibility]] for testing tools and approaches.

## Related Pages

- [[landmarks]] - ARIA landmarks and HTML5 sectioning
- [[document-outline]] - Heading hierarchy best practices
- [[semantic-elements]] - Article, main, nav, aside, etc.
- [[accessibility-tree]] - How browsers expose semantics
- [[content-extraction]] - How extractors use semantic signals
- [[example-markup-sources]] - Authoritative sources for good/bad markup examples

## References

[^google-js-seo]:
  - **Source**: Google Search Central
  - **Title**: "JavaScript SEO Basics"
  - **URL**: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
  - **Accessed**: 2026-02-03
  - **Supports**: How Google uses HTML structure signals
