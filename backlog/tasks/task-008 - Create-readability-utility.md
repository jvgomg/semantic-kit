---
id: TASK-008
title: Create readability utility
status: To Do
assignee: []
created_date: '2026-02-09 14:22'
updated_date: '2026-02-09 14:35'
labels: []
milestone: Command API Restructure
dependencies:
  - TASK-016
references:
  - docs/backlog/command-api-restructure.md
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
New utility for raw Readability extraction and analysis from static HTML.

**Purpose:** Provide detailed Readability extraction results for debugging and analysis.

**Behavior:**
- Extracts content via Mozilla Readability
- Shows detailed extraction results
- Reports Readability metrics (scores, link density, etc.)
- Static HTML only (no JS execution)

**Implementation:**
1. Create `src/commands/readability/` directory (or extend existing)
2. Use shared Readability logic from `src/lib/readability.ts` (created in TASK-005)
3. Create formatter showing detailed metrics
4. Register in CLI as a Utility
5. Add to TUI if appropriate
6. Add tests

**Options:**
- `--format <type>` — full, compact, json (default: full)

**Reference:** docs/backlog/command-api-restructure.md (readability utility)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 readability command exists and works
- [ ] #2 Shows detailed Readability extraction results
- [ ] #3 Reports metrics like scores and link density
- [ ] #4 Works with URLs and file paths
- [ ] #5 Integration tests cover command functionality
- [ ] #6 Documentation updated
<!-- AC:END -->
