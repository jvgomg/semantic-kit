---
id: TASK-020
title: Package configuration and build system for npm
status: In Progress
assignee: []
created_date: '2026-02-15 21:37'
updated_date: '2026-02-16 15:08'
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
- [x] #3 TypeScript consumers can import types correctly
- [x] #4 `npm pack --dry-run` shows only intended files
- [x] #5 exports field uses built .js and .d.ts files
- [ ] #6 Built CLI works on Node.js (not just Bun)
- [x] #7 sideEffects field configured in package.json
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Implementation Progress

### Completed

**Phase 1-2: Build-time switching pattern**
- Created `src/lib/fs.ts` with `__TARGET_BUN__` conditional switching
- Functions: `fileExists()`, `readTextFile()`, `readJsonFile()`, `writeTextFile()`
- Updated all files that used Bun file APIs:
  - `src/lib/config.ts`
  - `src/lib/fetch.ts`
  - `src/tui/state/persistence/storage.ts`
  - `src/lib/tui-config/loader.ts`
  - `src/commands/fetch/command.ts`

**Phase 3-4: Build scripts**
- Updated `build.ts`: targets `node`, defines `__TARGET_BUN__: 'false'`, adds shebang
- Updated `build-global.ts`: defines `__TARGET_BUN__: 'true'`
- Created stub files for optional dependencies

**Phase 5-6: Package configuration**
- Created `tsconfig.build.json` for declaration generation
- Updated `package.json`:
  - Added `engines: { node: ">=18.0.0" }`
  - Added `sideEffects: false`
  - Added `files: ["dist", "README.md", "LICENSE"]`
  - Updated `exports` to use `.d.ts` for types
  - Added `prepublishOnly` script

**Phase 7: Documentation**
- Updated `directives/code.md` with build-time target switching docs

### Verification Results

| Check | Status |
|-------|--------|
| TypeScript compilation | ✅ Pass |
| npm build (`bun run build`) | ✅ Pass |
| Dead code elimination | ✅ Pass (0 `Bun.*` refs) |
| Type declarations | ✅ Generated |
| npm pack | ✅ Correct files |

### Blockers

**1. Node.js CLI runtime fails**
```
TypeError [ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension ".scm"
```
- `@opentui/core` imports `.scm` files (tree-sitter grammars) that Node.js ESM loader can't handle
- This affects running `node dist/cli.js` directly

**2. Binary build fails**
```
error: Could not resolve: "@opentui/core-darwin-arm64/index.ts"
```
- `@opentui/core` uses dynamic imports for platform-specific packages
- Bun bundler can't resolve these at compile time
- First Bun.build step succeeds, but standalone compilation fails

### Next Steps

Research needed on OpenTUI bundling approaches:
- Does OpenTUI have documented build/bundling guidance?
- Are there known workarounds for standalone builds?
- Alternative approaches for Node.js compatibility?
<!-- SECTION:NOTES:END -->
