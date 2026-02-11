---
id: TASK-010
title: 'Migrate bot command to readability:compare'
status: Done
assignee: []
created_date: '2026-02-09 14:22'
updated_date: '2026-02-10 23:44'
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
- [x] #1 readability:compare command exists and works
- [x] #2 Always shows content comparison (no flag needed)
- [x] #3 bot command shows deprecation warning and works
- [x] #4 Follows pattern of other :compare commands
- [x] #5 Integration tests cover command functionality
- [x] #6 Documentation updated
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Decision Context

Per TASK-001 decision #1: **Remove old names immediately (no deprecation period)**. When migrating `bot` → `readability:compare`, do not keep `bot` as an alias. Clean removal.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
## Summary

Migrated the `bot` command to `readability:compare` utility.

### Changes

**New files:**
- `src/commands/readability/runner-compare.ts` - Runner that fetches static and rendered HTML, extracts with Readability, and compares
- `src/commands/readability/command-compare.ts` - Command handler with timeout option
- `integration-tests/readability/compare.test.ts` - 12 integration tests covering comparison, metrics, markdown, and validation

**Modified files:**
- `src/commands/readability/types.ts` - Added ReadabilityCompareOptions, SectionInfo, ReadabilityComparison, ReadabilityCompareResult types
- `src/commands/readability/formatters.ts` - Added buildCompareIssues, formatReadabilityCompareOutput with unified diff support for full mode
- `src/commands/readability/index.ts` - Exported new command and types
- `src/cli.ts` - Registered `readability:compare`, removed `bot` command (no alias per TASK-001)
- `integration-tests/utils/cli.ts` - Added runReadabilityCompare helper
- `AGENTS.md` - Updated Available Commands table
- `package.json` - Added `diff` package for unified diff output

**Deleted files:**
- `src/commands/bot/` directory (all files)

### Command Usage

```bash
semantic-kit readability:compare <url> [options]

Options:
  --format <type>  Output format: full (default), compact (summary), json
  --timeout <ms>   Timeout for page load (default: 5000)
```

### Output Modes

- **Full**: Shows issues, comparison table, sections, meta, and unified diff of markdown content
- **Compact**: Shows issues and comparison table only (stats)
- **JSON**: Full data including both static and rendered extractions with comparison metrics

### Testing

- All 70 integration tests pass
- TypeScript compilation successful
- Manual testing verified JSON and compact output modes
<!-- SECTION:FINAL_SUMMARY:END -->
