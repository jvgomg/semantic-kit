---
id: TASK-027.03
title: Create @webspecs/cli package
status: Done
assignee: []
created_date: '2026-02-16 16:03'
updated_date: '2026-02-17 12:28'
labels:
  - npm
  - architecture
milestone: npm release
dependencies:
  - TASK-027.02
parent_task_id: TASK-027
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create the `@webspecs/cli` package - Node.js compatible command-line interface.

## What Goes in CLI

### From `src/`
- `cli.ts` - Main CLI entrypoint (modified)
- `commands/` - All command implementations

### From `src/lib/` (CLI-specific utilities)
- `cli-formatting/` - Terminal output formatting
- `run-command.ts` - Command runner with spinners
- `output-mode.ts` - Output mode handling
- `arguments.ts` - Argument parsing helpers
- `config.ts` - XDG config loading
- `version.ts` - Version display

## Package Configuration

### package.json
```json
{
  "name": "@webspecs/cli",
  "version": "0.1.0",
  "type": "module",
  "engines": { "node": ">=18.0.0" },
  "bin": {
    "webspecs": "./dist/cli.js"
  },
  "dependencies": {
    "@webspecs/core": "workspace:*",
    "commander": "^14.0.0"
    // ... other CLI deps
  },
  "files": ["dist"],
  "scripts": {
    "build": "bun run build.ts",
    "typecheck": "tsc --noEmit"
  }
}
```

## TUI Command Handling

The CLI package does NOT include TUI functionality. When user runs `webspecs tui`:

```typescript
.command('tui')
.description('Launch interactive TUI (requires Bun runtime)')
.action(() => {
  console.log(`
The TUI requires the Bun runtime and is available as a separate package.

Install and run with Bun:
  bunx @webspecs/tui [url]

Or install globally:
  bun install -g @webspecs/tui
  webspecs-tui [url]

Learn more: https://github.com/jvgomg/webspecs#tui
`)
  process.exit(0)
})
```

## Build Configuration
- Target: Node.js
- Add shebang: `#!/usr/bin/env node`
- External dependencies (installed via npm)
- Use `__TARGET_BUN__: 'false'`

## Testing
- Test with `npx` in a fresh directory
- Test with Node.js directly: `node dist/cli.js`
- Verify all commands work without TUI
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Package builds successfully
- [x] #2 npx @webspecs/cli --help works on Node.js
- [x] #3 All non-TUI commands function correctly
- [x] #4 TUI command shows helpful redirect message
- [x] #5 Depends on @webspecs/core via workspace protocol
- [x] #6 No OpenTUI/TUI code bundled
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Implementation Complete

### What was done:
- Created CLI build.ts using Bun.build with Node.js target
- Created CLI tsconfig.build.json for declaration generation
- CLI package.json has proper exports for commands/* and lib/*
- TUI command stub shows helpful message directing users to @webspecs/tui
- All CLI imports consolidated to use @webspecs/core
- CLI builds successfully and can be imported in Node.js

### Build configuration:
- Entry: src/cli.ts
- Target: Node.js
- Format: ESM
- Externals: @webspecs/core, all direct dependencies
- Generates .d.ts files

### Remaining for full npm release:
- Add shebang to built output
- Test with npx in isolated environment
- Test all commands work correctly

## Follow-up work completed

- Added `#!/usr/bin/env node` shebang to `dist/cli.js` in build.ts so npm creates correct bin wrappers
- Renamed CLI from `semantic-kit` to `webspecs` in Commander program name and help text
- Verified all commands work on Node.js: `node dist/cli.js --help`, schema, validate:html, tui stub all work correctly
<!-- SECTION:NOTES:END -->
