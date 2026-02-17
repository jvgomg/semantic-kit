---
id: TASK-021
title: Optimize package size
status: Done
assignee: []
created_date: '2026-02-15 21:37'
updated_date: '2026-02-17 12:13'
labels:
  - build
  - performance
milestone: npm release
dependencies:
  - TASK-027
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Reduce the npm package size by fixing bundling issues and optimizing dependencies.

**Note:** This task now applies to the monorepo structure (TASK-027). Each package should be optimized individually.

## Current State (Pre-Monorepo)
- `dist/cli.js` is 3.6MB (100,332 lines)
- `dist/cli.js.map` is 5.8MB (should not be published)
- Many dependencies are bundled when they should be external

## How Monorepo Helps
The split into three packages naturally addresses some concerns:
- TUI-specific deps (OpenTUI, Jotai) only in `@webspecs/tui`
- CLI can be much smaller without TUI code
- Core is just the library code

## Per-Package Optimization

### @webspecs/core
- Should be smallest - just analyzers/extractors
- All deps external
- Target: < 100KB bundled

### @webspecs/cli
- Depends on core + CLI utilities
- highlight.js still a concern (emphasize for fetch command)
- Target: < 300KB bundled (excluding deps)

### @webspecs/tui
- Larger due to TUI framework
- OpenTUI deps are expected
- Target: Reasonable for TUI app

## Remaining Concerns
- **highlight.js bloat**: Still relevant for CLI's fetch command
  - Consider lazy-loading or removing syntax highlighting
  - Or use a lighter alternative

## Security Audit
Before publishing each package:
- No `.env` files
- No API keys or credentials
- Run `npm pack --dry-run` for each package
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 All dependencies properly externalized in build.ts
- [x] #2 Source maps excluded from npm package
- [x] #3 cli.js bundle under 500KB (ideally under 300KB)
- [x] #4 highlight.js bloat resolved
- [x] #5 `npm pack --dry-run` shows reasonable package size
- [x] #6 No secrets or sensitive files in published package
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
## Implementation Plan

### Context
The monorepo is already implemented (packages/core, cli, tui all exist). The main outstanding issues are:
- Source maps being published in npm packages
- emphasize/highlight.js as a hard CLI dependency

### Current State (Post-Monorepo)
- cli.js: 13KB ✅ (AC #3 met)
- core/index.js: 72KB ✅ (under 100KB target)
- tui/index.js: 84KB ✅
- All deps properly external in build.ts ✅ (AC #1 met)

### Steps

1. **Add .npmignore to packages/core, packages/cli, packages/tui**
   - Exclude *.map files (source maps have TypeScript source, shouldn't be published)
   - Exclude tsconfig.build.tsbuildinfo
   - Exclude *.d.ts.map files

2. **Remove emphasize from CLI** (user preference: remove syntax highlighting)
   - Update packages/cli/src/commands/fetch/formatters.ts - remove import, return plain HTML
   - Update packages/cli/src/commands/fetch/command.ts - remove emphasize import/usage
   - Remove emphasize from packages/cli/package.json dependencies
   - Remove emphasize from packages/cli/build.ts external list

3. **Run npm pack --dry-run** for each package to verify output

4. **Verify no secrets** in published packages

5. **Mark acceptance criteria** as complete in task
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Update: Monorepo Context

This task should be addressed after TASK-027 (monorepo restructure) is complete. The split into core/cli/tui packages naturally solves some size issues by separating TUI dependencies.

Primary remaining concern is highlight.js in the CLI package.

## Implementation Results (2026-02-17)

All acceptance criteria now met. Key changes:

### AC #1 - Dependencies externalized
Already complete pre-task: all packages had proper external lists in build.ts.

### AC #2 - Source maps excluded
Updated `files` field in all three package.json files from `["dist", "README.md"]` to `["dist/**/*.js", "dist/**/*.d.ts", "README.md"]`. This explicitly excludes `.js.map`, `.d.ts.map`, and `tsconfig.build.tsbuildinfo` files from published packages.

Note: .npmignore was tried first but does not override directories listed in `files` field.

### AC #3 - Bundle sizes
- `dist/cli.js`: 13KB ✅ (well under 300KB target)
- `dist/core/index.js`: 72KB ✅ (under 100KB target)
- `dist/tui/index.js`: 84KB ✅

### AC #4 - highlight.js resolved
Removed `emphasize` (which depended on highlight.js ~8.9MB) from @webspecs/cli entirely:
- `packages/cli/src/commands/fetch/formatters.ts`: removed emphasize import, output plain HTML
- `packages/cli/src/commands/fetch/command.ts`: removed emphasize import and usage
- `packages/cli/package.json`: removed from dependencies
- `packages/cli/build.ts`: removed from externals
- `packages/tui/build.ts`: removed from externals (was leftover transitive ref)

### AC #5 - npm pack --dry-run results
- @webspecs/core: 36.7 kB (compressed) / 205.8 kB (unpacked) / 54 files
- @webspecs/cli: 67.6 kB (compressed) / 313.9 kB (unpacked) / 382 files
- @webspecs/tui: 60.1 kB (compressed) / 311.1 kB (unpacked) / 249 files

### AC #6 - No secrets
No .env files, credentials, or sensitive files found in any package.
<!-- SECTION:NOTES:END -->
