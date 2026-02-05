# Page Structure

Show the semantic structure of a page: landmarks, headings, links, skip links, title, and language.

---

## What it does

The `structure` commands analyze a page's HTML and display its semantic structure — the elements that define how the page is organized for assistive technologies and search engines.

---

## Usage

### Static HTML

```bash
# Show full structure (all items, no truncation)
semantic-kit structure https://example.com

# Truncated output (top 5 link destinations)
semantic-kit structure https://example.com --format brief

# Compact summary (one line per section)
semantic-kit structure https://example.com --format compact

# Machine-readable output
semantic-kit structure https://example.com --format json

# Comprehensive accessibility checks (68 rules instead of 14)
semantic-kit structure https://example.com --all-rules

# Analyze a local file
semantic-kit structure ./dist/index.html
```

### Hydrated DOM (JavaScript)

```bash
# Requires Playwright
semantic-kit structure:js https://example.com

# With custom timeout
semantic-kit structure:js https://example.com --timeout 10000
```

### Compare static vs hydrated

```bash
semantic-kit structure:compare https://example.com
semantic-kit structure:compare https://example.com --format compact
```

---

## Options

| Option | Description |
|--------|-------------|
| `--format full` | Default. All items, no truncation |
| `--format brief` | Truncated output (top 5 per section) |
| `--format compact` | One-line summary per section |
| `--format json` | Machine-readable JSON |
| `--all-rules` | Run 68 accessibility rules instead of 14 |
| `--timeout` | Browser timeout for `structure:js` (default: 30000) |

---

## Behavior

| What it does | Why | Research |
|--------------|-----|----------|
| Detects ARIA landmarks | Screen readers navigate by landmark | [[landmarks]] |
| Analyzes heading hierarchy | Document outline for AT and SEO | [[accessibility-tree]] |
| Groups links by destination | Shows internal vs external link patterns | — |
| Runs axe-core rules (JSDOM) | Catches structural accessibility issues | [[axe-core]] |
| Compares static vs hydrated | JS may add critical structure | [[ai-crawler-behavior]] |

---

## Output

### Default output

```
┌─────────────────────────────────────────────────────────────
│ Page Structure
│ https://example.com
├─────────────────────────────────────────────────────────────
│ Title:      Example Site - Home
│ Language:   en
├─────────────────────────────────────────────────────────────
│ Skip Links
│   "Skip to main content" → #main-content
├─────────────────────────────────────────────────────────────
│ Landmarks
│   banner: 1, navigation: 2, main: 1, complementary: 1, contentinfo: 1
├─────────────────────────────────────────────────────────────
│ Heading Outline
│   h1: Welcome to Example
│     h2: Introduction
│       45 words · 2 paragraphs
│     h2: Features
│       h3: Feature One
│         120 words · 3 paragraphs
├─────────────────────────────────────────────────────────────
│ Links
│   Internal (47): /about (3), /features (2), ...
│   External (12): github.com (4), twitter.com (2), ...
└─────────────────────────────────────────────────────────────
```

### Comparison output

```
┌─────────────────────────────────────────────────────────────
│ Structure Comparison
│ https://example.com
├─────────────────────────────────────────────────────────────
│ Summary
│   Landmarks: 3 → 7 (+4)
│   Headings:  1 → 5 (+4)
│   Links:     10 → 47 (+37)
├─────────────────────────────────────────────────────────────
│ Landmark Changes
│   + navigation: 0 → 2
│   + complementary: 0 → 1
└─────────────────────────────────────────────────────────────
```

---

## What's detected

| Feature | Source |
|---------|--------|
| Title | `<title>` element |
| Language | `<html lang="...">` attribute |
| Skip links | Anchors targeting `#main`, `#content`, etc. |
| Landmarks | `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`, `role="..."` |
| Headings | `<h1>` through `<h6>` with content stats |
| Links | All `<a href>` grouped by destination |

---

## Static vs Hydrated

| Command | What it shows | Use case |
|---------|---------------|----------|
| `structure` | Static HTML | What AI crawlers see |
| `structure:js` | Hydrated DOM | What Google/browsers see |
| `structure:compare` | Differences only | Identify JS-dependent structure |

---

## structure:js

Analyzes page structure after JavaScript execution using Playwright. Shows the hydrated DOM that browsers and Google see, along with a comparison summary showing what JavaScript added.

### When to use

