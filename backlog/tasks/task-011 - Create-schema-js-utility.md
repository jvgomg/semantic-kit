---
id: TASK-011
title: 'Create schema:js utility'
status: To Do
assignee: []
created_date: '2026-02-09 14:22'
updated_date: '2026-02-09 14:35'
labels: []
milestone: Command API Restructure
dependencies:
  - TASK-003
references:
  - docs/backlog/command-api-restructure.md
  - src/commands/schema/
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
New utility showing structured data after JavaScript rendering.

**Purpose:** Capture schema injected by JavaScript (common with Next.js, SPAs).

**Implementation:**
1. Add to `src/commands/schema/` directory
2. Use Playwright to render page with JS
3. Extract all structured data types from rendered HTML
4. Register in CLI as a Utility
5. Add to TUI if appropriate
6. Add tests

**Options:**
- `--format <type>` — full, compact, json (default: full)
- `--timeout <ms>` — Timeout for page load (default: 5000)

**Reference:** docs/backlog/command-api-restructure.md (schema:js utility)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 schema:js command exists and works
- [ ] #2 Extracts schema from JS-rendered HTML
- [ ] #3 Captures dynamically injected JSON-LD
- [ ] #4 Requires URL (not file path)
- [ ] #5 Integration tests cover command functionality
- [ ] #6 Documentation updated
<!-- AC:END -->
