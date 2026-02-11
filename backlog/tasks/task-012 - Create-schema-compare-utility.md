---
id: TASK-012
title: 'Create schema:compare utility'
status: Done
assignee: []
created_date: '2026-02-09 14:22'
updated_date: '2026-02-11 00:31'
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
- [x] #1 schema:compare command exists and works
- [x] #2 Shows differences between static and JS schema
- [x] #3 Highlights added, removed, and changed items
- [x] #4 Requires URL (not file path)
- [x] #5 Integration tests cover command functionality
- [x] #6 Documentation updated
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
## Summary

Implemented the `schema:compare` utility command that compares structured data between static HTML and JavaScript-rendered HTML using Playwright.

## Changes

**New files:**
- `src/commands/schema/command-compare.ts` - Command handler
- `src/commands/schema/runner-compare.ts` - Comparison runner
- `integration-tests/schema/compare.test.ts` - Integration tests (9 tests)

**Modified files:**
- `src/commands/schema/types.ts` - Added `SchemaCompareOptions` type
- `src/commands/schema/formatters.ts` - Added compare formatters and issue builders
- `src/commands/schema/index.ts` - Export new command and runner
- `src/lib/results.ts` - Added `SchemaCompareResult` and `SchemaComparisonMetrics` types
- `src/cli.ts` - Registered `schema:compare` command and updated help text
- `integration-tests/utils/cli.ts` - Added `runSchemaCompare` test utility
- `AGENTS.md` - Updated documentation

## Features

- Compares JSON-LD, Microdata, RDFa, Open Graph, and Twitter Card data
- Reports schemas added/removed by JavaScript
- Tracks Open Graph and Twitter tag changes
- `hasDifferences` flag for quick assessment
- Supports `--format` option (full, compact, json)
- Supports `--timeout` option for page load (default: 5000ms)
- Requires URL (rejects file paths with helpful error message)
- Reports timeout status in output

## Testing

- 9 new integration tests covering:
  - Basic functionality
  - Comparison metrics
  - Static page (no JS-dependent schema)
  - Timeout option
  - URL validation
<!-- SECTION:FINAL_SUMMARY:END -->
