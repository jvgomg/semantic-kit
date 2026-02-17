# @webspecs/core

Core analyzers, extractors, and validators for the [webspecs](https://github.com/jvgomg/semantic-kit) toolkit.

[![npm](https://img.shields.io/npm/v/@webspecs/core)](https://www.npmjs.com/package/@webspecs/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/jvgomg/semantic-kit/blob/main/LICENSE)

## Install

```bash
npm install @webspecs/core
```

## Usage

`@webspecs/core` provides the underlying analysis functions and TypeScript types used by `@webspecs/cli` and `@webspecs/tui`. Use it to build custom tooling or integrate webspecs analysis into your own scripts.

### Fetch and parse HTML

```typescript
import { fetchHtmlContent, parseHTML } from '@webspecs/core'

const html = await fetchHtmlContent('https://example.com')
const dom = parseHTML(html)
```

### Extract structured data

```typescript
import { extractStructuredData } from '@webspecs/core'

const { jsonld, opengraph, twitter } = await extractStructuredData(html)
```

### Extract readable content

```typescript
import { extractReadability } from '@webspecs/core'

const result = extractReadability(html, 'https://example.com')
console.log(result.title, result.textContent)
```

### Analyze page structure

```typescript
import { analyzeStructure } from '@webspecs/core'

const structure = analyzeStructure(dom)
console.log(structure.headings, structure.landmarks)
```

### Validate

```typescript
import { validateHtml, validateAccessibility, validateStructuredData } from '@webspecs/core'

const htmlIssues = await validateHtml(html)
const a11yResult = await validateAccessibility('https://example.com', { level: 'wcag2aa' })
const schemaResult = await validateStructuredData(html, { preset: 'Google' })
```

### JavaScript rendering (optional)

```typescript
import { fetchRenderedHtml, fetchAccessibilitySnapshot } from '@webspecs/core'

// Requires playwright as a peer dependency
const rendered = await fetchRenderedHtml('https://example.com')
const snapshot = await fetchAccessibilitySnapshot('https://example.com')
```

### Result types

All CLI output types are exported for type-safe consumption of `--format json` output:

```typescript
import type {
  AiResult,
  GoogleResult,
  SchemaResult,
  StructureResult,
  ScreenReaderResult,
  ValidateHtmlResult,
  ValidateSchemaResult,
  ValidateA11yResult,
  A11yResult,
  AriaNode,
  StructureAnalysis,
  SnapshotDiff,
} from '@webspecs/core'
```

## What's Included

| Category | Key Functions |
| --- | --- |
| HTML | `fetchHtmlContent`, `parseHTML` |
| Structure | `analyzeStructure`, `compareStructures`, `extractLandmarks`, `extractHeadings` |
| Accessibility | `analyzeAriaSnapshot`, `compareSnapshots`, `runAxeOnStaticHtml` |
| Content | `extractReadability`, `analyzeScreenReaderExperience` |
| Metadata | `extractStructuredData`, `extractPageMetadata`, `buildSocialPreview` |
| Google | `analyzeForGoogle` |
| Validation | `validateHtml`, `validateAccessibility`, `validateStructuredData`, `validateSocialTags` |
| JS Rendering | `fetchRenderedHtml`, `fetchAccessibilitySnapshot` |

JavaScript rendering functions require [Playwright](https://playwright.dev) as an optional peer dependency.

## Related Packages

- [`@webspecs/cli`](https://www.npmjs.com/package/@webspecs/cli) — Node.js CLI for running analysis commands
- [`@webspecs/tui`](https://www.npmjs.com/package/@webspecs/tui) — Interactive terminal UI (requires Bun)
