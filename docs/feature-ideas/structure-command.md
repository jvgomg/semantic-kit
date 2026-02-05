# Structure Command Design

Design specification for the `structure` and `structure:js` commands.

---

## Overview

The `structure` command shows the semantic structure of a page: landmarks, heading hierarchy, and links. It provides insight into how the page is organized without extracting content.

---

## Commands

| Command                 | Input             | Rendering                 |
| ----------------------- | ----------------- | ------------------------- |
| `structure <url\|file>` | URL or local file | Static HTML               |
| `structure:js <url>`    | URL only          | Playwright (rendered DOM) |

---

## Output

### Compact View (Default)

```
┌─────────────────────────────────────────────────────────────
│ Page Structure
│ https://example.com
├─────────────────────────────────────────────────────────────
│ Landmarks:  header · nav (2) · main · article · aside · footer
│ Headings:   1×h1 · 4×h2 · 6×h3 · 2×h4
│ Links:      47 internal · 12 external
└─────────────────────────────────────────────────────────────
```

### Expanded View (`--expanded`)

```
┌─────────────────────────────────────────────────────────────
│ Page Structure
│ https://example.com
├─────────────────────────────────────────────────────────────
│ Landmarks
│   <header>
│   <nav> (primary navigation)
│   <main>
│     <article>
│     <aside>
│   <nav> (footer navigation)
│   <footer>
├─────────────────────────────────────────────────────────────
│ Heading Outline
│   h1: Welcome to Example
│     h2: Introduction
│     h2: Main Features
│       h3: Feature One
│       h3: Feature Two
│       h3: Feature Three
│     h2: Getting Started
│       h3: Installation
│         h4: Requirements
│         h4: Steps
│     h2: Conclusion
│   h2: Related Articles (aside)
├─────────────────────────────────────────────────────────────
│ Links
│   Internal (47):
│     /about (3)
│     /features (2)
│     /docs (5)
│     ... and 37 more
│   External (12):
│     github.com (4)
│     twitter.com (2)
│     ... and 6 more
└─────────────────────────────────────────────────────────────
```

### JSON Output (`--json`)

```json
{
  "url": "https://example.com",
  "landmarks": [
    { "tag": "header", "count": 1 },
    { "tag": "nav", "count": 2 },
    { "tag": "main", "count": 1 },
    { "tag": "article", "count": 1 },
    { "tag": "aside", "count": 1 },
    { "tag": "footer", "count": 1 }
  ],
  "headings": {
    "outline": [
      {
        "level": 1,
        "text": "Welcome to Example",
        "children": [
          { "level": 2, "text": "Introduction", "children": [] },
          { "level": 2, "text": "Main Features", "children": [...] }
        ]
      }
    ],
    "counts": { "h1": 1, "h2": 4, "h3": 6, "h4": 2 }
  },
  "links": {
    "internal": {
      "count": 47,
      "destinations": [
        { "href": "/about", "count": 3 },
        { "href": "/features", "count": 2 }
      ]
    },
    "external": {
      "count": 12,
      "domains": [
        { "domain": "github.com", "count": 4 },
        { "domain": "twitter.com", "count": 2 }
      ]
    }
  }
}
```

---

## Flags

| Flag         | Description                                      |
| ------------ | ------------------------------------------------ |
| `--expanded` | Show full hierarchy instead of summary           |
| `--json`     | Output as JSON for scripting                     |
| `--links`    | In expanded view, show all links (not truncated) |

---

## Data Extraction

### Landmarks

Query for semantic landmark elements:

```typescript
const landmarks = [
  'header',
  'nav',
  'main',
  'article',
  'section',
  'aside',
  'footer',
]
const elements = document.querySelectorAll(landmarks.join(', '))
```

**Note:** `<section>` is only a landmark if it has an accessible name (aria-label, aria-labelledby, or heading). For initial implementation, we may count all sections.

### Headings

Query for heading elements and build hierarchy:

```typescript
const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
```

Building the outline:

1. Track current level
2. When level increases, nest under parent
3. When level decreases or stays same, move to appropriate ancestor
4. Handle skipped levels gracefully (for warnings later)

### Links

Query for anchor elements:

```typescript
const links = document.querySelectorAll('a[href]')
```

Classify as internal/external:

- Parse `href` attribute
- Compare hostname to page hostname
- Handle relative URLs, fragments, mailto:, tel:, etc.

---

## Warnings (Phase 4+)

After `validate:a11y` is built, add inline warnings to the structure output:

```
│ Landmarks:  header · nav (2) · main · article · aside · footer
│ Headings:   1×h1 · 4×h2 · 6×h3 · 2×h4
│             ⚠ Skipped level: h2 → h4 (missing h3)
│ Links:      47 internal · 12 external
```

Potential warnings:

- No `<main>` landmark
- Multiple `<main>` elements
- Multiple `<h1>` elements
- Skipped heading levels (h1 → h3)
- No headings at all
- Very few internal links
- Heading outside landmark

---

## Implementation Notes

### Dependencies

**`structure` (static):** No new dependencies

- Uses linkedom (already available)
- Uses fetchHtmlContent from lib

**`structure:js` (rendered):** Requires Playwright

- Same pattern as `bot` command
- Dynamic import with fallback message

### File Structure

```
src/commands/
  structure.ts      # Static HTML analysis
  structure-js.ts   # Rendered DOM analysis (shares logic with structure.ts)
```

Or single file with mode detection:

```
src/commands/
  structure.ts      # Handles both, with renderMode parameter
```

### Shared Logic

Extract core analysis to reusable functions:

```typescript
// Can be called with linkedom document or Playwright page content
function analyzeStructure(document: Document): StructureAnalysis {
  return {
    landmarks: extractLandmarks(document),
    headings: extractHeadingOutline(document),
    links: extractLinks(document, baseUrl),
  }
}
```

---

## Research Notes

### Libraries to Investigate

For static HTML analysis, investigate:

- Does axe-core work on JSDOM/linkedom? (probably limited)
- Are there heading outline algorithms we can use?
- HTML5 outline algorithm (deprecated but informative)

### Landmark Detection Nuances

ARIA landmark roles to consider:

- `<header>` → `banner` (only if not nested in article/section)
- `<footer>` → `contentinfo` (only if not nested in article/section)
- `<nav>` → `navigation`
- `<main>` → `main`
- `<aside>` → `complementary`
- `<section>` → `region` (only with accessible name)
- `<form>` → `form` (only with accessible name)

For initial implementation, focus on the HTML elements. ARIA role detection can be added later for `a11y` command.

---

## Success Criteria

The `structure` command is complete when:

1. Shows landmarks with counts
2. Shows heading outline with hierarchy
3. Shows link counts (internal/external)
4. Supports compact (default) and expanded views
5. Supports `--json` output
6. Works on URLs and local files
7. Has documentation following existing patterns
