---
title: "Readability Algorithm"
lastVerified: 2026-02-03
lastUpdated: 2026-02-03
---

# Readability Algorithm

A family of algorithms that identify and extract the "main content" from web pages by scoring DOM elements based on text characteristics.

## History

The original Readability algorithm was developed by Arc90 Labs in 2010 [^arc90]. It was designed to strip away navigation, ads, and other distractions to present article content in a clean reading view.

The algorithm was adopted by:
- **Firefox** - as Reader View (via [[mozilla-readability]])
- **Safari** - in modified form for Reader Mode
- **Numerous tools** - [[jina-reader]], content extractors, and read-later services

## How It Works

The algorithm traverses the DOM and assigns scores to elements based on heuristics that predict "article-like" content.

### Scoring Heuristics

**Positive signals:**
- High text content relative to HTML tags (text density)
- Presence of commas, periods (indicates flowing prose)
- Favorable class/id names: `content`, `article`, `post`, `entry`, `main`, `text`
- Container elements: `<article>`, `<main>`, `<p>`

**Negative signals:**
- High link density (many links relative to text)
- Unfavorable class/id names: `nav`, `footer`, `sidebar`, `comment`, `ad`, `banner`
- List elements with many links (likely navigation)
- Form elements, scripts, hidden content

### Score Bubbling

Scores "bubble up" from child elements to parents. A `<div>` containing many high-scoring paragraphs inherits their combined score.

### Candidate Selection

After scoring, the algorithm:
1. Identifies top-scoring candidates
2. Selects the best container (highest score, reasonable size)
3. Cleans the selected content (removes remaining cruft)
4. Returns simplified HTML

## Limitations

| Limitation | Description |
|------------|-------------|
| Article-focused | Designed for articles; struggles with product pages, forums, etc. |
| No JavaScript | Operates on static HTML; can't extract JS-rendered content |
| Heuristic-based | False positives/negatives on unusual page structures |
| No site-specific rules | Same algorithm for all sites (unlike [[postlight-parser]]) |

## Implementations

| Implementation | Language | Used By | Source |
|----------------|----------|---------|--------|
| [[mozilla-readability]] | JavaScript | Firefox, Jina Reader | Open source |
| Safari Reader | JavaScript | Safari | Extractable from iOS [^safari-readability-repo] |
| [[postlight-parser]] | JavaScript | Mercury Reader (legacy) | Open source |
| python-readability | Python | Custom tools | Open source |
| readability-lxml | Python | Custom tools | Open source |
| go-readability | Go | Custom tools | Open source |

[[mozilla-readability]] is the most actively maintained and widely-used implementation [^mozilla-readability-repo].

### Safari Reader Source Code

Apple's Safari Reader implementation can be extracted from iOS bundles and is available on GitHub [^safari-readability-repo]. The code reveals implementation details not documented elsewhere:

- `ReaderArticleFinder.js` (~1200 lines) - Core article detection algorithm
- Uses Levenshtein distance for title matching against `document.title`
- Requires at least 10 commas for primary article candidate
- Adjusts scores based on visual position when Reader button is pressed
- Hardcodes certain excludes like `#disqus_thread`
- Supports multi-page article detection by scoring "next page" links

See [[reader-mode]] for detailed Safari vs Mozilla comparison.

## Alternatives

### Selector-based Extraction

Instead of scoring, use CSS selectors to target known content containers:
- `<main>`, `<article>` elements
- Site-specific classes
- [[firecrawl]] uses this approach with Cheerio

### Machine Learning

Train models to identify content boundaries:
- **Reader-LM** - [[jina-reader]]'s transformer model for extraction
- Requires training data but can handle diverse page types

### Manual Rules

Site-specific parsing rules for known domains:
- [[postlight-parser]] includes custom parsers for popular sites
- More accurate for supported sites, but doesn't scale

## Related Pages

- [[mozilla-readability]] - The most common implementation
- [[postlight-parser]] - Alternative with site-specific rules
- [[content-extraction]] - Overview of extraction approaches
- [[reader-mode]] - How browser reader modes use readability

## References

[^arc90]:
  - **Source**: Medium
  - **Title**: "Extracting significant content from a web page using Arc90 Readability algorithm"
  - **URL**: https://medium.com/@kamendamov/extracting-significant-content-from-a-web-page-using-arc90-readability-algorithm-636e2c1951e7
  - **Accessed**: 2026-02-03
  - **Supports**: Algorithm history and scoring approach

[^mozilla-readability-repo]:
  - **Source**: GitHub
  - **Title**: "mozilla/readability"
  - **URL**: https://github.com/mozilla/readability
  - **Accessed**: 2026-02-03
  - **Supports**: Current implementation details

[^safari-readability-repo]:
  - **Source**: GitHub
  - **Title**: "dm-zharov/safari-readability: Safari Reader Mode Source Code"
  - **URL**: https://github.com/dm-zharov/safari-readability
  - **Accessed**: 2026-02-03
  - **Supports**: Safari Reader source code availability (iOS 17.2), algorithm details
