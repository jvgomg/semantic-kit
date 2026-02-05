---
title: "ARIA Landmarks"
lastVerified: 2026-02-03
lastUpdated: 2026-02-03
---

# ARIA Landmarks

Landmark roles identify regions of a page for assistive technology navigation.

## What They Are

Landmarks are ARIA roles that define the purpose of page regions. Screen reader users can jump directly between landmarks, skipping repetitive content like navigation.

## HTML to Role Mapping

HTML5 sectioning elements automatically map to landmark roles:

| HTML Element | Landmark Role | Condition |
|--------------|---------------|-----------|
| `<header>` | `banner` | Only when top-level (not inside article, aside, main, nav, section) |
| `<nav>` | `navigation` | Always |
| `<main>` | `main` | Always |
| `<aside>` | `complementary` | Always |
| `<footer>` | `contentinfo` | Only when top-level |
| `<section>` | `region` | Only when it has an accessible name |
| `<form>` | `form` | Only when it has an accessible name |
| `<article>` | `article` | Always (not technically a landmark, but navigable) |

Elements can also use explicit `role` attributes:

```html
<div role="search">...</div>
<div role="navigation" aria-label="Footer">...</div>
```

## Best Practices

### One of Each Major Landmark

Pages should have exactly one `banner`, `main`, and `contentinfo`:

```html
<header>...</header>      <!-- banner -->
<main>...</main>          <!-- main -->
<footer>...</footer>      <!-- contentinfo -->
```

### Label Duplicate Landmarks

When multiple landmarks of the same type exist, distinguish them with `aria-label`:

```html
<nav aria-label="Main">...</nav>
<nav aria-label="Footer">...</nav>
```

### Top-Level Placement

Major landmarks should be direct children of `<body>`, not nested inside other landmarks (except `region` and `article` inside `main`).

### Search Landmark

Use `role="search"` for search forms:

```html
<form role="search">
  <input type="search" aria-label="Search site">
  <button>Search</button>
</form>
```

## Skip Links

Skip links complement landmarks by providing keyboard-accessible shortcuts:

```html
<a href="#main-content" class="skip-link">Skip to main content</a>
```

Common skip link targets:
- `#main`, `#main-content`, `#content` — Main content
- `#navigation`, `#nav` — Navigation
- `#search` — Search form

## Consumers

| Consumer | How They Use Landmarks |
|----------|----------------------|
| Screen readers | Navigate by landmark (e.g., "Jump to main") |
| Browser extensions | Generate page outlines |
| Search engines | Understand page regions |
| Content extractors | Identify main content area |

## Related Pages

- [[accessibility-tree]] — How landmarks appear in the accessibility tree
- [[axe-core]] — Rules for landmark validation

## References

[^wai-landmarks]:
  - **Source**: W3C WAI
  - **Title**: "ARIA Landmarks Example"
  - **URL**: https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/
  - **Accessed**: 2026-02-03
  - **Supports**: Landmark patterns and usage guidance

[^html-sectioning]:
  - **Source**: WHATWG
  - **Title**: "HTML Living Standard - Sections"
  - **URL**: https://html.spec.whatwg.org/multipage/sections.html
  - **Accessed**: 2026-02-03
  - **Supports**: HTML element to role mapping rules
