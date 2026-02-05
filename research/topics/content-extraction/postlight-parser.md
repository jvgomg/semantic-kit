---
title: "Postlight Parser"
lastVerified: 2026-02-03
lastUpdated: 2026-02-03
---

# Postlight Parser

A content extraction library with site-specific custom parsers.

[Postlight Parser](https://github.com/postlight/parser) (formerly Mercury Parser) extracts article content, titles, authors, dates, and lead images from web pages. Unlike [[mozilla-readability]], it includes custom parsing rules for popular websites.

## Installation

```bash
npm install @postlight/parser
```

## Library Usage

```javascript
const Parser = require('@postlight/parser')

const result = await Parser.parse('https://example.com/article')

console.log(result.title)          // Article title
console.log(result.content)        // HTML content (default)
console.log(result.author)         // Author name
console.log(result.date_published) // Publication date
console.log(result.lead_image_url) // Hero image URL
console.log(result.excerpt)        // Article summary
console.log(result.word_count)     // Word count
console.log(result.domain)         // Source domain
```

## CLI Usage

```bash
npm install -g @postlight/parser

postlight-parser https://example.com/article
postlight-parser https://example.com/article --format=markdown
postlight-parser https://example.com/article --format=text
postlight-parser https://example.com/article --extend  # Include custom fields
```

### With Custom Headers

```bash
postlight-parser https://example.com/article \
  --header.Cookie="session=abc123" \
  --header.Authorization="Bearer token"
```

## Output Formats

| Format | Description |
|--------|-------------|
| `html` | Clean HTML (default) |
| `markdown` | Markdown via internal converter |
| `text` | Plain text |

## Custom Parsers

Postlight Parser's key differentiator is site-specific extraction rules [^postlight-repo]:

```javascript
// Custom parser for a specific domain
const customExtractor = {
  domain: 'example.com',
  title: {
    selectors: ['h1.article-title', 'meta[property="og:title"]'],
  },
  author: {
    selectors: ['.author-name', 'meta[name="author"]'],
  },
  content: {
    selectors: ['article.main-content', '.post-body'],
  },
  date_published: {
    selectors: ['time[datetime]', '.publish-date'],
  },
}
```

The library includes built-in parsers for major publications (Medium, NY Times, etc.), improving extraction accuracy for these sites.

## Comparison with Mozilla Readability

| Aspect | Postlight Parser | [[mozilla-readability]] |
|--------|------------------|-------------------------|
| Approach | Scoring + custom rules | Scoring algorithm only |
| Site-specific | Yes (many built-in) | No |
| Metadata | Rich (author, date, image) | Basic (title, byline) |
| Output formats | HTML, Markdown, Text | HTML only |
| Maintenance | Active | Active |
| Bundle size | Larger (includes parsers) | Smaller |

### When to Use Each

| Scenario | Recommendation |
|----------|----------------|
| General articles | Either works |
| Major publications | Postlight (custom parsers) |
| Browser integration | Readability (smaller, no network) |
| Need markdown output | Postlight (built-in) |
| Minimal dependencies | Readability |

## Also Extracts: Unfluff

Another extraction library based on python-goose:

```javascript
const unfluff = require('unfluff')

const data = unfluff(htmlString)
console.log(data.title)
console.log(data.text)        // Plain text content
console.log(data.description)
console.log(data.author)
console.log(data.publisher)
console.log(data.image)
console.log(data.tags)
```

**Links:** [npm](https://www.npmjs.com/package/unfluff) | [GitHub](https://github.com/ageitgey/node-unfluff)

## Related Pages

- [[mozilla-readability]] - The alternative scoring-only approach
- [[content-extraction]] - How extraction algorithms work
- [[turndown]] - For HTML-to-markdown conversion

## References

[^postlight-repo]:
  - **Source**: GitHub
  - **Title**: "postlight/parser"
  - **URL**: https://github.com/postlight/parser
  - **Accessed**: 2026-02-03
  - **Supports**: Custom parser system, API options

[^postlight-npm]:
  - **Source**: npm
  - **Title**: "@postlight/parser"
  - **URL**: https://www.npmjs.com/package/@postlight/parser
  - **Accessed**: 2026-02-03
  - **Supports**: Installation, CLI usage
