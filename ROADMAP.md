# Roadmap

Current status and planned development for semantic-kit.

For the full vision and philosophy, see the [manifesto](../../research/semantic-markup/semantic-kit-roadmap.md).

For detailed design decisions, see [Design Decisions](./docs/design-decisions.md).

---

## Status

### Phase 0: Foundation ✅

Foundation phase establishing package ergonomics and documentation patterns.

| Feature                           | Status  | Command                     |
| --------------------------------- | ------- | --------------------------- |
| HTML validation via html-validate | ✅ Done | `validate:html <url\|file>` |
| Fetch and prettify HTML           | ✅ Done | `fetch <url>`               |
| Syntax highlighting in terminal   | ✅ Done |                             |
| File validation                   | ✅ Done |                             |
| Documentation                     | ✅ Done |                             |

---

### Phase 1: AI Crawler Perspective ✅

Show developers what AI tools (Claude, ChatGPT, Perplexity) see.

| Feature                          | Status  | Command       |
| -------------------------------- | ------- | ------------- |
| Static HTML fetching             | ✅ Done | `fetch <url>` |
| Content extraction (Readability) | ✅ Done | `ai <url>`    |
| Markdown output                  | ✅ Done | `ai <url>`    |
| `ai` command                     | ✅ Done | `ai <url>`    |

See [AI Crawlers documentation](./docs/ai-crawlers.md) for details.

---

### Phase 2: Structured Data & Rendered Comparison ✅

Structured data inspection and static vs rendered content comparison.

| Feature                       | Status  | Command                       |
| ----------------------------- | ------- | ----------------------------- |
| Structured data inspection    | ✅ Done | `schema <url\|file>`          |
| Structured data validation    | ✅ Done | `validate:schema <url\|file>` |
| Rendered DOM (Playwright)     | ✅ Done | `bot <url>`                   |
| Static vs rendered comparison | ✅ Done | `bot <url>`                   |

See [Bot documentation](./docs/bot.md) and [Structured Data documentation](./docs/structured-data.md) for details.

---

### Phase 3: Page Structure ✅

Show developers the semantic structure of their pages.

| Feature                       | Status  | Command                     |
| ----------------------------- | ------- | --------------------------- |
| Landmarks and ARIA roles      | ✅ Done | `structure <url\|file>`     |
| Heading hierarchy             | ✅ Done | `structure <url\|file>`     |
| Internal/external links       | ✅ Done | `structure <url\|file>`     |
| Skip link detection           | ✅ Done | `structure <url\|file>`     |
| Title and language            | ✅ Done | `structure <url\|file>`     |
| Rendered DOM analysis         | ✅ Done | `structure:js <url>`        |
| Static vs rendered comparison | ✅ Done | `structure:compare <url>`   |
| Compact and expanded views    | ✅ Done | `--compact` flag            |
| axe-core violations           | ✅ Done | `structure`, `structure:js` |

Accessibility validation (missing landmarks, duplicates, etc.) is handled by [`validate:a11y`](./docs/validate-a11y.md) using axe-core.

See [Structure documentation](./docs/structure.md) for details.

---

### Phase 4: Accessibility ✅

Show developers how screen readers interpret markup and validate WCAG compliance.

| Feature                       | Status  | Command               |
| ----------------------------- | ------- | --------------------- |
| Accessibility tree (static)   | ✅ Done | `a11y <url>`          |
| Accessibility tree (hydrated) | ✅ Done | `a11y:js <url>`       |
| Static vs hydrated comparison | ✅ Done | `a11y:compare <url>`  |
| Browser-based ARIA snapshot   | ✅ Done | All `a11y` commands   |
| WCAG validation               | ✅ Done | `validate:a11y <url>` |

All accessibility commands use Playwright's ARIA snapshot for accurate results. WCAG validation uses axe-core for comprehensive accessibility checks.

See [Accessibility Validation documentation](./docs/validate-a11y.md) for details.

---

### Phase 5: Google Lens 🔜

Composed view showing what Google sees by bundling relevant data from other commands.

| Feature                                  | Status     | Command        |
| ---------------------------------------- | ---------- | -------------- |
| Composed view (schema + bot + structure) | 🔜 Planned | `google <url>` |
| Structured data summary                  | 🔜 Planned |                |
| Static vs rendered summary               | 🔜 Planned |                |
| Structure summary                        | 🔜 Planned |                |

---

### Phase 6: Monitoring & Configuration 🔜

Production-ready features for CI integration and ongoing monitoring.

| Feature                    | Status     | Command                  |
| -------------------------- | ---------- | ------------------------ |
| Project configuration file | 🔜 Planned |                          |
| Snapshot workflow          | 🔜 Planned | `--snapshot`, `--accept` |
| Baseline comparisons       | 🔜 Planned |                          |
| Diff output                | 🔜 Planned |                          |

See [Error Configuration](./docs/feature-ideas/error-configuration.md) for design exploration.

---

## Command Patterns

### Observe vs Validate

Each perspective follows a consistent pattern:

| Perspective     | Observe     | Validate          |
| --------------- | ----------- | ----------------- |
| HTML            | `fetch`     | `validate:html`   |
| Structured Data | `schema`    | `validate:schema` |
| Structure       | `structure` | `validate:a11y`   |
| Accessibility   | `a11y`      | `validate:a11y`   |

### Static vs Rendered

Commands that analyze page content support both static HTML and rendered DOM:

| Static (no JS) | Rendered (with JS) | Comparison          |
| -------------- | ------------------ | ------------------- |
| `ai`           | `bot`              | (built into `bot`)  |
| `structure`    | `structure:js`     | `structure:compare` |
| `a11y` ✅      | `a11y:js` ✅       | `a11y:compare` ✅   |

Static commands work on URLs and local files. Rendered and comparison commands require Playwright and only work on URLs.

---

## Contributing

When adding a new tool integration:

1. Create command in `src/commands/`
2. Add to CLI in `src/cli.ts`
3. Write documentation in `docs/`
4. Update this ROADMAP
5. Add entry to CHANGELOG
