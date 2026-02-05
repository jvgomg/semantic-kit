# Research Guide

How to contribute to the semantic-kit research documentation.

---

## What This Documentation Covers

This research documents how web content is interpreted by different consumers:

- **Search engines** - Google, Bing, and how they crawl, render, and index pages
- **AI crawlers** - GPTBot, ClaudeBot, PerplexityBot and their content extraction
- **Reader modes** - Firefox Reader View, Safari Reader, and content extraction algorithms
- **Screen readers** - How assistive technologies interpret markup
- **Content extraction tools** - Firecrawl, Jina Reader, and similar services

The goal is to help developers understand what these systems see and how to optimize for them.

---

## Directory Structure

```
research/
  entities/                    # Company/product-specific research
    _index.md                  # Entities overview
    google/
      _index.md                # Overview of Google's ecosystem
      googlebot.md             # Crawler identification and verification
      google-javascript-rendering.md  # WRS and JS handling
      google-structured-data.md       # Rich results, JSON-LD
    anthropic/
      _index.md                # ClaudeBot crawler
    openai/
      _index.md                # GPTBot crawler
    perplexity/
      _index.md                # PerplexityBot crawler
    apple/
      _index.md                # Safari Reader Mode

  topics/                      # Cross-cutting technical topics
    _index.md                  # Topics overview
    content-extraction/
      _index.md
      readability.md           # The algorithm concept
      mozilla-readability.md   # Mozilla's implementation
      reader-mode.md           # Browser reader modes
      postlight-parser.md
      jina-reader.md
      firecrawl.md
      turndown.md
      ai-crawler-behavior.md
      streaming-ssr.md
    structured-data/
      _index.md
      schema-org.md            # Schema.org vocabulary
    semantic-html/
      _index.md
      landmarks.md
      document-outline.md
      semantic-elements.md
    accessibility/
      _index.md
      accessibility-tree.md
      axe-core.md
      pa11y.md
      lighthouse-accessibility.md
      ibm-accessibility-checker.md
      guidepup.md
      violation-detection-tools.md
    markup-validation/
      _index.md

  _meta/                       # Documentation about documentation
    AGENT_DIRECTIVES.md        # Instructions for AI agents
    RESEARCH_GUIDE.md          # This file
    SEARCH_STRATEGIES.md       # Sources and queries by topic
    VERIFICATION_LOG.md        # Record of verification runs

  CHANGELOG.md                 # Research version history
```

---

## Page Types

### Entity Overview (`_index.md`)

Provides an overview of a company's ecosystem and links to specific topics.

```markdown
---
title: "Google"
lastVerified: 2024-01-15
lastUpdated: 2024-01-15
---

# Google

Overview of how Google crawls, renders, and indexes web content.

## Crawling & Indexing

Google uses Googlebot to crawl the web. See [[googlebot]] for crawler behavior
and [[google-javascript-rendering]] for how JavaScript content is handled.

## Structured Data

Google supports JSON-LD, Microdata, and RDFa for rich results.
See [[google-structured-data]] for requirements and validation.

## Related Topics

- [[readability]] - Content extraction (Google doesn't use this, but it's relevant context)
- [[semantic-html]] - How HTML structure affects indexing
```

### Entity Detail Page

Deep dive on a specific aspect of an entity.

### Topic Overview (`_index.md`)

Introduces a cross-cutting concept and links to specifics.

### Topic Detail Page

Detailed documentation on a specific technology or approach.

---

## Writing Style

### Be Specific and Factual

Bad: "Google likes semantic HTML"
Good: "Google uses semantic HTML elements like `<main>`, `<article>`, and heading hierarchy to understand content structure [^google-seo-starter]"

### Explain Why It Matters

Don't just document what - explain the implications for developers.

### Use Wikilinks Liberally

Connect related concepts: "The [[readability]] algorithm, used by [[reader-mode]] and [[jina-reader]], identifies main content by..."

### Keep Pages Focused

