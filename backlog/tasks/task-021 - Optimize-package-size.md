---
id: TASK-021
title: Optimize package size
status: To Do
assignee: []
created_date: '2026-02-15 21:37'
updated_date: '2026-02-16 16:04'
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
- [ ] #1 All dependencies properly externalized in build.ts
- [ ] #2 Source maps excluded from npm package
- [ ] #3 cli.js bundle under 500KB (ideally under 300KB)
- [ ] #4 highlight.js bloat resolved
- [ ] #5 `npm pack --dry-run` shows reasonable package size
- [ ] #6 No secrets or sensitive files in published package
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Update: Monorepo Context

This task should be addressed after TASK-027 (monorepo restructure) is complete. The split into core/cli/tui packages naturally solves some size issues by separating TUI dependencies.

Primary remaining concern is highlight.js in the CLI package.
<!-- SECTION:NOTES:END -->
