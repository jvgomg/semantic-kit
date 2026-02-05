---
title: "Firecrawl"
lastVerified: 2026-02-03
lastUpdated: 2026-02-03
---

# Firecrawl

An API service that converts web pages to LLM-ready formats.

[Firecrawl](https://www.firecrawl.dev/) is a web scraping service designed for AI applications. It handles JavaScript rendering, content extraction, and markdown conversion in a single API call.

## Technology Stack

Based on analysis of Firecrawl's `apps/api/package.json` [^firecrawl-repo]:

| Dependency | Version | Purpose |
|------------|---------|---------|
| `turndown` | 7.1.3 | HTML to markdown conversion |
| `joplin-turndown-plugin-gfm` | 1.0.12 | GitHub Flavored Markdown (tables, strikethrough) |
| `cheerio` | 1.0.0-rc.12 | jQuery-like DOM manipulation |
| `playwright` | — | Browser automation for JavaScript rendering |

## Process

```
URL → Playwright → Rendered DOM → Cheerio → Clean HTML → Turndown → Markdown
      (render)                    (extract)              (convert)
```

1. **Fetch** - Playwright loads the page in a headless browser
2. **Render** - JavaScript executes, dynamic content loads
3. **Extract** - Cheerio parses the DOM, removes non-content elements
4. **Convert** - [[turndown]] transforms HTML to markdown

## API Usage

```javascript
const result = await firecrawl.scrape('https://example.com', {
  formats: ['markdown', 'html', 'links'],
  onlyMainContent: true,
  includeTags: ['article', 'main'],
  excludeTags: ['nav', 'footer'],
  waitFor: 2000,
  timeout: 30000,
})
```

### Key Options

| Option | Description |
|--------|-------------|
| `formats` | Output formats: `markdown`, `html`, `links`, `screenshot` |
| `onlyMainContent` | Extract only main content (vs full page) |
| `includeTags` | HTML tags to include |
| `excludeTags` | HTML tags to exclude |
| `waitFor` | Milliseconds to wait after page load |
| `timeout` | Maximum time for the request |

## Why Results Can Be Strange

Firecrawl's extraction quality depends on several factors:

| Issue | Cause |
|-------|-------|
| Missing content | Unusual page layouts confuse content detection |
| Extra content included | CSS-hidden elements may be captured |
| Ignored accessibility markup | ARIA attributes are for screen readers, not extractors |
| Incomplete dynamic content | JavaScript may not fully execute before extraction |
| Garbled formatting | Complex HTML patterns don't map cleanly to markdown |

### Debugging Tips

- Compare `html` and `markdown` output to identify conversion issues
- Use `includeTags`/`excludeTags` for problematic pages
- Increase `waitFor` for slow-loading JavaScript content
- Test the same URL with [[jina-reader]] to compare results

## Comparison with Alternatives

| Service | JS Rendering | Extraction | Strengths |
|---------|--------------|------------|-----------|
| Firecrawl | Yes (Playwright) | Cheerio selectors | Configurable, self-hostable |
| [[jina-reader]] | Yes (Chrome) | [[mozilla-readability]] | Simple API, Reader-LM option |
| Direct scraping | Manual | Manual | Full control |

## Related Pages

- [[turndown]] - The HTML-to-markdown library Firecrawl uses
- [[jina-reader]] - Alternative extraction service
- [[content-extraction]] - How extraction algorithms work

## References

[^firecrawl-repo]:
  - **Source**: GitHub
  - **Title**: "mendableai/firecrawl"
  - **URL**: https://github.com/mendableai/firecrawl
  - **Accessed**: 2026-02-03
  - **Supports**: Technology stack, architecture

[^firecrawl-docs]:
  - **Source**: Firecrawl
  - **Title**: "Firecrawl Documentation"
  - **URL**: https://docs.firecrawl.dev/
  - **Accessed**: 2026-02-03
  - **Supports**: API options, usage examples
