```yaml
# Metadata
researchVersion: null
toolVersion: null
status: pending
created: 2026-02-09
```

# Command API Restructure: Lenses and Utilities

## Overview

This document describes a comprehensive restructure of the semantic-kit command API. The goal is to organize commands into two conceptual groups that provide a clearer mental model for users:

1. **Lenses** — Commands that show how a specific consumer "sees" a webpage (AI crawlers, search engines, social media platforms, reader modes, screen readers)
2. **Utilities** — Task-oriented tools for analysis, validation, and debugging

This restructure improves discoverability, clarifies purpose, and provides intuitive entry points for different user needs.

---

## Design Principles

### 1. Lenses are opinionated and fixed

Lens commands answer the question "How does X see my page?" They provide a curated, opinionated view without configuration options that change the perspective. The lens decides internally whether to use JavaScript rendering based on what the real consumer does.

### 2. Utilities are flexible tools

Utility commands are task-oriented and can have variants (`:js`, `:compare`) and configuration options. They provide raw data and analysis capabilities.

### 3. Schema data flows contextually

Structured data is surfaced through lenses contextually (Google lens shows Google-relevant schema, Social lens shows OG/Twitter Cards) while the `schema` utility shows everything.

### 4. Documentation frames the mental model

Commands themselves don't need prefixes, but `--help`, README, and TUI should organize and present them clearly as "Lenses" and "Utilities".

### 5. `:compare` variants are utilities

Comparison features (static vs JS-rendered) are utilities, not lens variants. This keeps lenses pure while providing comparison capabilities where valuable.

---

# Part 1: Current State (Comprehensive Reference)

This section documents every current command with complete details on behavior, options, and implementation.

---

## Global Options

All commands support these global options:

| Option | Description |
|--------|-------------|
| `--plain` | Disable rich output (no spinners, plain text) |
| `--ci` | CI mode (alias for `--plain`) |

---

## Command: `ai`

**Purpose:** Show how AI crawlers see your page (extracted content as markdown)

**Description:** Fetches static HTML and extracts readable content using Mozilla Readability, converting it to markdown. This simulates what AI crawlers like ChatGPT, Claude, and Perplexity see when they fetch a page without JavaScript execution.

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<target>` | Yes | URL or file path to analyze |

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--raw` | Show raw static HTML instead of extracted content | `false` |
| `--format <type>` | Output format: `full`, `compact`, `json` | `full` |

### Output Formats

- **full** — Complete extracted content with metadata
- **compact** — Summary view
- **json** — Structured JSON output with `result` and `issues` fields

### Input Support

- URLs (http/https)
- Local file paths

### Implementation

- **Command file:** `src/commands/ai/command.ts`
- **Types:** `src/commands/ai/types.ts`
- **Key dependencies:** Mozilla Readability for content extraction, Turndown for HTML-to-markdown

### Behavior Notes

- Fetches static HTML only (no JavaScript execution)
- Detects framework-specific hidden content (e.g., React hydration artifacts)
- Reports hidden content severity (none, low, high)
- Issues warnings when significant content may be hidden

---

## Command: `bot`

**Purpose:** Compare static HTML vs JavaScript-rendered content

**Description:** Fetches a page twice — once as static HTML and once after JavaScript execution — then compares what bots would see in each case. Useful for debugging hydration issues and understanding crawler behavior.

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<target>` | Yes | URL to analyze (must be URL, not file path) |

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--content` | Show extracted markdown content | `false` |
| `--timeout <ms>` | Timeout in milliseconds for page to load | `5000` |
| `--format <type>` | Output format: `full`, `compact`, `json` | `full` |

### Output Formats

- **full** — Detailed comparison with differences highlighted
- **compact** — Summary view
- **json** — Structured JSON output

### Input Support

- URLs only (requires browser for JavaScript execution)

### Implementation

- **Command file:** `src/commands/bot/command.ts`
- **Types:** `src/commands/bot/types.ts`
- **Key dependencies:** Playwright for browser rendering

### Behavior Notes

- Requires URL (not file path) because JavaScript execution requires a browser
- Compares content extraction results between static and hydrated states
- Reports differences in what crawlers would see

---

## Command: `schema`

**Purpose:** View structured data (JSON-LD, Microdata, RDFa, Open Graph, Twitter Cards)

**Description:** Extracts and displays all structured data embedded in a page. Shows JSON-LD scripts, Microdata attributes, RDFa, Open Graph meta tags, and Twitter Card meta tags.

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<target>` | Yes | URL or file path to inspect |

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--format <type>` | Output format: `full`, `compact`, `json` | `full` |

### Output Formats

- **full** — Complete structured data with all types
- **compact** — Summary view showing what's present
- **json** — Structured JSON output

### Input Support

- URLs (http/https)
- Local file paths

### Implementation

- **Command file:** `src/commands/schema/command.ts`
- **Types:** `src/commands/schema/types.ts`

### Structured Data Types Detected

