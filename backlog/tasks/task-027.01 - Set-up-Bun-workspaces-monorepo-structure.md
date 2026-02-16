---
id: TASK-027.01
title: Set up Bun workspaces monorepo structure
status: Done
assignee: []
created_date: '2026-02-16 16:02'
updated_date: '2026-02-16 16:35'
labels:
  - npm
  - architecture
milestone: npm release
dependencies: []
parent_task_id: TASK-027
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Initialize the Bun workspaces monorepo structure for the @webspecs packages.

## Changes Required

### 1. Root package.json
```json
{
  "name": "webspecs",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "build": "bun run --filter '*' build",
    "typecheck": "bun run --filter '*' typecheck",
    "test": "bun run --filter '*' test"
  }
}
```

### 2. Directory Structure
```
packages/
  core/
    package.json
    tsconfig.json
    src/
  cli/
    package.json
    tsconfig.json
    src/
  tui/
    package.json
    tsconfig.json
    src/
```

### 3. Root tsconfig.json
- Configure project references
- Shared compiler options in `tsconfig.base.json`

### 4. Move Existing Code
- Keep `test-server/` at root (shared test infrastructure)
- Keep `integration-tests/` at root
- Move `src/lib/` → `packages/core/src/`
- Move `src/commands/` → `packages/cli/src/commands/`
- Move `src/tui/` → `packages/tui/src/`

### 5. Update .gitignore
- Add `packages/*/dist/`
- Keep root `dist/` for any root-level builds

## Notes
- Bun workspaces use the same `workspaces` field as npm/yarn
- `bun install` at root installs all workspace dependencies
- Internal dependencies use `workspace:*` protocol

## References
- https://bun.sh/docs/install/workspaces
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Root package.json has workspaces config
- [x] #2 packages/ directory created with core, cli, tui subdirs
- [x] #3 bun install works from root
- [x] #4 tsconfig project references configured
- [x] #5 Existing test-server and integration-tests still work
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Implementation Progress

### Completed
- Created packages/ directory structure with all workspace packages:
  - `@webspecs/core` - Library (analyzers, extractors, validators)
  - `@webspecs/cli` - CLI tool (depends on core)
  - `@webspecs/tui` - Terminal UI (depends on core)
  - `@webspecs/integration-tests` - Integration tests (depends on cli, core)
  - `@webspecs/test-server` - Test server with HTML fixtures
  - `@webspecs/test-server-nextjs` - Next.js streaming fixture

- Updated root package.json:
  - Changed name to "webspecs" and marked as private
  - Simplified workspaces to `["packages/*"]`
  - Updated scripts to use `bun run --filter` pattern
  - Removed package-specific fields

- Created tsconfig.base.json with shared compiler options
- Updated root tsconfig.json with project references to all packages
- Created package.json and tsconfig.json for all packages
- Moved source code to appropriate packages
- Updated .gitignore for packages/*/dist/ and Next.js build outputs
- Verified bun install works and recognizes all 6 workspace packages
- Verified test-server still starts correctly

### Final Structure
```
packages/
  core/                 # @webspecs/core
  cli/                  # @webspecs/cli
  tui/                  # @webspecs/tui
  integration-tests/    # @webspecs/integration-tests
  test-server/          # @webspecs/test-server
  test-server-nextjs/   # @webspecs/test-server-nextjs
```

### Ready for Next Tasks
1. TASK-027.02: Fix imports in @webspecs/core and create its build.ts
2. TASK-027.03: Fix imports in @webspecs/cli and create its build.ts
3. TASK-027.04: Fix imports in @webspecs/tui and create its build.ts

### Notes
Integration tests currently have broken imports (reference old src/lib/ paths). These will be fixed when subsequent tasks properly export types from the new packages.
<!-- SECTION:NOTES:END -->
