---
id: TASK-042
title: 'Refactor package architecture: Move business logic from CLI to Core'
status: In Progress
assignee: []
created_date: '2026-02-16 19:20'
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
- [ ] #1 Core exports parseHTML utility wrapper
- [ ] #2 Core exports validateHtml function with all validation logic
- [ ] #3 Core exports validateStructuredData with preset handling
- [ ] #4 Core exports validateAccessibility with Playwright orchestration
- [ ] #5 Core exports analyzeForGoogle with Google-specific extraction
- [ ] #6 Core exports analyzeScreenReaderExperience with full analysis
- [ ] #7 Structure command uses core parseHTML instead of direct linkedom import
- [ ] #8 CLI commands are thin wrappers over core functions
- [ ] #9 TUI never imports types from third-party validation libraries
- [ ] #10 All third-party types re-exported from core where needed
- [ ] #11 TypeScript compiles without errors
- [ ] #12 Linting passes
- [ ] #13 Code is formatted with prettier
- [ ] #14 No behavioral changes or regressions
- [ ] #15 All JSDoc comments updated for consistency
<!-- AC:END -->