1. **JSON-LD** — `<script type="application/ld+json">` blocks
2. **Microdata** — Elements with `itemscope`, `itemtype`, `itemprop` attributes
3. **RDFa** — Elements with `vocab`, `typeof`, `property` attributes
4. **Open Graph** — Meta tags with `property="og:*"` attributes
5. **Twitter Cards** — Meta tags with `name="twitter:*"` attributes

### Tag Requirements (for reference)

**Open Graph Required:** `og:title`, `og:type`, `og:image`, `og:url`
**Open Graph Recommended:** `og:description`, `og:site_name`, `og:locale`

**Twitter Cards Required:** `twitter:card`, `twitter:title`, `twitter:description`
**Twitter Cards Recommended:** `twitter:image`, `twitter:site`, `twitter:creator`

---

## Command: `structure`

**Purpose:** Show page structure (landmarks, headings, links, skip links, title, and language)

**Description:** Analyzes the semantic structure of a page including ARIA landmarks, heading hierarchy, link inventory, and basic accessibility signals. Uses static HTML analysis.

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<target>` | Yes | URL or file path to analyze |

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--format <type>` | Output format: `full`, `brief`, `compact`, `json` | `full` |
| `--all-rules` | Run all JSDOM-safe accessibility rules (68 rules) instead of just structure rules (14 rules) | `false` |

### Output Formats

- **full** — Complete structure analysis with all details
- **brief** — Truncated view
- **compact** — Summary view
- **json** — Structured JSON output

### Input Support

- URLs (http/https)
- Local file paths

### Implementation

- **Command file:** `src/commands/structure/command.ts`
- **Types:** `src/commands/structure/types.ts`
- **Runner:** `src/commands/structure/runner.ts`
- **Key dependencies:** axe-core for accessibility rule checking

### Analysis Includes

- Document title
- Document language (`lang` attribute)
- ARIA landmarks (banner, navigation, main, contentinfo, etc.)
- Heading hierarchy (h1-h6)
- Link inventory
- Skip links

---

## Command: `structure:js`

**Purpose:** Show page structure after JavaScript rendering

**Description:** Same analysis as `structure` but after JavaScript execution, showing the hydrated DOM structure.

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<target>` | Yes | URL to analyze (must be URL, not file path) |

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--format <type>` | Output format: `full`, `brief`, `compact`, `json` | `full` |
| `--timeout <ms>` | Timeout in milliseconds for page to load | `5000` |
| `--all-rules` | Run all JSDOM-safe accessibility rules (68 rules) instead of just structure rules (14 rules) | `false` |

### Output Formats

Same as `structure`

### Input Support

- URLs only (requires browser)

### Implementation

- **Command file:** `src/commands/structure/command-js.ts`
- **Types:** `src/commands/structure/types.ts`
- **Runner:** `src/commands/structure/runner-js.ts`
- **Key dependencies:** Playwright for browser rendering

### Behavior Notes

- Requires URL because JavaScript execution requires a browser
- Returns both static and hydrated analysis for comparison
- Reports timeout status

---

## Command: `structure:compare`

**Purpose:** Compare structural differences between static HTML and JavaScript-rendered page

**Description:** Runs structure analysis twice (static and hydrated) and highlights differences, useful for debugging SSR/hydration issues.

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<target>` | Yes | URL to analyze (must be URL, not file path) |

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--format <type>` | Output format: `full`, `brief`, `compact`, `json` | `full` |
| `--timeout <ms>` | Timeout in milliseconds for page to load | `5000` |

### Output Formats

Same as `structure`

### Input Support

- URLs only (requires browser)

### Implementation

- **Command file:** `src/commands/structure/command-compare.ts`
- **Types:** `src/commands/structure/types.ts`
- **Runner:** `src/commands/structure/runner-compare.ts`

### Behavior Notes

- Compares landmarks, headings, links, and other structural elements
- Highlights additions, removals, and changes
- Reports timeout status

---

## Command: `a11y`

**Purpose:** Show accessibility tree from static HTML (JavaScript disabled)

**Description:** Renders the page in a browser with JavaScript disabled and extracts the accessibility tree that assistive technologies would see.

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<target>` | Yes | URL to analyze (must be URL, not file path) |

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--format <type>` | Output format: `full`, `compact`, `json` | `full` |
| `--timeout <ms>` | Timeout in milliseconds for page to load | `5000` |

### Output Formats

- **full** — Complete accessibility tree
- **compact** — Summary view
- **json** — Structured JSON output

### Input Support

- URLs only (requires browser with JavaScript disabled)

### Implementation

- **Command file:** `src/commands/a11y/command.ts`
- **Types:** `src/commands/a11y/types.ts`
- **Runner:** `src/commands/a11y/runner.ts`
- **Key dependencies:** Playwright for browser rendering and accessibility tree extraction

### Behavior Notes

- Requires URL because it needs a browser to build accessibility tree
- Uses Playwright's accessibility tree snapshot feature
- JavaScript is explicitly disabled

