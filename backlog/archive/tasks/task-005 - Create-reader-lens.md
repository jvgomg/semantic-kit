---
id: TASK-005
title: Create reader lens
status: To Do
assignee: []
created_date: '2026-02-09 14:21'
labels: []
milestone: Command API Restructure
dependencies:
  - TASK-003
references:
  - docs/backlog/command-api-restructure.md
  - docs/backlog/reader-command.md
  - src/commands/ai/
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
New lens showing how browser reader modes see a page.

**Purpose:** Answer "How do Safari Reader, Pocket, and similar tools see my page?"

**Behavior:**
- Extracts content via Mozilla Readability
- Shows extraction metadata (title, byline, excerpt, length)
- Reports compatibility signals for Safari Reader
- Distinct from `ai` lens in framing and metrics

**Key distinction from `ai`:**
- `ai` focuses on AI crawler extraction
- `reader` focuses on browser reader mode extraction
- Same underlying technology, different framing and metrics

**Implementation:**
1. Create `src/commands/reader/` directory
2. Extract shared Readability logic from `ai` command into `src/lib/readability.ts`
3. Create reader-specific formatter with Safari compatibility metrics
4. Register in CLI as a Lens
5. Add to TUI navigation
6. Add tests

**Options:**
- `--format <type>` — full, compact, json (default: full)

**Reference:** 
- docs/backlog/command-api-restructure.md (reader lens)
- docs/backlog/reader-command.md (detailed spec)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 reader command exists and works
- [ ] #2 Extracts content via Readability
- [ ] #3 Shows reader-mode-specific metadata and compatibility signals
- [ ] #4 Shared Readability logic extracted to src/lib/
- [ ] #5 TUI includes reader in Lenses section
- [ ] #6 Tests cover basic functionality
<!-- AC:END -->
