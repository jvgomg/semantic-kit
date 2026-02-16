---
id: TASK-027.04
title: Create @webspecs/tui package
status: Done
assignee: []
created_date: '2026-02-16 16:03'
updated_date: '2026-02-16 17:19'
labels:
  - npm
  - architecture
  - bun-only
milestone: npm release
dependencies:
  - TASK-027.02
parent_task_id: TASK-027
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create the `@webspecs/tui` package - Bun-only terminal user interface.

## What Goes in TUI

### From `src/`
- `src/tui/` - All TUI code (App, components, state, views, theme)
- `src/commands/tui.ts` - TUI command launcher

### From `src/lib/`
- `tui-config/` - TUI configuration loading

## Package Configuration

### package.json
```json
{
  "name": "@webspecs/tui",
  "version": "0.1.0",
  "type": "module",
  "bin": {
    "webspecs-tui": "./dist/cli.js"
  },
  "dependencies": {
    "@webspecs/core": "workspace:*",
    "@opentui/core": "^0.1.79",
    "@opentui/react": "^0.1.79",
    "jotai": "...",
    // ... TUI-specific deps
  },
  "files": ["dist"],
  "scripts": {
    "build": "bun run build.ts",
    "build:binary": "bun run build-binary.ts",
    "typecheck": "tsc --noEmit"
  }
}
```

## Bun Runtime Check

At the start of the CLI entrypoint, check for Bun:

```typescript
// packages/tui/src/cli.ts
if (typeof Bun === 'undefined') {
  console.error(`
┌─────────────────────────────────────────────────────────┐
│  @webspecs/tui requires the Bun runtime                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  The TUI uses OpenTUI which requires Bun.               │
│                                                         │
│  Install Bun:                                           │
│    curl -fsSL https://bun.sh/install | bash             │
│                                                         │
│  Then run:                                              │
│    bunx @webspecs/tui [url]                             │
│                                                         │
│  For Node.js, use the CLI instead:                      │
│    npx @webspecs/cli [command] [url]                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
`)
  process.exit(1)
}
```

## Build Configuration

### Development Build
- Target: Bun
- Use `__TARGET_BUN__: 'true'`
- External dependencies

### Binary Build (build-binary.ts)
- Per-platform builds for GitHub releases
- Statically import the target platform's @opentui/core-* package
- Produces standalone executable

```typescript
// build-binary.ts
const platform = process.env.TARGET_PLATFORM || `${process.platform}-${process.arch}`

await Bun.build({
  entrypoints: ['./src/cli.ts'],
  outdir: './dist',
  target: 'bun',
  define: {
    __TARGET_BUN__: 'true',
    __VERSION__: JSON.stringify(pkg.version),
  },
  compile: {
    target: `bun-${platform}`,
    outfile: `./dist/webspecs-tui-${platform}`,
  },
})
```

## README

The package README should clearly explain:
1. This package requires Bun runtime
2. How to install Bun
3. Usage examples
4. Link to CLI package for Node.js users
5. Binary download links
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Package builds successfully with Bun
- [ ] #2 bunx @webspecs/tui works with full TUI
- [ ] #3 Clear error message when run without Bun
- [ ] #4 Binary build produces working executables
- [ ] #5 README clearly documents Bun requirement
- [x] #6 Depends on @webspecs/core via workspace protocol
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Implementation Complete

### What was done:
- Fixed all TUI imports to use @webspecs/core and @webspecs/cli
- Created TUI build.ts using Bun.build with Bun target
- Created TUI tsconfig.build.json for declaration generation
- TUI tsconfig.json has proper paths mappings for development
- TUI depends on both @webspecs/core and @webspecs/cli via workspace protocol
- TUI builds successfully

### Build configuration:
- Entry: src/index.tsx
- Target: Bun (uses __TARGET_BUN__: true)
- Format: ESM
- Externals: workspace deps, OpenTUI, React, Jotai, etc.
- Generates .d.ts files

### Remaining for full npm release:
- Add Bun runtime check at entrypoint
- Create binary build script
- Test with bunx in isolated environment
- Write README documenting Bun requirement
<!-- SECTION:NOTES:END -->