---

## Command: `a11y:js`

**Purpose:** Show accessibility tree after JavaScript rendering

**Description:** Same as `a11y` but with JavaScript enabled, showing the accessibility tree of the fully hydrated page.

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<target>` | Yes | URL to analyze (must be URL, not file path) |

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--format <type>` | Output format: `full`, `json` | `full` |
| `--timeout <ms>` | Timeout in milliseconds for page to load | `5000` |

### Output Formats

- **full** — Complete accessibility tree
- **json** — Structured JSON output

### Input Support

- URLs only (requires browser)

### Implementation

- **Command file:** `src/commands/a11y/command-js.ts`
- **Types:** `src/commands/a11y/types.ts`
- **Runner:** `src/commands/a11y/runner-js.ts`

---

## Command: `a11y:compare`

**Purpose:** Compare accessibility tree differences between static and hydrated page

**Description:** Extracts accessibility trees from both static HTML and JavaScript-rendered page, then compares them to highlight differences.

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<target>` | Yes | URL to analyze (must be URL, not file path) |

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--format <type>` | Output format: `full`, `compact`, `json` | `full` |
| `--timeout <ms>` | Timeout in milliseconds for page to load | `5000` |

### Output Formats

- **full** — Detailed comparison
- **compact** — Summary view
- **json** — Structured JSON output

### Input Support

- URLs only (requires browser)

### Implementation

- **Command file:** `src/commands/a11y/command-compare.ts`
- **Types:** `src/commands/a11y/types.ts`
- **Runner:** `src/commands/a11y/runner-compare.ts`

---

## Command: `validate:html`

**Purpose:** Validate HTML markup against W3C standards and best practices

**Description:** Runs html-validate against the page to check for markup errors, accessibility issues, and best practice violations.

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<target>` | Yes | URL or file path to validate |

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--config <path>` | Path to html-validate config file | (none) |
| `--format <type>` | Output format: `full`, `brief`, `compact`, `json` | `full` |

### Output Formats

- **full** — With code context around errors (uses `codeframe` formatter)
- **brief** — Minimal one-line per error (uses `text` formatter)
- **compact** — Concise grouped errors (uses `stylish` formatter)
- **json** — Structured JSON output

### Input Support

- URLs (http/https)
- Local file paths

### Exit Behavior

- Exits with code `1` if validation fails (errors found)
- Exits with code `0` if validation passes

### Implementation

- **Command file:** `src/commands/validate-html/command.ts`
- **Types:** `src/commands/validate-html/types.ts`
- **Key dependencies:** html-validate

---

## Command: `validate:schema`

**Purpose:** Validate structured data against platform requirements

**Description:** Validates JSON-LD, Microdata, and meta tags against specific platform requirements (Google, Twitter, Facebook).

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<target>` | Yes | URL or file path to validate |

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--presets <names>` | Validate against: `google`, `twitter`, `facebook`, `social-media` (comma-separated) | (all) |
| `--format <type>` | Output format: `full`, `compact`, `json` | `full` |

### Available Presets

| Preset | Description |
|--------|-------------|
| `google` | Google Search structured data requirements |
| `twitter` | Twitter Card requirements |
| `facebook` | Facebook/Open Graph requirements |
| `social-media` | Combined Twitter + Facebook |

### Output Formats

- **full** — Detailed validation results
- **compact** — Summary view
- **json** — Structured JSON output

### Input Support

- URLs (http/https)
- Local file paths

### Exit Behavior

- Exits with code `1` if required tests fail
- Exits with code `0` if all required tests pass (warnings are OK)

### Implementation

- **Command file:** `src/commands/validate-schema/command.ts`
- **Types:** `src/commands/validate-schema/types.ts`
- **Key dependencies:** structured-data-testing-tool

---

## Command: `validate:a11y`

**Purpose:** Validate accessibility against WCAG guidelines

**Description:** Runs axe-core accessibility testing against a rendered page to find WCAG violations.

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<target>` | Yes | URL to validate (must be URL, not file path) |

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--level <level>` | WCAG level: `A`, `AA`, `AAA` | `AA` |
| `--format <type>` | Output format: `full`, `compact`, `json` | `full` |
| `--timeout <ms>` | Timeout in milliseconds for page to load | `5000` |
| `--ignore-incomplete` | Do not exit with error for incomplete checks (still displayed) | `false` |

### WCAG Levels

| Level | Tags Included |
|-------|---------------|
| `A` | wcag2a, wcag21a, wcag22a |
| `AA` | wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22a, wcag22aa |
| `AAA` | All above plus wcag2aaa, wcag21aaa |

### Output Formats

- **full** — Detailed violations with element selectors
- **compact** — Summary view
- **json** — Structured JSON output

### Input Support

- URLs only (requires browser rendering)

### Exit Behavior

- Exits with code `1` if violations found OR (incomplete checks AND `--ignore-incomplete` not set)
- Exits with code `0` otherwise

