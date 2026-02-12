---
id: TASK-013
title: Remove deprecated command aliases
status: Done
assignee: []
created_date: '2026-02-09 14:22'
updated_date: '2026-02-12 23:20'
labels: []
milestone: Command API Restructure
dependencies:
  - TASK-002
  - TASK-010
references:
  - docs/backlog/command-api-restructure.md
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Remove the deprecated command aliases after transition period.

**Aliases to remove:**
- `bot` (replaced by `readability:compare`)
- `a11y` (replaced by `a11y-tree`)
- `a11y:js` (replaced by `a11y-tree:js`)
- `a11y:compare` (replaced by `a11y-tree:compare`)

**Implementation:**
1. Remove alias registrations from CLI
2. Remove deprecation warning code
3. Update any remaining references
4. Update tests to only use new names

**Note:** Only proceed with this after sufficient transition period (per TASK-001 decision).

**Reference:** docs/backlog/command-api-restructure.md
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Old command names no longer work
- [x] #2 No deprecation warning code remains
- [x] #3 All tests use new command names
- [x] #4 Documentation only references new names
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Decision Context

Per TASK-001 decision #1: **Remove old names immediately (no deprecation period)**.

This task is now simpler: just ensure old command names (`bot`, `a11y`, `a11y:js`, `a11y:compare`) are fully removed from CLI registration. No deprecation aliases to manage.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
## Summary

Cleaned up documentation to remove all references to deprecated command aliases (`bot`, `a11y`, `a11y:js`, `a11y:compare`).

**Note:** The CLI code and tests were already clean — TASK-002 and TASK-010 removed the old commands completely per TASK-001 decision (no deprecation period). This task focused on documentation cleanup only.

## Changes

### Documentation removed
- `docs/commands/bot.md` — Deleted (obsolete command documentation)
- `docs/commands/a11y.md` — Deleted (replaced by a11y-tree.md)

### Documentation added
- `docs/commands/a11y-tree.md` — New file with updated command names throughout

### Documentation updated
- `docs/commands/readability.md` — Changed "coming soon" to available for `:js` and `:compare` commands
- `README.md`:
  - Updated command table to use `readability:compare` and `a11y-tree` variants
  - Updated documentation links section
  - Updated Perspectives table
  - Updated Static vs Rendered comparison table
  - Updated Programmatic API type imports (`BotResult` → `ReadabilityCompareResult`)

## Verification

- Typecheck passes
- All 141 integration tests pass
- No remaining `semantic-kit bot` or `semantic-kit a11y` command invocations in documentation
<!-- SECTION:FINAL_SUMMARY:END -->
