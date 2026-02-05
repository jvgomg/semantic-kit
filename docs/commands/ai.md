# AI Crawlers

Show how AI crawlers see your page by extracting main content and converting it to markdown.

---

## What it does

The `ai` command shows what content extraction tools would extract from your page's static HTML and convert to markdown format.

```
Static HTML → Content Extraction → Clean HTML → Markdown Conversion
              (Readability)                      (Turndown)
```

---

## Usage

```bash
# Show extracted content as markdown
semantic-kit ai https://example.com/article

# Show raw static HTML (what crawlers actually fetch)
semantic-kit ai https://example.com --raw

# Summary output (title, word count, status)
semantic-kit ai https://example.com --format compact

# Machine-readable output for scripting
semantic-kit ai https://example.com --format json

# Analyze a local HTML file
semantic-kit ai ./dist/index.html
```

---

## Options

| Option | Description |
|--------|-------------|
| `--raw` | Show raw static HTML instead of extracted content |
| `--format full` | Default. Header + warnings + full markdown |
| `--format compact` | Summary only: title, word count, hidden status |
| `--format json` | Machine-readable JSON output |

---

## Behavior

| What it does | Why | Research |
|--------------|-----|----------|
| Fetches static HTML only | AI crawlers don't render JavaScript | [[ai-crawler-behavior]] |
| Uses Readability for extraction | Matches Jina Reader approach | [[mozilla-readability]], [[jina-reader]] |
| Converts to markdown with Turndown | Standard LLM-ready format | [[turndown]] |
| Detects hidden streaming content | Next.js and other frameworks hide content | [[streaming-ssr]] |

---

## Output

### Default output

```
┌─────────────────────────────────────────────────────────────
│ AI Crawler View
│ https://example.com/article
├─────────────────────────────────────────────────────────────
│ Title:   How to Build Better Websites
│ Author:  Jane Doe
│ Site:    Example Blog
│ Excerpt: A comprehensive guide to semantic HTML...
│ Length:  1,247 words
└─────────────────────────────────────────────────────────────

# How to Build Better Websites

The article content converted to markdown...
```

### Metadata fields

| Field | Source |
|-------|--------|
| Title | `<title>`, `<h1>`, or Open Graph meta tags |
| Author | Byline detection, `<meta name="author">` |
| Site | `<meta property="og:site_name">` |
| Excerpt | First paragraph or meta description |
| Length | Word count of extracted text |

### Warnings

| Warning | Meaning |
|---------|---------|
| "Page may not be suitable for content extraction" | Page structure doesn't match article patterns |
| "Very short content extracted" | Likely JavaScript-heavy; content not in static HTML |
| "No main content could be extracted" | Readability couldn't identify content container |
| "HIDDEN CONTENT DETECTED" | Streaming SSR hides content from crawlers |

### Hidden content warnings

When streaming SSR frameworks (Next.js, Remix, etc.) hide content:

```
🚨 NEXT.JS STREAMING DETECTED — 100% of content hidden

   Visible: ~3 words | Hidden: ~2,596 words

   Next.js streaming SSR delivers content in hidden elements that
   require JavaScript to display. AI crawlers will NOT see this content.

   To verify: Disable JavaScript in your browser and reload the page.
```

See [[streaming-ssr]] for details on detection and severity levels.

---

## JSON output

```json
{
  "title": "Article Title",
  "author": "Author Name",
  "siteName": "Site Name",
  "excerpt": "First paragraph...",
  "wordCount": 1247,
  "markdown": "# Article Title\n\n...",
  "hiddenContentAnalysis": {
    "hiddenWordCount": 2596,
    "visibleWordCount": 3,
    "hiddenPercentage": 100,
    "severity": "high",
    "framework": {
      "name": "Next.js",
      "confidence": "detected"
    },
    "hasHiddenContent": true
  }
}
```

---

## Common problems

### JavaScript-rendered content

```bash
$ semantic-kit ai https://my-spa.com
⚠ Very short content extracted (12 words) — page may be JavaScript-heavy
```

**Solution:** Use SSR or SSG. See [[ai-crawler-behavior]] for details.

### Poor page structure

```bash
$ semantic-kit ai https://example.com
⚠ This page may not be suitable for content extraction
```

**Solution:** Use semantic HTML (`<article>`, `<main>`). See [[mozilla-readability]] for what Readability looks for.

### Wrong content extracted

If navigation or footer appears in output, the page structure may be confusing Readability.

**Solution:** Keep main content in a clear container, separate from navigation.

---

## Programmatic usage

### Using Readability directly

```javascript
const { Readability } = require('@mozilla/readability')
const { JSDOM } = require('jsdom')

const dom = new JSDOM(htmlString, { url: 'https://example.com' })
const article = new Readability(dom.window.document).parse()

console.log(article.title)
console.log(article.content)    // Clean HTML
console.log(article.textContent) // Plain text
```

### Using Turndown directly

```javascript
const TurndownService = require('turndown')

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
})

const markdown = turndown.turndown(htmlString)
```

---

## Limitations

| Limitation | Impact |
|------------|--------|
| Not the actual AI crawler algorithm | Output may differ from what Claude/ChatGPT processes |
| Readability optimized for articles | May not work on apps, dashboards, product pages |
| No site-specific rules | Unlike Firecrawl, no custom extractors per domain |
| No JavaScript execution | Pure client-side content won't be visible |

---

## Related

- [[ai-crawler-behavior]] - How AI crawlers differ from Google
- [[mozilla-readability]] - The extraction algorithm
- [[jina-reader]] - Service using the same approach
- [[firecrawl]] - Alternative with different extraction
- [[streaming-ssr]] - Hidden content in modern frameworks
