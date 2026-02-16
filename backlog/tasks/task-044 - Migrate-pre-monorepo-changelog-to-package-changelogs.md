---
id: TASK-044
title: Migrate pre-monorepo changelog to package changelogs
status: To Do
assignee: []
created_date: '2026-02-16 21:39'
labels:
  - documentation
  - cleanup
milestone: v1.0 release
dependencies: []
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Distribute the historical changelog entries from `CHANGELOG-pre-monorepo.md` into the appropriate package changelogs to preserve development history.

## Current State

The pre-monorepo changelog (`CHANGELOG-pre-monorepo.md`) contains all development history from v0.0.1 to v0.0.17, but these entries aren't in the package-specific changelogs.

Current package changelogs just say "Unreleased" with a note pointing to the archived file.

## Goal

Distribute the historical entries to the appropriate packages:
- **Most entries** → `packages/cli/CHANGELOG.md` (commands, features, CLI changes)
- **Core logic entries** → `packages/core/CHANGELOG.md` (extractors, analyzers, validators)
- **TUI-related entries** → `packages/tui/CHANGELOG.md` (if any exist)

This preserves the complete feature development history in the right places.

## Approach

1. Read through each changelog entry in `CHANGELOG-pre-monorepo.md`
2. Determine which package(s) it belongs to based on:
   - Commands mentioned (cli)
   - Core functionality (core)
   - TUI features (tui)
   - Some entries may apply to multiple packages
3. Copy entries to appropriate package changelogs under "Pre-release Development" section
4. Keep entries in chronological order
5. Preserve research references and all details

## Format in Package Changelogs

```markdown
# @webspecs/cli

## Unreleased

## Pre-release Development

These changes occurred before the monorepo restructure and npm publishing.
**Note**: These versions were never published to npm.

### [0.0.17] - 2026-02-12

- **BREAKING**: `social` command result type restructured
...

### [0.0.16] - 2026-01-30
...
```

## Benefits

- Preserves complete feature development history
- Shows when features were added and why
- Keeps research version references
- Provides context for breaking changes
- Package changelogs show complete evolution

## After Migration

Delete or archive `CHANGELOG-pre-monorepo.md` as it will be redundant.
<!-- SECTION:DESCRIPTION:END -->