### Implementation

- **Command file:** `src/commands/validate-a11y/command.ts`
- **Types:** `src/commands/validate-a11y/types.ts`
- **Key dependencies:** Playwright, axe-core

### Severity Levels

Violations are categorized by severity:
- **critical** — Must fix
- **serious** — Should fix
- **moderate** — Consider fixing
- **minor** — Minor issue

---

## Command: `fetch`

**Purpose:** Fetch and prettify HTML from a URL for inspection

**Description:** Simple utility to fetch HTML and optionally save it to a file. Prettifies the HTML for readability.

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<target>` | Yes | URL to fetch |

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-o, --out <path>` | Save to file instead of terminal | (none) |
| `--stream` | Show in terminal even when saving to file | `false` |

### Input Support

- URLs only

### Implementation

- **Command file:** `src/commands/fetch/command.ts`
- **Types:** `src/commands/fetch/types.ts`
- **Key dependencies:** emphasize for syntax highlighting

### Behavior Notes

- Prettifies HTML for readability
- Warns if HTML is malformed and cannot be prettified
- Syntax highlights output when displayed in terminal

---

## Command: `tui`

**Purpose:** Launch interactive terminal UI for exploring semantic data

**Description:** Opens an interactive terminal interface for exploring page analysis results.

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `[url]` | No | URL to analyze on startup |

### Options

None (inherits global options only)

### Implementation

- **Command file:** `src/commands/tui.ts`
- **TUI implementation:** `src/tui/`

---

# Part 2: Migration Mapping

This section maps every current command to its new location in the restructured API, with detailed notes on what changes.

---

## Summary Table

| Current Command | New Location | Type | Notes |
|-----------------|--------------|------|-------|
| `ai` | `ai` | Lens | Unchanged |
| `bot` | `readability:compare` | Utility | Comparison feature extracted, renamed |
| `schema` | `schema` | Utility | Unchanged (shows all data) |
| `schema` | `google` | Lens | New: filters to Google-relevant schema |
| `schema` | `social` | Lens | New: filters to OG/Twitter Cards |
| `structure` | `structure` | Utility | Unchanged |
| `structure:js` | `structure:js` | Utility | Unchanged |
| `structure:compare` | `structure:compare` | Utility | Unchanged |
| `a11y` | `a11y-tree` | Utility | Renamed |
| `a11y:js` | `a11y-tree:js` | Utility | Renamed |
| `a11y:js` | `screen-reader` | Lens | New: uses JS-rendered a11y tree |
| `a11y:compare` | `a11y-tree:compare` | Utility | Renamed |
| `validate:html` | `validate:html` | Utility | Unchanged |
| `validate:schema` | `validate:schema` | Utility | Unchanged |
| `validate:a11y` | `validate:a11y` | Utility | Unchanged |
| `fetch` | `fetch` | Utility | Unchanged |
| `tui` | `tui` | Utility | Unchanged |
| (new) | `reader` | Lens | New: Readability extraction view |
| (new) | `readability` | Utility | New: Readability analysis (static) |
| (new) | `readability:js` | Utility | New: Readability analysis (after JS) |
| (new) | `schema:js` | Utility | New: Schema after JS rendering |
| (new) | `schema:compare` | Utility | New: Schema diff static vs JS |

---

## Detailed Migration Notes

### `ai` → `ai` (Lens)

**Change type:** None (unchanged)

**Current behavior preserved:**
- Fetches static HTML
- Extracts content via Mozilla Readability
- Converts to markdown
- Reports hidden content warnings

**Options preserved:**
- `--raw`
- `--format`

**Notes:**
- This is a lens because it shows "how AI crawlers see your page"
- No `:js` variant because AI crawlers typically don't execute JavaScript
- The `--raw` flag remains for debugging purposes

---

### `bot` → `readability:compare` (Utility)

**Change type:** Renamed and reclassified

**Current behavior preserved:**
- Fetches static HTML
- Fetches JavaScript-rendered HTML
- Compares extracted content between the two
- Reports differences

**Current options:**
- `--content` → behavior should be default (always show content diff)
- `--timeout` → preserved
- `--format` → preserved

**Rationale:**
- The comparison feature is a utility, not a lens
- `readability:compare` follows the pattern of `structure:compare` and `a11y-tree:compare`
- The lens for reader mode view is `reader` (separate command)

---

### `schema` → `schema` (Utility)

**Change type:** None (unchanged as utility)

**Current behavior preserved:**
- Extracts all structured data types
- Shows JSON-LD, Microdata, RDFa, Open Graph, Twitter Cards

**Options preserved:**
- `--format`

**New behavior:**
- This utility shows ALL schema data
- Lenses (`google`, `social`) filter to relevant subsets

---

### `schema` → `google` (Lens) — NEW

**Change type:** New lens derived from `schema`

