# semantic-kit

> Work in progress

Developer toolkit for understanding how websites are interpreted by search engines, AI crawlers, screen readers, and content extractors.

## Installation

```bash
# Install globally
npm install -g semantic-kit

# Or use with npx
npx semantic-kit <command> [options]
```

## Usage

```bash
semantic-kit <command> [options]
```

## Commands

| Command                       | Description                                      | Status       |
| ----------------------------- | ------------------------------------------------ | ------------ |
| `validate:html <url\|file>`   | Validate HTML markup                             | Available |
| `validate:schema <url\|file>` | Validate structured data                         | Available |
| `fetch <url>`                 | Fetch and prettify HTML                          | Available |
| `schema <url\|file>`          | View structured data                             | Available |
| `ai <url\|file>`              | Show AI crawler view (static HTML)               | Available |
| `readability:compare <url>`   | Compare static vs JS-rendered content            | Available |
| `structure <url\|file>`       | Show page structure (landmarks, headings, links) | Available |
| `structure:js <url>`          | Show page structure (rendered DOM)               | Available |
| `structure:compare <url>`     | Compare static vs rendered structure             | Available |
| `validate:a11y <url>`         | Validate WCAG compliance                         | Available |
| `a11y-tree <url>`             | Show accessibility tree (static HTML)            | Available |
| `a11y-tree:js <url>`          | Show accessibility tree (rendered DOM)           | Available |
| `a11y-tree:compare <url>`     | Compare static vs rendered accessibility tree    | Available |
| `tui`                         | Interactive terminal UI                          | Available |
| `google <url>`                | Google perspective (composed view)               | Available |

## Documentation

- [HTML Validation](./docs/commands/validate-html.md) — Validate markup correctness
- [Schema Validation](./docs/commands/validate-schema.md) — Validate structured data against platform requirements
- [Structured Data](./docs/commands/schema.md) — View JSON-LD, Microdata, RDFa
- [AI Crawlers](./docs/commands/ai.md) — How AI tools see your content (static HTML)
- [Readability](./docs/commands/readability.md) — Raw Readability extraction and comparison
- [Structure](./docs/commands/structure.md) — Page structure (landmarks, headings, links)
- [Accessibility Tree](./docs/commands/a11y-tree.md) — View accessibility tree
- [Accessibility Validation](./docs/commands/validate-a11y.md) — Validate WCAG compliance
- [Fetch](./docs/commands/fetch.md) — Fetch and prettify HTML
- [TUI](./docs/commands/tui.md) — Interactive terminal UI
- [Design Decisions](./docs/design-decisions.md) — Why things are built this way
- [Roadmap](./ROADMAP.md) — What's built and what's next
- [Changelog](./CHANGELOG.md) — Version history

## Philosophy

This toolkit prioritizes:

1. **Observability over enforcement** — Insight first, pass/fail second
2. **Documentation over implementation** — Curating existing tools, not reinventing
3. **Breadth before depth** — Coverage across perspectives before deep dives

See the [full roadmap](./docs/semantic-kit-roadmap.md) for details.

## Perspectives

The toolkit answers "How does X see my website?" for different consumers:

| Perspective       | What they see                 | Commands                                            |
| ----------------- | ----------------------------- | --------------------------------------------------- |
| **Validator**     | Markup correctness            | `validate:html`, `validate:schema`, `validate:a11y` |
| **AI Crawlers**   | Static HTML only              | `ai`                                                |
| **Readability**   | Static vs rendered comparison | `readability:compare`                               |
| **Structure**     | Landmarks, headings, links    | `structure`, `structure:js`                         |
| **Accessibility** | Accessibility tree, ARIA      | `a11y-tree`, `a11y-tree:js`                         |
| **Google**        | Composed view                 | `google`                                            |

## Static vs Rendered

Commands that analyze pages support two modes:

| Static (no JS)  | Rendered (with JS)    | Purpose            |
| --------------- | --------------------- | ------------------ |
| `ai`            | `readability:compare` | Content extraction |
| `structure`     | `structure:js`        | Page structure     |
| `a11y-tree`     | `a11y-tree:js`        | Accessibility      |

- **Static:** Works on URLs and local files. Fast. Shows what AI crawlers see.
- **Rendered:** Requires Playwright. URL only. Shows what browsers/Google see.

## Programmatic API

All command result types are exported for programmatic usage:

```typescript
import type {
  // A11y-tree commands
  A11yResult,
  A11yCompareResult,
  // Structure commands
  StructureResult,
  StructureJsResult,
  StructureCompareResult,
  // Readability commands
  ReadabilityCompareResult,
  AiResult,
  // Schema commands
  SchemaResult,
  // Validation commands
  ValidateHtmlResult,
  ValidateSchemaResult,
  ValidateA11yResult,
  // Lib types
  StructureAnalysis,
  StructureComparison,
  AriaNode,
  SnapshotDiff,
} from 'semantic-kit'
```

These types define the exact structure of `--format json` output for each command, enabling type-safe consumption of results in scripts and tools.

## Development

### Setup

```bash
# Install dependencies
bun install

# Run in development mode
bun run dev <command> [options]

# Type check
bun run typecheck

# Lint
bun run lint

# Build
bun run build

# Run tests
bun run test
```

### Test Server

A local test server serves HTML fixtures for testing commands:

```bash
# Start the test server (localhost:4000)
bun run test-server

# Test commands against fixtures
bun run dev ai http://localhost:4000/good/semantic-article.html
bun run dev validate:a11y http://localhost:4000/bad/div-soup.html
```

Fixtures are organized by category (`good/`, `bad/`, `edge-cases/`, `responses/`) and support configurable response behaviors via `.meta.json` sidecar files.

See [test-server/README.md](test-server/README.md) for full documentation.

## License

MIT
