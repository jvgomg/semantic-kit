---
id: TASK-002
title: Rename a11y commands to a11y-tree
status: To Do
assignee: []
created_date: '2026-02-09 14:21'
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
- [ ] #1 a11y-tree command works with same behavior as current a11y
- [ ] #2 a11y-tree:js command works with same behavior as current a11y:js
- [ ] #3 a11y-tree:compare command works with same behavior as current a11y:compare
- [ ] #4 Old command names show deprecation warning (if decided)
- [ ] #5 TUI updated to use new command names
- [ ] #6 Tests pass
<!-- AC:END -->
