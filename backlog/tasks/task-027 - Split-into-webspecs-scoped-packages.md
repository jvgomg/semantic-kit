---
id: TASK-027
title: Split into @webspecs/* scoped packages
status: To Do
assignee: []
created_date: '2026-02-15 21:58'
updated_date: '2026-02-15 22:22'
labels:
  - npm
  - architecture
milestone: v1.0 release
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Split the `@webspecs/cli` package into separate scoped packages for better modularity and smaller install sizes.

## Background
The `@webspecs` npm organization is already created. Current state:
- `@webspecs/cli` - reserved (placeholder published)
- `@jvgomg/webspecs` - personal scope fallback (placeholder published)

## Target Structure
```
@webspecs/core  - Core command logic, programmatic API, types
@webspecs/cli   - CLI interface (depends on core) [already reserved]
@webspecs/tui   - TUI interface (depends on core)
```

Note: An unscoped `webspecs` package is not possible (blocked by npm due to similarity to `web-specs`).

## Benefits
- Users who only need CLI don't install TUI dependencies
- Programmatic users can import just `@webspecs/core`
- Clearer separation of concerns
- Smaller install footprint for targeted use cases

## Implementation Considerations
- Convert to monorepo with workspaces (already have workspace setup for test-server)
- Shared build configuration
- Coordinated versioning (independent or lockstep?)
- Cross-package testing

## Questions to Resolve
- Independent versioning or same version across all packages?
- How to handle shared dependencies?
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 @webspecs/core published and importable
- [ ] #2 @webspecs/cli works standalone without TUI deps
- [ ] #3 @webspecs/tui works with full TUI experience
- [ ] #4 Each package has appropriate dependencies (not over-bundled)
<!-- AC:END -->
