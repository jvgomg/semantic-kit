---
id: TASK-035
title: Graceful Playwright browser installation UX
status: To Do
assignee: []
created_date: '2026-02-16 13:13'
labels:
  - enhancement
  - ux
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Context

**Problem:**
Playwright-dependent commands require browser binaries to be installed separately from the semantic-kit package. When users run these commands without browsers installed, they see a raw Playwright error which is confusing.

This is especially important for the standalone binary which bundles all JavaScript code but cannot bundle the browser binaries.

**Current error when browsers missing:**
```
Error: Executable doesn't exist at /Users/.../ms-playwright/chromium.../chrome-headless-shell
╔═════════════════════════════════════════════════════════════════════════╗
║ Looks like Playwright Test or Playwright was just installed or updated. ║
║ Please run the following command to download new browsers:              ║
║     npx playwright install                                              ║
╚═════════════════════════════════════════════════════════════════════════╝
```

## Proposed Change

**Affected commands:** All Playwright-dependent commands (`readability:compare`, `structure:js`, `structure:compare`, `a11y-tree`, `a11y-tree:js`, `a11y-tree:compare`, `tui`)

**What should change:**
Detect missing Playwright browsers and provide context-appropriate UX:

1. **Streaming/CI mode** (non-TTY): Clear error message with install instructions
2. **Interactive CLI mode** (TTY): Prompt user to install browsers
3. **TUI mode**: Modal dialog offering one-click installation

## Implementation Approach

**Key files:**
- `src/lib/playwright.ts` - Add browser detection and installation helpers
- `src/commands/*.ts` - Wrap Playwright usage with graceful error handling
- `src/tui/` - Add modal component for browser installation

**Approach:**
1. Create detection utility using Playwright's registry
2. Create installation utility using Bun shell
3. Create mode-aware prompt utility (checks `process.stdout.isTTY`)
4. Wrap Playwright commands with try/catch for the specific error
5. Create TUI modal for installation

**Considerations:**
- Installation takes 1-2 minutes for Chromium (~150MB)
- Show progress during installation
- After successful installation, automatically retry original command
- Prefer `bunx playwright install chromium` (smaller than all browsers)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Friendly error in non-TTY mode when browsers missing
- [ ] #2 Interactive prompt in TTY mode when browsers missing
- [ ] #3 User can accept prompt and browsers install successfully
- [ ] #4 After installation, command automatically retries
- [ ] #5 TUI shows modal when Playwright features accessed without browsers
- [ ] #6 All Playwright-dependent commands handle missing browsers gracefully
- [ ] #7 Installation progress is visible to user
- [ ] #8 Installation errors are handled gracefully with actionable message
<!-- AC:END -->
