---
id: TASK-010
title: 'Migrate bot command to readability:compare'
status: To Do
assignee: []
created_date: '2026-02-09 14:22'
updated_date: '2026-02-09 14:35'
labels: []
milestone: Command API Restructure
dependencies:
  - TASK-001
  - TASK-009
references:
  - docs/backlog/command-api-restructure.md
  - src/commands/bot/
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Rename the `bot` command to `readability:compare` and update its behavior.

**Current behavior (bot):**
- Fetches static HTML and JS-rendered HTML
- Compares what bots would see
- `--content` flag to show extracted markdown

**New behavior (readability:compare):**
- Same fetching and comparison
- Always show content diff (no --content flag needed)
- Follows pattern of `structure:compare` and `a11y-tree:compare`

**Implementation:**
1. Move/rename `src/commands/bot/` to integrate with readability commands
2. Update behavior to always show content comparison
3. Remove `--content` flag (make it default)
4. Keep `bot` as deprecated alias (per TASK-001 decision)
5. Update CLI registration
6. Update TUI
7. Update tests

**Options:**
- `--format <type>` — full, compact, json (default: full)
- `--timeout <ms>` — Timeout for page load (default: 5000)

**Reference:** docs/backlog/command-api-restructure.md (bot → readability:compare)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 readability:compare command exists and works
- [ ] #2 Always shows content comparison (no flag needed)
- [ ] #3 bot command shows deprecation warning and works
- [ ] #4 Follows pattern of other :compare commands
- [ ] #5 Integration tests cover command functionality
- [ ] #6 Documentation updated
<!-- AC:END -->
