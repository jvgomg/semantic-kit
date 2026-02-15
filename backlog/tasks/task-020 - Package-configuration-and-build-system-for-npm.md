---
id: TASK-020
title: Package configuration and build system for npm
status: To Do
assignee: []
created_date: '2026-02-15 21:37'
updated_date: '2026-02-15 21:43'
labels:
  - build
  - npm
milestone: npm release
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Configure package.json and build system to support npm publishing while maintaining the existing optimized binary builds.

## Current State
- `build.ts` targets `bun` and externalizes some deps
- `build-global.ts` creates standalone compiled binaries
- `exports` field points to `.ts` for types (non-standard)
- No `files` field - everything gets published

## Requirements
1. **Keep optimized binary builds** - `build-global.ts` workflow must continue working
2. **Add Node.js-compatible build** - new build target for npm consumers
3. **Fix exports field** - point to built `.js` and `.d.ts` files
4. **Add files field** - control what gets published to npm
5. **Add engines field** - document Node.js version requirements
6. **Ensure TypeScript types are optimal** - `.d.ts` generation and exports
7. **Add sideEffects field** - enable tree-shaking for bundlers (`"sideEffects": false` if applicable)

## Node.js Compatibility
The current build uses Bun-specific APIs that need verification:
- `import.meta.require` - Bun-specific, may need polyfill or alternative
- Verify built output runs correctly on Node.js (not just Bun)
- Test with `node dist/cli.js` after build

## Questions to Resolve
- Should we have separate build scripts or unified with flags?
- What's the minimum Node.js version to support?
- Do we need conditional exports for different runtimes?
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Package can be installed from npm and `npx semantic-kit` works
- [ ] #2 Binary build (`build-global.ts`) still works
- [ ] #3 TypeScript consumers can import types correctly
- [ ] #4 `npm pack --dry-run` shows only intended files
- [ ] #5 exports field uses built .js and .d.ts files
- [ ] #6 Built CLI works on Node.js (not just Bun)
- [ ] #7 sideEffects field configured in package.json
<!-- AC:END -->
