---
id: TASK-049
title: Move runner functions from CLI to Core to remove TUI→CLI dependency
status: Done
assignee: []
created_date: '2026-02-17 13:07'
updated_date: '2026-02-17 15:29'
labels:
  - refactor
  - architecture
dependencies: []
references:
  - packages/core/src/index.ts
  - packages/core/src/results.ts
  - packages/tui/package.json
  - packages/cli/src/commands/
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The TUI package currently imports ~20 runner functions and several types from the CLI package, creating a TUI→CLI→Core dependency chain. This is architecturally incorrect: TUI and CLI should both be downstream consumers of Core, with no dependency between them.

## Background

The "runner" functions are thin orchestrators that call Core analysis functions in sequence and return typed results. They have no CLI-specific logic (no Commander, no terminal formatting). They belong in Core.

## Types currently in CLI that TUI needs (not yet in Core):
- `SocialResult`, `SocialTagGroup` (social/types.ts)
- `ReadabilityCompareResult`, `SectionInfo`, `ReadabilityComparison` (readability/types.ts)
- `TuiStructureResult` (structure/types.ts)
- `StructureJsInternalResult` (structure/types.ts)
- `StructureCompareRunnerResult` = `{ comparison: StructureComparison; timedOut: boolean }` (structure/types.ts, note: named differently from core's existing `StructureCompareResult = StructureComparison`)

## Runner functions to move to Core (20 functions):
fetchAi, fetchA11y, fetchA11yJs, fetchA11yCompare, fetchGoogle, fetchReader, fetchReadability, fetchReadabilityJs, fetchReadabilityCompare, fetchSchema, fetchSchemaJs, fetchSchemaCompare, fetchSocial, fetchScreenReader, fetchStructure, fetchStructureJs, fetchStructureCompare, runAxeAnalysis, fetchValidateHtml, fetchSchemaValidation

## Note on schema runners:
The schema runners (runner.ts, runner-js.ts, runner-compare.ts in CLI) have significant logic duplication (groupMetatags, filterIssuesByPrefix, buildSchemaResult helpers). This should be consolidated when moving to Core.

## Target architecture:
```
TUI → Core
CLI → Core
```
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 TUI package has no dependency on @webspecs/cli in package.json
- [x] #2 All runner functions are exported from @webspecs/core
- [x] #3 All result types used by TUI are exported from @webspecs/core
- [x] #4 TUI view files import from @webspecs/core only (not @webspecs/cli)
- [x] #5 CLI continues to work (commands still function correctly)
- [ ] #6 bun run typecheck passes with no errors
- [ ] #7 Schema runner logic duplication is consolidated in Core
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
## Summary

Moved all 20 runner functions and associated result types from `@webspecs/cli` into `@webspecs/core`, eliminating the TUI→CLI dependency.

### Changes made

**`packages/core/src/results.ts`** — Added result types previously only in CLI:
- `SocialTagGroup`, `SocialResult`
- `SectionInfo`, `ReadabilityComparison`, `ReadabilityCompareResult`
- `TuiStructureResult`, `StructureJsInternalResult`, `StructureCompareRunnerResult`

**`packages/core/src/runners.ts`** — New file with all 20 runner functions consolidated from CLI commands. Also consolidated duplicated schema helper logic (`buildSchemaResult`, `groupMetatagsInternal`, `filterIssuesByPrefix`) that was previously spread across 3 CLI runner files.

**`packages/core/src/index.ts`** — Exported all new types and runner functions.

**`packages/core/tsconfig.json`** — Added `rootDir: "./src"` and removed `build.ts`/`package.json` from `include` so TypeScript project references resolve declarations correctly at `dist/` (not `dist/src/`).

**`packages/core/tsconfig.build.json`** — Added `rootDir: "./src"` so the build emits declarations to `dist/` root.

**20 TUI view/component files** — Updated imports from `@webspecs/cli/commands/*` to `@webspecs/core`.

**`packages/tui/package.json`** — Removed `@webspecs/cli` dependency.

**20 CLI runner files** — Now re-export from `@webspecs/core` (thin re-export wrappers for backward compatibility within CLI).

**`packages/tui/src/test-setup.ts`** — Fixed pre-existing TS4111 error (dot notation → bracket notation).

### Result

`bun run typecheck` passes across all 6 packages with zero errors. Dependency graph is now:
- TUI → Core ✓
- CLI → Core ✓
- TUI ↛ CLI ✓
<!-- SECTION:FINAL_SUMMARY:END -->
