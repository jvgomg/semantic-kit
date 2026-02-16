---
id: TASK-026
title: Rename package to @webspecs/cli
status: Done
assignee: []
created_date: '2026-02-15 21:58'
updated_date: '2026-02-16 16:04'
labels:
  - npm
  - breaking
milestone: npm release
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Rename the package from `semantic-kit` to `@webspecs/cli` before the first npm publish.

## Background
The unscoped `webspecs` name is blocked by npm (too similar to existing `web-specs` package). We've secured:
- `@webspecs/cli` - primary package name ✓ (placeholder published)
- `@jvgomg/webspecs` - personal scope fallback ✓ (placeholder published)
- `@webspecs` npm organization ✓ (created)

## Changes Required
1. **package.json** - Update `name` field to `@webspecs/cli`
2. **Repository** - Consider renaming GitHub repo (optional, can redirect)
3. **Documentation** - Update README, CHANGELOG references
4. **CLI name** - Update commander `.name('webspecs')` (keep CLI name simple)
5. **Internal references** - Search codebase for "semantic-kit" strings

## User Experience After Rename
```bash
npx @webspecs/cli ai https://example.com
npx @webspecs/cli tui
npm install @webspecs/cli
```

## Notes
- Placeholder `@webspecs/cli@0.0.0` already published to reserve name
- The unscoped `webspecs` command isn't possible due to npm restrictions
- Future packages: `@webspecs/core`, `@webspecs/tui` (v1.0 milestone)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 package.json name is '@webspecs/cli'
- [ ] #2 CLI shows 'webspecs' in help output
- [ ] #3 README updated with new name and install instructions
- [ ] #4 No remaining 'semantic-kit' references in user-facing strings
- [ ] #5 Placeholder version 0.0.0 replaced with real release
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Superseded by TASK-027

This task has been superseded by the monorepo restructure (TASK-027).

The rename to `@webspecs/cli` will happen as part of creating the CLI package in TASK-027.03.

### What Carries Forward
- The `@webspecs` npm organization is already created
- Placeholder packages are published to reserve names
- CLI will be named `webspecs` (the binary command)

### Changes from Original Plan
- Instead of renaming the single package, we're splitting into three packages
- `@webspecs/cli` is one of three packages, not a rename of the monolith
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Superseded by TASK-027 (monorepo restructure). The @webspecs/cli package will be created as part of the split rather than a rename. The npm organization and placeholder packages are already in place.
<!-- SECTION:FINAL_SUMMARY:END -->
