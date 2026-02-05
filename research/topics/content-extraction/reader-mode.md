---
title: "Browser Reader Mode"
lastVerified: 2026-02-03
lastUpdated: 2026-02-03
---

# Browser Reader Mode

How browsers extract and present article content in a clean, readable format.

Reader mode is a browser feature that strips away navigation, ads, and other distractions to present just the article content. Firefox, Safari, Edge, and other browsers each implement this differently, but all rely on algorithms to identify the "main content" of a page.

## How It Works

Reader mode activation involves two steps:

1. **Detection** - Determine if the page is suitable for reader mode (show/hide the button)
2. **Extraction** - Identify and extract the main content when activated

Both steps use heuristics about page structure, text density, and semantic HTML.

## Implementations

### Mozilla Readability (Firefox)

Firefox uses [[mozilla-readability]], an open-source library available on npm. See the dedicated page for algorithm details.

Key characteristics:
- Scores paragraphs based on text length, comma frequency, and link density
- Scores propagate up the DOM tree to parent elements
- Highest-scoring container becomes "main content"
- `isProbablyReaderable()` provides quick detection before full extraction

### Apple Readability (Safari)

Safari uses Apple's proprietary fork of Arc90 Readability, which differs significantly from Mozilla's implementation [^ctrl-blog-content].

The Safari Reader source code (JavaScript) is available via reverse engineering from iOS bundles [^safari-readability-repo]. The `ReaderArticleFinder.js` file contains ~1200 lines of unminified code revealing the algorithm.

| Aspect | Mozilla | Apple |
|--------|---------|-------|
| Codebase size | Smaller | More than 2x larger (~1200 lines) |
| Positioning | DOM-only | Considers visual position on screen |
| Title matching | Basic | Uses Levenshtein distance against `document.title` |
| CJK support | Character counts | Visual space measurement |
| Footer handling | Hides footers | Includes footers within main content |
| Ad removal | Basic | Better at hiding inline ads and "suggested reading" |
| RTL support | Limited | Full right-to-left language support |
| Minimum commas | Not specified | At least 10 commas for primary candidate |
| Scoring | Per-paragraph | +1 score per 100 characters |
| Multi-page | Not supported | Parses "next page" links |
| Hardcoded excludes | None | `#disqus_thread` explicitly skipped |

#### Safari 18 Features (iOS 18 / macOS Sequoia)

Safari 18 introduced significant Reader enhancements [^macrumors-ios18-reader]:

**Table of Contents**: Auto-generated from heading hierarchy (h1-h6). Appears at the top of Reader view for articles with subheadings, allowing quick navigation to sections.

**Apple Intelligence Summarization** (iOS 18.1+): Three-sentence AI-generated summaries [^9to5mac-safari-ai]. Key details:
- Must be manually requested via "Summarize" button in Reader
- Displays purple Apple Intelligence animation while processing
- Available in English-speaking regions only (US, UK, Canada, Australia, Ireland, South Africa, NZ)
- Works on older devices (M1 MacBook Air, some iPhone 12 reports)

**Highlights Feature**: Separate from Reader Mode, surfaces key information without reformatting the page. Shows summaries, directions, and quick links via a purple sparkle icon in the address bar [^appleinsider-highlights].

**Redesigned UI**: Reader accessed via Page Menu (box with lines icon), with customizable fonts, colors, and text sizes.

### Other Browsers

- **Edge** - Uses a Chromium-based implementation
- **Brave** - Uses Mozilla Readability (Chromium fork)
- **Vivaldi** - Custom implementation

## Triggering Reader Mode

The reader mode button appears when a page meets certain criteria [^ctrl-blog-content] [^mathias-safari-reader]:

- **Sufficient text content** - Minimum 350-400 characters (varies by browser/version)
- **Minimum child elements** - At least 5 child elements inside the content wrapper
- **Identifiable article structure** - Presence of `<article>` or similar container elements
- **Low link-to-text ratio** - Content area isn't dominated by navigation links
- **Proper serving** - Must be served via HTTP/HTTPS (not `file://` URLs)

Pages that fail these heuristics won't show the reader mode button, even if they contain readable content.

### Safari-Specific Requirements

Safari Reader has additional considerations [^mathias-safari-reader]:

- Content wrapper can be `<article>`, `<div>`, or `<span>` — but **not `<p>` alone**
- Double line breaks (`<br><br>`) count as two elements toward the minimum
- Safari caches content extraction, so changes may not reflect immediately
- Nested divs (excessive wrapper depth) can prevent activation
- At least 10 commas needed for primary article candidate detection

### Improving Detection

To ensure your pages trigger reader mode:

