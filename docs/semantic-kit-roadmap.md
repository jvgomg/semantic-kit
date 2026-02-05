# semantic-kit: Manifesto & Technical Roadmap

A developer toolkit for understanding how websites are interpreted by search engines, AI crawlers, screen readers, and content extractors.

---

## Vision

Developers should be able to answer these questions from their terminal:

- "Is my markup valid?"
- "How does Google see my website?"
- "How do AI tools like Claude and ChatGPT see my website?"
- "How do screen readers interpret my markup?"
- "How does reader mode extract my content?"

Each question maps to a command. Each command provides observability into a specific consumer's perspective.

---

## Philosophy

### Documentation over implementation

The majority of value comes from **curating and documenting existing tools**, not writing custom code. The ecosystem already has excellent tools — they're just scattered and hard to discover.

semantic-kit succeeds by:

- Mapping complex tool APIs to memorable commands
- Documenting the landscape so developers understand what's possible
- Linking to upstream documentation for advanced usage
- Providing opinionated defaults while exposing underlying power

### Observability over enforcement

The primary goal is **insight**, not pass/fail gatekeeping. Developers should see what consumers see, then decide what to fix.

Some tools naturally provide pass/fail (HTML validation, WCAG checks). When clean state is achieved, regressions become visible. But the first interaction should be exploratory, not punitive.

### Breadth before depth

Build simple integrations across all perspectives before going deep on any one. A developer with surface-level coverage of SEO, AI, accessibility, and reader mode is better served than one with exhaustive SEO tooling and nothing else.

### Local-first, production-capable

Primary use case: testing against local dev servers for rapid feedback. But every command should accept arbitrary URLs for production testing.

---

## Mental Model

The toolkit is organized around **perspectives** — different consumers that interpret the same HTML differently.

| Perspective        | What they see                 | Key tools                                |
| ------------------ | ----------------------------- | ---------------------------------------- |
| **Validator**      | Markup correctness            | html-validate                            |
| **Google**         | Rendered DOM, structured data | Playwright, structured-data-testing-tool |
| **AI Crawlers**    | Static HTML only              | curl, Readability, Postlight Parser      |
| **Screen Readers** | Accessibility tree            | Playwright a11y snapshot, axe-core       |
| **Reader Mode**    | Extracted main content        | Readability                              |

Each perspective combines:

1. **How to fetch** — Static HTML vs rendered DOM
2. **What to extract** — Full content, tree structure, or specific data
3. **What to validate** — Optional checks for issues

---

## Roadmap

### Phase 0: HTML Validation (Foundation)

**Goal:** Validate that markup is well-formed. Establish package ergonomics and documentation patterns.

**Why first:**

- Simplest integration (no browser, no content extraction)
- Table stakes — invalid HTML causes downstream issues
- Tests the documentation approach before more complex phases

