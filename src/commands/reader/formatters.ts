/**
 * Reader command formatters.
 *
 * Formats reader extraction results for CLI output.
 */
import {
  createFormatterContext,
  formatTableGroups,
  type TableGroup,
} from '../../lib/cli-formatting/index.js'
import type { OutputMode } from '../../lib/output-mode.js'
import type { ReaderResult } from '../../lib/results.js'
import type { OutputFormat } from '../../lib/arguments.js'

// ============================================================================
// Table Groups
// ============================================================================

/**
 * Build table groups for the reader result.
 */
function buildTableGroups(result: ReaderResult): TableGroup[] {
  // Extraction results group
  const extractionRows = [
    { key: 'Title', value: result.title ?? '(not found)' },
    { key: 'Byline', value: result.byline ?? '(not found)' },
    { key: 'Site Name', value: result.siteName ?? '(not found)' },
    {
      key: 'Excerpt',
      value: result.excerpt
        ? result.excerpt.length > 80
          ? result.excerpt.slice(0, 77) + '...'
          : result.excerpt
        : '(not found)',
    },
  ]

  // Add published time if available
  if (result.publishedTime) {
    extractionRows.push({ key: 'Published', value: result.publishedTime })
  }

  // Metrics group
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
  result: ReaderResult,
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
 * Format reader result for terminal output (full or compact mode).
 * JSON format is handled directly by runCommand.
 */
export function formatReaderOutput(
  result: ReaderResult,
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
