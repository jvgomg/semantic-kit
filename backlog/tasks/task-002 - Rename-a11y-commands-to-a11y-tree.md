---
id: TASK-002
title: Rename a11y commands to a11y-tree
status: Done
assignee: []
created_date: '2026-02-09 14:21'
updated_date: '2026-02-09 15:55'
labels: []
milestone: Command API Restructure
dependencies:
  - TASK-001
references:
  - docs/backlog/command-api-restructure.md
  - src/commands/a11y/
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Rename the accessibility tree commands to clarify their purpose and distinguish from validation.

**Changes:**
- `a11y` → `a11y-tree`
- `a11y:js` → `a11y-tree:js`
- `a11y:compare` → `a11y-tree:compare`

**Rationale:** `a11y` is ambiguous (could mean validation, tree, or general accessibility). `a11y-tree` clearly indicates this shows the accessibility tree.

**Implementation:**
1. Rename command files in `src/commands/a11y/`
2. Update CLI registration in `src/cli.ts`
3. Add old names as aliases with deprecation warnings (per decision in TASK-001)
4. Update TUI references
5. Update tests

**Reference:** docs/backlog/command-api-restructure.md (Migration Notes: a11y → a11y-tree)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 a11y-tree command works with same behavior as current a11y
- [x] #2 a11y-tree:js command works with same behavior as current a11y:js
- [x] #3 a11y-tree:compare command works with same behavior as current a11y:compare
- [ ] #4 Old command names show deprecation warning (if decided)
- [x] #5 TUI updated to use new command names
- [x] #6 Tests pass
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Decision Context

Per TASK-001 decision #1: **Remove old names immediately (no deprecation period)**. When renaming `a11y` → `a11y-tree`, do not keep `a11y` as an alias. Clean removal.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
## Summary

Renamed the accessibility tree commands from `a11y` to `a11y-tree` for clarity:
- `a11y` → `a11y-tree`
- `a11y:js` → `a11y-tree:js`
- `a11y:compare` → `a11y-tree:compare`

## Changes

### Directory rename
- `src/commands/a11y/` → `src/commands/a11y-tree/`

### Function renames
- `a11yCommand` → `a11yTreeCommand`
- `a11yJsCommand` → `a11yTreeJsCommand`
- `a11yCompareCommand` → `a11yTreeCompareCommand`

### CLI updates
- Updated imports to use new path
- Updated command registrations to use new names
- Updated action handlers to use new functions

### Documentation updates
- Updated TUI integration guide to reference new command names

### Tests
- Typecheck passes
- All 22 integration tests pass

## Notes
Per TASK-001 decision: No deprecation aliases added. Old command names (`a11y`, `a11y:js`, `a11y:compare`) are removed completely.
<!-- SECTION:FINAL_SUMMARY:END -->
