---
id: TASK-023
title: Documentation for npm package
status: To Do
assignee: []
created_date: '2026-02-15 21:37'
updated_date: '2026-02-15 22:22'
labels:
  - docs
milestone: npm release
dependencies: []
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Update documentation for npm package consumers.

## README Updates
- Installation instructions (`npm install @webspecs/cli`, `npx @webspecs/cli` usage)
- Quick start examples
- Programmatic API usage
- CLI command reference (or link to docs)

## Badges to Add
- npm version (for @webspecs/cli)
- License
- Node.js version requirement

## Package Discoverability
Add `keywords` field to package.json for npm search:
```json
"keywords": [
  "seo",
  "accessibility", 
  "a11y",
  "schema",
  "structured-data",
  "json-ld",
  "open-graph",
  "readability",
  "screen-reader",
  "wcag",
  "html-validation"
]
```

## Additional Docs
- CONTRIBUTING.md (if accepting contributions)
- Ensure LICENSE file is correct
- API documentation for TypeScript exports
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 README has npm installation instructions
- [ ] #2 README has npx usage examples
- [ ] #3 npm badges added to README
- [ ] #4 Programmatic API usage documented
- [ ] #5 keywords field added to package.json
<!-- AC:END -->
