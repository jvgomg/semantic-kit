---
id: TASK-026
title: Rename package to webspecs
status: To Do
assignee: []
created_date: '2026-02-15 21:58'
labels:
  - npm
  - breaking
milestone: npm release
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Rename the package from `semantic-kit` to `webspecs` before the first npm publish.

## Changes Required
1. **package.json** - Update `name` field to `webspecs`
2. **Repository** - Consider renaming GitHub repo (optional, can redirect)
3. **npm organization** - Create `webspecs` org on npm (needed for future @webspecs/* packages)
4. **Documentation** - Update README, CHANGELOG references
5. **CLI name** - Update commander `.name('webspecs')`
6. **Internal references** - Search codebase for "semantic-kit" strings

## User Experience After Rename
```bash
npx webspecs ai https://example.com
npx webspecs tui
npm install webspecs
```

## Notes
- Do this BEFORE first npm publish to avoid confusion
- The @webspecs/* scoped packages will come later (v1.0)
- Reserve the npm org now even if not using scoped packages yet
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 package.json name is 'webspecs'
- [ ] #2 CLI shows 'webspecs' in help output
- [ ] #3 npm org 'webspecs' created (for future @webspecs/* packages)
- [ ] #4 README updated with new name
- [ ] #5 No remaining 'semantic-kit' references in user-facing strings
<!-- AC:END -->
