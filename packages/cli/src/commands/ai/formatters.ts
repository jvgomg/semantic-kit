import type { AiResult } from '@webspecs/core'
import type { OutputFormat } from '../../lib/arguments.js'
import {
  createFormatterContext,
  formatIssues,
  formatTableGroups,
  type TableGroup,
} from '../../lib/cli-formatting/index.js'
import type { OutputMode } from '../../lib/output-mode.js'
import { buildIssues } from './issues.js'

// Re-export for backwards compatibility
export { buildIssues, type AiIssue } from './issues.js'

// ============================================================================
// Table Groups
// ============================================================================

/**
 * Build table groups for the AI result.
 */
function buildTableGroups(result: AiResult): TableGroup[] {
  const { hiddenContentAnalysis } = result

  // ANALYSIS group
  const analysisRows: { key: string; value: string | number }[] = [
    { key: 'Word Count', value: result.wordCount },
  ]

  // Add Hidden row only if there's streaming content
  if (hiddenContentAnalysis.hasStreamingContent) {
    analysisRows.push({
      key: 'Hidden',
      value: `${hiddenContentAnalysis.hiddenWordCount.toLocaleString()} words (${hiddenContentAnalysis.hiddenPercentage}%)`,
    })
  }

  analysisRows.push({
    key: 'Readerable',
    value: result.isReaderable ? 'Yes' : 'No',
  })

  // META group
  const metaRows = [
    { key: 'Title', value: result.title ?? undefined },
    { key: 'Byline', value: result.byline ?? undefined },
    { key: 'Site', value: result.siteName ?? undefined },
    {
      key: 'Excerpt',
      value: result.excerpt
        ? result.excerpt.length > 80
          ? result.excerpt.slice(0, 77) + '...'
          : result.excerpt
        : undefined,
    },
  ]

  return [
    { header: 'Analysis', rows: analysisRows },
    { header: 'Meta', rows: metaRows },
  ]
}

// ============================================================================
// Output Formats
// ============================================================================

/**
 * Truncate text to a specified number of words.
 * Adds "..." if truncated.
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
  result: AiResult,
  ctx: ReturnType<typeof createFormatterContext>,
  options?: { compact?: boolean },
): string {
  const compact = options?.compact ?? false
  const sections: string[] = []

  // Issues section
  const issues = buildIssues(result)
  if (issues.length > 0) {
    sections.push(formatIssues(issues, ctx, { compact }))
    sections.push('') // blank line after issues
  }

  // If no content was extracted, stop here
  if (result.wordCount === 0) {
    return sections.join('\n')
  }

  // Table groups (Analysis + Meta)
  const tableGroups = buildTableGroups(result)
  sections.push(formatTableGroups(tableGroups, ctx))

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
 * Format AI result for terminal output (full or compact mode).
 * JSON format is handled directly by runCommand.
 */
export function formatAiOutput(
  result: AiResult,
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
