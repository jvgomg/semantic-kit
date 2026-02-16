/**
 * Readability utility formatters.
 *
 * Formats raw Readability extraction results for CLI output.
 * Shows all metrics including link density for developer analysis.
 */
import type {
  ReadabilityJsResult,
  ReadabilityUtilityResult,
} from '@webspecs/core'
import { createPatch } from 'diff'

import type { OutputFormat } from '../../lib/arguments.js'
import {
  colorize,
  colors,
  createFormatterContext,
  formatIssues,
  formatTable,
  formatTableGroups,
  type FormatterContext,
  type Issue,
  type TableGroup,
} from '../../lib/cli-formatting/index.js'
import type { OutputMode } from '../../lib/output-mode.js'
import type { ReadabilityCompareResult, SectionInfo } from './types.js'

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

// ============================================================================
// Compare Output
// ============================================================================

/**
 * Build an array of issues from the compare result.
 */
export function buildCompareIssues(result: ReadabilityCompareResult): Issue[] {
  const issues: Issue[] = []
  const { comparison, timedOut, rendered } = result

  // 1. Timeout warning
  if (timedOut) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      title: 'Page Load Timeout',
      description:
        'Rendering exceeded timeout. Analysis shows partial content.',
      tip: 'Increase timeout with --timeout or optimize page load.',
    })
  }

  // 2. No content extracted
  if (rendered.metrics.wordCount === 0) {
    issues.push({
      type: 'warning',
      severity: 'high',
      title: 'No Content Extracted',
      description: 'No main content could be extracted from the rendered page.',
    })
  }

  // 3. High JS dependency (>50%)
  if (comparison.jsDependentPercentage > 50) {
    issues.push({
      type: 'warning',
      severity: 'high',
      title: 'High JavaScript Dependency',
      description: `${comparison.jsDependentPercentage}% of content requires JavaScript. Search bots may miss ${comparison.jsDependentWordCount.toLocaleString()} words.`,
      tip: 'Consider server-side rendering for SEO-critical content.',
    })
  }
  // 4. Some JS dependency (>0% and <=50%)
  else if (comparison.jsDependentPercentage > 0) {
    issues.push({
      type: 'info',
      severity: 'low',
      title: 'Some JavaScript Content',
      description: `${comparison.jsDependentPercentage}% of content requires JavaScript (${comparison.jsDependentWordCount.toLocaleString()} words).`,
    })
  }

  // 5. Sections hidden from bots
  if (comparison.sectionsOnlyInRendered.length > 0) {
    const count = comparison.sectionsOnlyInRendered.length
    issues.push({
      type: 'info',
      severity: 'low',
      title: 'Sections Hidden from Bots',
      description: `${count} section${count === 1 ? '' : 's'} only appear after JavaScript execution.`,
    })
  }

  return issues
}

/**
 * Format sections that are only visible after JavaScript execution.
 */
function formatSections(
  sections: SectionInfo[],
  ctx: FormatterContext,
): string {
  if (sections.length === 0) {
    return ''
  }

  const lines: string[] = []

  // Header
  if (ctx.mode === 'tty') {
    lines.push(colorize('SECTIONS', colors.gray, ctx))
  } else {
    lines.push('SECTIONS')
  }

  // Subheading
  const subheading = 'Only visible after JavaScript:'
  if (ctx.mode === 'tty') {
    lines.push(colorize(subheading, colors.dim, ctx))
  } else {
    lines.push(subheading)
  }

  // Section list
  for (const section of sections) {
    const levelLabel = `h${section.level}`
    if (ctx.mode === 'tty') {
      const dimLevel = colorize(levelLabel.padEnd(4), colors.dim, ctx)
      lines.push(`  ${dimLevel}${section.heading}`)
    } else {
      lines.push(`  ${levelLabel}  ${section.heading}`)
    }
  }

  return lines.join('\n')
}

/**
 * Build the COMPARISON table.
 */
function buildComparisonTable(result: ReadabilityCompareResult) {
  const { comparison } = result

  return [
    {
      key: 'Static HTML',
      value: `${comparison.staticWordCount.toLocaleString()} words`,
    },
    {
      key: 'Rendered DOM',
      value: `${comparison.renderedWordCount.toLocaleString()} words`,
    },
    {
      key: 'JS-Dependent',
      value: `${comparison.jsDependentWordCount.toLocaleString()} words (${comparison.jsDependentPercentage}%)`,
    },
  ]
}