**New behavior:**
- Shows structured data relevant to Google Search
- Filters to JSON-LD types Google recognizes (Article, Product, FAQ, HowTo, BreadcrumbList, etc.)
- Shows relevant meta tags (title, description, canonical)
- Does NOT show Open Graph or Twitter Cards (not Google-relevant)

**Implementation approach:**
- Reuse schema extraction logic
- Add filter for Google-recognized schema types
- Add page metadata (title, description, canonical URL)
- Consider showing structure signals (heading hierarchy, landmarks)

---

### `schema` → `social` (Lens) — NEW

**Change type:** New lens derived from `schema`

**New behavior:**
- Shows structured data relevant to social media link previews
- Shows Open Graph tags (og:title, og:description, og:image, og:url, etc.)
- Shows Twitter Card tags (twitter:card, twitter:title, etc.)
- Reports completeness (missing required/recommended tags)

**Implementation approach:**
- Reuse schema extraction logic
- Filter to OG and Twitter Card meta tags
- Show preview of how link would appear (title, description, image)

---

### `structure` → `structure` (Utility)

**Change type:** None (unchanged)

All current behavior and options preserved.

---

### `structure:js` → `structure:js` (Utility)

**Change type:** None (unchanged)

All current behavior and options preserved.

---

### `structure:compare` → `structure:compare` (Utility)

**Change type:** None (unchanged)

All current behavior and options preserved.

---

### `a11y` → `a11y-tree` (Utility)

**Change type:** Renamed

**Rationale:**
- `a11y` is ambiguous (could mean validation, tree, or general accessibility)
- `a11y-tree` clearly indicates this shows the accessibility tree
- Distinguishes from `validate:a11y` (validation) and `screen-reader` (lens)

**Current behavior preserved:**
- Shows accessibility tree from browser with JS disabled
- All options preserved

---

### `a11y:js` → `a11y-tree:js` (Utility)

**Change type:** Renamed

**Rationale:** Same as above — clarity about what the command shows.

**Current behavior preserved.**

---

### `a11y:js` → `screen-reader` (Lens) — NEW

**Change type:** New lens that internally uses `a11y:js` functionality

**New behavior:**
- Shows accessibility tree as screen readers see it
- Uses JavaScript rendering (because real screen readers see rendered pages)
- Opinionated: no `:js` variant (the lens always uses JS)
- Presents tree in user-friendly format optimized for understanding screen reader experience

**Implementation approach:**
- Reuse `a11y:js` runner
- Create new formatter focused on screen reader UX
- No `--timeout` exposed (or use sensible default)

---

### `a11y:compare` → `a11y-tree:compare` (Utility)

**Change type:** Renamed

**Rationale:** Consistency with `a11y-tree` and `a11y-tree:js` naming.

**Current behavior preserved.**

---

### `validate:html` → `validate:html` (Utility)

**Change type:** None (unchanged)

All current behavior and options preserved.

---

### `validate:schema` → `validate:schema` (Utility)

**Change type:** None (unchanged)

All current behavior and options preserved.

---

### `validate:a11y` → `validate:a11y` (Utility)

**Change type:** None (unchanged)

All current behavior and options preserved.

---

### `fetch` → `fetch` (Utility)

**Change type:** None (unchanged)

All current behavior and options preserved.

---

### `tui` → `tui` (Utility)

**Change type:** None (unchanged)

TUI will need updates to reflect new command organization but core functionality unchanged.

---

### NEW: `reader` (Lens)

**New command** — See existing backlog item: `docs/backlog/reader-command.md`

**Purpose:** Show how browser reader modes see your page

**Behavior:**
- Extracts content via Mozilla Readability
- Shows extraction metadata (title, byline, excerpt, length)
- Reports compatibility signals for Safari Reader

**Key distinction from `ai`:**
- `ai` focuses on AI crawler extraction
- `reader` focuses on browser reader mode extraction
- Same underlying technology, different framing and metrics

---

### NEW: `readability` (Utility)

**New command**

**Purpose:** Raw Readability extraction and analysis (static HTML)

**Behavior:**
- Extracts content via Mozilla Readability
- Shows detailed extraction results
- Reports Readability metrics (scores, link density, etc.)

**Options:**
- `--format` — full, compact, json

---

### NEW: `readability:js` (Utility)

**New command**

**Purpose:** Readability extraction after JavaScript rendering

**Behavior:**
- Same as `readability` but on JS-rendered HTML
- Useful for SPAs and hydrated content

**Options:**
- `--format`
- `--timeout`

---

### NEW: `schema:js` (Utility)

**New command**

**Purpose:** Show structured data after JavaScript rendering

**Behavior:**
- Same as `schema` but on JS-rendered HTML
- Captures schema injected by JavaScript (common with Next.js, SPAs)

**Options:**
- `--format`
- `--timeout`

---

### NEW: `schema:compare` (Utility)

**New command**

**Purpose:** Compare structured data between static and JS-rendered HTML

**Behavior:**
- Extracts schema from both static and hydrated HTML
- Shows differences (added, removed, changed)

