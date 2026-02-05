import {
  analyzeAriaSnapshot,
  compareSnapshots,
  hasDifferences,
  type SnapshotDiff,
} from '../lib/aria-snapshot.js'
import {
  fetchAccessibilityComparison,
  PlaywrightNotInstalledError,
} from '../lib/playwright.js'
import type { A11yCompareResult } from '../lib/results.js'
import {
  requireUrl,
  validateFormat,
  validateTimeout,
} from '../lib/validation.js'

// ============================================================================
// Types
// ============================================================================

type OutputFormat = 'full' | 'compact' | 'json'

interface A11yCompareOptions {
  format?: OutputFormat
  timeout?: string
}

// ============================================================================
// Output Formatting
// ============================================================================

/**
 * Format a change value with + or - prefix
 */
function formatChange(value: number): string {
  if (value > 0) return `+${value}`
  if (value < 0) return `${value}`
  return '0'
}

/**
 * Format compact view
 */
function formatCompact(
  diff: SnapshotDiff,
  _staticCounts: Record<string, number>,
  _hydratedCounts: Record<string, number>,
  url: string,
  timedOut: boolean,
): string {
  const lines: string[] = []

  lines.push('┌─────────────────────────────────────────────────────────────')
  lines.push('│ Accessibility Comparison')
  lines.push(`│ ${url}`)
  if (timedOut) {
    lines.push('│ ⚠ Timeout reached — comparison may be incomplete')
  }
  lines.push('├─────────────────────────────────────────────────────────────')

  if (!hasDifferences(diff)) {
    lines.push(
      '│ ✓ No differences between static and hydrated accessibility trees',
    )
  } else {
    // Show summary of count changes
    for (const change of diff.countChanges.slice(0, 5)) {
      const delta = change.hydrated - change.static
      lines.push(
        `│ ${change.role}: ${change.static} → ${change.hydrated} (${formatChange(delta)})`,
      )
    }
    if (diff.countChanges.length > 5) {
      lines.push(`│ ... and ${diff.countChanges.length - 5} more role changes`)
    }
  }

  lines.push('└─────────────────────────────────────────────────────────────')

  return lines.join('\n')
}

/**
 * Format expanded view
 */
function formatExpanded(
  diff: SnapshotDiff,
  _staticSnapshot: string,
  _hydratedSnapshot: string,
  url: string,
  timedOut: boolean,
): string {
  const lines: string[] = []
  const LIMIT = 15

  lines.push('┌─────────────────────────────────────────────────────────────')
  lines.push('│ Accessibility Comparison')
  lines.push(`│ ${url}`)
  if (timedOut) {
    lines.push('│ ⚠ Timeout reached — comparison may be incomplete')
  }
  lines.push('├─────────────────────────────────────────────────────────────')

  if (!hasDifferences(diff)) {
    lines.push(
      '│ ✓ No differences between static and hydrated accessibility trees',
    )
    lines.push('└─────────────────────────────────────────────────────────────')
    return lines.join('\n')
  }

  // Summary of role count changes
  if (diff.countChanges.length > 0) {
    lines.push('│ Role Changes')
    for (const change of diff.countChanges) {
      const delta = change.hydrated - change.static
      const prefix = delta > 0 ? '+' : ''
      lines.push(
        `│   ${change.role}: ${change.static} → ${change.hydrated} (${prefix}${delta})`,
      )
    }
  }

  // Show added elements
  if (diff.added.length > 0) {
    lines.push('├─────────────────────────────────────────────────────────────')
    lines.push('│ Added by JavaScript')
    const addedToShow = diff.added.slice(0, LIMIT)
    for (const line of addedToShow) {
      // Trim and truncate long lines
      const trimmed = line.trim()
      const display =
        trimmed.length > 55 ? trimmed.slice(0, 52) + '...' : trimmed
      lines.push(`│   + ${display}`)
    }
    if (diff.added.length > LIMIT) {
      lines.push(`│   ... and ${diff.added.length - LIMIT} more`)
    }
  }

  // Show removed elements (less common, but possible if JS removes content)
  if (diff.removed.length > 0) {
    lines.push('├─────────────────────────────────────────────────────────────')
    lines.push('│ Removed by JavaScript')
    const removedToShow = diff.removed.slice(0, LIMIT)
    for (const line of removedToShow) {
      const trimmed = line.trim()
      const display =
        trimmed.length > 55 ? trimmed.slice(0, 52) + '...' : trimmed
      lines.push(`│   - ${display}`)
    }
    if (diff.removed.length > LIMIT) {
      lines.push(`│   ... and ${diff.removed.length - LIMIT} more`)
    }
  }

  lines.push('└─────────────────────────────────────────────────────────────')

  return lines.join('\n')
}

// ============================================================================
// Main Command
// ============================================================================

const VALID_FORMATS: OutputFormat[] = ['full', 'compact', 'json']

export async function a11yCompareView(
  target: string,
  options: A11yCompareOptions,
): Promise<void> {
  requireUrl(target, 'a11y:compare')
  const timeoutMs = validateTimeout(options.timeout)
  const format = validateFormat(options.format, VALID_FORMATS)

  try {
    const { static: staticResult, hydrated: hydratedResult } =
      await fetchAccessibilityComparison(target, timeoutMs)

    const timedOut = staticResult.timedOut || hydratedResult.timedOut

    // Compare the snapshots
    const diff = compareSnapshots(
      staticResult.snapshot,
      hydratedResult.snapshot,
    )
    const staticAnalysis = analyzeAriaSnapshot(staticResult.snapshot)
    const hydratedAnalysis = analyzeAriaSnapshot(hydratedResult.snapshot)

    // Build the result
    const result: A11yCompareResult = {
      url: target,
      hasDifferences: hasDifferences(diff),
      static: {
        snapshot: staticResult.snapshot,
        counts: staticAnalysis.counts,
        timedOut: staticResult.timedOut,
      },
      hydrated: {
        snapshot: hydratedResult.snapshot,
        counts: hydratedAnalysis.counts,
        timedOut: hydratedResult.timedOut,
      },
      diff,
    }

    // JSON output
    if (format === 'json') {
      console.log(JSON.stringify(result, null, 2))
      return
    }

    // Compact view
    if (format === 'compact') {
      console.log(
        formatCompact(
          diff,
          staticAnalysis.counts,
          hydratedAnalysis.counts,
          target,
          timedOut,
        ),
      )
      return
    }

    // Default: expanded view
    console.log(
      formatExpanded(
        diff,
        staticResult.snapshot,
        hydratedResult.snapshot,
        target,
        timedOut,
      ),
    )
  } catch (error) {
    if (error instanceof PlaywrightNotInstalledError) {
      console.error(
        `Error: The 'a11y:compare' command requires Playwright.\n\n${error.getInstallInstructions()}`,
      )
    } else if (error instanceof Error) {
      console.error(`Error: ${error.message}`)
    } else {
      console.error('An unknown error occurred')
    }
    process.exit(1)
  }
}
