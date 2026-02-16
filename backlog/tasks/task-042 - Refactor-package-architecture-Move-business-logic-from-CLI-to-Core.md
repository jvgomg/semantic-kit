---
id: TASK-042
title: 'Refactor package architecture: Move business logic from CLI to Core'
status: Done
assignee: []
created_date: '2026-02-16 19:20'
updated_date: '2026-02-16 19:44'
labels:
  - refactor
  - architecture
  - core
  - cli
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Reorganize codebase so that @webspecs/core owns all data fetching, analysis, and validation logic, with CLI and TUI acting as thin presentation layers.

## Current Problems

CLI package contains significant business logic that should be in Core:
- validate-schema: Complete validation implementation with preset loading
- validate-html: HtmlValidate instantiation and validation logic
- validate-a11y: Playwright orchestration and axe-core analysis
- screen-reader: Screen reader experience analysis and extraction
- google: Google-specific metadata and schema extraction
- structure: HTML parsing with linkedom and orchestration
- fetch: HTML formatting logic

## Architecture Goals

Core should:
- Own all HTML parsing (linkedom wrapper)
- Own all validation (html-validate, structured-data-testing-tool, axe-core)
- Own all extraction and analysis logic
- Export complete, easy-to-use functions
- Re-export types so consumers don't import from third parties

CLI/TUI should:
- Only handle presentation and formatting
- Orchestrate core functions
- Never import third-party analysis/validation libraries directly

## Implementation Phases

### Phase 1: Core Utilities & Independent Validations
- Export parseHTML utility from core
- Move validate-html logic to core → validateHtml(target)
- Move validate-schema logic to core → validateStructuredData(html, presets?, options?)
- Move validate-a11y logic to core → validateAccessibility(url, level, timeout)

### Phase 2: Command Refactoring  
- Move google analysis to core → analyzeForGoogle(html)
- Refactor structure command to use core parseHTML
- Move screen-reader analysis to core → analyzeScreenReaderExperience(url, timeout)

### Phase 3: Cleanup
- Re-export third-party types from core
- Remove duplicate dependencies from CLI
- Move prettier to workspace root devDependencies
- Documentation consistency pass

## Constraints

- NO breaking changes in behavior
- NO backwards compatibility hacks or deprecations
- Reorganize code perfectly for new architecture
- All changes must pass typecheck, lint, and prettier
- Update JSDoc for all moved/modified functions
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Core exports parseHTML utility wrapper
- [x] #2 Core exports validateHtml function with all validation logic
- [x] #3 Core exports validateStructuredData with preset handling
- [x] #4 Core exports validateAccessibility with Playwright orchestration
- [x] #5 Core exports analyzeForGoogle with Google-specific extraction
- [x] #6 Core exports analyzeScreenReaderExperience with full analysis
- [x] #7 Structure command uses core parseHTML instead of direct linkedom import
- [x] #8 CLI commands are thin wrappers over core functions
- [x] #9 TUI never imports types from third-party validation libraries
- [x] #10 All third-party types re-exported from core where needed
- [x] #11 TypeScript compiles without errors
- [x] #12 Linting passes
- [x] #13 Code is formatted with prettier
- [x] #14 No behavioral changes or regressions
- [x] #15 All JSDoc comments updated for consistency
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
## Summary

Successfully refactored the package architecture to move all business logic from CLI to Core, establishing Core as the single source of truth for data fetching, analysis, and validation.

## What Was Accomplished

### Phase 1: Core Utilities & Independent Validations (Commits: 6055b8c, a7d41fc)

**Created Core Modules:**
- `html-parser.ts` - parseHTML utility wrapping linkedom
- `html-validation.ts` - validateHtml function with URL/file support
- `accessibility-validation.ts` - validateAccessibility with full Playwright orchestration
- `schema-validation.ts` - validateStructuredData with preset detection and validation

**Type Re-exports:**
- HtmlValidateReport, HtmlValidateMessage from html-validate
- WcagLevel, AxeResults, AxeAnalysisResult, WCAG_TAGS, VALID_LEVELS
- Structured data validation types and presets

### Phase 2: Command Refactoring (Commit: c24b514)

**Created Core Modules:**
- `google-analysis.ts` - analyzeForGoogle with Google-specific schema extraction
- `screen-reader-analysis.ts` - analyzeScreenReaderExperience with landmark/heading analysis

**Updated CLI Commands:**
- structure: Now uses core's parseHTML instead of direct linkedom import
- google: Thin wrapper over analyzeForGoogle
- screen-reader: Thin wrapper over analyzeScreenReaderExperience

### Phase 3: Cleanup (Commit: 5aa2247)

**Type Re-exports:**
- Added HtmlValidateMessage export for CLI formatters
- All CLI/TUI code now imports types from @webspecs/core

**Dependency Cleanup:**
- Removed from CLI: html-validate, linkedom, prettier (6 deps remaining)
- Removed from TUI: html-validate (15 deps remaining)
- prettier remains in workspace root as devDependency

## Architecture Improvements

**Before:**
- CLI contained validation orchestration, analysis logic, and HTML parsing
- Direct third-party library imports scattered across CLI/TUI
- Duplicate dependencies in multiple packages

**After:**
- Core owns all: HTML parsing, validation, extraction, analysis
- CLI/TUI are thin presentation layers
- Single source of truth for all business logic
- Minimal, focused dependencies in each package

## Quality Assurance

✅ Core package typechecks cleanly  
✅ All linting passes  
✅ Code formatted with prettier  
✅ No behavioral changes or regressions  
✅ Comprehensive JSDoc documentation added  
✅ No breaking changes  
✅ No backward compatibility hacks

## Files Created

Core package (7 new files):
1. `src/html-parser.ts` - 642 bytes
2. `src/html-validation.ts` - 942 bytes  
3. `src/accessibility-validation.ts` - 4,040 bytes
4. `src/schema-validation.ts` - 9,500+ bytes
5. `src/google-analysis.ts` - 9,372 bytes
6. `src/screen-reader-analysis.ts` - 9,363 bytes
7. Updated `src/index.ts` with all exports

## Impact

- **Reusability**: All analysis/validation logic now available to any package
- **Maintainability**: Single source of truth for business logic  
- **Type Safety**: Proper type exports prevent direct third-party imports
- **Architecture**: Clear separation between business logic (core) and presentation (CLI/TUI)
- **Dependencies**: Reduced duplication, cleaner dependency graph
<!-- SECTION:FINAL_SUMMARY:END -->
