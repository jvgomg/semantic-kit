---
id: doc-001
title: Command API Restructure Design Document (Archived)
type: other
created_date: '2026-02-16 13:38'
---
# Command API Restructure: Lenses and Utilities

> **Archive Note:** This design document drove the API restructure implemented in TASK-001 through TASK-019 (completed February 2026). Archived for historical reference.

---

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

## End State Command Reference

### Lenses

| Command | Consumer | What It Shows |
|---------|----------|---------------|
| `ai` | ChatGPT, Claude, Perplexity | Markdown content extracted via Readability |
| `reader` | Safari Reader, Pocket | Readability extraction with compatibility metrics |
| `google` | Googlebot | Page structure + Google-relevant structured data |
| `social` | WhatsApp, Slack, Twitter, iMessage | Open Graph + Twitter Card previews |
| `screen-reader` | VoiceOver, NVDA, JAWS | Accessibility tree (JS-rendered) |

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

## Implementation Phases (Completed)

- **Phase 1**: Renames and Reorganization (a11y → a11y-tree, bot → readability:compare)
- **Phase 2**: New Readability Utilities
- **Phase 3**: New Schema Utilities  
- **Phase 4**: New Lenses (reader, google, social, screen-reader)
- **Phase 5**: TUI Updates
- **Phase 6**: Documentation and Polish

---

## Related Tasks

Implemented via: TASK-001 through TASK-019
