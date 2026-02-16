# Semantic Versioning Guide

How to determine the correct version bump type (major, minor, patch) for changesets in this monorepo.

## Quick Reference

| Type | When to Use | Version Change | Example |
|------|-------------|----------------|---------|
| **patch** | Bug fixes, docs, internal refactors | 0.0.X | 1.0.0 → 1.0.1 |
| **minor** | New features, backward-compatible changes | 0.X.0 | 1.0.0 → 1.1.0 |
| **major** | Breaking changes, API changes | X.0.0 | 1.0.0 → 2.0.0 |

## Rules for This Monorepo

### @webspecs/core

**Major (breaking changes)**:
- Removing or renaming exported functions/classes
- Changing function signatures (parameters, return types)
- Removing or renaming public properties
- Changing error behavior in breaking ways

**Minor (new features)**:
- Adding new exported functions/classes
- Adding optional parameters to existing functions
- Adding new properties to return types
- New analyzers, extractors, or validators

**Patch (fixes)**:
- Bug fixes that don't change API
- Documentation updates
- Internal refactors with no external impact
- Dependency updates (non-breaking)

### @webspecs/cli

**Major (breaking changes)**:
- Removing commands
- Changing command behavior in incompatible ways
- Removing or renaming CLI flags
- Changing default behavior
- Changing output format in breaking ways

**Minor (new features)**:
- Adding new commands
- Adding new CLI flags
- New output formats (when old format still available)
- Enhancing existing commands without breaking changes

**Patch (fixes)**:
- Bug fixes
- Improving error messages
- Documentation updates
- Internal refactors

### @webspecs/tui

**Major (breaking changes)**:
- Removing UI features
- Changing keyboard shortcuts (unless old ones still work)
- Removing configuration options

**Minor (new features)**:
- New UI features
- New keyboard shortcuts
- New configuration options
- UI improvements

**Patch (fixes)**:
- Bug fixes
- UI polish
- Performance improvements
- Documentation updates

## Multiple Packages

When a change affects multiple packages, create a changeset with appropriate bump types for each:

```bash
# Core gets minor (new feature), CLI gets patch (uses new feature)
node scripts/create-changeset.js "@webspecs/core:minor,@webspecs/cli:patch" "Add new analyzer"
```

## Pre-1.0 Considerations

**Important**: All packages are currently pre-1.0 (0.0.X). During pre-1.0:

- Breaking changes can use **minor** instead of major
- New features can use **patch** instead of minor
- However, for clarity, still follow the standard semver rules

Once packages reach 1.0.0, strictly follow standard semver.

## Research Integration

When a changeset is based on research, include research references in the summary:

```markdown
---
"@webspecs/core": minor
---

Add streaming SSR detection

Research: [[streaming-ssr]], research-v0.5.0

Implements detection of streaming SSR patterns based on documented research.
```

## Common Scenarios

### Scenario: Adding a new command
- **@webspecs/cli**: minor (new feature)

### Scenario: Fixing a bug in core analyzer
- **@webspecs/core**: patch (bug fix)
- **@webspecs/cli**: No changeset needed (uses fixed version automatically)

### Scenario: Breaking API change in core
- **@webspecs/core**: major (breaking change)
- **@webspecs/cli**: major (breaks consumers using old API)
- **@webspecs/tui**: major (if TUI uses the changed API)

### Scenario: Internal refactor with no external changes
- No changeset needed (unless it's significant enough to document)

### Scenario: Dependency update
- Usually no changeset needed
- If it fixes a bug: patch
- If it adds functionality: minor
- If it requires changes: major
