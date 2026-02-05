---
title: "Jina Reader"
lastVerified: 2026-02-03
lastUpdated: 2026-02-03
---

# Jina Reader

A service that converts URLs to LLM-friendly markdown via a simple API.

[Jina Reader](https://jina.ai/reader/) provides web content extraction optimized for AI applications. It uses [[mozilla-readability]] for content extraction and [[turndown]] for markdown conversion.

## Usage

Prepend `r.jina.ai/` to any URL:

```
https://r.jina.ai/https://example.com/article
```

Returns the page content as clean markdown, suitable for LLM context.

## Process

```
URL → Headless Chrome → Rendered DOM → Readability → Clean HTML → Turndown → Markdown
                                       (extract)                  (convert)
```

1. **Fetch** - Headless Chrome loads the page
2. **Extract** - [[mozilla-readability]] identifies main content
3. **Convert** - [[turndown]] transforms to markdown
4. **Clean** - Regex post-processing for consistent output

## Reader-LM

Jina also offers Reader-LM, a specialized language model for HTML-to-markdown conversion [^reader-lm]:

| Feature | Value |
|---------|-------|
| Model size | 1.5B parameters |
| Context length | Up to 512K tokens |
| Languages | 29 supported |
| Accuracy | ~20% higher than rule-based approaches |

Reader-LM handles edge cases that confuse traditional parsers:
- Complex nested structures
- Unusual markup patterns
- Non-standard HTML
- Mixed content types

### When to Use Reader-LM

| Scenario | Recommendation |
|----------|----------------|
| Standard articles | Rule-based (faster, cheaper) |
| Complex pages | Reader-LM (more accurate) |
| High volume | Rule-based (cost effective) |
| Quality critical | Reader-LM (fewer errors) |

## Search API

Jina also provides a search-to-markdown API:

```
https://s.jina.ai/your+search+query
```

Searches the web and returns results in markdown format, useful for giving LLMs access to current information.

## API Options

Headers can customize behavior:

| Header | Purpose |
|--------|---------|
| `X-With-Links-Summary` | Include link summary at end |
| `X-With-Images-Summary` | Include image summary |
| `X-Target-Selector` | CSS selector for specific content |
| `X-Remove-Selector` | CSS selector to exclude content |
| `X-Md-Link-Style` | Control link formatting (`referenced` or `discarded`) |

### Link Summary Feature

By default, Jina Reader extracts only main content: "Menus, footers, and ads are automatically ignored" [^jina-professional]. However, links can be preserved for downstream use:

```bash
curl -X POST 'https://r.jina.ai/' \
  -H "Authorization: Bearer $JINA_API_KEY" \
  -H "X-With-Links-Summary: true" \
  -d '{"url":"https://example.com"}'
```

| Value | Behavior |
|-------|----------|
| `true` | Gather unique links at end of response |
| `all` | Gather all links (including duplicates) |

Links are returned in `response["data"]["links"]` as key-value pairs:

```json
{
  "links": {
    "About Us": "https://example.com/about",
    "Contact": "https://example.com/contact"
  }
}
```

This feature exists because "this helps the downstream LLMs or web agents navigating the page or take further actions" [^jina-reader]. Navigation links, while excluded from main content, may be valuable for:
- AI agents that need to navigate further
- RAG systems that want to crawl related pages
- Site structure analysis

## Comparison with Firecrawl

| Aspect | Jina Reader | [[firecrawl]] |
|--------|-------------|---------------|
| Extraction | [[mozilla-readability]] | Cheerio selectors |
| API style | URL prefix | REST API |
| Customization | Headers | JSON body |
| Self-hosting | No | Yes |
| ML option | Reader-LM | No |

## Related Pages

- [[mozilla-readability]] - The extraction algorithm Jina uses
- [[turndown]] - The HTML-to-markdown converter
- [[firecrawl]] - Alternative extraction service
- [[content-extraction]] - How extraction algorithms work

## References

[^jina-reader]:
  - **Source**: Jina AI
  - **Title**: "Jina Reader"
  - **URL**: https://jina.ai/reader/
  - **Accessed**: 2026-02-03
  - **Supports**: Usage, process description

[^reader-lm]:
  - **Source**: Jina AI
  - **Title**: "Reader-LM: Small Language Models for Cleaning and Converting HTML to Markdown"
  - **URL**: https://jina.ai/news/reader-lm-small-language-models-for-cleaning-and-converting-html-to-markdown/
  - **Accessed**: 2026-02-03
  - **Supports**: Reader-LM capabilities, accuracy comparison

[^jina-github]:
  - **Source**: GitHub
  - **Title**: "jina-ai/reader"
  - **URL**: https://github.com/jina-ai/reader
  - **Accessed**: 2026-02-03
  - **Supports**: Implementation details, API options

[^jina-professional]:
  - **Source**: AI Professional
  - **Title**: "Jina AI Reader – The Best Kept Secret for Enhancing LLM-Friendly Content Extraction"
  - **URL**: https://aiprofessional.ai/news/jina-ai-reader-best-kept-secret-enhancing-llm-friendly-content-extraction/
  - **Accessed**: 2026-02-03
  - **Supports**: Default behavior excludes menus, footers, ads
