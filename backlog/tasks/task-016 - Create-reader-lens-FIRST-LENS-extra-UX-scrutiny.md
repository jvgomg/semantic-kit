---
id: TASK-016
title: Create reader lens (FIRST LENS - extra UX scrutiny)
status: To Do
assignee: []
created_date: '2026-02-09 14:34'
labels:
  - first-lens
milestone: Command API Restructure
dependencies:
  - TASK-015
references:
  - docs/backlog/command-api-restructure.md
  - docs/backlog/reader-command.md
  - src/commands/ai/
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**THIS IS THE FIRST LENS** — Extra scrutiny on UX, architecture, and patterns that other lenses will follow.

New lens showing how browser reader modes see a page.

**Purpose:** Answer "How do Safari Reader, Pocket, and similar tools see my page?"

**Behavior:**
- Extracts content via Mozilla Readability
- Shows extraction metadata (title, byline, excerpt, length, site name)
- Reports Mozilla Readability metrics (paragraph count, character count, link density, top candidate score)
- Reports Safari Reader compatibility checks:
  - Character count (>= 350-400)
  - Comma count (>= 10)
  - Child elements in wrapper (>= 5)
  - Container element type (not `<p>` alone)
- Shows Safari Reader likelihood (LIKELY TO TRIGGER / UNLIKELY TO TRIGGER)

**Example Output:**
```
Reader Analysis: https://example.com/article

## Extraction Results
Title:       "How to Build Better Websites"
Byline:      "Jane Smith"
Excerpt:     "A comprehensive guide..."
Length:      4,523 characters

## Mozilla Readability Metrics
Paragraph count:     23
Character count:     4,523
Link density:        0.12 (low - good)

## Safari Reader Compatibility
Character count:     4,523  ✓ (min: 350-400)
Comma count:         67     ✓ (min: 10)
Child elements:      28     ✓ (min: 5)
Container element:   <article>  ✓

Safari Reader:       LIKELY TO TRIGGER
```

**Implementation:**
1. Create `src/commands/reader/` directory
2. Extract shared Readability logic from `ai` command into `src/lib/readability.ts`
3. Create `src/lib/safari-heuristics.ts` for Safari-specific checks
4. Create reader-specific formatter with all metrics
5. Register in CLI as a Lens
6. Add to TUI navigation (following patterns from TASK-015)
7. Add integration tests

**Options:**
- `--format <type>` — full, compact, json (default: full)
- `--full` — Show complete extracted content (vs truncated preview)

**First Lens Checklist:**
- [ ] CLI output UX is polished and serves as template for other lenses
- [ ] TUI integration follows patterns established in TASK-015
- [ ] JSON output structure is well-designed for programmatic use
- [ ] Jotai state management patterns are clean and reusable
- [ ] Code architecture allows easy creation of similar lenses
- [ ] Integration tests establish patterns for lens testing

**Reference:** 
- docs/backlog/command-api-restructure.md
- docs/backlog/reader-command.md (MIGRATED - full spec incorporated above)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 reader command exists and works
- [ ] #2 Extracts content via Readability
- [ ] #3 Shows Mozilla Readability metrics (paragraph count, character count, link density)
- [ ] #4 Shows Safari compatibility checks with pass/fail indicators
- [ ] #5 Shows Safari Reader trigger likelihood
- [ ] #6 --full flag shows complete content
- [ ] #7 JSON output includes all metrics as structured data
- [ ] #8 Shared Readability logic extracted to src/lib/
- [ ] #9 Safari heuristics in src/lib/safari-heuristics.ts
- [ ] #10 TUI includes reader in Lenses section
- [ ] #11 Integration tests cover command functionality
- [ ] #12 CLI and TUI UX is polished (first lens standard)
- [ ] #13 Jotai patterns are documented for reuse
<!-- AC:END -->
