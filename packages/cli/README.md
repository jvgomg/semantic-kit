# @webspecs/cli

Command-line tool for understanding how websites are interpreted by search engines, AI crawlers, screen readers, and content extractors.

[![npm](https://img.shields.io/npm/v/@webspecs/cli)](https://www.npmjs.com/package/@webspecs/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/jvgomg/semantic-kit/blob/main/LICENSE)

## Install

```bash
# Install globally
npm install -g @webspecs/cli

# Or use without installing
npx @webspecs/cli <command> [url]
```

## Usage

```bash
webspecs <command> [url] [options]
```

## Commands

Commands are organized into two groups:

- **Lenses** — Answer "How does X see my page?" for a specific consumer
- **Utilities** — Task-oriented tools with explicit control over rendering mode

### Lenses

| Command | Consumer | Description |
| --- | --- | --- |
| `ai <url>` | ChatGPT, Claude, Perplexity | Content as AI crawlers extract it |
| `reader <url\|file>` | Safari Reader, Pocket | Content as reader modes see it |
| `google <url\|file>` | Googlebot | Metadata, schema, and page structure |
| `social <url\|file>` | WhatsApp, Slack, Twitter | Open Graph + Twitter Card preview |
| `screen-reader <url>` | VoiceOver, NVDA, JAWS | Accessibility tree experience |

Lenses decide internally whether to use JavaScript rendering based on what the real consumer does.

### Analysis Utilities

| Command | Description |
| --- | --- |
| `readability <url\|file>` | Raw Readability extraction with metrics |
| `schema <url\|file>` | Structured data (JSON-LD, Open Graph, Twitter Cards) |
| `structure <url\|file>` | Page structure (landmarks, headings, links) |
| `a11y-tree <url>` | Accessibility tree |

Append `:js` for JavaScript-rendered content, `:compare` to diff static vs rendered:

```bash
webspecs schema:js https://example.com
webspecs structure:compare https://example.com
```

### Validation Utilities

| Command | Description |
| --- | --- |
| `validate:html <url\|file>` | HTML markup validation |
| `validate:schema <url\|file>` | Structured data validation against platform requirements |
| `validate:a11y <url>` | WCAG accessibility validation |

### Other

| Command | Description |
| --- | --- |
| `fetch <url>` | Fetch and prettify HTML |
| `tui` | Launch interactive terminal UI (requires Bun) |

## Options

All commands support:

```bash
--format json    # Output as JSON for scripting
--format text    # Output as formatted text (default)
--help           # Show command help
```

## Requirements

Node.js ≥ 18.0.0

JavaScript rendering commands (`:js`, `:compare`, `screen-reader`) require [Playwright](https://playwright.dev):

```bash
npm install playwright
npx playwright install chromium
```

## Related Packages

- [`@webspecs/core`](https://www.npmjs.com/package/@webspecs/core) — Core library for programmatic use
- [`@webspecs/tui`](https://www.npmjs.com/package/@webspecs/tui) — Interactive terminal UI (requires Bun)
