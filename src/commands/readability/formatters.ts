/**
 * Readability utility formatters.
 *
 * Formats raw Readability extraction results for CLI output.
 * Shows all metrics including link density for developer analysis.
 */
import {
  createFormatterContext,
  formatTableGroups,
  type TableGroup,
} from '../../lib/cli-formatting/index.js'
import type { OutputMode } from '../../lib/output-mode.js'
import type { ReadabilityJsResult, ReadabilityUtilityResult } from '../../lib/results.js'
import type { OutputFormat } from '../../lib/validation.js'

// ============================================================================
// Table Groups
// ============================================================================

/**
 * Format link density as a readable string with assessment.
 */
function formatLinkDensity(density: number): string {
  const percentage = (density * 100).toFixed(1)
  if (density < 0.1) {
    return `${percentage}% (low - good)`
  } else if (density < 0.3) {
    return `${percentage}% (moderate)`
  } else {
    return `${percentage}% (high - may indicate link farm)`
  }
}

/**
 * Build table groups for the readability result.
 */
function buildTableGroups(result: ReadabilityUtilityResult): TableGroup[] {
  // Extraction results group
  const extractionRows = result.extraction
    ? [
        { key: 'Title', value: result.extraction.title ?? '(not found)' },
        { key: 'Byline', value: result.extraction.byline ?? '(not found)' },
        {
          key: 'Site Name',
          value: result.extraction.siteName ?? '(not found)',
        },
        {
          key: 'Excerpt',
          value: result.extraction.excerpt
            ? result.extraction.excerpt.length > 80
              ? result.extraction.excerpt.slice(0, 77) + '...'
              : result.extraction.excerpt
            : '(not found)',
        },
        ...(result.extraction.publishedTime
          ? [{ key: 'Published', value: result.extraction.publishedTime }]
          : []),
      ]
    : [{ key: 'Status', value: 'Extraction failed - no content found' }]

  // Full metrics group (includes link density)
  const metricsRows = [
    { key: 'Word Count', value: result.metrics.wordCount.toLocaleString() },
    {
      key: 'Character Count',
      value: result.metrics.characterCount.toLocaleString(),
    },
    {
      key: 'Paragraph Count',
      value: result.metrics.paragraphCount.toLocaleString(),
    },
    {
      key: 'Link Density',
      value: formatLinkDensity(result.metrics.linkDensity),
    },
    { key: 'Readerable', value: result.metrics.isReaderable ? 'Yes' : 'No' },
  ]

  return [
    { header: 'Extraction Results', rows: extractionRows },
    { header: 'Readability Metrics', rows: metricsRows },
  ]
}

// ============================================================================
// Output Formats
// ============================================================================

/**
 * Truncate text to a specified number of words.
 */
function truncateToWords(text: string, maxWords: number): string {
  const words = text.split(/\s+/)
  if (words.length <= maxWords) {
    return text
  }
  return words.slice(0, maxWords).join(' ') + '...'
}

/**
 * Format terminal output - full or compact mode.
 */
function formatTerminal(
  result: ReadabilityUtilityResult,
  ctx: ReturnType<typeof createFormatterContext>,
  options?: { compact?: boolean },
): string {
  const compact = options?.compact ?? false
  const sections: string[] = []

  // Table groups (Extraction Results + Readability Metrics)
  const tableGroups = buildTableGroups(result)
  sections.push(formatTableGroups(tableGroups, ctx))

  // If no content was extracted, stop here
  if (result.metrics.wordCount === 0) {
    sections.push('')
    sections.push('No content could be extracted from this page.')
    return sections.join('\n')
  }

  // Horizontal rule before markdown content
  sections.push('')
  sections.push('---')
  sections.push('')

  // Markdown content (truncated in compact mode)
  if (compact) {
    sections.push(truncateToWords(result.markdown, 25))
  } else {
    sections.push(result.markdown)
  }

  return sections.join('\n')
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Format readability result for terminal output (full or compact mode).
 * JSON format is handled directly by runCommand.
 */
export function formatReadabilityOutput(
  result: ReadabilityUtilityResult,
  format: OutputFormat,
  mode: OutputMode,
): string {
  const ctx = createFormatterContext(mode)

  switch (format) {
    case 'compact':
      return formatTerminal(result, ctx, { compact: true })
    case 'full':
    default:
      return formatTerminal(result, ctx)
  }
}

/**
 * Format readability:js result for terminal output (full or compact mode).
 * Includes timeout status indicator.
 */
export function formatReadabilityJsOutput(
  result: ReadabilityJsResult,
  format: OutputFormat,
  mode: OutputMode,
): string {
  const ctx = createFormatterContext(mode)
  const sections: string[] = []

  // Show timeout warning if applicable
  if (result.timedOut) {
    sections.push('⚠ Page load timed out - results may be incomplete')
    sections.push('')
  }

  // Use the same terminal formatting as the static command
  switch (format) {
    case 'compact':
      sections.push(formatTerminal(result, ctx, { compact: true }))
      break
    case 'full':
    default:
      sections.push(formatTerminal(result, ctx))
  }

  return sections.join('\n')
}
