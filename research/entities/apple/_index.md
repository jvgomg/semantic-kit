---
title: "Apple"
lastVerified: 2026-02-03
lastUpdated: 2026-02-03
---

# Apple

Apple's Safari browser includes Reader Mode, a content extraction feature for distraction-free reading. Apple's implementation is a proprietary fork of the Arc90 [[readability]] algorithm with significant enhancements.

## Safari Reader Mode

Safari Reader Mode strips away navigation, ads, and other distractions to present article content in a clean, readable format.

### How It Works

Safari uses a proprietary content extraction algorithm forked from Arc90 Readability [^apple-reader]. The algorithm differs significantly from [[mozilla-readability]] — Apple's codebase is more than twice the size and includes visual positioning analysis [^ctrl-blog-content].

Key algorithm characteristics [^safari-readability-repo] [^mathias-safari-reader]:

| Aspect | Detail |
|--------|--------|
| Title matching | Levenshtein distance against `document.title` |
| Visual positioning | Adjusts scores based on screen visibility |
| Minimum commas | At least 10 commas for primary candidate |
| Scoring | +1 per 100 characters in a paragraph |
| Multi-page support | Parses "next page" links by scoring |
| CJK languages | Uses visual space instead of character counts |
| RTL languages | Full right-to-left support |

### Source Code

Safari Reader source code (JavaScript) can be extracted from iOS bundles. A repository containing iOS 17.2 source code is available [^safari-readability-repo]:

- `ReaderArticleFinder.js` (~1200 lines) - Core article detection
- `ReaderSharedUI.js` - Shared UI components
- Code is unminified and readable

### Activation

- **Desktop**: `Cmd+Shift+R` or click the Reader icon in the address bar
- **iOS/iPadOS (Safari 18+)**: Tap Page Menu (box with lines icon), select "Show Reader"

Reader Mode only appears on pages Safari identifies as articles. Requirements [^mathias-safari-reader]:

- Minimum 350-400 characters of text
- At least 5 child elements in content wrapper
- At least 10 commas in article text
- Must be served via HTTP/HTTPS (not `file://`)
- Container element must not be `<p>` alone

### Safari 18 Features (iOS 18 / macOS Sequoia)

**Redesigned UI**: Reader accessed via Page Menu with customizable fonts, colors, and text sizes [^macrumors-ios18-reader].

**Table of Contents**: Auto-generated from heading hierarchy (h1-h6). Appears at the top of Reader view, allowing navigation to sections.

**Apple Intelligence Summarization** (iOS 18.1+) [^9to5mac-safari-ai]:
- Three-sentence AI-generated summaries
- Manual activation via "Summarize" button
- Purple animation indicates processing
- Available in English-speaking regions: US, UK, Canada, Australia, Ireland, South Africa, NZ
- Works on older devices (M1 MacBook Air, some iPhone 12 reports)

**Highlights Feature**: Separate from Reader Mode. Surfaces key information (summaries, directions, quick links) without reformatting the page. Indicated by purple sparkle icon [^appleinsider-highlights].

### Metadata Extraction

Safari extracts metadata through visual examination rather than pure DOM parsing [^ctrl-blog-metadata]:

| Field | Method |
|-------|--------|
| Title | Visual proximity to article top + Levenshtein distance from `document.title` |
| Author | Class names (`author-name`, `article-author`) or `a[rel="author"]` |
| Date | `<time>` element or classes (`dateline`, `entry-date`) nearest title |
| Site name | Open Graph, Schema.org (confirmation only) |

Schema.org and Open Graph are used to confirm selections, not as primary sources.

### Markup Hints

Safari respects certain class names for content control:

- `instapaper_hide` - Explicitly exclude content from Reader

## Related Pages

- [[reader-mode]] - Browser reader mode implementations (detailed comparison)
- [[mozilla-readability]] - Firefox's open-source extraction algorithm
- [[readability]] - The general readability algorithm concept
- [[content-extraction]] - How content extraction works

## Official Resources

- [Apple](https://www.apple.com/) - Company website
- [Safari Reader Mode Guide](https://support.apple.com/guide/iphone/hide-distractions-when-reading-iphdc30e3b86/ios) - Official documentation

## References

[^apple-reader]:
  - **Source**: Apple Support
  - **Title**: "Hide distractions when reading articles in Safari on iPhone"
  - **URL**: https://support.apple.com/guide/iphone/hide-distractions-when-reading-iphdc30e3b86/ios
  - **Accessed**: 2026-02-03
  - **Supports**: Reader Mode features and usage

[^ctrl-blog-content]:
  - **Source**: Ctrl blog
  - **Title**: "Web Reading Mode: The non-standard rendering mode"
  - **URL**: https://www.ctrl.blog/entry/browser-reading-mode-content.html
  - **Author**: Daniel Aleksandersen
  - **Accessed**: 2026-02-03
  - **Supports**: Apple vs Mozilla Readability differences, codebase size comparison

[^ctrl-blog-metadata]:
  - **Source**: Ctrl blog
  - **Title**: "Web Reading Mode: How browsers extract metadata"
  - **URL**: https://www.ctrl.blog/entry/browser-reading-mode-metadata.html
  - **Author**: Daniel Aleksandersen
  - **Accessed**: 2026-02-03
  - **Supports**: Metadata extraction through visual examination

[^safari-readability-repo]:
  - **Source**: GitHub
  - **Title**: "dm-zharov/safari-readability: Safari Reader Mode Source Code"
  - **URL**: https://github.com/dm-zharov/safari-readability
  - **Accessed**: 2026-02-03
  - **Supports**: Safari Reader source code (iOS 17.2), algorithm implementation details

[^mathias-safari-reader]:
  - **Source**: Mathias Bynens
  - **Title**: "How to enable Safari Reader on your site?"
  - **URL**: https://mathiasbynens.be/notes/safari-reader
  - **Accessed**: 2026-02-03
  - **Supports**: Triggering requirements, minimum thresholds, element counting

[^macrumors-ios18-reader]:
  - **Source**: MacRumors
  - **Title**: "iOS 18: How to Use the Redesigned Reader Mode in Safari"
  - **URL**: https://www.macrumors.com/how-to/use-new-reader-mode-ios-safari/
  - **Accessed**: 2026-02-03
  - **Supports**: Safari 18 UI changes, table of contents

[^9to5mac-safari-ai]:
  - **Source**: 9to5Mac
  - **Title**: "Safari gets Apple Intelligence upgrade in iOS 18.1 with new summarize feature"
  - **URL**: https://9to5mac.com/2024/07/30/safari-gets-apple-intelligence-upgrade-in-ios-181-with-new-summarize-feature/
  - **Accessed**: 2026-02-03
  - **Supports**: Apple Intelligence summarization, device compatibility

[^appleinsider-highlights]:
  - **Source**: AppleInsider
  - **Title**: "Safari 18 is getting a new Highlights feature that can summarize articles and more"
  - **URL**: https://appleinsider.com/articles/24/06/10/safari-18-includes-a-new-highlights-feature-for-summarizing-articles-and-more
  - **Accessed**: 2026-02-03
  - **Supports**: Highlights feature distinct from Reader Mode
