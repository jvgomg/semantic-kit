# Changelog

All notable changes to semantic-kit will be documented in this file.

## Unreleased

### Added

- **Command API Restructure** — Commands organized into Lenses and Utilities
  - **Lenses** show how a specific consumer "sees" your page (ai, reader, google, social, screen-reader)
  - **Utilities** are task-oriented tools with `:js` and `:compare` variants
  - CLI help output now shows grouped commands

- **New Lenses**
  - `reader` — Show how browser reader modes see your page (Safari Reader, Pocket)
  - `google` — Show how Googlebot sees your page (metadata, Google-recognized schema, headings)
  - `social` — Show how social platforms see your page for link previews (Open Graph, Twitter Cards)
  - `screen-reader` — Show how screen readers interpret your page (accessibility tree)

- **New Utilities**
  - `readability` — Raw Readability extraction with full metrics (link density, etc.)
  - `readability:js` — Readability extraction after JavaScript rendering
  - `schema:js` — View structured data after JavaScript rendering
  - `schema:compare` — Compare static vs JS-rendered structured data

### Changed

- **BREAKING**: `a11y` commands renamed to `a11y-tree`
  - `a11y` -> `a11y-tree`
  - `a11y:js` -> `a11y-tree:js`
  - `a11y:compare` -> `a11y-tree:compare`

- **BREAKING**: `bot` command renamed to `readability:compare`
  - Same functionality, better naming consistency

### Removed

- Deprecated command aliases (old names no longer work)

---

## [0.0.17] - 2026-02-12

### Changed

- **BREAKING**: `social` command result type restructured
  - Removed: `completeness`, `isComplete`, `missingRequired`, `missingRecommended`, `missingImageTags`
  - Added: `issues` array with tiered validation (`error`, `warning`, `info`)

### Added

- **Tiered validation for social metadata** in the `social` command
  - Error: `og:url` not absolute (must include protocol)
  - Warning: `og:title` > 60 chars, `og:description` > 155 chars, missing image dimensions
  - Info: Missing `twitter:card`, missing image alt text
  - Research: [[open-graph-validation]], research-v0.6.0

- **Platform-accurate preview fallbacks** matching Facebook, Twitter, WhatsApp behavior
  - Title: `twitter:title` → `og:title` → `<title>`
  - Description: `twitter:description` → `og:description` → `<meta name="description">`
  - Image: `twitter:image` → `og:image` → null
  - Research: [[open-graph-validation]], research-v0.6.0

### Internal

- New modules: `src/commands/social/validation.ts`, `src/commands/social/preview.ts`
- Unit tests for validation rules and fallback behavior
- Test fixtures for validation scenarios

---

## [0.0.16] - 2026-01-30

### Internal

- **Example HTML fixtures** for demonstrating `structure` and `validate:a11y` commands
  - Good examples: semantic-article.html, accessible-form.html, navigation-landmarks.html
  - Bad examples: div-soup.html, heading-chaos.html, form-no-labels.html, button-anti-patterns.html
  - Edge cases: nested-landmarks.html, multiple-mains.html
  - Based on research from [[example-markup-sources]] (research-v0.4.0)

---

## [0.0.16] - 2026-01-30

### Added

- **Explicit result types for all commands** - Foundation for programmatic usage and future TUI support
  - New `src/lib/results.ts` with typed interfaces for all 12 command outputs
  - Types exported from package: `A11yResult`, `A11yCompareResult`, `StructureResult`, `StructureJsResult`, `BotResult`, `AiResult`, `SchemaResult`, `ValidateHtmlResult`, `ValidateSchemaResult`, `ValidateA11yResult`, and more
  - All commands now build typed result objects before JSON serialization
  - Re-exports commonly used lib types: `StructureAnalysis`, `StructureComparison`, `AriaNode`, `SnapshotDiff`

### Fixed

