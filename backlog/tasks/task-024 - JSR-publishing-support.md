---
id: TASK-024
title: JSR publishing support
status: To Do
assignee: []
created_date: '2026-02-15 21:37'
labels:
  - build
  - jsr
milestone: npm release
dependencies:
  - TASK-020
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add support for publishing to JSR (JavaScript Registry) in addition to npm.

## About JSR
- Deno's modern JavaScript registry
- Publishes TypeScript source directly (no build step)
- Native TypeScript support with auto-generated docs
- Works with npm, Deno, and Bun

## Requirements
1. **Create jsr.json config** - defines package metadata and exports
2. **Configure exports for JSR** - may differ from npm exports
3. **Publish workflow** - `npx jsr publish` or Deno
4. **Verify compatibility** - ensure package works when installed from JSR

## Considerations
- JSR uses TypeScript source directly - different from npm's built JS
- May need conditional exports or separate entry points
- Score system rewards documentation and type coverage
- Can maintain both npm and JSR from same codebase

## References
- https://jsr.io/docs/publishing-packages
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 jsr.json configuration file created
- [ ] #2 Package can be published to JSR
- [ ] #3 Package works when installed from JSR
- [ ] #4 Types work correctly for JSR consumers
<!-- AC:END -->
