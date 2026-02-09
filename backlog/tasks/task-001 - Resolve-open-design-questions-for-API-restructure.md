---
id: TASK-001
title: Resolve open design questions for API restructure
status: To Do
assignee: []
created_date: '2026-02-09 14:20'
labels: []
milestone: Command API Restructure
dependencies: []
references:
  - docs/backlog/command-api-restructure.md
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Research and decide on open questions before implementation begins. Update relevant tasks with decisions.

**Open Questions to Resolve:**

1. **Deprecation period**: Should old command names (`bot`, `a11y`) continue to work with deprecation warnings, or be removed immediately?

2. **TUI navigation**: How should the TUI present the lens vs utility distinction? Tabs? Sections?

3. **`google` lens scope**: Should it attempt to show rendered content (like the cached version Google sees) or focus on metadata/schema?

4. **`social` lens preview**: Should it attempt to render a visual preview of how the link card would appear, or just show the raw data?

5. **Testing approach**: Should integration tests cover both old and new command names during transition?

**Reference:** docs/backlog/command-api-restructure.md (Part 4: Notes and Open Questions)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 All 5 open questions have documented decisions
- [ ] #2 Decisions are recorded in the restructure document or task notes
- [ ] #3 Relevant downstream tasks are updated with decision context
<!-- AC:END -->
