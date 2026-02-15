---
id: TASK-027
title: Split into @webspecs/* scoped packages
status: To Do
assignee: []
created_date: '2026-02-15 21:58'
labels:
  - npm
  - architecture
milestone: v1.0 release
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Split the monolithic `webspecs` package into scoped packages for better modularity and smaller install sizes.

## Target Structure
```
@webspecs/core  - Core command logic, programmatic API, types
@webspecs/cli   - CLI interface (depends on core)
@webspecs/tui   - TUI interface (depends on core)
webspecs        - Convenience package (alias for full experience, likely @webspecs/tui)
```

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
- Should `webspecs` be an alias for `@webspecs/tui` or a meta-package that depends on all?
- Independent versioning or same version across all packages?
- How to handle shared dependencies?
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 @webspecs/core published and importable
- [ ] #2 @webspecs/cli works standalone without TUI deps
- [ ] #3 @webspecs/tui works with full TUI experience
- [ ] #4 webspecs package provides convenient full install
- [ ] #5 Each package has appropriate dependencies (not over-bundled)
<!-- AC:END -->
