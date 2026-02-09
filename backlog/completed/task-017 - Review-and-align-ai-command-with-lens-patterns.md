---
id: TASK-017
title: Review and align ai command with lens patterns
status: Done
assignee: []
created_date: '2026-02-09 14:34'
updated_date: '2026-02-09 20:17'
labels: []
milestone: Command API Restructure
dependencies:
  - TASK-016
references:
  - src/commands/ai/
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
After the first lens (reader) is complete, review the existing `ai` command and align it with the established lens patterns.

**Purpose:** Ensure the `ai` command follows the same UX, architecture, and output patterns established by the reader lens.

**Review Areas:**
1. **CLI output format** — Does it match the reader lens style?
2. **Help text** — Does it clearly position `ai` as a lens ("How AI crawlers see your page")?
3. **JSON output structure** — Does it follow the conventions established for lenses?
4. **TUI integration** — Is it properly placed in the Lenses section?
5. **Code architecture** — Does it use shared libraries appropriately?

**Potential Changes:**
- Update help text to use lens framing
- Align output format with reader lens conventions
- Ensure JSON structure matches lens conventions
- Update TUI placement/presentation
- Refactor to use shared Readability library from TASK-016

**Note:** The `ai` command may not need significant changes, but this review ensures consistency across all lenses.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 ai command reviewed against reader lens patterns
- [x] #2 Help text uses lens framing
- [x] #3 Output format is consistent with other lenses
- [x] #4 JSON structure follows lens conventions
- [x] #5 TUI shows ai in Lenses section correctly
- [x] #6 Code uses shared libraries where appropriate
- [x] #7 Documentation updated if changes made
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Review Summary (2026-02-09)

**Already aligned (no changes needed):**
- Both `ai` and `reader` use shared `extractReadability()` from `src/lib/readability.ts`
- Both registered as `category: 'lens'` in TUI
- Both use lens framing in CLI help text ("Show how X sees your page")
- Both use `runCommand()` and `formatTableGroups()` patterns
- JSON output follows same `{ result, issues }` structure
- TUI shows both under "LENSES" section

**Changes made:**
1. Renamed `author` field to `byline` in `AiResult` type and all usages (aligns with Readability's field name and `ReaderResult`)
2. Extracted `hiddenContentAnalysis` logic from `src/commands/ai/runner.ts` to new `src/lib/hidden-content.ts` module

**Intentional differences (confirmed with user):**
- TUI labels: "AI Bot" vs "Reader" - different is fine
- Table group headers: "Analysis"/"Meta" vs "Extraction Results"/"Readability Metrics" - intentional differentiation
- Issues: AI has streaming detection issues, Reader returns empty issues - appropriate for each use case

**Documentation:**
- No AGENTS.md changes needed - internal refactoring only
- `reader` command should be added to AGENTS.md command table (deferred to TASK-014)

## Files Changed
- `src/lib/results.ts` - renamed `author` to `byline` in `AiResult`
- `src/lib/hidden-content.ts` - new module for hidden content analysis
- `src/commands/ai/runner.ts` - uses new lib module, updated field name
- `src/commands/ai/formatters.ts` - updated field name
- `src/commands/ai/types.ts` - removed moved types
- `src/tui/views/components/AiViewContent.tsx` - updated field name
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
## Summary

Reviewed `ai` command against `reader` lens patterns and aligned where appropriate.

**Changes:**
- Renamed `author` → `byline` field in `AiResult` type for consistency with `ReaderResult` and Readability's native field name
- Extracted hidden content analysis logic to new `src/lib/hidden-content.ts` module for reusability

**Already aligned (no changes needed):**
- Both lenses use shared `extractReadability()` from `src/lib/readability.ts`
- Both use lens framing in CLI help text
- Both use `runCommand()` and `formatTableGroups()` patterns
- JSON output follows `{ result, issues }` convention
- TUI shows both under "LENSES" section with `category: 'lens'`

**Intentional differences (kept):**
- TUI labels ("AI Bot" vs "Reader")
- Table group headers reflect different purposes
- Issues structure (AI detects streaming, Reader doesn't need to)
<!-- SECTION:FINAL_SUMMARY:END -->
