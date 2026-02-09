---
id: TASK-012
title: 'Create schema:compare utility'
status: To Do
assignee: []
created_date: '2026-02-09 14:22'
updated_date: '2026-02-09 14:35'
labels: []
milestone: Command API Restructure
dependencies:
  - TASK-011
references:
  - docs/backlog/command-api-restructure.md
  - src/commands/schema/
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
New utility comparing structured data between static and JS-rendered HTML.

**Purpose:** Show differences in schema between static and hydrated pages.

**Implementation:**
1. Add to `src/commands/schema/` directory
2. Fetch static HTML and JS-rendered HTML
3. Extract schema from both
4. Compute and display differences (added, removed, changed)
5. Register in CLI as a Utility
6. Add to TUI if appropriate
7. Add tests

**Options:**
- `--format <type>` — full, compact, json (default: full)
- `--timeout <ms>` — Timeout for page load (default: 5000)

**Reference:** docs/backlog/command-api-restructure.md (schema:compare utility)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 schema:compare command exists and works
- [ ] #2 Shows differences between static and JS schema
- [ ] #3 Highlights added, removed, and changed items
- [ ] #4 Requires URL (not file path)
- [ ] #5 Integration tests cover command functionality
- [ ] #6 Documentation updated
<!-- AC:END -->
