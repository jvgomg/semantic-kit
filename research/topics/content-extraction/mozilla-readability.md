---
title: "Mozilla Readability"
lastVerified: 2026-02-03
lastUpdated: 2026-02-03
---

# Mozilla Readability

The content extraction library that powers Firefox Reader View.

Mozilla Readability is an open-source JavaScript library that identifies and extracts the "main content" from web pages. It's the most widely-used [[readability]] implementation, used by Firefox, [[jina-reader]], and many other tools.

## How It Works

The algorithm follows these steps [^readability-repo]:

### 1. Initial Cleanup

Removes elements that are never content:
- `<script>`, `<style>`, `<form>`, `<iframe>`
- Known non-content patterns

### 2. Candidate Identification

Identifies paragraph (`<p>`) elements and discards those with fewer than 25 characters.

### 3. Scoring

Each paragraph is scored based on:

| Factor | Effect |
|--------|--------|
| Character count | More text = higher score |
| Comma frequency | Commas indicate flowing prose |
| Link density | High link ratio = likely navigation (negative) |

### 4. Score Propagation

Scores "bubble up" the DOM tree:
- Direct parent receives full score
- Grandparent receives half score
- Great-grandparent receives one-third score

### 5. Selection

The highest-scoring ancestor container becomes the "main content."

## Configuration

```javascript
const { Readability } = require('@mozilla/readability')
const { JSDOM } = require('jsdom')

const dom = new JSDOM(html, { url: 'https://example.com' })
const article = new Readability(dom.window.document, {
  charThreshold: 500,        // Minimum characters for valid article
  nbTopCandidates: 5,        // Candidates to consider
  classesToPreserve: [],     // CSS classes to keep
  keepClasses: false,        // Preserve all classes
}).parse()
```

## Output

```javascript
{
  title: "Article Title",
  content: "<div>...</div>",    // Clean HTML
  textContent: "Plain text...", // Text only
  excerpt: "First paragraph...",
  byline: "Author Name",
  siteName: "Site Name",
  length: 1500,                 // Character count
}
```

## Security

The `content` output is HTML that may contain unsafe elements. Sanitize before rendering in a browser [^readability-repo]:

```javascript
import DOMPurify from 'dompurify'

const article = new Readability(dom.window.document).parse()
const safeHtml = DOMPurify.sanitize(article.content)
```

## isProbablyReaderable

A quick heuristic to determine if a page is suitable for reader mode **before** running the full algorithm [^readability-repo]. Firefox uses this to show/hide the reader mode button.

Checks for:
- Sufficient text content
- Identifiable article structure
- Low link-to-text ratio

## Limitations

- **Optimized for articles** - May not work well on product pages, apps, dashboards
- **Heuristic-based** - Edge cases produce unexpected results
- **No site-specific rules** - Unlike [[postlight-parser]], doesn't have per-domain customization
- **English-centric scoring** - Comma frequency may not apply to all languages

## Used By

- **Firefox Reader View** - Built-in browser feature
- **[[jina-reader]]** - Web content to markdown API
- **semantic-kit** - The `ai` command uses this for content extraction
- Many RSS readers and read-later services

## Comparison with Alternatives

| Library | Approach | Strengths |
|---------|----------|-----------|
| Mozilla Readability | Scoring algorithm | Battle-tested, widely used |
| [[postlight-parser]] | Scoring + site rules | Custom parsers for popular sites |
| Cheerio + selectors | Manual selection | Full control, requires configuration |

## Related Pages

- [[reader-mode]] - How browser reader modes work (Mozilla vs Apple)
- [[readability]] - The general concept
- [[jina-reader]] - Service using Mozilla Readability
- [[content-extraction]] - Overview of extraction approaches

## References

[^readability-repo]:
  - **Source**: GitHub
  - **Title**: "mozilla/readability"
  - **URL**: https://github.com/mozilla/readability
  - **Accessed**: 2026-02-03
  - **Supports**: Algorithm description, configuration options, output format, security recommendations

[^ctrl-blog-content]:
  - **Source**: Ctrl blog
  - **Title**: "Web Reading Mode: The non-standard rendering mode"
  - **URL**: https://www.ctrl.blog/entry/browser-reading-mode-content.html
  - **Author**: Daniel Aleksandersen
  - **Accessed**: 2026-02-03
  - **Supports**: Comparison with other implementations, browser differences