- **axe-core import compatibility** with Node.js v24
  - Changed from named ESM import to default import with destructuring
  - Fixes `SyntaxError: Named export 'run' not found` error

### Internal

- Commands refactored to follow consistent pattern: build result, then format
- Types wrap existing lib types rather than duplicating them

---

## [0.0.15] - 2025-12-03

### Changed

- **BREAKING**: `ai`, `bot`, and `schema` commands now use `--format` flag instead of `--json`
  - `ai`: `--format full|compact|json` (default: full)
  - `bot`: `--format full|compact|json` (default: full)
  - `schema`: `--format full|compact|json` (default: full)
- **BREAKING**: `validate:schema` renamed `--require` to `--presets`
  - Old: `--require google,twitter`
  - New: `--presets google,twitter`
  - Better describes the flag's purpose (specifies validation presets)

### Added

- Compact format for `ai` command
  - Shows title, word count, hidden content summary, and extraction status
- Compact format for `bot` command
  - Shows word count comparison summary with JS dependency percentage
- Compact format for `schema` command
  - Shows schema types and metatag completion status
- Centralized validation utilities in `src/lib/validation.ts`
  - `validateFormat()` - validates and returns format option
  - `validateTimeout()` - validates and parses timeout option
  - `requireUrl()` - validates that target is a URL
  - `isUrl()` - checks if target is a URL

### Removed

- `--json` flag from `ai`, `bot`, and `schema` commands (use `--format json`)
- `--require` flag from `validate:schema` (use `--presets`)

---

## [0.0.14] - 2025-12-02

### Changed

- **BREAKING**: All validate commands now use consistent `--format` flag
  - `validate:html`: `--format full|brief|compact|json` (default: full)
    - `full` = codeframe (shows code context)
    - `brief` = text (minimal one-line per error)
    - `compact` = stylish (grouped errors)
    - `json` = machine-readable JSON
  - `validate:schema`: `--format full|compact|json` (default: full)
  - `validate:a11y`: `--format full|compact|json` (default: full)
- **BREAKING**: `validate:a11y` incomplete checks now cause error exit by default
  - Incomplete checks are always displayed (previously required `--full`)
  - Use `--ignore-incomplete` to allow incomplete without error exit

### Added

- `--ignore-incomplete` flag for `validate:a11y`
  - Allows incomplete checks without causing error exit
  - Incomplete checks still displayed with count message

### Removed

- `validate:html`: `-v, --verbose` and `--formatter` flags (use `--format`)
- `validate:schema`: `--json` flag (use `--format json`)
- `validate:a11y`: `--json` and `--full` flags (use `--format json`)

---

## [0.0.13] - 2025-12-02

### Changed

- **BREAKING**: `a11y`, `a11y:js`, and `a11y:compare` commands now use `--format` flag
  - `a11y` and `a11y:js`: `--format full` (default) or `--format json`
  - `a11y:compare`: `--format full` (default), `--format compact`, or `--format json`
- Invalid `--format` values now throw a clear error with valid options listed

### Removed

- `--json` flag from `a11y` and `a11y:js` (use `--format json`)
- `--compact` and `--json` flags from `a11y:compare` (use `--format compact` or `--format json`)

---

## [0.0.12] - 2025-12-02

### Changed

- **BREAKING**: Consolidated `--compact`, `--full`, and `--json` flags into single `--format` flag
  - `--format full` (default): Expanded view with all items, no truncation
  - `--format brief`: Expanded view with truncated lists (top 5)
  - `--format compact`: One-line summary per section
  - `--format json`: Machine-readable JSON output
  - Applies to `structure`, `structure:js`, and `structure:compare` commands
- **Default changed**: Full output (no truncation) is now the default; truncation is opt-in via `--format brief`
- Invalid `--format` values now throw a clear error with valid options listed

### Removed

- `--compact` flag (use `--format compact`)
- `--full` flag (now the default behavior)
- `--json` flag (use `--format json`)

---

## [0.0.11] - 2025-12-02

