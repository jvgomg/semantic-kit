# Readability

Raw Readability extraction and analysis showing full metrics including link density.

---

## What it does

The `readability` commands extract content using Mozilla Readability and report detailed metrics for debugging and analysis. Unlike the `reader` lens (which shows what Safari Reader sees), this utility exposes all internal metrics for developers.

| Command | Purpose |
|---------|---------|
| `readability` | Extract from static HTML |
| `readability:js` | Extract after JavaScript rendering |
| `readability:compare` | Compare static vs hydrated extraction |

---

## Usage

### Static HTML

```bash
# Full extraction with all metrics
semantic-kit readability https://example.com

# Summary output
semantic-kit readability https://example.com --format compact

# Machine-readable output
semantic-kit readability https://example.com --format json

# Analyze a local file
semantic-kit readability ./dist/index.html
```

---

## Options

| Option | Description |
|--------|-------------|
| `--format full` | Default. All metrics and full markdown content |
| `--format compact` | Metrics with truncated content preview |
| `--format json` | Machine-readable JSON output |

---

## Behavior

| What it does | Why | Research |
|--------------|-----|----------|
| Extracts via Mozilla Readability | Industry-standard content extraction | [[readability]] |
| Reports link density | High link density indicates link farms or navigation-heavy pages | [[readability]] |
| Calculates paragraph count | Indicates content structure depth | — |
| Checks isReaderable | Mozilla's heuristic for Safari Reader compatibility | [[readability]] |
| Static HTML only | Matches AI crawler behavior | [[ai-crawler-behavior]] |

---

## Output

### Default output

```
semantic-kit v0.0.16

Readability extraction for https://example.com. Took 0.2s.

EXTRACTION RESULTS
Title: Understanding Semantic HTML
Byline: Jane Smith
Site Name: Example Blog
Excerpt: A comprehensive guide to semantic HTML and why it matters...
Published: 2026-02-04

READABILITY METRICS
Word Count: 847
Character Count: 4,523
Paragraph Count: 23
Link Density: 1.2% (low - good)
Readerable: Yes

---

[Full markdown content here...]
```

### Compact output

Same metrics, but content truncated to ~25 words.

### JSON output

```json
{
  "command": {
    "name": "readability",
    "target": "https://example.com",
    "timestamp": "2026-02-10T12:00:00.000Z",
    "durationMs": 234.5,
    "version": "0.0.16"
  },
  "result": {
    "url": "https://example.com",
    "extraction": {
      "title": "Understanding Semantic HTML",
      "byline": "Jane Smith",
      "excerpt": "A comprehensive guide...",
      "siteName": "Example Blog",
      "publishedTime": "2026-02-04"
    },
    "metrics": {
      "wordCount": 847,
      "characterCount": 4523,
      "paragraphCount": 23,
      "linkDensity": 0.012,
      "isReaderable": true
    },
    "markdown": "...",
    "html": "..."
  },
  "issues": []
}
```

---

## Metrics explained

| Metric | Description | Good values |
|--------|-------------|-------------|
| Word Count | Total words in extracted content | > 100 for articles |
| Character Count | Total characters in extracted content | — |
| Paragraph Count | Number of `<p>` elements extracted | > 3 for articles |
| Link Density | Ratio of link text to total text (0-1) | < 0.1 (10%) is good |
| Readerable | Mozilla's heuristic for content suitability | Yes for articles |

### Link density assessment

| Range | Assessment | Meaning |
|-------|------------|---------|
| < 10% | Low (good) | Content-focused page |
| 10-30% | Moderate | Mixed content/navigation |
| > 30% | High | May indicate link farm or nav-heavy page |

---

## readability vs reader

| Aspect | `readability` (utility) | `reader` (lens) |
|--------|-------------------------|-----------------|
| Purpose | Developer analysis | Consumer preview |
| Link density | Shown | Hidden |
| Framing | Technical metrics | "How Safari Reader sees it" |
| Category | Tool | Lens |

Use `readability` when debugging extraction issues or analyzing content quality metrics. Use `reader` when previewing how reader modes will display content.

---

## Common problems

### Low word count

```
Word Count: 12
```

**Problem:** Readability couldn't find article content.

**Solution:** Ensure content is in semantic elements (`<article>`, `<main>`) with sufficient text. Add proper heading structure.

### High link density

```
Link Density: 45.2% (high - may indicate link farm)
```

**Problem:** More link text than content text.

**Solution:** This may be expected for navigation pages. For articles, reduce inline links or move navigation to separate elements.

### Readerable: No

```
Readerable: No
```

**Problem:** Mozilla's heuristic doesn't detect article-like content.

**Solution:** Add more text content, use semantic markup, ensure paragraphs have sufficient length.

### Extraction failed

```
EXTRACTION RESULTS
Status: Extraction failed - no content found
```

**Problem:** Readability returned null.

**Solution:** Page may lack article structure. Ensure `<article>` or main content area exists with meaningful text.

---

## TUI

The readability utility is available in the TUI under **Tools > Readability**.

```bash
semantic-kit tui
# Then select Readability from the Tools section
```

---

## Programmatic usage

```typescript
import { fetchReadability } from 'semantic-kit'

const result = await fetchReadability('https://example.com')

console.log(result.metrics.linkDensity) // 0.012
console.log(result.metrics.isReaderable) // true
console.log(result.extraction?.title) // "Understanding Semantic HTML"
```

---

## Related

- [[readability]] — How Mozilla Readability works
- [[ai-crawler-behavior]] — How AI crawlers extract content
- [reader command](./reader.md) — Consumer-focused reader mode preview
