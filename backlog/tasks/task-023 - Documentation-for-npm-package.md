---
id: TASK-023
title: Documentation for npm package
status: Done
assignee: []
created_date: '2026-02-15 21:37'
updated_date: '2026-02-17 12:36'
labels:
  - docs
milestone: npm release
dependencies: []
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Update documentation for the 3 published npm packages (`@webspecs/core`, `@webspecs/cli`, `@webspecs/tui`).

The project uses 4 README files with different audiences:
- **Root `README.md`** — GitHub-facing. The project homepage. Covers all 3 packages, the overall concept, and developer contribution info.
- **`packages/core/README.md`** — npm-facing. Programmatic API docs for `@webspecs/core`.
- **`packages/cli/README.md`** — npm-facing. CLI install and usage docs for `@webspecs/cli`.
- **`packages/tui/README.md`** — npm-facing. TUI install and usage docs for `@webspecs/tui`. Already largely written.

## Current State

- Root README exists but has stale references to old package name `semantic-kit` (install commands, `import from 'semantic-kit'`). No badges. Needs a package ecosystem overview section.
- `packages/tui/README.md` exists with good content. Missing npm badge.
- `packages/core/README.md` does not exist.
- `packages/cli/README.md` does not exist.

## Root README Updates

- Fix stale `semantic-kit` → `@webspecs/cli` install commands
- Fix programmatic API import from `'semantic-kit'` → `'@webspecs/core'`
- Add npm badges for all 3 packages
- Add a package ecosystem section explaining how the 3 packages relate (core → cli → tui)
- Remove or update the "Work in progress" notice

## @webspecs/core README

Create `packages/core/README.md`:
- One-liner description
- npm badge
- Installation instructions
- Programmatic usage: TypeScript import examples
- Overview of what's exported (analyzers, extractors, validators, result types)
- Related packages section

## @webspecs/cli README

Create `packages/cli/README.md`:
- One-liner description
- npm badge
- Installation (`npm install -g @webspecs/cli`) and npx usage
- Command reference table (Lenses and Utilities)
- Node.js compatibility note (≥18)
- Related packages section

## @webspecs/tui README

Update `packages/tui/README.md`:
- Add npm version badge (currently missing)

## Package.json Updates

Add `keywords` to all 3 published packages. Suggested per-package additions:

**@webspecs/core:**
```json
"keywords": ["seo", "accessibility", "a11y", "schema", "structured-data", "json-ld", "open-graph", "readability", "screen-reader", "wcag", "html-validation", "programmatic", "api", "typescript"]
```

**@webspecs/cli:**
```json
"keywords": ["seo", "accessibility", "a11y", "schema", "structured-data", "json-ld", "open-graph", "readability", "screen-reader", "wcag", "html-validation", "cli", "command-line"]
```

**@webspecs/tui:**
```json
"keywords": ["seo", "accessibility", "a11y", "schema", "structured-data", "json-ld", "open-graph", "readability", "screen-reader", "wcag", "html-validation", "tui", "terminal", "interactive", "bun"]
```

Also add `engines` field to `@webspecs/tui` package.json (currently missing):
```json
"engines": { "bun": ">=1.0.0" }
```
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Root README: install commands reference @webspecs/cli (not semantic-kit)
- [x] #2 Root README: programmatic API imports from @webspecs/core (not semantic-kit)
- [x] #3 Root README: npm badges for all 3 packages
- [x] #4 Root README: package ecosystem section explains how core, cli, and tui relate
- [x] #5 packages/core/README.md created with installation and TypeScript import examples
- [x] #6 packages/core/README.md has npm badge and related packages section
- [x] #7 packages/cli/README.md created with installation, npx usage, and command reference
- [x] #8 packages/cli/README.md has npm badge and related packages section
- [x] #9 packages/tui/README.md has npm badge added
- [x] #10 keywords added to @webspecs/core package.json
- [x] #11 keywords added to @webspecs/cli package.json
- [x] #12 keywords added to @webspecs/tui package.json
- [x] #13 engines field (bun >=1.0.0) added to @webspecs/tui package.json
<!-- AC:END -->
