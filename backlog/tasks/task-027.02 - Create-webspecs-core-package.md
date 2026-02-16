---
id: TASK-027.02
title: Create @webspecs/core package
status: Done
assignee: []
created_date: '2026-02-16 16:03'
updated_date: '2026-02-16 17:18'
labels:
  - npm
  - architecture
milestone: npm release
dependencies:
  - TASK-027.01
parent_task_id: TASK-027
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Extract the core library code into `@webspecs/core` package.

## What Goes in Core

### From `src/lib/`
- `aria-snapshot.ts` - Accessibility tree extraction
- `axe-static.ts` - Axe accessibility testing
- `formatting.ts` - Output formatting utilities
- `hidden-content.ts` - Hidden content detection
- `json-envelope.ts` - JSON output wrapper
- `metadata/` - Metadata extraction (OG, Twitter, etc.)
- `playwright.ts` - Playwright helpers
- `preview.ts` - Preview generation
- `readability.ts` - Readability extraction
- `results.ts` - Result types
- `sitemap.ts` - Sitemap parsing
- `structure.ts` - Page structure analysis
- `turndown.ts` - HTML to Markdown
- `words.ts` - Word/character counting

### From `src/lib/` - Build Infrastructure
- `fs.ts` - Build-time switching (from TASK-020 branch)

### NOT in Core (CLI-specific)
- `cli-formatting/` → goes to CLI package
- `run-command.ts` → goes to CLI package
- `output-mode.ts` → goes to CLI package
- `arguments.ts` → goes to CLI package
- `config.ts` → evaluate: may stay in core or split
- `tui-config/` → goes to TUI package

## Package Configuration

### package.json
```json
{
  "name": "@webspecs/core",
  "version": "0.1.0",
  "type": "module",
  "engines": { "node": ">=18.0.0" },
  "sideEffects": false,
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "bun run build.ts",
    "typecheck": "tsc --noEmit"
  }
}
```

### Build Configuration
- Target: Node.js (for npm compatibility)
- Use `__TARGET_BUN__: 'false'` pattern
- External all dependencies
- Generate .d.ts files

## Exports
Design the public API surface carefully:
- Export types for all result structures
- Export runner functions for each analyzer
- Keep internal helpers private

## Testing
- Unit tests move with the code
- Integration tests stay at root (test full stack)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Package builds successfully with bun run build
- [x] #2 TypeScript types are correctly exported
- [x] #3 Can be imported in Node.js: import { ... } from '@webspecs/core'
- [x] #4 No Bun-specific APIs in built output (verified)
- [x] #5 All unit tests pass
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Implementation Progress

### Completed
- Moved CLI-specific files from core to CLI package:
  - arguments.ts, output-mode.ts, run-command.ts, version.ts, config.ts → packages/cli/src/lib/
  - cli-formatting/ → packages/cli/src/lib/cli-formatting/
- Moved TUI-specific files from core to TUI package:
  - tui-config/ → packages/tui/src/lib/tui-config/
- Created shared types file (packages/core/src/types.ts) with Issue types
- Updated core index.ts with comprehensive exports
- Created build.ts for core package
- Created tsconfig.build.json for core package
- Core package builds successfully
- Updated CLI imports to use @webspecs/core for library code
- Updated CLI imports to use ../lib/ or ../../lib/ for CLI-specific code
- Added path mapping in CLI tsconfig.json for @webspecs/core
- Stubbed TUI command in CLI (shows message directing to @webspecs/tui)
- Core and CLI typecheck passes

### What's Exported from @webspecs/core
- Issue types (Issue, IssueType, IssueSeverity)
- HTML fetching (fetchHtmlContent)
- File system utilities (fileExists, readTextFile, readJsonFile, writeTextFile)
- Structure analysis and formatting
- Accessibility testing (axe-core)
- ARIA snapshot analysis
- Playwright helpers (fetchRenderedHtml, fetchAccessibilitySnapshot, fetchAccessibilityComparison)
- Sitemap parsing
- Readability extraction
- Hidden content detection
- Metadata extraction and validation
- Social preview generation
- All result types for commands

### Remaining
- Lint has import order warnings (can be auto-fixed)
- Need to verify Node.js imports work (acceptance criteria #3)
- Need to verify no Bun-specific APIs in output (acceptance criteria #4)

## Additional Work Completed

- Fixed TUI imports to use @webspecs/core and local paths

- Fixed integration-tests imports to use @webspecs/core and @webspecs/cli

- Created CLI build.ts and tsconfig.build.json

- Created TUI build.ts and tsconfig.build.json

- Updated CLI package.json with exports for commands/* and lib/*

- Updated ESLint config to ignore dist directories and stubs

- Consolidated duplicate imports from @webspecs/core across CLI files

- All packages build successfully: core, cli, tui

- Node.js compatibility verified for core and CLI
<!-- SECTION:NOTES:END -->