### Added

- **Comprehensive JSDOM-safe rule list**: Empirically tested all 104 axe-core 4.11 rules to determine which work reliably in JSDOM without returning "incomplete" results
  - 68 rules confirmed to work reliably (`JSDOM_SAFE_RULES`)
  - 15 rules identified as unsafe (`JSDOM_UNSAFE_RULES`) - return incomplete or require browser rendering
  - Rule lists are exported for programmatic use
- **`--all-rules` flag** for `structure` and `structure:js` commands
  - Runs all 68 JSDOM-safe accessibility rules instead of just 14 structure rules
  - Provides comprehensive accessibility checking without a browser
- **Expanded `STRUCTURE_RULES`** from 7 to 14 rules:
  - Added: `landmark-no-duplicate-banner`, `landmark-no-duplicate-contentinfo`, `landmark-banner-is-top-level`, `landmark-main-is-top-level`, `landmark-contentinfo-is-top-level`, `landmark-complementary-is-top-level`, `region`
- **New utility functions**:
  - `getJsdomSafeRuleIds()` - get list of all JSDOM-safe rules
  - `getJsdomUnsafeRuleIds()` - get list of rules that don't work in JSDOM
  - `isRuleSafeForJsdom(ruleId)` - check if a specific rule is safe
- **Test suite** using vitest to verify JSDOM rule compatibility
  - Tests run against comprehensive HTML to verify no incomplete results
  - Catches regressions if axe-core updates change rule behavior
  - Tests verify STRUCTURE_RULES is a subset of JSDOM_SAFE_RULES

### Changed

- `runAxeOnStaticHtml()` now accepts `ruleSet` option: `'structure'` (default) or `'all'`
- Unsafe rules are now explicitly disabled rather than relying on color category filtering
- Documentation updated with accessibility rules section explaining available rules

### Dependencies

- Added vitest for testing

### Internal

- Rule configuration refactored with clear categorization and documentation

---

## [0.0.10] - 2025-12-01

### Added

- axe-core violations for `structure` and `structure:js` commands
  - Powered by Deque's axe-core accessibility engine (same as `validate:a11y`)
  - Runs axe-core rules via jsdom for static HTML analysis (no browser required)
  - Rules enabled: `document-title`, `html-has-lang`, `html-lang-valid`, `bypass`, `landmark-no-duplicate-main`, `heading-order`, `empty-heading`
  - Shows "Violations" section in expanded view with axe-core messages
  - Shows violation count summary in compact view
  - Included in JSON output as `warnings` array with `id`, `severity`, `message`, `details`
- Severity mapping: axe-core `critical`/`serious` → `error`, `moderate`/`minor` → `warning`
- New `runAxeOnStaticHtml()` function exported for programmatic use

### Changed

- Removed custom landmark expectation warnings from `structure` command
  - No longer shows "missing" or "should be 1, found N" warnings
  - Landmark skeleton now shows only factual counts
  - Use `validate:a11y` for accessibility validation (missing landmarks, duplicates, etc.)
- Removed "Inconclusive" section from output
  - axe-core rules that can't run in jsdom are excluded from STRUCTURE_RULES
  - Command errors if any test returns inconclusive (defensive check)
- `LandmarkSkeleton` type simplified: removed `expected` and `warning` fields

### Fixed

- Fixed `<header>` and `<footer>` inside `<main>` incorrectly counted as banner/contentinfo landmarks
  - Added `main` to `SECTIONING_ELEMENTS` per ARIA spec

### Dependencies

- Added jsdom for running axe-core without a browser
- Added axe-core as direct dependency (was transitive via @axe-core/playwright)

---

## [0.0.9] - 2025-11-30

### Added

