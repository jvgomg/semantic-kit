---
id: TASK-026
title: Rename package to @webspecs/cli
status: To Do
assignee: []
created_date: '2026-02-15 21:58'
updated_date: '2026-02-15 22:22'
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
