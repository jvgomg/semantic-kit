// ============================================================================
// Playwright Types (Optional Dependency)
// ============================================================================

interface PlaywrightBrowser {
  newContext(): Promise<PlaywrightContext>
  close(): Promise<void>
}

interface PlaywrightContextOptions {
  javaScriptEnabled?: boolean
}

interface PlaywrightContext {
  newPage(): Promise<PlaywrightPage>
  close(): Promise<void>
}

interface PlaywrightBrowserWithOptions {
  newContext(options?: PlaywrightContextOptions): Promise<PlaywrightContext>
  close(): Promise<void>
}

interface PlaywrightLocator {
  ariaSnapshot(): Promise<string>
}

interface PlaywrightPage {
  goto(
    url: string,
    options?: { waitUntil?: string; timeout?: number },
  ): Promise<unknown>
  content(): Promise<string>
  locator(selector: string): PlaywrightLocator
}

interface PlaywrightChromium {
  launch(options?: { headless?: boolean }): Promise<PlaywrightBrowser>
}

// ============================================================================
// Playwright Import
// ============================================================================

async function getPlaywright(): Promise<PlaywrightChromium | null> {
  try {
    const playwright = await import('playwright')
    return playwright.chromium
  } catch {
    return null
  }
}

// ============================================================================
// Rendering
// ============================================================================

export interface RenderedHtmlResult {
  html: string
  timedOut: boolean
}

/**
 * Fetch rendered HTML using Playwright
 *
 * Launches a headless browser, navigates to the URL, waits for network idle,
 * and returns the rendered HTML content.
 *
 * @param url - The URL to render
 * @param timeoutMs - Maximum time to wait for network idle (default: 5000)
 * @returns The rendered HTML and whether the timeout was reached
 * @throws Error if Playwright is not installed
 */
export async function fetchRenderedHtml(
  url: string,
  timeoutMs: number = 5000,
): Promise<RenderedHtmlResult> {
  const chromium = await getPlaywright()

  if (!chromium) {
    throw new PlaywrightNotInstalledError()
  }

  const browser = await chromium.launch({ headless: true })
  let timedOut = false

  try {
    const context = await browser.newContext()
    const page = await context.newPage()

    try {
      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: timeoutMs,
      })
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes('timeout')
      ) {
        timedOut = true
      } else {
        throw error
      }
    }

    const html = await page.content()
    await context.close()

    return { html, timedOut }
  } finally {
    await browser.close()
  }
}

// ============================================================================
// Accessibility Snapshot
// ============================================================================

export interface AccessibilitySnapshotResult {
  snapshot: string
  timedOut: boolean
}

export interface AccessibilitySnapshotOptions {
  javaScriptEnabled?: boolean
  timeoutMs?: number
}

/**
 * Fetch accessibility tree snapshot using Playwright
 *
 * Launches a headless browser, navigates to the URL, waits for network idle,
 * and returns the ARIA snapshot of the page.
 *
 * @param url - The URL to analyze
 * @param options - Options including javaScriptEnabled and timeoutMs
 * @returns The ARIA snapshot YAML and whether the timeout was reached
 * @throws Error if Playwright is not installed
 */
export async function fetchAccessibilitySnapshot(
  url: string,
  options: AccessibilitySnapshotOptions = {},
): Promise<AccessibilitySnapshotResult> {
  const { javaScriptEnabled = true, timeoutMs = 5000 } = options
  const chromium = await getPlaywright()

  if (!chromium) {
    throw new PlaywrightNotInstalledError()
  }

  const browser = (await chromium.launch({
    headless: true,
  })) as PlaywrightBrowserWithOptions
  let timedOut = false

  try {
    const context = await browser.newContext({ javaScriptEnabled })
    const page = await context.newPage()

    try {
      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: timeoutMs,
      })
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes('timeout')
      ) {
        timedOut = true
      } else {
        throw error
      }
    }

    const snapshot = await page.locator('body').ariaSnapshot()
    await context.close()

    return { snapshot, timedOut }
  } finally {
    await browser.close()
  }
}

// ============================================================================
// Accessibility Comparison
// ============================================================================

export interface AccessibilityComparisonResult {
  static: AccessibilitySnapshotResult
  hydrated: AccessibilitySnapshotResult
}

/**
 * Fetch both static and hydrated accessibility snapshots for comparison
 *
 * Launches a headless browser twice - once with JS disabled (static) and
 * once with JS enabled (hydrated) - to compare accessibility trees.
 *
 * @param url - The URL to analyze
 * @param timeoutMs - Maximum time to wait for network idle (default: 5000)
 * @returns Both snapshots for comparison
 * @throws Error if Playwright is not installed
 */
export async function fetchAccessibilityComparison(
  url: string,
  timeoutMs: number = 5000,
): Promise<AccessibilityComparisonResult> {
  // Fetch both in parallel for efficiency
  const [staticResult, hydratedResult] = await Promise.all([
    fetchAccessibilitySnapshot(url, { javaScriptEnabled: false, timeoutMs }),
    fetchAccessibilitySnapshot(url, { javaScriptEnabled: true, timeoutMs }),
  ])

  return {
    static: staticResult,
    hydrated: hydratedResult,
  }
}

// ============================================================================
// Errors
// ============================================================================

export class PlaywrightNotInstalledError extends Error {
  constructor() {
    super('Playwright is not installed')
    this.name = 'PlaywrightNotInstalledError'
  }

  getInstallInstructions(): string {
    return `Install it with:
  bun add playwright
  bunx playwright install chromium`
  }
}