One concept per page. If a page grows too large, split it.

---

## Frontmatter

Every research page has frontmatter with required and optional fields:

```yaml
---
title: "Human-Readable Title"
lastVerified: 2024-01-15    # When claims were last verified against sources
lastUpdated: 2024-01-15     # When content was last modified

# Optional: Tool coverage (add when findings are implemented in semantic-kit)
toolCoverage:
  - finding: "Next.js streaming detection"
    command: ai
    since: v0.0.3
  - finding: "Remix streaming detection"
    command: ai
    since: v0.0.17
---
```

### Required Fields

- `title` - Human-readable page title
- `lastVerified` - Update when you check sources are still valid
- `lastUpdated` - Update when you change content

### Optional Fields

- `toolCoverage` - Array of findings implemented in the tool (see [Tool Coverage](#tool-coverage))

---

## Citations

### When to Cite

- Specific factual claims
- Statistics or metrics
- Quotes or paraphrases
- Anything non-obvious

### Citation Format

Use footnote-style references:

```markdown
AI crawlers do not execute JavaScript and only see static HTML [^salt-ai-crawlers].

## References

[^salt-ai-crawlers]:
  - **Source**: Salt Agency
  - **Title**: "Making JavaScript websites AI and LLM crawler friendly"
  - **URL**: https://salt.agency/blog/ai-crawlers-javascript/
  - **Published**: 2024-02-10
  - **Accessed**: 2024-03-15
  - **Supports**: Claim that AI crawlers don't execute JavaScript
```

### Citation Fields

| Field | Required | Description |
|-------|----------|-------------|
| Source | Yes | Organization or publication name |
| Title | Yes | Article or document title |
| URL | Yes | Direct link to the source |
| Author | If known | Article author (helpful for attribution) |
| Published | If known | When the source was published |
| Accessed | Yes | When you last verified the source |
| Supports | Yes | What claim this citation supports |

---

## Wikilinks

### Basic Usage

```markdown
See [[readability]] for details on the algorithm.
```

### With Display Text

```markdown
Mozilla's [[mozilla-readability|Readability library]] powers Firefox Reader View.
```

### Conventions

- Use lowercase, hyphenated names: `[[mozilla-readability]]` not `[[Mozilla Readability]]`
- Keep names unique across all research pages
- Flat namespace - no paths in wikilinks

---

## Creating New Pages

### When to Create vs Extend

**Create a new page when:**
- The topic is distinct enough to stand alone (e.g., "Safari Reader" vs "Firefox Reader")
- The existing page would become too long or unfocused
- Users might search for this topic specifically
- You have enough material (2-3+ citations)

**Extend an existing page when:**
- The new content is closely related and doesn't warrant separation
- The addition is a minor clarification or update
- The existing page is still reasonably sized

When uncertain, ask before creating - it's easier to split a page later than to merge scattered content.

### Before Creating

1. Check if the topic fits an existing page
2. Ensure you have enough source material (at least 2-3 citations)
3. Consider where it belongs (entity vs topic)

### Page Checklist

- [ ] Frontmatter with title, lastVerified, lastUpdated
- [ ] Opening paragraph explaining what and why
- [ ] Wikilinks to related pages
- [ ] Citations for factual claims
- [ ] References section at bottom

### Naming Convention

- Lowercase with hyphens: `mozilla-readability.md`
- Descriptive but concise: `json-ld.md` not `json-linked-data-format.md`
- Entity pages include context: `google-structured-data.md` vs just `structured-data.md`

---

## Updating Existing Pages

### When to Update

- Source information has changed
- New authoritative information is available
- Errors or inaccuracies discovered
- Related pages have changed and links need updating

### Update Process

1. Read the existing page thoroughly
2. Verify existing citations still support claims
3. Add new information with citations
4. Update `lastUpdated` date
5. Update `lastVerified` if you checked all sources
6. Add changelog entry if change is substantial

---

## Verification

### What Verification Means

- Visiting cited URLs to confirm they still exist
- Checking that sources still say what we claim
- Looking for newer information that might supersede
- Confirming factual claims against primary sources

### Recording Verification

Log all verification work in [[VERIFICATION_LOG]] so others know what's been checked and when.

---

## Relationship to Tool Documentation

Research pages document **how things work**.
Command documentation (in `docs/commands/`) documents **how to use the tool**.
The tool CHANGELOG (`/CHANGELOG.md`) documents **what changed and when**.

These three are connected:

```
Research ←→ Tool CHANGELOG ←→ Command Docs
   ↑              ↑                ↑
findings    version history    usage guide
```

### Command Docs → Research

Command docs include a "Behavior" table linking to research:

```markdown
## Behavior

| What it does | Why | Research |
|--------------|-----|----------|
| Extracts main content | Matches AI crawler behavior | [[readability]] |
| Ignores JavaScript | AI crawlers don't render JS | [[ai-crawler-behavior]] |
```

### Tool CHANGELOG → Research

When a tool change is driven by research, the changelog entry references it:

```markdown
### Added
- Remix streaming detection in `ai` command
  - Research: [[streaming-ssr]], research-v0.1.0
```

### Research → Tool Version

Research pages indicate which findings are implemented in the tool. See [Tool Coverage](#tool-coverage) below.

---

## Tool Coverage

When research findings are implemented in semantic-kit, document this in two places with different purposes:

### 1. Frontmatter (systematic, exhaustive)

The `toolCoverage` array is the **audit trail**. Add an entry for every tool version that implements or improves coverage of findings from this page.

```yaml
---
title: "Streaming SSR"
lastVerified: 2024-01-15
lastUpdated: 2024-01-15
toolCoverage:
  - finding: "Next.js streaming detection"
    command: ai
    since: v0.0.3
  - finding: "Next.js App Router patterns"
    command: ai
    since: v0.0.12
  - finding: "Remix streaming detection"
    command: ai
    since: v0.0.17
  - finding: "Improved Remix deferred boundary detection"
    command: ai
    since: v0.0.19
---
```

Each entry has:
- `finding` - Brief description of what's implemented
- `command` - Which command covers this (`ai`, `structure`, `validate:a11y`, etc.)
- `since` - Tool version number (e.g., `v0.0.17`)

**Always add a new entry** when a tool release improves coverage related to this research, even for incremental improvements. This creates a complete history.

### 2. Inline callouts (editorial, curated)

Inline callouts provide **reader context**. They don't need to track every version—use editorial judgment about what's useful to mention.

```markdown
Remix uses deferred data patterns that resolve after initial render. This content
won't be visible to AI crawlers that only fetch static HTML.

> **Tool support:** The `ai` command detects streaming SSR patterns from Next.js
> and Remix since v0.0.3.
```

Guidelines for inline callouts:
- **Reference the first version** that added meaningful support, not every patch
- **Group related functionality** rather than listing each increment
- **Update sparingly** - only when the change is significant to readers
- **Omit if unhelpful** - not every finding needs a callout

Good: `> **Tool support:** The `ai` command detects streaming SSR since v0.0.3.`
Unnecessary: `> **Tool support:** The `ai` command improved Remix detection accuracy in v0.0.19.`

### When to Update

| Situation | Frontmatter | Inline callout |
|-----------|-------------|----------------|
| New feature implements this research | Add entry | Add callout |
| Incremental improvement | Add entry | Usually skip |
| Bug fix related to this research | Add entry | Skip |
| Major expansion of coverage | Add entry | Update callout |

### Callout Format

Use this format for consistency:

```markdown
> **Tool support:** The `{command}` command {description} since v{X.Y.Z}.
```

Examples:
- `> **Tool support:** The `ai` command detects streaming SSR patterns since v0.0.3.`
- `> **Tool support:** The `structure` command extracts ARIA landmarks since v0.0.8.`
- `> **Tool support:** Checked by `validate:a11y` since v0.0.9.`
