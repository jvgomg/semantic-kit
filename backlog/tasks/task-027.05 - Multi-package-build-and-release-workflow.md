---
id: TASK-027.05
title: Multi-package build and release workflow
status: To Do
assignee: []
created_date: '2026-02-16 16:04'
labels:
  - npm
  - workflow
milestone: npm release
dependencies:
  - TASK-027.03
  - TASK-027.04
parent_task_id: TASK-027
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Set up coordinated build and release workflow for the @webspecs monorepo.

## Build Workflow

### Root Scripts
```json
{
  "scripts": {
    "build": "bun run --filter '*' build",
    "build:core": "bun run --cwd packages/core build",
    "build:cli": "bun run --cwd packages/cli build", 
    "build:tui": "bun run --cwd packages/tui build",
    "build:binaries": "bun run build-binaries.ts",
    "typecheck": "bun run --filter '*' typecheck",
    "test": "bun run test:unit && bun run test:integration",
    "test:unit": "bun run --filter '*' test",
    "test:integration": "bun test integration-tests/",
    "clean": "rm -rf packages/*/dist"
  }
}
```

### Build Order
Dependencies must build in order:
1. `@webspecs/core` (no internal deps)
2. `@webspecs/cli` (depends on core)
3. `@webspecs/tui` (depends on core)

Bun workspaces handle this automatically with `--filter`.

## Release Workflow

### Versioning Strategy
- **Lockstep versioning**: All packages share the same version
- Simplifies coordination and communication
- Version in root package.json, sync to all packages

### Release Script (scripts/release.ts)
```typescript
// 1. Bump version in all package.json files
// 2. Update CHANGELOG.md
// 3. Build all packages
// 4. Run tests
// 5. Git commit and tag
// 6. Publish to npm (core, then cli, then tui)
// 7. Build binaries
// 8. Create GitHub release with binaries
```

### npm Publishing Order
Must publish in dependency order:
1. `npm publish packages/core`
2. `npm publish packages/cli`
3. `npm publish packages/tui`

### GitHub Releases
- Create release for each version
- Attach binary downloads:
  - `webspecs-cli-darwin-arm64`
  - `webspecs-cli-darwin-x64`
  - `webspecs-cli-linux-x64`
  - `webspecs-tui-darwin-arm64`
  - `webspecs-tui-darwin-x64`
  - `webspecs-tui-linux-x64`

## CI/CD Considerations (Future)
- GitHub Actions workflow for releases
- Matrix build for cross-platform binaries
- npm provenance (--provenance flag)
- Automated changelog from conventional commits

## Integration Tests
- Tests at root level exercise the full stack
- Test that published packages work together:
  ```bash
  npm install @webspecs/core @webspecs/cli
  npx webspecs ai https://example.com
  ```
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 bun run build builds all packages in correct order
- [ ] #2 bun run test runs all tests
- [ ] #3 Release script bumps versions in all packages
- [ ] #4 npm publish works for all packages
- [ ] #5 GitHub release created with changelog and binaries
- [ ] #6 Integration tests pass with published packages
<!-- AC:END -->