**Options:**
- `--format`
- `--timeout`

---

# Part 3: End State Command Reference

This section describes the complete command structure after the restructure is implemented.

---

## Lenses

Lenses answer: "How does X see my page?"

| Command | Consumer | What It Shows |
|---------|----------|---------------|
| `ai` | ChatGPT, Claude, Perplexity | Markdown content extracted via Readability |
| `reader` | Safari Reader, Pocket | Readability extraction with compatibility metrics |
| `google` | Googlebot | Page structure + Google-relevant structured data |
| `social` | WhatsApp, Slack, Twitter, iMessage | Open Graph + Twitter Card previews |
| `screen-reader` | VoiceOver, NVDA, JAWS | Accessibility tree (JS-rendered) |

### Lens Design Principles

1. **No `:js` variants** — Each lens decides internally whether to use JavaScript based on what the real consumer does
2. **Opinionated output** — Shows curated, relevant information for that consumer
3. **Minimal options** — Format options only (`--format`), no behavioral configuration

---

## Utilities

Utilities are task-oriented analysis and validation tools.

### Analysis Utilities

| Command | Purpose |
|---------|---------|
| `schema` | Show all structured data (static HTML) |
| `schema:js` | Show all structured data (after JS) |
| `schema:compare` | Compare schema: static vs JS |
| `structure` | Show page structure (static HTML) |
| `structure:js` | Show page structure (after JS) |
| `structure:compare` | Compare structure: static vs JS |
| `a11y-tree` | Show accessibility tree (static HTML, JS disabled) |
| `a11y-tree:js` | Show accessibility tree (after JS) |
| `a11y-tree:compare` | Compare a11y tree: static vs JS |
| `readability` | Show Readability extraction (static HTML) |
| `readability:js` | Show Readability extraction (after JS) |
| `readability:compare` | Compare Readability: static vs JS |

### Validation Utilities

| Command | Purpose |
|---------|---------|
| `validate:html` | Validate HTML markup (W3C standards) |
| `validate:schema` | Validate structured data (platform requirements) |
| `validate:a11y` | Validate accessibility (WCAG guidelines) |

### Other Utilities

| Command | Purpose |
|---------|---------|
| `fetch` | Fetch and prettify HTML |
| `tui` | Interactive terminal UI |

---

## Complete Command Reference

### `ai` (Lens)

Show how AI crawlers see your page.

```
semantic-kit ai <target> [options]

Arguments:
  target              URL or file path to analyze

Options:
  --raw               Show raw static HTML instead of extracted content
  --format <type>     Output format: full, compact, json (default: full)
```

---

### `reader` (Lens)

Show how browser reader modes see your page.

```
semantic-kit reader <target> [options]

Arguments:
  target              URL or file path to analyze

Options:
  --format <type>     Output format: full, compact, json (default: full)
```

---

### `google` (Lens)

Show how Googlebot sees your page.

```
semantic-kit google <target> [options]

Arguments:
  target              URL or file path to analyze

Options:
  --format <type>     Output format: full, compact, json (default: full)
```

---

### `social` (Lens)

Show how social media platforms see your page for link previews.

```
semantic-kit social <target> [options]

Arguments:
  target              URL or file path to analyze

Options:
  --format <type>     Output format: full, compact, json (default: full)
```

---

### `screen-reader` (Lens)

Show how screen readers interpret your page.

```
semantic-kit screen-reader <target> [options]

Arguments:
  target              URL to analyze (requires browser)

Options:
  --format <type>     Output format: full, compact, json (default: full)
```

---

### `schema` (Utility)

View all structured data.

```
semantic-kit schema <target> [options]

Arguments:
  target              URL or file path to inspect

Options:
  --format <type>     Output format: full, compact, json (default: full)
```

---

### `schema:js` (Utility)

View structured data after JavaScript rendering.

```
semantic-kit schema:js <target> [options]

Arguments:
  target              URL to inspect (requires browser)

Options:
  --format <type>     Output format: full, compact, json (default: full)
  --timeout <ms>      Timeout for page load (default: 5000)
```

---

### `schema:compare` (Utility)

Compare structured data between static and JS-rendered HTML.

```
semantic-kit schema:compare <target> [options]

Arguments:
  target              URL to analyze (requires browser)

Options:
  --format <type>     Output format: full, compact, json (default: full)
  --timeout <ms>      Timeout for page load (default: 5000)
```

---

### `structure` (Utility)

Show page structure from static HTML.

```
semantic-kit structure <target> [options]

Arguments:
  target              URL or file path to analyze

Options:
  --format <type>     Output format: full, brief, compact, json (default: full)
  --all-rules         Run all JSDOM-safe accessibility rules (68) instead of structure rules (14)
```

---

### `structure:js` (Utility)

Show page structure after JavaScript rendering.

```
semantic-kit structure:js <target> [options]

Arguments:
  target              URL to analyze (requires browser)

Options:
  --format <type>     Output format: full, brief, compact, json (default: full)
  --timeout <ms>      Timeout for page load (default: 5000)
  --all-rules         Run all JSDOM-safe accessibility rules (68) instead of structure rules (14)
```

