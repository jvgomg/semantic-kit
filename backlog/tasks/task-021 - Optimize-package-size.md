---
id: TASK-021
title: Optimize package size
status: To Do
assignee: []
created_date: '2026-02-15 21:37'
updated_date: '2026-02-15 21:43'
labels:
  - build
  - performance
milestone: npm release
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Reduce the npm package size by fixing bundling issues and optimizing dependencies.

## Current State
- `dist/cli.js` is 3.6MB (100,332 lines)
- `dist/cli.js.map` is 5.8MB (should not be published)
- Many dependencies are bundled when they should be external

## Analysis Results

### Bundle Breakdown
| Package | Lines | % | Issue |
|---------|-------|---|-------|
| highlight.js | 32,500 | 32.4% | ALL 190+ language grammars bundled |
| zod | 14,000 | 14% | Should be external |
| yaml | 8,500 | 8.5% | Should be external |
| sitemap | 10,000 | 10% | Should be external |
| jotai ecosystem | 3,500 | 3.5% | Should be external |
| src code | 6,000 | 6% | Expected |

### Missing from externals list in build.ts
- `diff`
- `zod`
- `yaml`
- `sitemap`
- `jotai`, `jotai-effect`, `jotai-family`, `jotai-optics`, `optics-ts`
- `marked`, `marked-terminal`

### highlight.js Issue
- `emphasize` uses highlight.js internally
- Only used in `fetch` command for XML syntax highlighting
- Imports `common` subset but Bun bundles all languages anyway

## Action Items
1. Add all dependencies to externals list in build.ts
2. Exclude source maps from published package
3. Fix highlight.js bloat (externalize, dynamic import, or replace)
4. Consider lazy-loading TUI dependencies

## Security Audit
Before publishing, audit the package contents for accidentally included secrets:
- No `.env` files
- No API keys or credentials in test fixtures
- No private configuration files
- Run `npm pack --dry-run` and review file list carefully
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 All dependencies properly externalized in build.ts
- [ ] #2 Source maps excluded from npm package
- [ ] #3 cli.js bundle under 500KB (ideally under 300KB)
- [ ] #4 highlight.js bloat resolved
- [ ] #5 `npm pack --dry-run` shows reasonable package size
- [ ] #6 No secrets or sensitive files in published package
<!-- AC:END -->
