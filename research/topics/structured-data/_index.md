---
title: "Structured Data"
lastVerified: 2026-02-04
lastUpdated: 2026-02-04
---

# Structured Data

Machine-readable markup that explicitly describes page content for search engines and other consumers.

Structured data helps search engines understand your content beyond what they can infer from HTML structure. It enables rich results in search (recipe cards, event listings, FAQ accordions) and improves content discovery.

## What It Is

Instead of relying on algorithms to infer meaning, structured data **explicitly declares** content properties:

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

This tells search engines: "This page is an Article, written by Author Name, published on 2024-01-15."

## Formats

Three formats exist for embedding structured data in HTML:

| Format | Location | Syntax | Maintenance |
|--------|----------|--------|-------------|
| **JSON-LD** | `<script>` tag | JSON with `@context` | Easiest |
| **Microdata** | HTML attributes | `itemscope`, `itemprop` | Moderate |
| **RDFa** | HTML attributes | `vocab`, `property` | Moderate |

### JSON-LD (Recommended)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Widget",
  "offers": {
    "@type": "Offer",
    "price": "29.99",
    "priceCurrency": "USD"
  }
}
</script>
```

**Advantages:**
- Separate from HTML structure
- Easy to generate dynamically
- Doesn't affect page rendering
- Simpler to maintain

### Microdata

```html
<div itemscope itemtype="https://schema.org/Product">
  <h1 itemprop="name">Widget</h1>
  <div itemprop="offers" itemscope itemtype="https://schema.org/Offer">
    <span itemprop="price">29.99</span>
    <span itemprop="priceCurrency">USD</span>
  </div>
</div>
```

**Advantages:**
- Data is inline with visible content
- Harder for data and display to diverge

### RDFa

```html
<div vocab="https://schema.org/" typeof="Product">
  <h1 property="name">Widget</h1>
  <div property="offers" typeof="Offer">
    <span property="price">29.99</span>
    <span property="priceCurrency">USD</span>
  </div>
</div>
```

Similar to Microdata but with different attribute names.

## Schema.org

[Schema.org](https://schema.org/) is the vocabulary (set of types and properties) used by structured data. It's maintained jointly by Google, Microsoft, Yahoo, and Yandex.

### Common Types

| Type | Use Case |
|------|----------|
| `Article` | News, blog posts |
| `Product` | E-commerce items |
| `Recipe` | Cooking instructions |
| `Event` | Dates, locations, tickets |
| `FAQPage` | Question/answer content |
| `HowTo` | Step-by-step guides |
| `LocalBusiness` | Business listings |
| `Person` | Author profiles |
| `Organization` | Company information |

Each type has required and optional properties. See [schema.org/docs](https://schema.org/docs/schemas.html) for the full hierarchy.

## Validation Tools

### Web-based

| Tool | Purpose |
|------|---------|
| [Schema.org Validator](https://validator.schema.org/) | Format-agnostic validation |
| [Google Rich Results Test](https://search.google.com/test/rich-results) | Google-specific requirements |
| [isSemantic.net](https://issemantic.net/) | Multi-platform (Google, Twitter, Facebook) |

### CLI

**structured-data-testing-tool** provides command-line validation with platform presets:

```bash
npm install -g structured-data-testing-tool

sdtt https://example.com
sdtt https://example.com --presets Google
sdtt https://example.com --presets "Twitter,Facebook"
```

**Features:**
- Detects JSON-LD, Microdata, and RDFa
- Built-in presets for major platforms
- Custom preset support
- Headless browser option for JavaScript-rendered structured data

**Links:** [GitHub](https://github.com/iaincollins/structured-data-testing-tool)

> **Note:** This package hasn't been updated since 2019. It remains functional for basic validation but uses the unmaintained `web-auto-extractor` internally. For production applications requiring long-term maintenance, consider alternatives like metascraper.

### Programmatic Extraction

**metascraper** is an actively-maintained library for extracting unified metadata [^metascraper]:

```bash
npm install metascraper metascraper-title metascraper-description metascraper-image
```

```javascript
import metascraper from 'metascraper'
import title from 'metascraper-title'
import description from 'metascraper-description'
import image from 'metascraper-image'

const scraper = metascraper([title(), description(), image()])
const metadata = await scraper({ html, url })
```

**Features:**
- Supports Open Graph, Microdata, RDFa, Twitter Cards, JSON-LD
- Modular architecture (install only needed extractors)
- Rule-based priority system with fallbacks
- Platform-specific packages for YouTube, Instagram, Spotify

**Links:** [GitHub](https://github.com/microlinkhq/metascraper) | [npm](https://www.npmjs.com/package/metascraper)

## Platform-Specific Requirements

### Google

See [[google-structured-data]] for Google's specific requirements and supported rich result types.

### Social Platforms

Social platforms use their own metadata formats:

**Open Graph (Facebook, LinkedIn):**
```html
<meta property="og:title" content="Page Title">
<meta property="og:description" content="Description">
<meta property="og:image" content="https://example.com/image.jpg">
```

**Twitter Cards:**
```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Page Title">
<meta name="twitter:image" content="https://example.com/image.jpg">
```

## Related Pages

- [[google-structured-data]] - Google's requirements and rich results
- [[content-extraction]] - How extractors use (or ignore) structured data

## References

[^schema-org]:
  - **Source**: Schema.org
  - **Title**: "Schema.org"
  - **URL**: https://schema.org/
  - **Accessed**: 2026-02-03
  - **Supports**: Vocabulary definitions, type hierarchy

[^google-structured-data]:
  - **Source**: Google Search Central
  - **Title**: "Understand how structured data works"
  - **URL**: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
  - **Accessed**: 2026-02-03
  - **Supports**: Format recommendations, validation guidance

[^metascraper]:
  - **Source**: GitHub
  - **Title**: "metascraper - Get unified metadata from websites"
  - **URL**: https://github.com/microlinkhq/metascraper
  - **Accessed**: 2026-02-04
  - **Supports**: Library features, supported formats, modular architecture
