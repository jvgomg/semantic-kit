---
title: "Google Structured Data"
lastVerified: 2026-02-04
lastUpdated: 2026-02-04
---

# Google Structured Data

How Google uses structured data markup to enable rich results in search.

Structured data is machine-readable markup that explicitly describes page content. Google uses it to display enhanced search results like recipe cards, event listings, FAQ accordions, and product information.

## Supported Formats

Google supports three structured data formats [^google-structured-data]:

| Format | Location | Syntax |
|--------|----------|--------|
| JSON-LD | `<script>` tag | JSON with `@context` |
| Microdata | HTML attributes | `itemscope`, `itemprop` |
| RDFa | HTML attributes | `vocab`, `property` |

**JSON-LD is preferred** - it's easier to maintain and doesn't require modifying HTML structure.

## Example

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Article Title",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "datePublished": "2024-01-15"
}
</script>
```

## Rich Result Types

Google supports structured data for many content types [^google-structured-data]:

- **Articles** - News and blog posts
- **Products** - Price, availability, reviews
- **Recipes** - Ingredients, cooking time, nutrition
- **Events** - Date, location, tickets
- **FAQs** - Question/answer pairs
- **How-to** - Step-by-step instructions
- **Local Business** - Hours, address, reviews
- **Videos** - Thumbnails in search results

Each type has specific required and recommended properties.

## Validation Tools

### Web-based

- [Google Rich Results Test](https://search.google.com/test/rich-results) - Google-specific validation
- [Schema.org Validator](https://validator.schema.org/) - Format-agnostic validation
- [isSemantic.net](https://issemantic.net/) - Multi-platform (Google, Twitter, Facebook)

### CLI

```bash
npm install -g structured-data-testing-tool

sdtt https://example.com
sdtt https://example.com --presets Google
sdtt https://example.com --presets "Twitter,Facebook"
```

The `structured-data-testing-tool` detects JSON-LD, Microdata, and RDFa, with built-in presets for major platforms.

**Links:** [GitHub](https://github.com/iaincollins/structured-data-testing-tool)

> **Note:** This CLI tool hasn't been updated since 2019 but remains functional for validation. See [[structured-data]] for alternative libraries.

## Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| No rich results | Missing required properties | Check Google's documentation for each type |
| Validation errors | Invalid JSON or schema | Use validation tools before deploying |
| Not appearing in search | Google hasn't re-crawled | Request indexing in Search Console |
| Policy violation | Misleading or spammy markup | Follow Google's quality guidelines |

## Related Pages

- [[structured-data]] - General structured data concepts (cross-platform)
- [[schema-org]] - The Schema.org vocabulary

## References

[^google-structured-data]:
  - **Source**: Google Search Central
  - **Title**: "Understand how structured data works"
  - **URL**: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
  - **Accessed**: 2026-02-04
  - **Supports**: Supported formats, rich result types, validation
