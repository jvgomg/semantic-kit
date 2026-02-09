---
id: TASK-004
title: Create screen-reader lens
status: To Do
assignee: []
created_date: '2026-02-09 14:21'
updated_date: '2026-02-09 14:34'
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
- [ ] #1 screen-reader command exists and works
- [ ] #2 Uses JS-rendered accessibility tree internally
- [ ] #3 Output is user-friendly and explains screen reader interpretation
- [ ] #4 TUI includes screen-reader in Lenses section
- [ ] #5 Integration tests cover command functionality
- [ ] #6 Documentation updated (AGENTS.md command table)
<!-- AC:END -->
