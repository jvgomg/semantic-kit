---
id: TASK-009
title: 'Create readability:js utility'
status: Done
assignee: []
created_date: '2026-02-09 14:22'
updated_date: '2026-02-10 23:23'
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
- [x] #1 readability:js command exists and works
- [x] #2 Extracts content from JS-rendered HTML
- [x] #3 Shows same metrics as readability command
- [x] #4 Requires URL (not file path)
- [x] #5 Integration tests cover command functionality
- [x] #6 Documentation updated
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
## Summary

Implemented `readability:js` utility command that extracts content using Mozilla Readability after JavaScript rendering via Playwright.

### Changes

**New files:**
- `src/commands/readability/runner-js.ts` - Runner using Playwright's fetchRenderedHtml
- `src/commands/readability/command-js.ts` - Command handler with timeout option
- `integration-tests/readability/js-extraction.test.ts` - 10 integration tests

**Modified files:**
- `src/commands/readability/types.ts` - Added ReadabilityJsOptions interface
- `src/commands/readability/formatters.ts` - Added formatReadabilityJsOutput with timeout warning
- `src/commands/readability/index.ts` - Exported new command and runner
- `src/cli.ts` - Registered readability:js command with options
- `integration-tests/utils/cli.ts` - Added runReadabilityJs helper
- `AGENTS.md` - Updated Available Commands table

### Command Usage

```bash
semantic-kit readability:js <url> [options]

Options:
  --format <type>  Output format: full (default), compact (summary), json
  --timeout <ms>   Timeout for page load (default: 5000)
```

### Testing

- All 58 integration tests pass
- TypeScript compilation successful
- Command accepts URL only (rejects file paths as expected)
<!-- SECTION:FINAL_SUMMARY:END -->
