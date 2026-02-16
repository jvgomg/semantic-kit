---
id: TASK-027.02
title: Create @webspecs/core package
status: To Do
assignee: []
created_date: '2026-02-16 16:03'
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
- [ ] #1 Package builds successfully with bun run build
- [ ] #2 TypeScript types are correctly exported
- [ ] #3 Can be imported in Node.js: import { ... } from '@webspecs/core'
- [ ] #4 No Bun-specific APIs in built output (verified)
- [ ] #5 All unit tests pass
<!-- AC:END -->
