---
id: TASK-015
title: Set up TUI Lenses/Utilities navigation structure
status: To Do
assignee: []
created_date: '2026-02-09 14:34'
updated_date: '2026-02-09 14:43'
labels: []
milestone: Command API Restructure
dependencies:
  - TASK-001
  - TASK-003
references:
  - docs/backlog/command-api-restructure.md
  - src/tui/
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create the foundational TUI structure for the Lenses vs Utilities organization before adding the first lens.

**Purpose:** Establish the navigation patterns, layout, and UX conventions that all subsequent lenses and utilities will follow.

**Scope:**
1. Design and implement Lenses/Utilities navigation in TUI
2. Establish consistent patterns for:
   - How lenses are presented vs utilities
   - Navigation between commands
   - Output display conventions
3. Consider how existing commands (ai, structure, schema, validate) fit into the new structure
4. Set up placeholder sections for upcoming lenses

**UX Focus:**
- Navigation should be intuitive
- The lens vs utility distinction should be clear to users
- Consider keyboard shortcuts and accessibility

**Architecture Focus:**
- Establish Jotai state patterns for lens/utility data
- Define consistent JSON output structure for all commands
- Create reusable TUI components for command output display

**Reference:** docs/backlog/command-api-restructure.md (TUI navigation question in TASK-001)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 TUI has Lenses and Utilities sections in navigation
- [ ] #2 Navigation patterns are documented for future lens implementations
- [ ] #3 Jotai state patterns for command data are established
- [ ] #4 JSON output structure conventions are defined
- [ ] #5 Existing commands are reorganized into appropriate sections
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Decision Context

Per TASK-001 decision #2: **Sidebar menu with 2 groups**

- Group 1: **Lenses** (ai, reader, google, social, screen-reader)
- Group 2: **Tools** (not "Utilities" - user preference)

Use sidebar navigation pattern, not tabs.
<!-- SECTION:NOTES:END -->
