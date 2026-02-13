import {
  createFormatterContext,
  formatIssues,
  formatTableGroups,
  type Issue,
  type TableGroup,
} from '../../lib/cli-formatting/index.js'
import type { OutputMode } from '../../lib/output-mode.js'
import type { AiResult, HiddenContentAnalysis } from '../../lib/results.js'
import type { OutputFormat } from '../../lib/arguments.js'

// ============================================================================
// Issue Building
// ============================================================================

/**
 * Build an array of issues from the AI result.
 * Issues are ordered by priority (highest first):
 * 1. Framework/streaming detection (high severity first)
 * 2. No content extracted
 * 3. Readability warning
 * 4. Short content warning
 */
export function buildIssues(result: AiResult): Issue[] {
  const issues: Issue[] = []
  const { hiddenContentAnalysis } = result

  // 1. Framework/streaming detection (high severity)
  if (hiddenContentAnalysis.hasStreamingContent) {
    const streamingIssue = buildStreamingIssue(hiddenContentAnalysis)
    if (streamingIssue) {
      issues.push(streamingIssue)
    }
  }

  // 2. No content extracted
  if (result.wordCount === 0) {
    issues.push({
      type: 'warning',
      severity: 'high',
      title: 'No Content Extracted',
      description:
        'No main content could be extracted from this page. The page may rely heavily on JavaScript, have an unusual structure, or contain very little text.',
      tip: 'Use --raw to see the static HTML that AI crawlers receive.',
    })
  }

  // 3. Readability warning (only if we have some content)
  if (!result.isReaderable && result.wordCount > 0) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      title: 'Content Extraction Warning',
      description:
        'This page may not be suitable for content extraction (isProbablyReaderable: false).',
      tip: 'Consider adding semantic HTML elements like <article>, <main>, or structured headings.',
    })
  }

  // 4. Short content warning (only if no streaming and has some content)
  if (
    result.wordCount > 0 &&
    result.wordCount < 100 &&
    !hiddenContentAnalysis.hasStreamingContent
  ) {
    issues.push({
      type: 'info',
      severity: 'low',
      title: 'Short Content',
      description: `Very short content extracted (${result.wordCount} words). The page may be JavaScript-heavy.`,
      tip: 'Use --raw to see the static HTML that AI crawlers receive.',
    })
  }

  return issues
}

/**
 * Build a streaming/hidden content issue based on detection results.
 */
function buildStreamingIssue(analysis: HiddenContentAnalysis): Issue | null {
  const { framework, severity, hiddenWordCount, visibleWordCount, hiddenPercentage } =
    analysis

  if (severity === 'none') return null

  const isHighSeverity = severity === 'high'

  if (framework) {
    // Framework-specific message
    return {
      type: 'warning',
      severity: isHighSeverity ? 'high' : 'low',
      title: `${framework.name} Streaming Detected`,
      description: `${hiddenPercentage}% of content is hidden. Visible: ~${visibleWordCount.toLocaleString()} words, Hidden: ~${hiddenWordCount.toLocaleString()} words.${isHighSeverity ? ' AI crawlers will NOT see the hidden content.' : ' Most content is visible to AI crawlers.'}`,
      tip: 'Disable JavaScript in your browser and reload to verify what crawlers see.',
    }
  }

  // Generic hidden content message
  return {
    type: 'warning',
    severity: isHighSeverity ? 'high' : 'low',
    title: 'Hidden Content Detected',
    description: `${hiddenPercentage}% of content is hidden. Visible: ~${visibleWordCount.toLocaleString()} words, Hidden: ~${hiddenWordCount.toLocaleString()} words.${isHighSeverity ? ' This pattern is common with streaming SSR frameworks (Next.js, Remix, Nuxt, SvelteKit).' : ''}`,
    tip: 'Disable JavaScript in your browser and reload to verify what crawlers see.',
  }
}

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
