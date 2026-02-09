---
id: TASK-003
title: Update CLI help to show Lenses vs Utilities grouping
status: Done
assignee: []
created_date: '2026-02-09 14:21'
updated_date: '2026-02-09 16:19'
labels: []
milestone: Command API Restructure
dependencies:
  - TASK-002
references:
  - docs/backlog/command-api-restructure.md
  - src/cli.ts
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Reorganize the `--help` output to present commands in conceptual groups.

**New Help Structure:**
```
LENSES (How consumers see your page)
  ai              Show how AI crawlers see your page
  reader          Show how browser reader modes see your page
  google          Show how Googlebot sees your page
  social          Show how social media platforms see your page
  screen-reader   Show how screen readers interpret your page

ANALYSIS UTILITIES
  schema, structure, a11y-tree (with :js and :compare variants)
  readability (with :js and :compare variants)

VALIDATION UTILITIES
  validate:html, validate:schema, validate:a11y

OTHER
  fetch, tui
```

**Implementation:**
1. Update help text generation in CLI
2. Group commands logically
3. Placeholder entries for commands not yet implemented (or skip them)

**Reference:** docs/backlog/command-api-restructure.md (Help Output Organization)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 --help output shows Lenses and Utilities sections
- [x] #2 Commands are grouped logically
- [x] #3 Descriptions are clear and consistent
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Decision Context

Per TASK-001 decision #2: Use **"Tools"** instead of "Utilities" in CLI help and TUI navigation. The grouping should be:
- Lenses
- Tools (not "Utilities")
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
## Summary

Updated CLI help output to organize commands into logical groups:

**Lenses** (How consumers see your page):
- `ai` - Show how AI crawlers extract and see your content

**Analysis Tools**:
- `schema` - View structured data
- `structure`, `structure:js`, `structure:compare` - Page structure analysis
- `a11y-tree`, `a11y-tree:js`, `a11y-tree:compare` - Accessibility tree
- `bot` - Compare static vs JavaScript-rendered content

**Validation Tools**:
- `validate:html`, `validate:schema`, `validate:a11y`

**Other**:
- `fetch`, `tui`

## Changes

Modified `src/cli.ts`:
- Added `configureHelp({ visibleCommands: () => [] })` to hide default command list
- Added custom help text with grouped commands using `addHelpText('after', ...)`
- Individual command help (`semantic-kit <command> --help`) still works normally

## Notes

Used "Analysis Tools" and "Validation Tools" instead of "Utilities" per TASK-001 decision to use "Tools" terminology.
<!-- SECTION:FINAL_SUMMARY:END -->
