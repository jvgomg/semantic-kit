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

Commands are organized into two groups:

- **Lenses** — Show how a specific consumer "sees" your page
- **Utilities** — Task-oriented tools for analysis and validation

### Lenses

| Command                  | Description                                            |
| ------------------------ | ------------------------------------------------------ |
| `ai <url\|file>`         | Show how AI crawlers see your page                     |
| `reader <url\|file>`     | Show how browser reader modes see your page            |
| `google <url\|file>`     | Show how Googlebot sees your page                      |
| `social <url\|file>`     | Show how social platforms see your page (link preview) |
| `screen-reader <url>`    | Show how screen readers interpret your page            |

### Analysis Utilities

| Command                       | Description                                      |
| ----------------------------- | ------------------------------------------------ |
| `readability <url\|file>`     | Raw Readability extraction with full metrics     |
| `readability:js <url>`        | Readability extraction after JavaScript rendering|
| `readability:compare <url>`   | Compare static vs JS-rendered content extraction |
| `schema <url\|file>`          | View structured data (JSON-LD, OG, Twitter Cards)|
| `schema:js <url>`             | View structured data after JavaScript rendering  |
| `schema:compare <url>`        | Compare static vs JS-rendered structured data    |
| `structure <url\|file>`       | Show page structure (landmarks, headings, links) |
| `structure:js <url>`          | Show structure after JavaScript rendering        |
| `structure:compare <url>`     | Compare static vs hydrated structure             |
| `a11y-tree <url>`             | Show accessibility tree (static HTML)            |
| `a11y-tree:js <url>`          | Show accessibility tree (rendered DOM)           |
| `a11y-tree:compare <url>`     | Compare static vs rendered accessibility tree    |

### Validation Utilities

| Command                       | Description                                      |
| ----------------------------- | ------------------------------------------------ |
| `validate:html <url\|file>`   | Validate HTML markup against W3C standards       |
| `validate:schema <url\|file>` | Validate structured data against platform requirements |
| `validate:a11y <url>`         | Validate accessibility against WCAG guidelines   |

### Other Utilities

| Command       | Description                      |
| ------------- | -------------------------------- |
| `fetch <url>` | Fetch and prettify HTML          |
| `tui`         | Launch interactive terminal UI   |

## Documentation

### Lenses

- [AI Crawlers](./docs/commands/ai.md) — How AI tools see your content
- [Reader Mode](./docs/commands/reader.md) — How browser reader modes see your page
- [Google](./docs/commands/google.md) — How Googlebot sees your page
- [Social](./docs/commands/social.md) — How social platforms see your page for link previews
- [Screen Reader](./docs/commands/screen-reader.md) — How screen readers interpret your page

### Utilities

- [Readability](./docs/commands/readability.md) — Raw Readability extraction and comparison
- [Structured Data](./docs/commands/schema.md) — View JSON-LD, Microdata, RDFa
- [Structure](./docs/commands/structure.md) — Page structure (landmarks, headings, links)
- [Accessibility Tree](./docs/commands/a11y-tree.md) — View accessibility tree

### Validation

- [HTML Validation](./docs/commands/validate-html.md) — Validate markup correctness
- [Schema Validation](./docs/commands/validate-schema.md) — Validate structured data against platform requirements
- [Accessibility Validation](./docs/commands/validate-a11y.md) — Validate WCAG compliance

### Other

- [Fetch](./docs/commands/fetch.md) — Fetch and prettify HTML
- [TUI](./docs/commands/tui.md) — Interactive terminal UI
- [Design Decisions](./docs/design-decisions.md) — Why things are built this way
- [Changelog](./CHANGELOG.md) — Version history

## Philosophy

This toolkit prioritizes:

1. **Observability over enforcement** — Insight first, pass/fail second
2. **Documentation over implementation** — Curating existing tools, not reinventing
3. **Breadth before depth** — Coverage across perspectives before deep dives

See the [full roadmap](./docs/semantic-kit-roadmap.md) for details.

## Lenses vs Utilities

The toolkit organizes commands into two conceptual groups:

### Lenses

Lenses answer "How does X see my page?" for specific consumers:

| Lens            | Consumer                           | What it shows                        |
| --------------- | ---------------------------------- | ------------------------------------ |
| `ai`            | ChatGPT, Claude, Perplexity        | Markdown content via Readability     |
| `reader`        | Safari Reader, Pocket              | Reader mode extraction               |
| `google`        | Googlebot                          | Metadata, schema, structure          |
| `social`        | WhatsApp, Slack, Twitter, iMessage | Open Graph + Twitter Card previews   |
| `screen-reader` | VoiceOver, NVDA, JAWS              | Accessibility tree (JS-rendered)     |

Lenses are opinionated: each decides internally whether to use JavaScript rendering based on what the real consumer does.

### Utilities

Utilities are task-oriented tools with explicit control over rendering mode:

| Pattern            | Static         | JS-rendered       | Comparison            |
| ------------------ | -------------- | ----------------- | --------------------- |
| Content extraction | `readability`  | `readability:js`  | `readability:compare` |
| Structured data    | `schema`       | `schema:js`       | `schema:compare`      |
| Page structure     | `structure`    | `structure:js`    | `structure:compare`   |
| Accessibility tree | `a11y-tree`    | `a11y-tree:js`    | `a11y-tree:compare`   |

- **Static (no `:js`):** Works on URLs and local files. Fast.
- **JS-rendered (`:js`):** Requires Playwright. URL only. Shows hydrated DOM.
- **Compare (`:compare`):** Shows differences between static and rendered.

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
