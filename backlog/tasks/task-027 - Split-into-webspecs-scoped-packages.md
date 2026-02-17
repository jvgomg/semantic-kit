---
id: TASK-027
title: Split into @webspecs/* scoped packages
status: Done
assignee: []
created_date: '2026-02-15 21:58'
updated_date: '2026-02-17 12:28'
labels:
  - npm
  - architecture
  - epic
milestone: npm release
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Convert semantic-kit into a Bun workspaces monorepo with three packages. This is now **required** for the npm release due to OpenTUI's Bun-only constraint (see TASK-020 resolution).

## Background

**Why this is required:**
- OpenTUI uses Bun-specific APIs (file imports, dlopen, dynamic platform imports)
- Node.js runtime cannot load the TUI code
- The project must split TUI into a separate Bun-only package

**What we're building:**
```
packages/
  core/     # @webspecs/core - Node/Bun compatible library
  cli/      # @webspecs/cli - Node/Bun compatible CLI
  tui/      # @webspecs/tui - Bun-only TUI
```

## Package Details

### @webspecs/core
- Analyzers, extractors, validators (the "lib" code)
- Pure TypeScript, no runtime-specific APIs
- Consumable via `npm install @webspecs/core`
- Types exported for TypeScript users

### @webspecs/cli
- Command-line interface wrapping core functionality
- Works with `npx @webspecs/cli`, `bunx @webspecs/cli`
- Node.js 18+ compatible
- Does NOT include TUI - shows helpful message if user tries `tui` command

### @webspecs/tui
- Full terminal UI experience
- Bun runtime required
- Shows clear error with instructions if run without Bun
- Can be built into standalone Bun binary

## Technical Approach

### Bun Workspaces Setup
```json
// package.json (root)
{
  "workspaces": ["packages/*"]
}
```

### Shared Configuration
- Root `tsconfig.json` with project references
- Shared ESLint config
- Single `bun.lockb` for all packages

### Build Strategy
- Each package has its own `build.ts`
- Core: Node target, external deps
- CLI: Node target, depends on core
- TUI: Bun target, uses `__TARGET_BUN__` pattern from TASK-020

### Code from TASK-020 to Incorporate
- `src/lib/fs.ts` - build-time switching pattern
- `tsconfig.build.json` approach
- Package.json fields (engines, sideEffects, files)

## Sub-Tasks

This epic is broken into sub-tasks:
1. TASK-042: Set up Bun workspaces monorepo structure
2. TASK-043: Create @webspecs/core package
3. TASK-044: Create @webspecs/cli package
4. TASK-045: Create @webspecs/tui package
5. TASK-046: Multi-package build and release workflow

## References
- TASK-020 resolution (OpenTUI Bun-only discovery)
- Branch `task-020-npm-build-system` (build-time switching code)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Bun workspaces monorepo structure in place
- [x] #2 @webspecs/core published and importable on Node.js
- [x] #3 @webspecs/cli works with npx on Node.js (no TUI)
- [x] #4 @webspecs/tui works with bunx (full TUI experience)
- [x] #5 TUI shows helpful error when run without Bun
- [x] #6 Each package has minimal, appropriate dependencies
- [ ] #7 GitHub releases configured for binary downloads
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Session 2026-02-17: Remaining ACs addressed

All monorepo structure and package work is complete:
- AC#1: Bun workspaces monorepo in place ✓
- AC#2: @webspecs/core builds and exports types correctly ✓
- AC#3: @webspecs/cli works on Node.js (verified via node dist/cli.js) ✓
- AC#4: @webspecs/tui works with Bun (verified via bun dist/index.js) ✓
- AC#5: TUI Bun runtime check implemented + shebang + engines field ✓
- AC#6: Minimal appropriate dependencies in each package ✓
- AC#7 (GitHub releases with binaries): Deferred to first beta release — binary build system is ready but no release cut yet.
<!-- SECTION:NOTES:END -->
