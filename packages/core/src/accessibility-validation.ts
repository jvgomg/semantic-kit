import { type AxeBuilder } from '@axe-core/playwright'
import { PlaywrightNotInstalledError } from './playwright.js'
import type { AxeViolationResult } from './results.js'

// ============================================================================
// Types
// ============================================================================

export type WcagLevel = 'a' | 'aa' | 'aaa'

// Internal axe-core result types (from library)
export interface AxeResults {
  violations: AxeViolationResult[]
  passes: unknown[]
  incomplete: unknown[]
  inapplicable: unknown[]
  url: string
  timestamp: string
}

export interface AxeAnalysisResult {
  results: AxeResults
  timedOut: boolean
}

// ============================================================================
// Constants
// ============================================================================

export const WCAG_TAGS: Record<WcagLevel, string[]> = {
  a: ['wcag2a', 'wcag21a', 'wcag22a'],
  aa: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'],
  aaa: [
    'wcag2a',
    'wcag2aa',
    'wcag2aaa',
    'wcag21a',
    'wcag21aa',
    'wcag21aaa',
    'wcag22a',
    'wcag22aa',
  ],
}

export const VALID_LEVELS = ['a', 'aa', 'aaa'] as const

// ============================================================================
// Playwright/axe-core Integration
// ============================================================================

interface PlaywrightPage {
  goto(
    url: string,
    options?: { waitUntil?: string; timeout?: number },
  ): Promise<unknown>
  close(): Promise<void>
}

interface PlaywrightContext {
  newPage(): Promise<PlaywrightPage>
  close(): Promise<void>
}

interface PlaywrightBrowser {
  newContext(): Promise<PlaywrightContext>
  close(): Promise<void>
}

interface PlaywrightChromium {
  launch(options?: { headless?: boolean }): Promise<PlaywrightBrowser>
}

async function getPlaywright(): Promise<PlaywrightChromium | null> {
  try {
    const playwright = await import('playwright')
    return playwright.chromium
  } catch {
    return null
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Parse WCAG level from CLI option.
 */
export function parseWcagLevel(levelOption: string | undefined): WcagLevel {
  const levelInput = (levelOption || 'aa').toLowerCase()
  if (!VALID_LEVELS.includes(levelInput as WcagLevel)) {
    throw new Error(
      `Invalid WCAG level "${levelOption}". Valid levels: A, AA, AAA`,
    )
  }
  return levelInput as WcagLevel
}

/**
 * Run axe-core analysis on a URL.
 */
export async function validateAccessibility(
  url: string,
  level: WcagLevel,
  timeoutMs: number,
): Promise<AxeAnalysisResult> {
  const chromium = await getPlaywright()

  if (!chromium) {
    throw new PlaywrightNotInstalledError()
  }

  // Dynamic import of axe-core/playwright
  const { default: AxeBuilderClass } =
    (await import('@axe-core/playwright')) as { default: typeof AxeBuilder }

  const browser = await chromium.launch({ headless: true })
  let timedOut = false

  try {
    // axe-core/playwright requires using newContext() first
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

    // Run axe analysis with WCAG tags + best-practice rules
    // Include best-practice to match what the structure command tests
    const results = await new AxeBuilderClass({ page: page as never })
      .withTags([...WCAG_TAGS[level], 'best-practice'])
      .analyze()

    await context.close()

    return { results: results as AxeResults, timedOut }
  } finally {
    await browser.close()
  }
}
