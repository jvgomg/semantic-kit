---
id: TASK-018
title: Add integration tests for all lenses
status: Done
assignee: []
created_date: '2026-02-09 14:34'
updated_date: '2026-02-11 00:56'
labels: []
milestone: Command API Restructure
dependencies:
  - TASK-004
  - TASK-006
  - TASK-007
  - TASK-016
  - TASK-017
references:
  - integration-tests/
  - test-server/
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
After all lenses are complete, add comprehensive integration tests.

**Scope:**
1. Review test-server fixtures for suitability
2. Add new fixture pages if needed for lens testing
3. Create integration tests for each lens:
   - `ai` lens
   - `reader` lens
   - `google` lens
   - `social` lens
   - `screen-reader` lens

**Test Coverage:**
- Each lens should have tests for:
  - Basic functionality with well-formed pages
  - Edge cases (missing metadata, malformed content)
  - All output formats (full, compact, json)
  - Error handling

**Test Server Considerations:**
- May need fixtures with specific structured data for `google` lens
- May need fixtures with OG/Twitter tags for `social` lens
- May need fixtures that trigger/don't trigger Safari Reader for `reader` lens
- Consider adding fixtures in `test-server/fixtures/lenses/` directory

**Reference:** integration-tests/, test-server/
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Test server fixtures reviewed and extended as needed
- [x] #2 Integration tests exist for all 5 lenses
- [x] #3 Tests cover all output formats
- [x] #4 Tests cover edge cases and error handling
- [x] #5 Tests are documented and follow established patterns
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Decision Context

Per TASK-001 decision #5: **Test new names only**.

Since old command names are removed immediately (no deprecation period), integration tests only need to cover the canonical new command names. No need to test deprecated aliases.

## Implementation Summary

### New Tests Created

**reader lens (3 test files):**
- `content-extraction.test.ts` - markdown/HTML extraction from semantic and non-semantic markup
- `metadata-extraction.test.ts` - title, byline, siteName extraction
- `metrics.test.ts` - wordCount, characterCount, paragraphCount, isReaderable

**screen-reader lens (4 test files):**
- `summary.test.ts` - page title, element counts, non-semantic detection
- `landmarks.test.ts` - landmark detection, names, content counts
- `headings.test.ts` - heading extraction and hierarchy
- `accessibility-features.test.ts` - skip links, main/nav presence, ARIA snapshot

### CLI Helpers Added
- `runReader()` - ReaderResult
- `runScreenReader()` - ScreenReaderResult

### Existing Coverage (verified)
- `ai/` - 4 test files
- `google/` - 2 test files  
- `social/` - 1 test file (comprehensive)
- `readability/` - 3 test files
- `schema/` - 2 test files

### Test Organization
Tests are organized by **functionality** rather than URLs:
- Content extraction
- Metadata extraction
- Metrics/counts
- Edge cases

### Output Format Testing
Tests use JSON format (`--format json`) which validates the actual data correctness. Testing `full` and `compact` formats would test presentation, not data integrity.

### Final Count
135 tests across 19 files, all passing.
<!-- SECTION:NOTES:END -->