- `validate:a11y` command for WCAG accessibility validation (Phase 4 complete)
  - Uses axe-core for comprehensive accessibility checks
  - Validates against WCAG 2.0, 2.1, and 2.2 standards
  - `--level <level>` flag to specify WCAG level (A, AA, AAA; default: AA)
  - `--timeout <ms>` flag for custom page load timeout (default: 5000ms)
  - `--json` flag for machine-readable output
  - Violations grouped by severity (critical, serious, moderate, minor)
  - Shows affected elements with fix suggestions
  - Exit code 1 when violations found for CI integration
  - Requires Playwright for browser-based rendering
- Accessibility validation documentation with common violations and fixes

### Dependencies

- Added @axe-core/playwright for WCAG accessibility validation

---

## [0.0.8] - 2025-11-30

### Added

- `structure` command for analyzing page semantic structure (Phase 3)
  - Landmarks: HTML5 elements (header, nav, main, article, section, aside, footer)
  - ARIA landmark roles (banner, navigation, main, complementary, contentinfo, search, form, region)
  - Landmark skeleton showing all possible roles with counts
  - Elements section with raw HTML element counts
  - Outline section showing nested landmark structure
  - Heading hierarchy with nested outline view and content stats (word count, paragraphs, lists)
  - Internal vs external link classification with counts and link details
  - Link text and attributes (target="\_blank", noopener, noreferrer)
  - Skip link detection
  - Page title and language attribute
  - `--compact` flag for summary view (expanded is default)
  - `--json` flag for machine-readable output
  - `--full` flag to show all items without truncation
  - Local file support
- `structure:js` command for rendered DOM analysis
  - Requires Playwright (same as `bot` command)
  - Compares static vs rendered structure
  - Shows differences in landmark, heading, and link counts
  - `--timeout <ms>` flag for custom JavaScript timeout (default: 5000ms)
- `structure:compare` command for focused difference reporting
  - Shows only structural differences between static and rendered
  - Summary counts with change indicators (+/-)
  - Detailed landmark, heading, and link changes
  - Metadata changes (title, language)
  - `--compact` flag for summary only
  - `--json` flag for machine-readable output
  - `--full` flag to show all items without truncation
  - `--timeout <ms>` flag for custom JavaScript timeout
- Structure documentation with common problems and solutions

### Internal

- Added `src/lib/structure.ts` with reusable extraction functions
  - `analyzeStructure()` - complete page analysis
  - `compareStructures()` - detailed comparison between two analyses
  - Individual extractors: `extractLandmarks()`, `extractHeadings()`, `extractLinks()`, `extractSkipLinks()`, `extractTitle()`, `extractLanguage()`
- Added `src/lib/playwright.ts` with shared Playwright utilities
  - `fetchRenderedHtml()` - render page and return HTML
  - `PlaywrightNotInstalledError` - typed error with install instructions
- Added `src/lib/formatting.ts` with shared formatting utilities
  - Extracted 9 formatting functions from command files to reduce duplication
  - `formatLandmarkSkeletonCompact()`, `formatLandmarkSkeleton()`, `formatElements()`, `formatOutline()`
  - `formatLinkBadges()`, `formatLinkGroups()`
  - `formatHeadingsSummary()`, `formatContentStats()`, `formatHeadingTree()`
- `structure:js` now uses shared `compareStructures()` from lib
  - JSON output includes full comparison details (metadata, landmarks, headings, links diffs)
  - Comparison is now more sensitive (any link difference reported, previously tolerated ±5)

---

## [0.0.7] - 2024-11-30

### Added

- `bot` command for comparing static HTML vs JavaScript-rendered content
  - Renders pages using Playwright with headless Chromium
  - Shows comparison by default: word counts (static, rendered, JS-dependent)
  - Lists sections only visible after JavaScript execution
  - `--content` flag to optionally show extracted markdown
  - `--timeout <ms>` flag for custom JavaScript timeout (default: 5000ms)
  - `--json` flag for machine-readable output
  - Graceful timeout handling with partial content
  - Clear error message when Playwright is not installed
- Bot documentation explaining the comparison approach

### Changed

