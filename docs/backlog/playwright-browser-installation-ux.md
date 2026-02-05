```yaml
# Metadata (keep at top of file)
researchVersion: null
toolVersion: null
status: pending
created: 2025-02-04
```

# Graceful Playwright Browser Installation UX

## Context

**Problem:**
Playwright-dependent commands (`bot`, `structure:js`, `structure:compare`, `a11y`, `a11y:js`, `a11y:compare`) require browser binaries to be installed separately from the semantic-kit package. When users run these commands without browsers installed, they see a raw Playwright error which is confusing.

This is especially important for the standalone binary (`dist/semantic-kit`) which bundles all JavaScript code but cannot bundle the browser binaries.

**How Playwright works:**
- Playwright's npm package contains JavaScript code for browser automation
- Browser binaries (Chromium, Firefox, WebKit) must be installed separately
- Installation command: `npx playwright install` or `bunx playwright install`
- Binaries are stored in platform-specific cache directories:
  - macOS: `~/Library/Caches/ms-playwright/`
  - Linux: `~/.cache/ms-playwright/`
  - Windows: `%LOCALAPPDATA%\ms-playwright\`

**Current error when browsers missing:**
```
Error: Executable doesn't exist at /Users/james/Library/Caches/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-mac-arm64/chrome-headless-shell
╔═════════════════════════════════════════════════════════════════════════╗
║ Looks like Playwright Test or Playwright was just installed or updated. ║
║ Please run the following command to download new browsers:              ║
║                                                                         ║
║     npx playwright install                                              ║
║                                                                         ║
║ <3 Playwright Team                                                      ║
╚═════════════════════════════════════════════════════════════════════════╝
```

---

## Proposed Change

**Affected command(s):** `bot`, `structure:js`, `structure:compare`, `a11y`, `a11y:js`, `a11y:compare`, `tui`

**What should change:**

The app should detect missing Playwright browsers and provide context-appropriate UX:

### 1. Streaming CLI Mode (piped output / non-TTY)
Show a clear error message explaining the issue:
```
Error: Playwright browsers not installed.

Commands that render JavaScript (bot, structure:js, a11y, etc.) require
Playwright browser binaries. Install them with:

    bunx playwright install

Or install only Chromium (smaller download):

    bunx playwright install chromium
```

### 2. Interactive CLI Mode (TTY)
Prompt the user to install browsers:
```
Playwright browsers not installed.

This command requires browser binaries to render JavaScript.
Would you like to install them now? [Y/n]

> Installing Chromium via Playwright...
> bunx playwright install chromium
```

### 3. TUI Mode (Ink interface)
Show a modal dialog:
```
┌─────────────────────────────────────────────────┐
│  Playwright Browsers Required                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  This feature requires Playwright browsers      │
│  to render JavaScript.                          │
│                                                 │
│  Install now?                                   │
│                                                 │
│  [Install Chromium]  [Install All]  [Cancel]   │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Implementation Approach

**Key files likely involved:**
- `src/lib/playwright.ts` - Add browser detection and installation helpers
- `src/commands/bot.ts` - Wrap Playwright usage with graceful error handling
- `src/commands/structure-js.ts` - Same pattern
- `src/commands/structure-compare.ts` - Same pattern
- `src/commands/a11y.ts` - Same pattern
- `src/commands/a11y-js.ts` - Same pattern
- `src/commands/a11y-compare.ts` - Same pattern
- `src/tui/` - Add modal component for browser installation

**Approach:**

1. **Create detection utility** in `src/lib/playwright.ts`:
   ```typescript
   export async function checkPlaywrightBrowsers(): Promise<{
     installed: boolean
     chromiumPath: string | null
     error: Error | null
   }>
   ```

   Detection can use Playwright's registry:
   ```typescript
   import { chromium } from 'playwright'
   // Attempting to get executablePath will reveal if browsers exist
   const path = chromium.executablePath()
   ```

2. **Create installation utility**:
   ```typescript
   export async function installPlaywrightBrowsers(
     options: { browser?: 'chromium' | 'firefox' | 'webkit' | 'all' }
   ): Promise<void>
   ```

   Uses Bun's shell to run installation:
   ```typescript
   import { $ } from 'bun'
   await $`bunx playwright install ${browser ?? 'chromium'}`
   ```

3. **Create mode-aware prompt utility**:
   ```typescript
   export async function promptBrowserInstall(): Promise<boolean> {
     if (!process.stdout.isTTY) {
       // Streaming mode - just show error
       console.error('Error: Playwright browsers not installed...')
       return false
     }
     // Interactive mode - prompt user
     // Could use simple readline or a small prompt library
   }
   ```

4. **Wrap Playwright commands** with try/catch that detects the specific error and calls the prompt utility.

5. **TUI modal** - Create a new Ink component in `src/tui/components/` for the installation modal.

**Considerations:**
- Installation can take 1-2 minutes for Chromium (~150MB download)
- Show progress during installation (Playwright outputs progress to stderr)
- Consider offering "Chromium only" as default (smaller, sufficient for most use cases)
- After successful installation, automatically retry the original command
- Handle installation failures gracefully (network issues, permissions, etc.)
- The standalone binary uses `bunx` not `npx` - prefer `bunx playwright install`

---

## Acceptance Criteria

- [ ] `bot` command shows friendly error in non-TTY mode when browsers missing
- [ ] `bot` command prompts for installation in TTY mode when browsers missing
- [ ] User can accept prompt and browsers install successfully
- [ ] After installation, command automatically retries
- [ ] TUI shows modal when Playwright features accessed without browsers
- [ ] TUI modal allows one-click installation
- [ ] All Playwright-dependent commands handle missing browsers gracefully:
  - [ ] `bot`
  - [ ] `structure:js`
  - [ ] `structure:compare`
  - [ ] `a11y`
  - [ ] `a11y:js`
  - [ ] `a11y:compare`
- [ ] Installation progress is visible to user
- [ ] Installation errors are handled gracefully with actionable message

---

## Notes

**Playwright browser paths by platform:**
- macOS: `~/Library/Caches/ms-playwright/`
- Linux: `~/.cache/ms-playwright/`
- Windows: `%LOCALAPPDATA%\ms-playwright\`

**Browser sizes (approximate):**
- Chromium: ~150MB
- Firefox: ~80MB
- WebKit: ~60MB
- All browsers: ~290MB

**Alternative considered:** Bundle browsers in standalone binary
- Rejected: Would make binary 300MB+ and complicate cross-platform builds
- Current approach (prompt to install) is standard for Playwright-based tools

**Related:** The standalone binary (`bun run build:global`) bundles Playwright JS code but not browser binaries. This is the same model as any npm-installed Playwright project.
