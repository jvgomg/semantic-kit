# Google

Show how Googlebot sees your page for search indexing.

---

## What it does

The `google` lens shows what Googlebot extracts when crawling your page: page metadata, Google-recognized structured data (JSON-LD), and heading structure. This helps you understand what signals Google receives for search ranking and rich results.

---

## Usage

```bash
# Show Google's view of your page
semantic-kit google https://example.com

# Summary output
semantic-kit google https://example.com --format compact

# Machine-readable output
semantic-kit google https://example.com --format json

# Analyze a local file
semantic-kit google ./dist/index.html
```

---

## Options

| Option | Description |
|--------|-------------|
| `--format full` | Default. Full metadata, schemas, and headings |
| `--format compact` | Summary counts only |
| `--format json` | Machine-readable JSON output |

---

## What it shows

### Page Metadata

| Field | Source | Why it matters |
|-------|--------|----------------|
| Title | `<title>` | Search result title |
| Description | `<meta name="description">` | Search result snippet |
| Canonical | `<link rel="canonical">` | Duplicate content handling |
| Language | `<html lang="...">` | International targeting |

### Structured Data

Only shows JSON-LD schemas Google recognizes for rich results:

| Schema Type | Rich Result |
|-------------|-------------|
| Article, BlogPosting | News carousel, article features |
| Product, Offer | Product listings, prices |
| Recipe | Recipe cards |
| FAQPage | FAQ accordion |
| HowTo | How-to steps |
| BreadcrumbList | Breadcrumb navigation |
| Organization | Knowledge panel |
| VideoObject | Video results |
| Event | Event listings |

### Heading Structure

Shows H1-H6 hierarchy to help verify:
- Single H1 (recommended)
- Logical heading order (no skipped levels)
- Content structure signals

---

## Output

### Default output

```
semantic-kit v0.0.17

Google lens analysis for https://example.com. Took 0.2s.

PAGE METADATA
Title: How to Build Better Websites | Example Blog
Description: A comprehensive guide to semantic HTML and why it matters for SEO.
Canonical: https://example.com/guide
Language: en

STRUCTURED DATA (2 schemas)
Article
  headline: How to Build Better Websites
  author: Jane Smith
  datePublished: 2026-02-01

BreadcrumbList
  items: Home > Blog > Guide

HEADING STRUCTURE (6 headings)
h1 (1): How to Build Better Websites
  h2 (3): Introduction, Getting Started, Conclusion
    h3 (2): Prerequisites, Tools
```

---

## Common problems

### Missing description

```
Description: (none)
```

**Problem:** No meta description found.

**Solution:** Add `<meta name="description" content="...">` to your page.

### No structured data

```
STRUCTURED DATA (0 schemas)
No Google-recognized schemas found.
```

**Problem:** No JSON-LD schemas that Google uses for rich results.

**Solution:** Add relevant structured data. See [Google Search Central](https://developers.google.com/search/docs/appearance/structured-data) for supported types.

### Multiple H1 tags

```
h1 (3): Title One, Title Two, Title Three
```

**Problem:** Multiple H1 elements can confuse content hierarchy.

**Solution:** Use a single H1 for the main page title.

### Skipped heading levels

```
h1: Title
  h3: Subsection (skipped h2)
```

**Problem:** Jumping from H1 to H3 breaks heading hierarchy.

**Solution:** Use sequential heading levels (H1 > H2 > H3).

---

## What it doesn't show

The `google` lens focuses on crawl-time signals. It doesn't show:

- **Open Graph / Twitter Cards** - Use the `social` lens
- **JavaScript-rendered content** - Use `schema:js` or `structure:js`
- **PageRank or ranking signals** - Not available
- **How content renders** - Use browser DevTools

---

## TUI

The Google lens is available in the TUI under **Lenses > Google**.

```bash
semantic-kit tui
# Then select Google from the Lenses section
```

---

## Related

- [Social](./social.md) - Open Graph and Twitter Cards for sharing
- [Schema](./schema.md) - All structured data (not just Google-recognized)
- [Structure](./structure.md) - Full page structure analysis