/**
 * Build the META table from rendered content.
 */
function buildMetaTable(result: ReadabilityCompareResult) {
  const { rendered } = result
  const extraction = rendered.extraction

  if (!extraction) {
    return []
  }

  return [
    { key: 'Title', value: extraction.title ?? undefined },
    { key: 'Author', value: extraction.byline ?? undefined },
    { key: 'Site', value: extraction.siteName ?? undefined },
    {
      key: 'Excerpt',
      value: extraction.excerpt
        ? extraction.excerpt.length > 80
          ? extraction.excerpt.slice(0, 77) + '...'
          : extraction.excerpt
        : undefined,
    },
  ]
}

/**
 * Format a unified diff between two markdown strings.
 */
function formatUnifiedDiff(
  staticMarkdown: string,
  renderedMarkdown: string,
  ctx: FormatterContext,
): string {
  const patch = createPatch(
    'content',
    staticMarkdown,
    renderedMarkdown,
    'Static HTML',
    'Rendered DOM',
  )

  // Skip the header lines (first 4 lines) from the patch
  const lines = patch.split('\n').slice(4)

  if (ctx.mode === 'tty') {
    // Colorize the diff output
    return lines
      .map((line) => {
        if (line.startsWith('+')) {
          return colorize(line, colors.green, ctx)
        } else if (line.startsWith('-')) {
          return colorize(line, colors.red, ctx)
        } else if (line.startsWith('@@')) {
          return colorize(line, colors.cyan, ctx)
        }
        return line
      })
      .join('\n')
  }

  return lines.join('\n')
}

/**
 * Format compare terminal output - full or compact mode.
 */
function formatCompareTerminal(
  result: ReadabilityCompareResult,
  ctx: FormatterContext,
  options?: { compact?: boolean },
): string {
  const compact = options?.compact ?? false
  const sections: string[] = []

  // Issues section with success message when no issues
  const issues = buildCompareIssues(result)
  sections.push(
    formatIssues(issues, ctx, {
      compact,
      successMessage: 'No JavaScript dependency detected',
    }),
  )
  sections.push('') // blank line after issues

  // COMPARISON table
  const comparisonRows = buildComparisonTable(result)
  if (ctx.mode === 'tty') {
    sections.push(colorize('COMPARISON', colors.gray, ctx))
  } else {
    sections.push('COMPARISON')
  }
  sections.push(formatTable(comparisonRows, ctx))

  // In compact mode, stop here
  if (compact) {
    return sections.join('\n')
  }

  // SECTIONS (if any)
  const sectionsOutput = formatSections(
    result.comparison.sectionsOnlyInRendered,
    ctx,
  )
  if (sectionsOutput) {
    sections.push('')
    sections.push(sectionsOutput)
  }

  // META table
  const metaRows = buildMetaTable(result)
  const validMetaRows = metaRows.filter(
    (row) => row.value !== undefined && row.value !== null,
  )
  if (validMetaRows.length > 0) {
    sections.push('')
    if (ctx.mode === 'tty') {
      sections.push(colorize('META', colors.gray, ctx))
    } else {
      sections.push('META')
    }
    sections.push(formatTable(validMetaRows, ctx))
  }

  // Content diff
  sections.push('')
  sections.push('---')
  sections.push('')

  if (
    result.rendered.metrics.wordCount === 0 &&
    result.static.metrics.wordCount === 0
  ) {
    sections.push('No main content could be extracted from this page.')
  } else if (result.static.markdown === result.rendered.markdown) {
    sections.push(
      'No content differences between static and rendered versions.',
    )
    sections.push('')
    sections.push(result.rendered.markdown)
  } else {
    if (ctx.mode === 'tty') {
      sections.push(colorize('CONTENT DIFF', colors.gray, ctx))
    } else {
      sections.push('CONTENT DIFF')
    }
    sections.push(
      formatUnifiedDiff(result.static.markdown, result.rendered.markdown, ctx),
    )
  }

  return sections.join('\n')
}

/**
 * Format readability:compare result for terminal output (full or compact mode).
 * JSON format is handled directly by runCommand.
 */
export function formatReadabilityCompareOutput(
  result: ReadabilityCompareResult,
  format: OutputFormat,
  mode: OutputMode,
): string {
  const ctx = createFormatterContext(mode)

  switch (format) {
    case 'compact':
      return formatCompareTerminal(result, ctx, { compact: true })
    case 'full':
    default:
      return formatCompareTerminal(result, ctx)
  }
}