---

### `structure:compare` (Utility)

Compare structure between static and JS-rendered HTML.

```
semantic-kit structure:compare <target> [options]

Arguments:
  target              URL to analyze (requires browser)

Options:
  --format <type>     Output format: full, brief, compact, json (default: full)
  --timeout <ms>      Timeout for page load (default: 5000)
```

---

### `a11y-tree` (Utility)

Show accessibility tree from static HTML (JavaScript disabled).

```
semantic-kit a11y-tree <target> [options]

Arguments:
  target              URL to analyze (requires browser)

Options:
  --format <type>     Output format: full, compact, json (default: full)
  --timeout <ms>      Timeout for page load (default: 5000)
```

---

### `a11y-tree:js` (Utility)

Show accessibility tree after JavaScript rendering.

```
semantic-kit a11y-tree:js <target> [options]

Arguments:
  target              URL to analyze (requires browser)

Options:
  --format <type>     Output format: full, json (default: full)
  --timeout <ms>      Timeout for page load (default: 5000)
```

---

### `a11y-tree:compare` (Utility)

Compare accessibility tree between static and JS-rendered HTML.

```
semantic-kit a11y-tree:compare <target> [options]

Arguments:
  target              URL to analyze (requires browser)

Options:
  --format <type>     Output format: full, compact, json (default: full)
  --timeout <ms>      Timeout for page load (default: 5000)
```

---

### `readability` (Utility)

Show Readability extraction from static HTML.

```
semantic-kit readability <target> [options]

Arguments:
  target              URL or file path to analyze

Options:
  --format <type>     Output format: full, compact, json (default: full)
```

---

### `readability:js` (Utility)

Show Readability extraction after JavaScript rendering.

```
semantic-kit readability:js <target> [options]

Arguments:
  target              URL to analyze (requires browser)

Options:
  --format <type>     Output format: full, compact, json (default: full)
  --timeout <ms>      Timeout for page load (default: 5000)
```

---

### `readability:compare` (Utility)

Compare Readability extraction between static and JS-rendered HTML.

```
semantic-kit readability:compare <target> [options]

Arguments:
  target              URL to analyze (requires browser)

Options:
  --format <type>     Output format: full, compact, json (default: full)
  --timeout <ms>      Timeout for page load (default: 5000)
```

---

### `validate:html` (Utility)

Validate HTML markup against W3C standards.

```
semantic-kit validate:html <target> [options]

Arguments:
  target              URL or file path to validate

Options:
  --config <path>     Path to html-validate config file
  --format <type>     Output format: full, brief, compact, json (default: full)

Exit codes:
  0                   Validation passed
  1                   Validation failed
```

---

### `validate:schema` (Utility)

Validate structured data against platform requirements.

```
semantic-kit validate:schema <target> [options]

Arguments:
  target              URL or file path to validate

Options:
  --presets <names>   Validate against: google, twitter, facebook, social-media (comma-separated)
  --format <type>     Output format: full, compact, json (default: full)

Exit codes:
  0                   All required tests passed
  1                   Required tests failed
```

---

### `validate:a11y` (Utility)

Validate accessibility against WCAG guidelines.

```
semantic-kit validate:a11y <target> [options]

Arguments:
  target              URL to validate (requires browser)

Options:
  --level <level>     WCAG level: A, AA, AAA (default: AA)
  --format <type>     Output format: full, compact, json (default: full)
  --timeout <ms>      Timeout for page load (default: 5000)
  --ignore-incomplete Do not exit with error for incomplete checks

Exit codes:
  0                   No violations (or only incomplete with --ignore-incomplete)
  1                   Violations found (or incomplete checks without --ignore-incomplete)
```

---

### `fetch` (Utility)

Fetch and prettify HTML from a URL.

```
semantic-kit fetch <target> [options]

Arguments:
  target              URL to fetch

Options:
  -o, --out <path>    Save to file instead of terminal
  --stream            Show in terminal even when saving to file
```

---

### `tui` (Utility)

Launch interactive terminal UI.

```
semantic-kit tui [url]

Arguments:
  url                 Optional URL to analyze on startup
```

---

## Help Output Organization

The `--help` output should organize commands into groups:

