---
id: TASK-008
title: Create readability utility
status: Done
assignee: []
created_date: '2026-02-09 14:22'
updated_date: '2026-02-10 22:59'
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
- [x] #1 readability command exists and works
- [x] #2 Shows detailed Readability extraction results
- [x] #3 Reports metrics like scores and link density
- [x] #4 Works with URLs and file paths
- [x] #5 Integration tests cover command functionality
- [x] #6 Documentation updated
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Implementation (2026-02-10)

**Files created:**
- `src/commands/readability/types.ts` - Options and format types
- `src/commands/readability/runner.ts` - Core extraction logic
- `src/commands/readability/formatters.ts` - CLI output formatting
- `src/commands/readability/command.ts` - CLI handler
- `src/commands/readability/index.ts` - Public exports
- `src/lib/results.ts` - Added `ReadabilityUtilityResult`, `ReadabilityFullMetrics`, `ReadabilityExtractionData` types
- `integration-tests/readability/extraction.test.ts` - Integration tests
- `integration-tests/utils/cli.ts` - Added `runReadability` helper

**Key difference from `reader` lens:**
- Includes `linkDensity` metric (developer-focused analysis)
- Shows link density as percentage with assessment (low/moderate/high)
- More technical framing in output

**Output format:**
```
EXTRACTION RESULTS
Title: ...
Byline: ...
Site Name: ...
Excerpt: ...
Published: ...

READABILITY METRICS
Word Count: ...
Character Count: ...
Paragraph Count: ...
Link Density: X.X% (low - good|moderate|high - may indicate link farm)
Readerable: Yes/No
```

**Note:** Documentation update deferred (AC #6) - no docs/commands/ file created yet for any lens/utility.

## TUI Integration (2026-02-10)

Added readability to TUI under Tools section:
- `src/tui/views/readability-view.ts` - View definition
- `src/tui/views/components/ReadabilityViewContent.tsx` - React component
- Updated `src/tui/views/index.ts` to import the view

The TUI view shows:
- METRICS section with link density prominently displayed
- EXTRACTION section with metadata
- CONTENT section with syntax-highlighted markdown

## Documentation (2026-02-10)

Created `docs/commands/readability.md` with:
- Usage examples for all formats
- Options table
- Behavior table with research links
- Output examples (full, compact, JSON)
- Metrics explanation with good values
- Link density assessment guide
- Comparison with `reader` lens
- Common problems and solutions
- TUI section
- Programmatic usage example

Noted that `readability:js` and `readability:compare` are "coming soon" (TASK-009, TASK-010).
<!-- SECTION:NOTES:END -->
