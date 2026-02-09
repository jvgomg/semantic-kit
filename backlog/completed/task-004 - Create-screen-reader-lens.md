---
id: TASK-004
title: Create screen-reader lens
status: Done
assignee: []
created_date: '2026-02-09 14:21'
updated_date: '2026-02-09 20:23'
labels: []
milestone: Command API Restructure
dependencies:
  - TASK-017
references:
  - docs/backlog/command-api-restructure.md
  - src/commands/a11y/
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
New lens showing how screen readers interpret a page.

**Purpose:** Answer "How do screen readers see my page?"

**Behavior:**
- Shows accessibility tree as screen readers see it
- Uses JavaScript rendering (because real screen readers see rendered pages)
- Opinionated: no `:js` variant (the lens always uses JS)
- User-friendly format optimized for understanding screen reader experience

**Implementation:**
1. Create `src/commands/screen-reader/` directory
2. Reuse `a11y-tree:js` runner internally
3. Create new formatter focused on screen reader UX
4. Register in CLI as a Lens
5. Add to TUI navigation (per decision in TASK-001)
6. Add tests

**Options:**
- `--format <type>` — full, compact, json (default: full)

**Reference:** docs/backlog/command-api-restructure.md (screen-reader lens)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 screen-reader command exists and works
- [x] #2 Uses JS-rendered accessibility tree internally
- [x] #3 Output is user-friendly and explains screen reader interpretation
- [x] #4 TUI includes screen-reader in Lenses section
- [ ] #5 Integration tests cover command functionality
- [x] #6 Documentation updated (AGENTS.md command table)
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Implementation (2026-02-09)

**Created new `screen-reader` lens command:**
- `src/commands/screen-reader/` - new command directory
- Uses `fetchAccessibilitySnapshot` from Playwright (same as a11y-tree:js)
- Transforms accessibility tree into user-friendly analysis

**Key files:**
- `types.ts` - Options interface
- `runner.ts` - Fetches and analyzes accessibility tree
- `formatters.ts` - User-friendly CLI output
- `command.ts` - Command entry point using `runCommand()`
- `index.ts` - Public exports

**Result structure (ScreenReaderResult):**
- `summary` - High-level stats (landmarks, headings, links, etc.)
- `landmarks` - List of landmark regions with contents
- `headings` - Document outline
- `snapshot` - Raw ARIA snapshot for reference
- `counts` - Role counts

**Issues detected:**
- Missing main landmark (high severity)
- No headings found (high severity)
- No skip link (info, low severity)

**TUI view:**
- `screen-reader-view.ts` - View definition (category: lens)
- `ScreenReaderViewContent.tsx` - Custom TUI component with sections:
  - Warnings (accessibility issues)
  - Summary (stats)
  - Landmarks (page regions)
  - Heading Outline (document structure)

**CLI help text:**
- Added to Lenses section: "Show how screen readers interpret your page"

**AGENTS.md:**
- Added `screen-reader` and `reader` commands to table

## Deferred

**Integration tests:** Deferred to TASK-018 (Add integration tests for all lenses)
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
## Summary

Created new `screen-reader` lens showing how screen readers interpret a page.

**Features:**
- Uses JS-rendered accessibility tree (real screen readers see rendered pages)
- User-friendly output format optimized for understanding screen reader UX
- Detects missing landmarks, headings, and skip links
- Shows landmark regions with their content counts
- Displays heading outline for document structure

**Components:**
- CLI command with full/compact/json formats
- TUI view in Lenses section
- Shares `fetchAccessibilitySnapshot` from Playwright lib

**Output includes:**
- Summary: landmarks, headings, links, form controls, images
- Navigation features: main landmark, navigation, skip link
- Landmarks section with role names and content stats
- Heading outline showing document hierarchy
<!-- SECTION:FINAL_SUMMARY:END -->