- Testing JavaScript-rendered pages (React, Vue, Angular)
- Verifying SSR/SSG hydration produces expected structure
- Debugging why Google sees different content than AI crawlers

### Output

The output includes a "Static vs Hydrated Comparison" section when differences exist:

```
├─────────────────────────────────────────────────────────────
│ Static vs Hydrated Comparison
│   Landmarks: 3 → 7
│   Headings:  1 → 5
│   Links:     10 → 47
```

In compact format, differences appear inline:

```
│ Landmarks:  banner: 1, navigation: 2, main: 1 (+4 from JS)
│ Headings:   h1: 1, h2: 3, h3: 2 (+4 from JS)
```

### Options

Same as `structure`, plus:

| Option | Description |
|--------|-------------|
| `--timeout` | Browser timeout in ms (default: 30000) |

---

## structure:compare

Compares static HTML structure against hydrated DOM, showing only the differences. Useful for identifying JavaScript-dependent structure that AI crawlers will miss.

### When to use

- Auditing pages for AI crawler compatibility
- Finding structure that only exists after JavaScript
- Verifying SSR delivers complete content

### Output

Shows differences between static and hydrated states:

```
┌─────────────────────────────────────────────────────────────
│ Structure Comparison
│ https://example.com
├─────────────────────────────────────────────────────────────
│ Summary
│   Landmarks: 3 → 7 (+4)
│   Headings:  1 → 5 (+4)
│   Links:     10 → 47 (+37)
├─────────────────────────────────────────────────────────────
│ Landmark Changes
│   + navigation: 0 → 2
│   + complementary: 0 → 1
├─────────────────────────────────────────────────────────────
│ Heading Changes
│   + h1: "Welcome to Example"
│   + h2: "Features"
│   + h2: "About"
├─────────────────────────────────────────────────────────────
│ Link Changes
│   Internal: +37
│     + /about
│     + /features
│     + /contact
└─────────────────────────────────────────────────────────────
```

If no differences exist:

```
│ No structural differences between static and hydrated
```

### Options

Same as `structure`, plus:

| Option | Description |
|--------|-------------|
| `--timeout` | Browser timeout in ms (default: 30000) |

---

## Accessibility rules

By default, runs **14 structure-focused rules**. Use `--all-rules` for **68 JSDOM-safe rules**.

### Default rules

- `document-title`, `html-has-lang`, `html-lang-valid`
- `bypass` (skip links)
- `landmark-no-duplicate-main`, `landmark-no-duplicate-banner`, `landmark-no-duplicate-contentinfo`
- `landmark-*-is-top-level` (banner, main, contentinfo, complementary)
- `region`, `heading-order`, `empty-heading`

### With --all-rules

Adds rules for images, links, buttons, forms, tables, lists, ARIA, frames, and deprecated elements.

### Rules requiring a browser

Color contrast and visibility-dependent rules need Playwright. Use `validate:a11y` for full coverage.

---

## Common problems

### No skip links

**Problem:** Keyboard users must tab through all navigation.

**Solution:** Add skip link as first focusable element. See [[landmarks]].

### Missing language

**Problem:** Screen readers may use wrong pronunciation.

**Solution:** Add `<html lang="en">`.

### Multiple h1 elements

**Problem:** Unclear document structure.

**Solution:** Use single `<h1>` for page title.

### Skipped heading levels

**Problem:** Screen reader users may miss content.

**Solution:** Use heading levels sequentially (h1 → h2 → h3).

### JavaScript-dependent structure

```
│ Landmarks: 0 → 5
│ Headings:  0 → 8
```

**Problem:** Structure only exists after JavaScript.

**Solution:** Use SSR. See [[ai-crawler-behavior]].

---

## JSON output

```bash
semantic-kit structure https://example.com --format json > structure.json
```

Includes: title, language, skipLinks, landmarks (skeleton, elements, outline), headings (outline, counts), links (internal, external with grouping).

---

## Requirements

`structure:js` and `structure:compare` require Playwright:

```bash
bun add playwright
bunx playwright install chromium
```

---

## Related

- [[landmarks]] — ARIA landmarks and HTML mapping
- [[accessibility-tree]] — How structure appears to AT
- [[axe-core]] — Accessibility rule engine
- [a11y command](./a11y.md) — Accessibility tree inspection
- [validate:a11y command](./validate-a11y.md) — Full accessibility validation