```html
<article>
  <h1>Article Title</h1>
  <p>Your article content here. Ensure you have substantial
     paragraphs with flowing prose, commas, and proper structure...</p>
  <p>Additional paragraphs help meet the minimum element count...</p>
</article>
```

- Use `<article>` to wrap main content
- Ensure at least 400 characters of body text
- Include at least 5 paragraph or block elements
- Keep navigation separate from content containers
- Avoid high link density in content areas
- Use `instapaper_hide` class to explicitly exclude elements from Safari Reader

## CLI Tools

### readability-cli

Mozilla Readability as a command-line tool.

```bash
npm install -g readability-cli

readable https://example.com/article
readable https://example.com/article --json
readable https://example.com/article --low-confidence  # Force extraction
```

Output includes: title, byline, content (HTML), text content, excerpt, site name.

**Links:** [npm](https://www.npmjs.com/package/readability-cli)

### readability-extractor

ArchiveBox's wrapper around Mozilla Readability for archiving workflows.

```bash
npm install -g 'git+https://github.com/pirate/readability-extractor'
```

**Links:** [GitHub](https://github.com/ArchiveBox/readability-extractor)

## Metadata Extraction

Reader modes also extract metadata to display alongside content [^ctrl-blog-metadata]:

| Field | Sources checked |
|-------|-----------------|
| Title | `<title>`, `<h1>`, Open Graph, Schema.org |
| Author | `<meta name="author">`, Schema.org, byline patterns |
| Published date | Schema.org, `<time>`, meta tags |
| Site name | Open Graph, Schema.org, domain |

Providing explicit metadata (especially via JSON-LD or Open Graph) improves extraction accuracy.

## Related Pages

- [[mozilla-readability]] - The open-source extraction algorithm
- [[content-extraction]] - Overview of extraction approaches
- [[ai-crawler-behavior]] - How AI crawlers extract content (different from reader mode)

## References

[^ctrl-blog-content]:
  - **Source**: Ctrl blog
  - **Title**: "Web Reading Mode: The non-standard rendering mode"
  - **URL**: https://www.ctrl.blog/entry/browser-reading-mode-content.html
  - **Author**: Daniel Aleksandersen
  - **Accessed**: 2026-02-03
  - **Supports**: Apple vs Mozilla Readability differences, triggering conditions

[^ctrl-blog-metadata]:
  - **Source**: Ctrl blog
  - **Title**: "Web Reading Mode: How browsers extract metadata"
  - **URL**: https://www.ctrl.blog/entry/browser-reading-mode-metadata.html
  - **Author**: Daniel Aleksandersen
  - **Accessed**: 2026-02-03
  - **Supports**: Metadata extraction sources and priority

[^safari-readability-repo]:
  - **Source**: GitHub
  - **Title**: "dm-zharov/safari-readability: Safari Reader Mode Source Code"
  - **URL**: https://github.com/dm-zharov/safari-readability
  - **Accessed**: 2026-02-03
  - **Supports**: Safari Reader source code availability (iOS 17.2), algorithm implementation details

[^mathias-safari-reader]:
  - **Source**: Mathias Bynens
  - **Title**: "How to enable Safari Reader on your site?"
  - **URL**: https://mathiasbynens.be/notes/safari-reader
  - **Accessed**: 2026-02-03
  - **Supports**: Safari Reader triggering requirements, minimum content thresholds, element counting

[^macrumors-ios18-reader]:
  - **Source**: MacRumors
  - **Title**: "iOS 18: How to Use the Redesigned Reader Mode in Safari"
  - **URL**: https://www.macrumors.com/how-to/use-new-reader-mode-ios-safari/
  - **Accessed**: 2026-02-03
  - **Supports**: Safari 18 Reader UI changes, table of contents, customization options

[^9to5mac-safari-ai]:
  - **Source**: 9to5Mac
  - **Title**: "Safari gets Apple Intelligence upgrade in iOS 18.1 with new summarize feature"
  - **URL**: https://9to5mac.com/2024/07/30/safari-gets-apple-intelligence-upgrade-in-ios-181-with-new-summarize-feature/
  - **Accessed**: 2026-02-03
  - **Supports**: Apple Intelligence summarization in Reader, device compatibility

[^appleinsider-highlights]:
  - **Source**: AppleInsider
  - **Title**: "Safari 18 is getting a new Highlights feature that can summarize articles and more"
  - **URL**: https://appleinsider.com/articles/24/06/10/safari-18-includes-a-new-highlights-feature-for-summarizing-articles-and-more
  - **Accessed**: 2026-02-03
  - **Supports**: Highlights feature distinct from Reader Mode
