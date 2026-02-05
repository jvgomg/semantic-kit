---
title: "Turndown"
lastVerified: 2026-02-03
lastUpdated: 2026-02-03
---

# Turndown

The most widely-used HTML to markdown converter for JavaScript.

[Turndown](https://github.com/mixmark-io/turndown) converts HTML to markdown through configurable rules. It's used by [[firecrawl]], [[jina-reader]], and many other content extraction tools.

## Installation

```bash
npm install turndown
```

## Basic Usage

```javascript
const TurndownService = require('turndown')
const turndownService = new TurndownService()

const markdown = turndownService.turndown('<h1>Hello</h1><p>World</p>')
// # Hello
//
// World
```

## Configuration

````javascript
const turndownService = new TurndownService({
  headingStyle: 'atx',           // # style headings (vs setext)
  hr: '---',                     // Horizontal rule style
  bulletListMarker: '-',         // List marker (-, *, +)
  codeBlockStyle: 'fenced',      // ``` style (vs indented)
  emDelimiter: '_',              // Emphasis (*text* vs _text_)
  strongDelimiter: '**',         // Bold style
  linkStyle: 'inlined',          // [text](url) style
  linkReferenceStyle: 'full',    // Reference link style
})
````

## GFM Plugin

GitHub Flavored Markdown support via plugin:

```javascript
const turndownPluginGfm = require('turndown-plugin-gfm')

turndownService.use(turndownPluginGfm.gfm)           // All GFM features
// Or individual features:
turndownService.use(turndownPluginGfm.tables)        // Tables only
turndownService.use(turndownPluginGfm.strikethrough) // ~~strikethrough~~
turndownService.use(turndownPluginGfm.taskListItems) // - [ ] checkboxes
```

**Links:** [npm](https://www.npmjs.com/package/turndown-plugin-gfm)

## Custom Rules

### Add Rules

```javascript
turndownService.addRule('removeImages', {
  filter: 'img',
  replacement: () => '',
})

turndownService.addRule('customCode', {
  filter: ['pre', 'code'],
  replacement: (content, node) => {
    return '`' + content + '`'
  },
})
```

### Keep as HTML

```javascript
turndownService.keep(['iframe', 'video'])  // Keep as HTML in output
```

### Remove Entirely

```javascript
turndownService.remove(['script', 'style'])  // Remove from output
```

## Alternatives

### node-html-markdown

A faster alternative optimized for high-volume processing [^nhm]:

````javascript
const { NodeHtmlMarkdown } = require('node-html-markdown')

const markdown = NodeHtmlMarkdown.translate(htmlString)

// Or with options
const nhm = new NodeHtmlMarkdown({
  preferNativeParser: false,
  codeFence: '```',
  bulletMarker: '-',
  codeBlockStyle: 'fenced',
  maxConsecutiveNewlines: 2,
})
const markdown = nhm.translate(htmlString)
````

**Performance:** Benchmarks show node-html-markdown is ~1.5x faster than Turndown for large documents.

**Links:** [npm](https://www.npmjs.com/package/node-html-markdown) | [GitHub](https://github.com/crosstype/node-html-markdown)

### html-to-text

Converts HTML to plain text (not markdown):

```javascript
const { convert } = require('html-to-text')

const text = convert(htmlString, {
  wordwrap: 80,
  selectors: [
    { selector: 'a', options: { hideLinkHrefIfSameAsText: true } },
    { selector: 'img', format: 'skip' },
  ],
})
```

**Features:**
- Word wrapping
- Table formatting with colspan/rowspan support
- Selector-based customization

**Links:** [npm](https://www.npmjs.com/package/html-to-text)

## Comparison

| Library | Output | Speed | Customization |
|---------|--------|-------|---------------|
| Turndown | Markdown | Baseline | Extensive (rules, plugins) |
| node-html-markdown | Markdown | ~1.5x faster | Good |
| html-to-text | Plain text | Fast | Selector-based |

## Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Tables not converting | Missing GFM plugin | Add `turndownPluginGfm.tables` |
| Extra whitespace | Whitespace in HTML | Post-process with regex |
| Broken nested lists | Complex HTML nesting | Simplify source HTML |
| Lost formatting | Unsupported HTML | Add custom rule |

## Related Pages

- [[content-extraction]] - How extraction works before conversion
- [[mozilla-readability]] - Often paired with Turndown
- [[firecrawl]] - Service using Turndown
- [[jina-reader]] - Service using Turndown

## References

[^turndown]:
  - **Source**: GitHub
  - **Title**: "mixmark-io/turndown"
  - **URL**: https://github.com/mixmark-io/turndown
  - **Accessed**: 2026-02-03
  - **Supports**: Configuration options, custom rules, plugin system

[^nhm]:
  - **Source**: GitHub
  - **Title**: "crosstype/node-html-markdown"
  - **URL**: https://github.com/crosstype/node-html-markdown
  - **Accessed**: 2026-02-03
  - **Supports**: Performance comparison, API options
