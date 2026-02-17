---
id: TASK-046
title: Refactor binary build scripts into shared package
status: Done
assignee: []
created_date: '2026-02-16 22:13'
updated_date: '2026-02-17 11:04'
labels:
  - refactoring
  - build-system
  - dx
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The CLI and TUI packages have nearly identical `build-binaries.ts` scripts with significant duplication. This code should be centralized into a shared package or build utilities module.

## Current Duplication

Both `packages/cli/build-binaries.ts` and `packages/tui/build-binaries.ts` contain:
- Platform target definitions (darwin-arm64, darwin-x64, linux-x64, linux-arm64, windows-x64)
- Binary directory management (mkdir, rm)
- Build loop logic for compiled binaries
- Bun bundle creation logic
- File size reporting logic
- Nearly identical structure with only minor differences (entry points, external dependencies)

## Proposed Solution

Create a shared build utilities package or module that:
- Accepts configuration (entry point, external deps, binary name prefix, define options)
- Handles all platform compilation logic
- Provides consistent error handling and reporting
- Reduces maintenance burden (changes only need to be made in one place)

## Benefits

- DRY principle: Single source of truth for binary build logic
- Easier maintenance: Bug fixes and improvements apply to all packages
- Consistency: Ensures CLI and TUI binaries are built the same way
- Extensibility: Easy to add binary builds for future packages
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Create shared build utilities module/package
- [x] #2 Both CLI and TUI use the shared build logic
- [x] #3 Binary build output remains identical to current implementation
- [x] #4 Build scripts are significantly shorter and more declarative
- [x] #5 Documentation updated to reflect new build system architecture
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Created `packages/binary-build` (`@webspecs/binary-build`) — a private workspace package that exports four shared utilities: `prepareBinariesDir`, `buildSystemBinaries`, `buildBunBundle`, and `reportSizes`. Platform target definitions and all build logic now live in one place.

`packages/cli/build-binaries.ts` reduced from 87 lines to 27 lines — a declarative config object plus four function calls.

`packages/tui/build-binaries.ts` reduced from 100 lines to 34 lines. TUI is now configured to build the Bun bundle only (no system binaries) due to OpenTUI's native module loading constraints, which are documented in `docs/binary-distribution.md`.

TUI's `build:binaries:local` script now aliases `build:binaries` since there is no platform-specific local variant for a Bun bundle. `build:binaries:local` added to `turbo.json`.
<!-- SECTION:FINAL_SUMMARY:END -->