```
semantic-kit - Developer toolkit for understanding how websites are interpreted

LENSES (How consumers see your page)
  ai              Show how AI crawlers see your page
  reader          Show how browser reader modes see your page
  google          Show how Googlebot sees your page
  social          Show how social media platforms see your page for link previews
  screen-reader   Show how screen readers interpret your page

ANALYSIS UTILITIES
  schema          View all structured data (JSON-LD, OG, Twitter Cards, etc.)
  schema:js       View structured data after JavaScript rendering
  schema:compare  Compare structured data: static vs JS

  structure          Show page structure (landmarks, headings, links)
  structure:js       Show page structure after JavaScript rendering
  structure:compare  Compare structure: static vs JS

  a11y-tree          Show accessibility tree (JavaScript disabled)
  a11y-tree:js       Show accessibility tree after JavaScript rendering
  a11y-tree:compare  Compare accessibility tree: static vs JS

  readability          Show Readability extraction
  readability:js       Show Readability extraction after JavaScript rendering
  readability:compare  Compare Readability: static vs JS

VALIDATION UTILITIES
  validate:html     Validate HTML markup (W3C standards)
  validate:schema   Validate structured data (platform requirements)
  validate:a11y     Validate accessibility (WCAG guidelines)

OTHER
  fetch   Fetch and prettify HTML
  tui     Launch interactive terminal UI

Global options:
  --plain   Disable rich output (no spinners)
  --ci      CI mode (alias for --plain)
  --help    Show help
  --version Show version
```

---

# Part 4: Implementation Phases

This section suggests a phased approach to implementing the restructure.

---

## Phase 1: Renames and Reorganization

**Scope:** Rename existing commands, no new functionality

**Tasks:**
1. Rename `a11y` → `a11y-tree`
2. Rename `a11y:js` → `a11y-tree:js`
3. Rename `a11y:compare` → `a11y-tree:compare`
4. Rename `bot` → `readability:compare` (behavioral change: always show content)
5. Update CLI help output to show grouped commands
6. Update documentation
7. Add deprecation warnings for old command names (optional)

**Breaking changes:** Command names change

---

## Phase 2: New Readability Utilities

**Scope:** Add `readability` and `readability:js`

**Tasks:**
1. Extract Readability logic from `ai` command into shared module
2. Create `readability` command (static)
3. Create `readability:js` command (JS-rendered)
4. Ensure `readability:compare` (renamed from `bot`) uses shared logic

**Dependencies:** Phase 1 complete

---

## Phase 3: New Schema Utilities

**Scope:** Add `schema:js` and `schema:compare`

**Tasks:**
1. Create `schema:js` command using Playwright
2. Create `schema:compare` command
3. Add comparison logic for structured data diffing

**Dependencies:** None (can run parallel to Phase 2)

---

## Phase 4: New Lenses

**Scope:** Add `reader`, `google`, `social`, `screen-reader` lenses

**Tasks:**
1. Create `reader` lens (see existing backlog item)
2. Create `google` lens (filters schema, adds page metadata)
3. Create `social` lens (filters to OG/Twitter, shows preview)
4. Create `screen-reader` lens (wraps `a11y-tree:js`)

**Dependencies:** Phase 2 (for `reader`), Phase 1 (for `screen-reader`)

---

## Phase 5: TUI Updates

**Scope:** Update TUI to reflect new command organization

**Tasks:**
1. Organize TUI navigation into Lenses and Utilities sections
2. Add new commands to TUI
3. Update any command references

**Dependencies:** Phases 1-4 complete

---

## Phase 6: Documentation and Polish

**Scope:** Complete documentation overhaul

**Tasks:**
1. Update README with new command organization
2. Update all command documentation in `docs/commands/`
3. Add migration guide for users of old command names
4. Update AGENTS.md with new command reference

**Dependencies:** All phases complete

---

# Appendix: Files to Modify

## CLI Entrypoint
- `src/cli.ts` — Add new commands, update help text

## Command Directories to Create
- `src/commands/reader/` — New lens
- `src/commands/google/` — New lens
- `src/commands/social/` — New lens
- `src/commands/screen-reader/` — New lens
- `src/commands/readability/` — New utility (or extend existing)
- `src/commands/schema-js/` — New utility (or add to schema/)
- `src/commands/schema-compare/` — New utility (or add to schema/)

## Command Directories to Rename/Modify
- `src/commands/a11y/` — Rename commands to `a11y-tree`
- `src/commands/bot/` — Rename to `readability:compare` or move logic

## Shared Libraries
- `src/lib/readability.ts` — Extract/create shared Readability logic
- `src/lib/schema-filter.ts` — Create schema filtering for lenses

## Documentation
- `docs/commands/` — Update/add command docs
- `README.md` — Update command reference
- `AGENTS.md` — Update command reference
- `CHANGELOG.md` — Document breaking changes

---

# Notes and Open Questions

1. **Deprecation period:** Should old command names (`bot`, `a11y`) continue to work with deprecation warnings, or be removed immediately?

2. **TUI navigation:** How should the TUI present the lens vs utility distinction? Tabs? Sections?

3. **`google` lens scope:** Should it attempt to show rendered content (like the cached version Google sees) or focus on metadata/schema? Starting with metadata/schema seems more achievable.

4. **`social` lens preview:** Should it attempt to render a visual preview of how the link card would appear, or just show the raw data? Raw data is simpler; visual preview would require additional rendering.

5. **Testing:** Integration tests will need updates for renamed commands. Consider testing both old and new names during transition if deprecation warnings are used.
