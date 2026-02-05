---
title: "Semantic Elements"
lastVerified: 2026-02-03
lastUpdated: 2026-02-03
---

# Semantic Elements

HTML5 elements that describe the purpose of their content.

## Overview

HTML5 introduced sectioning and grouping elements that convey meaning about their content [^mdn-elements]:

| Element | Purpose | Landmark Role |
|---------|---------|---------------|
| `<main>` | Primary page content | `main` |
| `<article>` | Self-contained composition | `article` |
| `<section>` | Thematic grouping | `region` (if named) |
| `<nav>` | Navigation links | `navigation` |
| `<aside>` | Tangentially related content | `complementary` |
| `<header>` | Introductory content | `banner` (if top-level) |
| `<footer>` | Footer content | `contentinfo` (if top-level) |

## When to Use Each Element

### `<main>`

The dominant content of the document. Use once per page:

```html
<body>
  <header>...</header>
  <main>
    <!-- Primary content here -->
  </main>
  <footer>...</footer>
</body>
```

**Do:**
- Use exactly once per page
- Place as a direct child of `<body>`

**Don't:**
- Nest inside `<article>`, `<aside>`, `<header>`, `<footer>`, or `<nav>`

### `<article>`

Self-contained content that could be distributed independently (blog post, news article, forum post, product card):

```html
<article>
  <h2>Article Title</h2>
  <p>Article content...</p>
</article>
```

**Do:**
- Use for content that makes sense on its own
- Include a heading

**Don't:**
- Use as a generic container (use `<div>` instead)

### `<section>`

A thematic grouping of content, typically with a heading:

```html
<section>
  <h2>Features</h2>
  <p>Our product features...</p>
</section>
```

**Do:**
- Use when content has a natural heading
- Give it an accessible name for landmark navigation

**Don't:**
- Use as a styling wrapper (use `<div>`)
- Use without a heading (consider `<div>` instead)

### `<nav>`

Major navigation blocks:

```html
<nav aria-label="Main">
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>
```

**Do:**
- Use for primary navigation, table of contents, breadcrumbs
- Label with `aria-label` if multiple navs exist

**Don't:**
- Use for every group of links (footer links often don't need `<nav>`)

### `<aside>`

Content tangentially related to surrounding content (sidebars, pull quotes, advertising):

```html
<article>
  <p>Main article text...</p>
  <aside>
    <p>Related: See also our guide on...</p>
  </aside>
</article>
```

### `<header>` and `<footer>`

Introductory and closing content for their nearest sectioning ancestor:

```html
<article>
  <header>
    <h2>Article Title</h2>
    <p>By Author Name</p>
  </header>
  <p>Content...</p>
  <footer>
    <p>Published: 2024-01-15</p>
  </footer>
</article>
```

**Note:** Only top-level `<header>` and `<footer>` (not inside `<article>`, `<section>`, etc.) map to `banner` and `contentinfo` landmarks.

## Consumers

### Search Engines

Google uses semantic elements to understand content structure. `<main>` and `<article>` signal primary content; `<nav>`, `<aside>`, and `<footer>` indicate supporting content [^google-seo].

### Content Extractors

[[mozilla-readability]] and similar tools use semantic elements as signals:
- `<article>` containers get higher scores
- `<nav>`, `<aside>`, `<footer>` are typically excluded
- `<main>` helps identify the content boundary

### Screen Readers

Semantic elements create the [[accessibility-tree]] structure. Users can navigate by landmarks and understand page organization.

## Common Mistakes

| Mistake | Problem | Solution |
|---------|---------|----------|
| `<section>` without heading | No landmark unless named | Add heading or use `<div>` |
| Multiple `<main>` elements | Confusing for assistive tech | Use exactly one `<main>` |
| `<article>` for non-articles | Misleading semantics | Use `<div>` or `<section>` |
| `<nav>` for all link groups | Clutters landmark navigation | Reserve for major navigation |

## Related Pages

- [[landmarks]] - How elements map to ARIA landmarks
- [[document-outline]] - Heading hierarchy within sections
- [[semantic-html]] - Overview of semantic HTML
- [[content-extraction]] - How extractors use semantic signals

## References

[^google-seo]:
  - **Source**: Google Search Central
  - **Title**: "JavaScript SEO Basics"
  - **URL**: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
  - **Accessed**: 2026-02-03
  - **Supports**: How Google uses semantic HTML structure

[^mdn-elements]:
  - **Source**: MDN
  - **Title**: "HTML elements reference"
  - **URL**: https://developer.mozilla.org/en-US/docs/Web/HTML/Element
  - **Accessed**: 2026-02-03
  - **Supports**: Element definitions and usage guidelines