- Extracted shared utilities to `src/lib/`:
  - `fetchHtmlContent()` - fetch from URL or read from file
  - `createTurndownService()` - Turndown configuration
  - `countWords()` - word counting utility
- `ai` command now uses shared utilities (no functional change)

### Dependencies

- Added playwright as optional peer dependency (required for `bot` command)

---

## [0.0.6] - 2024-11-29

### Added

- `schema` command now shows missing fields inline with existing tags
  - Required fields: `✗ missing (required)`
  - Recommended fields: `⚠ missing (recommended)`
- `validate:schema` auto-detects Open Graph and Twitter Cards
  - No need for `--require` flag for basic validation
  - Automatically validates detected metatag standards

### Changed

- `validate:schema` header now shows detected standards
  - `Schemas: Article` for JSON-LD
  - `Metatags: Open Graph, Twitter Cards` for detected metatags
- `--require` flag now controls exit code behavior:
  - Only required standards affect exit code
  - Other detected issues shown as informational
- Both commands now use consistent field detection (required + recommended)

---

## [0.0.5] - 2024-11-29

### Added

- `schema` command for inspection-first structured data viewing
  - Shows all JSON-LD, Microdata, RDFa with actual values
  - Auto-detects incomplete Open Graph and Twitter Cards
  - Shows missing required fields in context
  - `--json` flag for machine-readable output
  - Follows semantic-kit philosophy: "observability over enforcement"

### Changed

- `validate:schema` now uses `--require` instead of `--presets`
- Standards are now lowercase/kebab-case: `google`, `twitter`, `facebook`, `social-media`
- Unknown standards now error instead of warning

### Dependencies

- Added web-auto-extractor for structured data extraction

---

## [0.0.4] - 2024-11-29

### Added

- `validate:schema` command for structured data validation
  - Validates JSON-LD, Microdata, and RDFa in static HTML
  - Platform standards: google, twitter, facebook, social-media
  - `--require <standards>` flag for platform validation
  - `--json` flag for machine-readable output
  - Local file support
  - Detailed test results with pass/fail/warning counts
- Structured data documentation with common schema examples

### Dependencies

- Added structured-data-testing-tool for schema validation

---

## [0.0.3] - 2024-11-29

### Added

- `ai` command for showing how AI crawlers see your page
  - Content extraction via Mozilla Readability
  - Markdown conversion via Turndown
  - Metadata display (title, author, excerpt, word count)
  - `--raw` flag to show static HTML
  - `--json` flag for machine-readable output
  - Local file support
  - Warnings for JavaScript-heavy or non-article pages
  - Hidden content detection with ratio calculation (visible vs hidden word counts)
  - Framework-specific detection (Next.js streaming SSR)
  - Generic hidden content detection for other frameworks
  - Severity-based warnings (low: 10-49% hidden, high: ≥50% hidden)
  - Extensible framework detector architecture for future additions
- AI crawlers documentation with approach rationale and limitations

### Dependencies

- Added @mozilla/readability for content extraction
- Added linkedom for fast DOM parsing
- Added turndown for HTML to markdown conversion

## [0.0.2] - 2024-11-29

### Added

- `fetch` command for fetching and prettifying HTML
  - Syntax highlighting in terminal via emphasize
  - Prettification via prettier (with fallback for malformed HTML)
  - `-o, --out <path>` option to save to file
  - `--stream` flag to show in terminal when saving to file
- `validate:html` formatter options
  - `-v, --verbose` flag to show code context (codeframe formatter)
  - `--formatter <name>` option to choose stylish, codeframe, or text
- AGENTS.md with contribution guidelines

## [0.0.1] - 2024-11-29

### Added

- Initial package scaffold
- `validate:html` command for HTML validation via html-validate
  - URL fetching and validation
  - Local file validation
  - Stylish output formatting
- Documentation
  - README with usage overview
  - HTML validation guide with common issues and advanced usage
  - ROADMAP tracking implementation status
