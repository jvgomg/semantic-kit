# Design Decisions

This document records the design decisions made during semantic-kit development. It serves as a reference for understanding why things are built the way they are.

---

## Core Philosophy

### Observability Over Enforcement

The primary goal is **insight**, not pass/fail gatekeeping. Developers should see what consumers see, then decide what to fix.

- Observe commands show data first (`schema`, `structure`, `a11y`)
- Validate commands provide pass/fail checks (`validate:html`, `validate:schema`, `validate:a11y`)
- Warnings bridge the two — observe commands show inline warnings for common issues

### Documentation Over Implementation

The majority of value comes from **curating and documenting existing tools**, not writing custom code. semantic-kit succeeds by:

- Mapping complex tool APIs to memorable commands
- Documenting the landscape so developers understand what's possible
- Providing opinionated defaults while exposing underlying power

### Breadth Before Depth

Build simple integrations across all perspectives before going deep on any one. Coverage across SEO, AI, accessibility, and structure is more valuable than exhaustive tooling in one area.

---

## Command Patterns

### Observe vs Validate

Each perspective follows a consistent pattern:

```
Perspective          Observe              Validate
─────────────────    ─────────────────    ─────────────────
HTML                 fetch                validate:html
Structured Data      schema               validate:schema
Structure            structure            (warnings inline)
Accessibility        a11y                 validate:a11y
```

**Why no `validate:structure`?**

Structural issues are accessibility issues. Rather than create a separate validation command, structural warnings are:

1. Added to `structure` command (after Phase 4)
2. Covered by `validate:a11y` which includes structural checks

### Static vs Rendered

Commands that analyze page content support both modes:

| Static (no JS) | Rendered (with JS) | Notes              |
| -------------- | ------------------ | ------------------ |
| `ai`           | `bot`              | Content extraction |
| `structure`    | `structure:js`     | Page structure     |
| `a11y`         | `a11y:js`          | Accessibility      |

**Naming decision:** We use `:js` suffix rather than `--rendered` flag because:

- Clear distinction in command name
- Different commands can have different defaults
- Easier to document and discover

**Default is static** because:

- Faster (no browser spin-up)
- Works on local files
- No Playwright dependency for basic usage
- Shows what AI crawlers see (valuable baseline)

---

## Command-Specific Decisions

### `bot` Command

**Original name:** `google`

**Why renamed:** The original `google` command used Playwright to render pages, suggesting it showed "what Google sees." However, it only showed content extraction (via Readability) from the rendered DOM — not the full picture Google indexes.

**New name rationale:** `bot` is neutral and accurate. It renders the page like a bot would, then compares static vs rendered content.

**Future `google` command:** Will be a composed "lens" that bundles output from multiple commands (`schema`, `bot`, `structure`) to give a more complete picture of Google's perspective.

### `structure` Command

**Purpose:** Show semantic structure — landmarks, headings, and links.

**Views:**

- **Compact (default):** Summary line for each category
- **Expanded (`--expanded`):** Full hierarchy with nesting

**No warnings initially:** Ship observability first. After building `validate:a11y`, we'll know which structural warnings matter and add them.

**Research note:** Investigate libraries for static HTML structure/accessibility analysis. For rendered mode, Playwright's `page.accessibility.snapshot()` provides the accessibility tree.

### `a11y` Command

**Purpose:** Show what screen readers see — the accessibility perspective.

**Difference from `structure`:**

| `structure`    | `a11y`                 |
| -------------- | ---------------------- |
| HTML landmarks | Computed ARIA roles    |
| Heading text   | Accessible names       |
| Link counts    | Link text, focus order |
| —              | ARIA attributes        |
| —              | Form labels            |
| —              | Image alt text         |

**`a11y:js` implementation:** Uses Playwright's accessibility snapshot, which reflects the actual accessibility tree browsers expose to assistive technology.

### `validate:a11y` Command

**Scope:** WCAG validation covering both accessibility AND structural issues.

**Tool choice:** Likely axe-core (industry standard).

**Requires Playwright:** Many accessibility issues depend on computed styles (color contrast) and the accessibility tree, which require a browser context.

### `google` Command (Future)

**Purpose:** Composed "lens" bundling relevant data from other commands.

**Sources:**

- Structured data summary (from `schema`)
- Static vs rendered comparison (from `bot`)
- Structure summary (from `structure`)

**No new analysis:** This command orchestrates existing commands rather than implementing new logic.

### Reader Mode (Deprecated)

**Decision:** Removed from roadmap.

**Rationale:** The `bot --content` command already shows extracted content using Readability. Reader mode metrics (isProbablyReaderable, text density) don't add enough unique value to justify a separate command.

---

## Dependency Strategy

### Optional Peer Dependencies

Large dependencies (Playwright) are optional peer dependencies:

```json
{
  "peerDependencies": {
    "playwright": "^1.40.0"
  },
  "peerDependenciesMeta": {
    "playwright": {
      "optional": true
    }
  }
}
```

Commands that require Playwright show helpful installation instructions when it's not available.

### Lazy Loading

Playwright is dynamically imported only when needed:

```typescript
async function getPlaywright() {
  try {
    const playwright = await import('playwright')
    return playwright.chromium
  } catch {
    return null
  }
}
```

This keeps the package lightweight for users who only need static analysis.

### Shared Utilities

Common functions extracted to `src/lib/`:

- `fetchHtmlContent()` — fetch from URL or read from file
- `createTurndownService()` — Turndown configuration
- `countWords()` — word counting

Commands import from lib rather than duplicating logic.

---

## Output Format

### Terminal Output

Consistent box-drawing style across commands:

```
┌─────────────────────────────────────────────────────────────
│ Command Name
│ https://example.com
├─────────────────────────────────────────────────────────────
│ Data: values
│ More: data
└─────────────────────────────────────────────────────────────
```

### JSON Output

All commands support `--json` for machine-readable output. JSON structure matches the internal data model.

### Warnings

Inline warnings use consistent formatting:

- `⚠` for warnings
- `✗` for errors/missing required items
- Shown within the relevant section, not as a separate block

---

## Rendering Strategy (for `bot`, `structure:js`, `a11y:js`)

### Wait Strategy

Uses Playwright's `networkidle` — waiting until no network requests for 500ms. This approximates Google's "event loop empty" strategy.

### Default Timeout

5 seconds (5000ms). Based on research showing this is the median render time for most pages.

### Partial Content

If timeout is reached, commands show whatever content was loaded (like Google does). A warning indicates the timeout.

### Research Sources

- Google's John Mueller: "No fixed timeout for JavaScript rendering"
- Martin Splitt (Chrome Dev Summit 2019): Rendering stops "when the event loop is empty"
- Median rendering delay: ~5 seconds
- Hard timeout: ~3 minutes (but too long for CLI)

---

## Future Considerations

### Phase 6: Monitoring & Configuration

The end-goal is production-ready monitoring:

- `.semantickitrc` or `semantic-kit.config.js` configuration
- `--snapshot` / `--accept` workflow for baseline management
- Diff output showing what changed between runs
- CI integration with exit codes

See [Error Configuration](./feature-ideas/error-configuration.md) for detailed design exploration.

### Static Accessibility Analysis

**Research needed:** Is there a library for analyzing accessibility from static HTML (without a browser)? This would improve `a11y` command performance and enable local file analysis.

Known limitations of static analysis:

- No computed styles (can't check color contrast)
- No accessibility tree (can't verify ARIA effectiveness)
- Limited form label association detection

For comprehensive analysis, browser-based tools (axe-core in Playwright) are likely necessary.
