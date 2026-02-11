---
id: TASK-011
title: 'Create schema:js utility'
status: Done
assignee: []
created_date: '2026-02-09 14:22'
updated_date: '2026-02-11 00:22'
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
- [x] #1 schema:js command exists and works
- [x] #2 Extracts schema from JS-rendered HTML
- [x] #3 Captures dynamically injected JSON-LD
- [x] #4 Requires URL (not file path)
- [x] #5 Integration tests cover command functionality
- [x] #6 Documentation updated
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
## Summary

Implemented the `schema:js` utility command that extracts structured data from JavaScript-rendered HTML using Playwright.

## Changes

**New files:**
- `src/commands/schema/command-js.ts` - Command handler
- `src/commands/schema/runner-js.ts` - Playwright-based extraction runner
- `integration-tests/schema/js-extraction.test.ts` - Integration tests

**Modified files:**
- `src/commands/schema/types.ts` - Added `SchemaJsOptions` type
- `src/commands/schema/index.ts` - Export new command and runner
- `src/lib/results.ts` - Added `SchemaJsResult` type
- `src/cli.ts` - Registered `schema:js` command and updated help text
- `integration-tests/utils/cli.ts` - Added `runSchemaJs` test utility

## Features

- Extracts JSON-LD, Microdata, RDFa, Open Graph, and Twitter Card data from JS-rendered HTML
- Supports `--format` option (full, compact, json)
- Supports `--timeout` option for page load (default: 5000ms)
- Requires URL (rejects file paths with helpful error message)
- Reports timeout status in output
- Reuses existing schema formatters and issue detection

## Testing

- 8 new integration tests covering:
  - Basic extraction
  - JSON-LD extraction
  - Open Graph extraction
  - Metatags extraction
  - Timeout option
  - URL validation
<!-- SECTION:FINAL_SUMMARY:END -->
