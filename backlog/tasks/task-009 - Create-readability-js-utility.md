---
id: TASK-009
title: 'Create readability:js utility'
status: To Do
assignee: []
created_date: '2026-02-09 14:22'
updated_date: '2026-02-09 14:35'
labels: []
milestone: Command API Restructure
dependencies:
  - TASK-008
references:
  - docs/backlog/command-api-restructure.md
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
New utility for Readability extraction after JavaScript rendering.

**Purpose:** Same as `readability` but on JS-rendered HTML, useful for SPAs and hydrated content.

**Implementation:**
1. Add to `src/commands/readability/` directory
2. Use Playwright to render page with JS
3. Apply Readability extraction to rendered HTML
4. Register in CLI as a Utility
5. Add to TUI if appropriate
6. Add tests

**Options:**
- `--format <type>` — full, compact, json (default: full)
- `--timeout <ms>` — Timeout for page load (default: 5000)

**Reference:** docs/backlog/command-api-restructure.md (readability:js utility)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 readability:js command exists and works
- [ ] #2 Extracts content from JS-rendered HTML
- [ ] #3 Shows same metrics as readability command
- [ ] #4 Requires URL (not file path)
- [ ] #5 Integration tests cover command functionality
- [ ] #6 Documentation updated
<!-- AC:END -->
