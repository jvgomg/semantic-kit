---
id: TASK-013
title: Remove deprecated command aliases
status: To Do
assignee: []
created_date: '2026-02-09 14:22'
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
- [ ] #1 Old command names no longer work
- [ ] #2 No deprecation warning code remains
- [ ] #3 All tests use new command names
- [ ] #4 Documentation only references new names
<!-- AC:END -->
