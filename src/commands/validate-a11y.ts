import { type AxeBuilder } from '@axe-core/playwright'
import { PlaywrightNotInstalledError } from '../lib/playwright.js'
import type { ValidateA11yResult, AxeViolationResult } from '../lib/results.js'
import {
  validateFormat,
  validateTimeout,
  requireUrl,
} from '../lib/validation.js'

// ============================================================================
// Types
// ============================================================================

const VALID_FORMATS = ['full', 'compact', 'json'] as const

interface ValidateA11yOptions {
  level?: string
  format?: string
  timeout?: string
  ignoreIncomplete?: boolean
}

type WcagLevel = 'a' | 'aa' | 'aaa'

// Internal axe-core result types (from library)
interface AxeResults {
  violations: AxeViolationResult[]
  passes: unknown[]
  incomplete: unknown[]
  inapplicable: unknown[]
  url: string
  timestamp: string
}

// ============================================================================
// WCAG Level Configuration
// ============================================================================

const WCAG_TAGS: Record<WcagLevel, string[]> = {
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

const VALID_LEVELS = ['a', 'aa', 'aaa'] as const

// ============================================================================
// Severity Formatting
// ============================================================================

const SEVERITY_ORDER = ['critical', 'serious', 'moderate', 'minor'] as const
type Severity = (typeof SEVERITY_ORDER)[number]

const SEVERITY_ICONS: Record<Severity, string> = {
  critical: '✗',
  serious: '✗',
  moderate: '⚠',
  minor: 'ℹ',
}

// ============================================================================
// Output Formatting
// ============================================================================

function formatHeader(url: string, level: WcagLevel): string {
  const lines: string[] = []
  lines.push('┌─────────────────────────────────────────────────────────────')
  lines.push('│ Accessibility Validation')
  lines.push(`│ ${url}`)
  lines.push('├─────────────────────────────────────────────────────────────')
  lines.push(`│ WCAG Level: ${level.toUpperCase()}`)
  lines.push('└─────────────────────────────────────────────────────────────')
  return lines.join('\n')
}

function formatViolation(violation: AxeViolationResult): string {
  const lines: string[] = []
  const severity = violation.impact || 'moderate'
  const icon = SEVERITY_ICONS[severity as Severity] || '⚠'

  lines.push(`${icon} [${severity}] ${violation.id}`)
  lines.push(`    ${violation.help}`)

  // Show affected elements (limit to 3)
  const nodesToShow = violation.nodes.slice(0, 3)
  for (const node of nodesToShow) {
    // Truncate long HTML
    const html =
      node.html.length > 60 ? node.html.substring(0, 60) + '...' : node.html
    lines.push(`    Element: ${html}`)

    if (node.failureSummary) {
      // Format the failure summary (remove "Fix any of the following:" prefix if present)
      const summary = node.failureSummary
        .replace(/^Fix (any|all) of the following:\s*/i, '')
        .split('\n')[0]
      if (summary) {
        lines.push(`    Fix: ${summary}`)
      }
    }
  }

  if (violation.nodes.length > 3) {
    lines.push(`    ... and ${violation.nodes.length - 3} more instance(s)`)
  }

  return lines.join('\n')
}

function formatIncomplete(incomplete: AxeViolationResult): string {
  const lines: string[] = []

  lines.push(`⚠ ${incomplete.id}`)
  lines.push(`    ${incomplete.help}`)

  // Show affected elements (limit to 3)
  const nodesToShow = incomplete.nodes.slice(0, 3)
  for (const node of nodesToShow) {
    const html =
      node.html.length > 60 ? node.html.substring(0, 60) + '...' : node.html
    lines.push(`    Element: ${html}`)
  }

  if (incomplete.nodes.length > 3) {
    lines.push(`    ... and ${incomplete.nodes.length - 3} more instance(s)`)
  }

  return lines.join('\n')
}

function formatSummary(results: AxeResults): string {
  const lines: string[] = []
  lines.push('┌─────────────────────────────────────────────────────────────')
  lines.push('│ Summary')
  lines.push('├─────────────────────────────────────────────────────────────')
  lines.push(`│ Violations: ${results.violations.length}`)
  lines.push(`│ Passes:     ${results.passes.length}`)
  lines.push(`│ Incomplete: ${results.incomplete.length}`)
  lines.push('└─────────────────────────────────────────────────────────────')
  return lines.join('\n')
}

/**
 * Format compact output - summary counts only
 */
function formatCompact(
  results: AxeResults,
  url: string,
  level: WcagLevel,
  timedOut: boolean,
): string {
  const lines: string[] = []

  lines.push('┌─────────────────────────────────────────────────────────────')
  lines.push('│ Accessibility Validation')
  lines.push(`│ ${url}`)
  lines.push('├─────────────────────────────────────────────────────────────')
  lines.push(`│ WCAG Level: ${level.toUpperCase()}`)

  if (timedOut) {
    lines.push('│ ⚠ Page load timed out')
  }

  const violations = results.violations
  const incomplete = results.incomplete as AxeViolationResult[]

  // Count violations by severity
  const bySeverity = new Map<string, number>()
  for (const v of violations) {
    const severity = v.impact || 'moderate'
    bySeverity.set(severity, (bySeverity.get(severity) || 0) + 1)
  }

  const summaryParts: string[] = []
  for (const severity of SEVERITY_ORDER) {
    const count = bySeverity.get(severity)
    if (count) {
      summaryParts.push(`${count} ${severity}`)
    }
  }

  lines.push(
    `│ Violations: ${violations.length}${summaryParts.length > 0 ? ` (${summaryParts.join(', ')})` : ''}`,
  )
  lines.push(`│ Incomplete: ${incomplete.length}`)
  lines.push(`│ Passes:     ${results.passes.length}`)

  if (violations.length === 0 && incomplete.length === 0) {
    lines.push('│ ✓ No accessibility issues found')
  } else if (violations.length > 0) {
    lines.push(`│ ✗ ${violations.length} violation(s) found`)
  }

  lines.push('└─────────────────────────────────────────────────────────────')

  return lines.join('\n')
}

function formatResults(
  results: AxeResults,
  url: string,
  level: WcagLevel,
  timedOut: boolean,
): string {
  const lines: string[] = []

  // Header
  lines.push(formatHeader(url, level))
  lines.push('')

  // Timeout warning
  if (timedOut) {
    lines.push('⚠ Page load timed out. Results may be incomplete.\n')
  }

  const violations = results.violations
  const incomplete = results.incomplete as AxeViolationResult[]

  // No violations case
  if (violations.length === 0) {
    lines.push(`✓ No accessibility violations found`)
    lines.push('')
  } else {
    // Count by severity
    const bySeverity = new Map<string, number>()
    for (const v of violations) {
      const severity = v.impact || 'moderate'
      bySeverity.set(severity, (bySeverity.get(severity) || 0) + 1)
    }

    const summaryParts: string[] = []
    for (const severity of SEVERITY_ORDER) {
      const count = bySeverity.get(severity)
      if (count) {
        summaryParts.push(`${count} ${severity}`)
      }
    }

    lines.push(`✗ ${violations.length} violation(s) found`)
    lines.push(`  ${summaryParts.join(', ')}`)
    lines.push('')

    // Group violations by severity
    const groupedViolations = new Map<Severity, AxeViolationResult[]>()
    for (const v of violations) {
      const severity = (v.impact || 'moderate') as Severity
      if (!groupedViolations.has(severity)) {
        groupedViolations.set(severity, [])
      }
      groupedViolations.get(severity)!.push(v)
    }

    // Output violations by severity (most severe first)
    for (const severity of SEVERITY_ORDER) {
      const group = groupedViolations.get(severity)
      if (group && group.length > 0) {
        lines.push(`${severity.charAt(0).toUpperCase() + severity.slice(1)}:`)
        for (let i = 0; i < group.length; i++) {
          lines.push(formatViolation(group[i]!))
          if (i < group.length - 1) lines.push('')
        }
        lines.push('')
      }
    }
  }

  // Always show incomplete checks (they need manual review)
  if (incomplete.length > 0) {
    lines.push('Incomplete (needs manual review):')
    for (let i = 0; i < incomplete.length; i++) {
      lines.push(formatIncomplete(incomplete[i]!))
      if (i < incomplete.length - 1) lines.push('')
    }
    lines.push('')
  }

  // Always show summary at the end
  lines.push(formatSummary(results))

  return lines.join('\n')
}

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

async function runAxeAnalysis(
  url: string,
  level: WcagLevel,
  timeoutMs: number,
): Promise<{ results: AxeResults; timedOut: boolean }> {
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

// ============================================================================
// Main Command
// ============================================================================

export async function validateA11y(
  url: string,
  options: ValidateA11yOptions,
): Promise<void> {
  // Validate URL
  requireUrl(url, 'validate:a11y')

  // Validate format option
  const format = validateFormat(options.format, VALID_FORMATS)

  // Parse and validate WCAG level
  const levelInput = (options.level || 'aa').toLowerCase()
  if (!VALID_LEVELS.includes(levelInput as WcagLevel)) {
    console.error(
      `Error: Invalid WCAG level "${options.level}". Valid levels: A, AA, AAA`,
    )
    process.exit(1)
  }
  const level = levelInput as WcagLevel

  // Parse timeout
  const timeoutMs = validateTimeout(options.timeout)

  const ignoreIncomplete = options.ignoreIncomplete ?? false

  try {
    const { results, timedOut } = await runAxeAnalysis(url, level, timeoutMs)

    const hasViolations = results.violations.length > 0
    const hasIncomplete = results.incomplete.length > 0

    // Determine if we should exit with error
    // Violations always cause error
    // Incomplete causes error unless --ignore-incomplete is set
    const shouldError = hasViolations || (hasIncomplete && !ignoreIncomplete)

    // JSON output
    if (format === 'json') {
      const jsonResult: ValidateA11yResult = {
        url,
        level: level.toUpperCase() as 'A' | 'AA' | 'AAA',
        timedOut,
        violations: results.violations.length,
        passes: results.passes.length,
        incomplete: results.incomplete.length,
        incompleteIgnored: ignoreIncomplete && hasIncomplete,
        results: {
          violations: results.violations,
          passes: results.passes,
          incomplete: results.incomplete,
        },
      }
      console.log(JSON.stringify(jsonResult, null, 2))

      if (shouldError) {
        process.exit(1)
      }
      return
    }

    // Compact output
    if (format === 'compact') {
      console.log(formatCompact(results, url, level, timedOut))

      // Show ignored message if applicable
      if (ignoreIncomplete && hasIncomplete) {
        console.log(
          `\n${results.incomplete.length} incomplete check(s) ignored`,
        )
      }

      if (shouldError) {
        process.exit(1)
      }
      return
    }

    // Full output (default)
    console.log(formatResults(results, url, level, timedOut))

    // Show ignored message if applicable
    if (ignoreIncomplete && hasIncomplete) {
      console.log(`\n${results.incomplete.length} incomplete check(s) ignored`)
    }

    if (shouldError) {
      process.exit(1)
    }
  } catch (error) {
    if (error instanceof PlaywrightNotInstalledError) {
      console.error(
        `Error: This command requires Playwright.\n\n${error.getInstallInstructions()}`,
      )
    } else if (error instanceof Error) {
      console.error(`Error: ${error.message}`)
    } else {
      console.error('An unknown error occurred')
    }
    process.exit(1)
  }
}
