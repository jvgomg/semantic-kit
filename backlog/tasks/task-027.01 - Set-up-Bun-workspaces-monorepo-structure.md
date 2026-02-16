---
id: TASK-027.01
title: Set up Bun workspaces monorepo structure
status: To Do
assignee: []
created_date: '2026-02-16 16:02'
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
- [ ] #1 Root package.json has workspaces config
- [ ] #2 packages/ directory created with core, cli, tui subdirs
- [ ] #3 bun install works from root
- [ ] #4 tsconfig project references configured
- [ ] #5 Existing test-server and integration-tests still work
<!-- AC:END -->