**Tool:** [html-validate](https://html-validate.org/)

**Commands:**

```bash
semantic-kit validate:html https://localhost:3000
semantic-kit validate:html ./dist/index.html
```

**Deliverables:**

- [ ] Package scaffold (`packages/semantic-kit`)
- [ ] CLI entrypoint with first command
- [ ] Documentation: what html-validate checks, links to rules, advanced usage
- [ ] ROADMAP.md and CHANGELOG.md

---

### Phase 1: AI Crawler Perspective

**Goal:** Show developers what AI tools (Claude, ChatGPT, Perplexity) see when they crawl a page.

**Why second:**

- No headless browser required (AI crawlers don't execute JavaScript)
- Builds content extraction foundation used by later phases
- High relevance — AI tools are increasingly how content is discovered

**Key insight:** AI crawlers see **static HTML only**. JavaScript-rendered content is invisible to them.

**Tools:**

- Static fetch (curl/fetch)
- [Readability](https://github.com/mozilla/readability) or [Postlight Parser](https://github.com/postlight/parser) for content extraction
- [Turndown](https://github.com/mixmark-io/turndown) for markdown output

**Commands:**

```bash
semantic-kit ai https://localhost:3000
# Output: Extracted content as markdown (what Claude would see)

semantic-kit ai https://localhost:3000 --raw
# Output: Raw static HTML
```

**Deliverables:**

- [ ] Static HTML fetching
- [ ] Readability content extraction
- [ ] Markdown output
- [ ] Documentation: how AI crawlers work, what they ignore, common pitfalls

---

### Phase 2: Google Perspective

**Goal:** Show developers what Google sees after JavaScript execution, plus structured data status.

**Why third:**

- Adds rendered DOM (requires headless browser)
- Builds on Phase 1 — can compare static vs rendered content
- SEO is highest stated priority

**Key insight:** Google renders JavaScript. Content only visible after JS execution is still indexed (with delay).

**Tools:**

- [Playwright](https://playwright.dev/) for rendered DOM
- [structured-data-testing-tool](https://github.com/iaincollins/structured-data-testing-tool) for Schema.org validation

**Commands:**

```bash
semantic-kit google https://localhost:3000
# Output: Rendered content, structured data summary

semantic-kit google https://localhost:3000 --compare
# Output: Diff between static and rendered content (highlights JS-dependent content)

semantic-kit validate:schema https://localhost:3000
# Output: Structured data validation results
```

**Deliverables:**

- [ ] Playwright-based rendered fetch
- [ ] Structured data extraction and validation
- [ ] Static vs rendered comparison
- [ ] Documentation: Google's two-wave indexing, structured data types, common issues

---

### Phase 3: Accessibility Perspective

**Goal:** Show developers how screen readers interpret their markup, including ARIA effectiveness.

**Why fourth:**

- Requires accessibility tree extraction (Playwright)
- Builds on headless browser work from Phase 2
- Answers: "Did my ARIA approach work for strange markup?"

**Tools:**

- [Playwright accessibility snapshot](https://playwright.dev/docs/api/class-accessibility)
- [axe-core](https://github.com/dequelabs/axe-core) or [Pa11y](https://pa11y.org/) for violations
- [Guidepup](https://www.guidepup.dev/) for screen reader simulation (stretch)

**Commands:**

```bash
semantic-kit a11y https://localhost:3000
# Output: Accessibility tree structure

semantic-kit validate:a11y https://localhost:3000
# Output: WCAG violations

semantic-kit a11y https://localhost:3000 --element "#my-component"
# Output: Accessibility tree for specific element
```

**Deliverables:**

- [ ] Accessibility tree snapshot output
- [ ] axe-core or Pa11y integration for violations
- [ ] Element-scoped inspection
- [ ] Documentation: accessibility tree concepts, ARIA interpretation, common patterns

---

### Phase 4: Reader Mode Perspective

**Goal:** Show developers how browser reader modes extract and present content.

**Why fifth:**

- Largely reuses Phase 1 extraction work
- Lower priority than SEO/AI/a11y
- Useful for content-heavy sites

**Tools:**

- [Readability](https://github.com/mozilla/readability) (same as Phase 1)
- `isProbablyReaderable` heuristic

**Commands:**

```bash
semantic-kit reader https://localhost:3000
# Output: Extracted article content, readability assessment

semantic-kit reader https://localhost:3000 --score
# Output: Readability metrics (character count, link density, etc.)
```

**Deliverables:**

- [ ] Readability scoring/metrics
- [ ] isProbablyReaderable check
- [ ] Documentation: how reader mode algorithms work, what triggers availability

---

### Phase 5: Unified View

**Goal:** Single command showing all perspectives, highlighting discrepancies.

**Commands:**

```bash
semantic-kit all https://localhost:3000
# Output: Summary from each perspective, warnings about discrepancies
```

**Example discrepancies to highlight:**

- Content visible to Google but not AI crawlers (JS-dependent)
- Elements with visual meaning but no accessible name
- Main content not extracted by reader mode

---

## Package Structure

```
packages/semantic-kit/
├── README.md                 # Usage overview, command reference
├── ROADMAP.md                # This roadmap, updated as phases complete
├── CHANGELOG.md              # Version history
├── package.json
├── src/
│   ├── cli.ts                # CLI entrypoint
│   └── commands/
│       ├── validate-html.ts
│       ├── ai.ts
│       ├── google.ts
│       ├── a11y.ts
│       └── reader.ts
└── docs/
    ├── html-validation.md    # Tool docs, advanced usage, upstream links
    ├── ai-crawlers.md
    ├── google.md
    ├── accessibility.md
    └── reader-mode.md
```

---

## Documentation Standards

Each integrated tool should have documentation covering:

1. **What it does** — One paragraph explanation
2. **Why it matters** — What problem it solves
3. **Basic usage** — The wrapped command
4. **What the output means** — How to interpret results
5. **Advanced usage** — Direct tool invocation for power users
6. **Upstream links** — Official docs, GitHub, configuration reference

Example structure:

```markdown
# HTML Validation

## What it does

Validates HTML markup against W3C standards and best practices.

## Why it matters

Invalid HTML can cause rendering issues, accessibility problems, and
unpredictable behavior in content extractors.

## Usage

\`\`\`bash
semantic-kit validate:html https://localhost:3000
\`\`\`

## Understanding the output

[Explanation of error types, severity levels]

## Advanced usage

For custom rulesets or CI integration, use html-validate directly:
\`\`\`bash
npx html-validate --config .htmlvalidate.json ./dist/\*_/_.html
\`\`\`

## Links

- [html-validate documentation](https://html-validate.org/)
- [Rule reference](https://html-validate.org/rules/)
- [Configuration](https://html-validate.org/usage/configuration.html)
```

---

## Technical Decisions

### CLI Framework

TBD. Options:

- [Commander.js](https://github.com/tj/commander.js) — Simple, widely used
- [yargs](https://yargs.js.org/) — More features, good for complex CLIs
- [Ink](https://github.com/vadimdemedes/ink) — React for CLIs (already used in apps/cli)

Recommendation: Start with Commander.js for simplicity. Migrate if needs grow.

### Dependency Strategy

- **Wrap, don't fork:** Shell out to external tools where possible
- **Peer dependencies:** Large tools (Playwright) should be peer deps
- **Lazy loading:** Don't load Playwright for HTML validation

### Output Format

- **Default:** Human-readable terminal output (pass through from tools)
- **--json flag:** Machine-readable output for scripting/CI
- **--verbose flag:** Extended output where applicable

---

## Success Criteria

Phase 0 is complete when:

- [ ] A developer can run `semantic-kit validate:html <url>` and see validation results
- [ ] Documentation explains what's being checked and how to learn more
- [ ] ROADMAP.md reflects current state
- [ ] Pattern is established for subsequent phases

The toolkit succeeds when:

- Developers reach for it naturally during development
- It surfaces issues before they reach production
- Documentation is the first place developers look to understand the landscape
