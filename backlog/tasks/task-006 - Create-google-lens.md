---
id: TASK-006
title: Create google lens
status: Done
assignee: []
created_date: '2026-02-09 14:21'
updated_date: '2026-02-09 20:46'
labels: []
milestone: Command API Restructure
dependencies:
  - TASK-017
references:
  - docs/backlog/command-api-restructure.md
  - src/commands/schema/
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
New lens showing how Googlebot sees a page.

**Purpose:** Answer "How does Google see my page?"

**Behavior:**
- Shows structured data relevant to Google Search
- Filters to JSON-LD types Google recognizes (Article, Product, FAQ, HowTo, BreadcrumbList, etc.)
- Shows relevant meta tags (title, description, canonical)
- Does NOT show Open Graph or Twitter Cards (not Google-relevant)
- May show structure signals (heading hierarchy, landmarks) per TASK-001 decision

**Implementation:**
1. Create `src/commands/google/` directory
2. Reuse schema extraction logic from `src/commands/schema/`
3. Create filter for Google-recognized schema types in `src/lib/schema-filter.ts`
4. Add page metadata extraction (title, description, canonical URL)
5. Register in CLI as a Lens
6. Add to TUI navigation
7. Add tests

**Options:**
- `--format <type>` — full, compact, json (default: full)

**Reference:** docs/backlog/command-api-restructure.md (google lens)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 google command exists and works
- [x] #2 Filters schema to Google-recognized types only
- [x] #3 Shows page metadata (title, description, canonical)
- [x] #4 Does not show OG/Twitter Cards
- [x] #5 TUI includes google in Lenses section
- [x] #6 Integration tests cover command functionality
- [x] #7 Documentation updated (AGENTS.md command table)
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Decision Context

Per TASK-001 decision #3: **Metadata/schema only**

The google lens should show:
- Page title, meta description, canonical URL
- Google-relevant JSON-LD schema types (Article, Product, FAQ, HowTo, BreadcrumbList, etc.)
- Heading structure signals

Do NOT attempt to render content as Google sees it.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
## Summary

Implemented the `google` lens command that shows how Googlebot sees a page, answering "How does Google see my page?"

### Features Implemented

1. **Page Metadata Extraction** - Extracts title from `<title>`, description from `<meta name="description">`, canonical from `<link rel="canonical">`, and language from `<html lang="...">`

2. **Google-Recognized Schema Filtering** - Filters JSON-LD to only show types Google uses for rich results (Article, Product, Recipe, Event, FAQPage, HowTo, LocalBusiness, Organization, Person, BreadcrumbList, VideoObject, etc.)

3. **Heading Structure** - Uses the same heading outline approach as the `structure` command with word counts and content stats

4. **CLI Command** - Registered as a lens with `--format` option (full/compact/json)

5. **TUI Integration** - Added Google view to the TUI with expandable sections for Summary, Metadata, Structured Data, and Headings

### Files Created

- `src/commands/google/types.ts` - Types and schema type constants
- `src/commands/google/runner.ts` - Core extraction logic
- `src/commands/google/formatters.ts` - CLI output formatting
- `src/commands/google/command.ts` - CLI command implementation
- `src/commands/google/index.ts` - Public API exports
- `src/tui/views/google-view.ts` - TUI view definition
- `src/tui/views/components/GoogleViewContent.tsx` - TUI component
- `integration-tests/google/metadata-extraction.test.ts` - Metadata tests
- `integration-tests/google/schema-extraction.test.ts` - Schema tests

### Files Modified

- `src/lib/results.ts` - Added GoogleResult type
- `src/cli.ts` - Registered google command
- `src/tui/views/index.ts` - Added google-view import
- `integration-tests/utils/cli.ts` - Added runGoogle helper
- `AGENTS.md` - Updated command table

### Testing

All 29 integration tests pass, including the 4 new tests for the google command.
<!-- SECTION:FINAL_SUMMARY:END -->
