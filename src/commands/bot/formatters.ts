import {
  colorize,
  colors,
  createFormatterContext,
  formatIssues,
  formatTable,
  type FormatterContext,
  type Issue,
  type TableRow,
} from '../../lib/cli-formatting/index.js'
import type { OutputMode } from '../../lib/output-mode.js'
import type { BotResult, SectionInfo } from '../../lib/results.js'
import type { OutputFormat } from '../../lib/validation.js'

// ============================================================================
// Issue Building
// ============================================================================

/**
 * Build an array of issues from the bot result.
 * Issues are ordered by priority (highest first):
 * 1. Timeout (if page load timed out)
 * 2. No content extracted
 * 3. High JS dependency (>50%)
 * 4. Some JS dependency (>0% and <=50%)
 * 5. Sections hidden from bots
 */
export function buildIssues(result: BotResult): Issue[] {
  const issues: Issue[] = []
  const { comparison, timedOut, content } = result

  // 1. Timeout warning
  if (timedOut) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      title: 'Page Load Timeout',
      description: 'Rendering exceeded timeout. Analysis shows partial content.',
      tip: 'Increase timeout with --timeout or optimize page load.',
    })
  }

  // 2. No content extracted
  if (content.wordCount === 0) {
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

// ============================================================================
// Section Formatting
// ============================================================================

/**
 * Format sections that are only visible after JavaScript execution.
 * Output format:
 * ```
 * [SECTIONS]
 * Only visible after JavaScript:
 *   h2  Introduction (~234 words)
 *   h2  Features (~567 words)
 * ```
 */
function formatSections(sections: SectionInfo[], ctx: FormatterContext): string {
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
    const wordInfo = section.wordCount > 0 ? ` (~${section.wordCount.toLocaleString()} words)` : ''

    if (ctx.mode === 'tty') {
      const dimLevel = colorize(levelLabel.padEnd(4), colors.dim, ctx)
      lines.push(`  ${dimLevel}${section.heading}${wordInfo}`)
    } else {
      lines.push(`  ${levelLabel}  ${section.heading}${wordInfo}`)
    }
  }

  return lines.join('\n')
}

// ============================================================================
// Table Groups
// ============================================================================

/**
 * Build the COMPARISON table group.
 */
function buildComparisonTable(result: BotResult): TableRow[] {
  const { comparison } = result

  return [
    { key: 'Static HTML', value: `${comparison.staticWordCount.toLocaleString()} words` },
    { key: 'Rendered DOM', value: `${comparison.renderedWordCount.toLocaleString()} words` },
    {
      key: 'JS-Dependent',
      value: `${comparison.jsDependentWordCount.toLocaleString()} words (${comparison.jsDependentPercentage}%)`,
    },
  ]
}

/**
 * Build the META table group from rendered content.
 */
function buildMetaTable(result: BotResult): TableRow[] {
  const { content } = result

  return [
    { key: 'Title', value: content.title ?? undefined },
    { key: 'Author', value: content.author ?? undefined },
    { key: 'Site', value: content.siteName ?? undefined },
    {
      key: 'Excerpt',
      value: content.excerpt
        ? content.excerpt.length > 80
          ? content.excerpt.slice(0, 77) + '...'
          : content.excerpt
        : undefined,
    },
  ]
}


// ============================================================================
// Terminal Formatting
// ============================================================================

/**
 * Format terminal output - full or compact mode.
 */
function formatTerminal(
  result: BotResult,
  ctx: FormatterContext,
  options?: { compact?: boolean; showContent?: boolean },
): string {
  const compact = options?.compact ?? false
  const showContent = options?.showContent ?? false
  const sections: string[] = []

  // Issues section with success message when no issues
  const issues = buildIssues(result)
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
  const sectionsOutput = formatSections(result.comparison.sectionsOnlyInRendered, ctx)
  if (sectionsOutput) {
    sections.push('')
    sections.push(sectionsOutput)
  }

  // META table
  const metaRows = buildMetaTable(result)
  const validMetaRows = metaRows.filter((row) => row.value !== undefined && row.value !== null)
  if (validMetaRows.length > 0) {
    sections.push('')
    if (ctx.mode === 'tty') {
      sections.push(colorize('META', colors.gray, ctx))
    } else {
      sections.push('META')
    }
    sections.push(formatTable(validMetaRows, ctx))
  }

  // Content (if --content flag)
  if (showContent) {
    sections.push('')
    sections.push('---')
    sections.push('')

    if (result.content.wordCount === 0) {
      sections.push('No main content could be extracted from this page.')
    } else {
      sections.push(result.content.markdown)
    }
  }

  return sections.join('\n')
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Format bot result for terminal output (full or compact mode).
 * JSON format is handled directly by runCommand.
 */
export function formatBotOutput(
  result: BotResult,
  format: OutputFormat,
  mode: OutputMode,
  showContent?: boolean,
): string {
  const ctx = createFormatterContext(mode)

  switch (format) {
    case 'compact':
      return formatTerminal(result, ctx, { compact: true })
    case 'full':
    default:
      return formatTerminal(result, ctx, { showContent })
  }
}
