/**
 * Screen reader command formatters.
 *
 * Formats accessibility analysis in a user-friendly way that helps
 * developers understand how screen readers interpret their page.
 */
import type { ScreenReaderResult } from '@webspecs/core'
import type { OutputFormat } from '../../lib/arguments.js'
import {
  colorize,
  colors,
  createFormatterContext,
  formatIssues,
  formatTableGroups,
  type Issue,
  type TableGroup,
} from '../../lib/cli-formatting/index.js'
import type { OutputMode } from '../../lib/output-mode.js'

// ============================================================================
// Issue Building
// ============================================================================

/**
 * Build issues based on accessibility analysis.
 */
export function buildIssues(result: ScreenReaderResult): Issue[] {
  const issues: Issue[] = []
  const { summary } = result

  // Timeout warning
  if (result.timedOut) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      title: 'Page Load Timeout',
      description:
        'The page did not finish loading within the timeout period. The accessibility analysis may be incomplete.',
      tip: 'Increase the timeout with --timeout or check if the page has performance issues.',
    })
  }

  // Missing main landmark
  if (!summary.hasMainLandmark) {
    issues.push({
      type: 'warning',
      severity: 'high',
      title: 'Missing Main Landmark',
      description:
        'No <main> element found. Screen reader users rely on landmarks to quickly navigate to primary content.',
      tip: 'Add a <main> element to wrap your primary content.',
    })
  }

  // No headings
  if (summary.headingCount === 0) {
    issues.push({
      type: 'warning',
      severity: 'high',
      title: 'No Headings Found',
      description:
        'No heading elements found. Screen reader users navigate by headings to understand page structure.',
      tip: 'Add heading elements (h1-h6) to organize your content hierarchically.',
    })
  }

  // No skip link (info level)
  if (!summary.hasSkipLink && summary.linkCount > 10) {
    issues.push({
      type: 'info',
      severity: 'low',
      title: 'No Skip Link Detected',
      description:
        'No skip link found. Skip links help keyboard and screen reader users bypass navigation.',
      tip: 'Add a "Skip to main content" link at the start of the page.',
    })
  }

  return issues
}

// ============================================================================
// Table Groups
// ============================================================================

/**
 * Build summary table group.
 */
function buildSummaryGroup(result: ScreenReaderResult): TableGroup {
  const { summary } = result

  const rows = [
    { key: 'Page Title', value: summary.pageTitle ?? '(not found)' },
    { key: 'Landmarks', value: summary.landmarkCount },
    { key: 'Headings', value: summary.headingCount },
    { key: 'Links', value: summary.linkCount },
    { key: 'Form Controls', value: summary.formControlCount },
    { key: 'Images', value: summary.imageCount },
  ]

  return { header: 'Summary', rows }
}

/**
 * Build navigation features table group.
 */
function buildNavigationGroup(result: ScreenReaderResult): TableGroup {
  const { summary } = result

  const rows = [
    { key: 'Main Landmark', value: summary.hasMainLandmark ? 'Yes' : 'No' },
    { key: 'Navigation', value: summary.hasNavigation ? 'Yes' : 'No' },
    { key: 'Skip Link', value: summary.hasSkipLink ? 'Yes' : 'No' },
  ]

  return { header: 'Navigation Features', rows }
}

// ============================================================================
// Landmarks Formatting
// ============================================================================

/**
 * Format landmarks section.
 */
function formatLandmarks(
  result: ScreenReaderResult,
  ctx: ReturnType<typeof createFormatterContext>,
): string {
  if (result.landmarks.length === 0) {
    return ''
  }

  const lines: string[] = []

  // Header
  const header = 'LANDMARKS'
  if (ctx.mode === 'tty') {
    lines.push(colorize(header, colors.gray, ctx))
  } else {
    lines.push(header)
  }

  // Landmarks
  for (const landmark of result.landmarks) {
    const name = landmark.name ? ` "${landmark.name}"` : ''
    const stats = `(${landmark.headingCount} headings, ${landmark.linkCount} links)`

    if (ctx.mode === 'tty') {
      lines.push(
        `  ${colorize(landmark.role, colors.cyan, ctx)}${name} ${colorize(stats, colors.gray, ctx)}`,
      )
    } else {
      lines.push(`  ${landmark.role}${name} ${stats}`)
    }
  }

  return lines.join('\n')
}

// ============================================================================
// Headings Formatting
// ============================================================================

/**
 * Format headings outline section.
 */
function formatHeadings(
  result: ScreenReaderResult,
  ctx: ReturnType<typeof createFormatterContext>,
  options?: { limit?: number },
): string {
  if (result.headings.length === 0) {
    return ''
  }

  const lines: string[] = []
  const limit = options?.limit ?? result.headings.length

  // Header
  const header = 'HEADING OUTLINE'
  if (ctx.mode === 'tty') {
    lines.push(colorize(header, colors.gray, ctx))
  } else {
    lines.push(header)
  }

  // Headings with indentation based on level (H1 = 0 spaces, H2 = 2 spaces, etc.)
  const headingsToShow = result.headings.slice(0, limit)
  for (const heading of headingsToShow) {
    const indent = '  '.repeat(heading.level - 1)
    const levelTag = `H${heading.level}`
    const text =
      heading.text.length > 60
        ? heading.text.slice(0, 57) + '...'
        : heading.text

    if (ctx.mode === 'tty') {
      lines.push(
        `${indent}${colorize(levelTag, colors.dim, ctx)}  ${text}`,
      )
    } else {
      lines.push(`${indent}${levelTag}  ${text}`)
    }
  }

  if (result.headings.length > limit) {
    lines.push(`  ... and ${result.headings.length - limit} more headings`)
  }

  return lines.join('\n')
}

// ============================================================================
// Output Formats
// ============================================================================

/**
 * Format terminal output - full or compact mode.
 */
function formatTerminal(
  result: ScreenReaderResult,
  ctx: ReturnType<typeof createFormatterContext>,
  options?: { compact?: boolean },
): string {
  const compact = options?.compact ?? false
  const sections: string[] = []

  // Issues section
  const issues = buildIssues(result)
  if (issues.length > 0) {
    sections.push(formatIssues(issues, ctx, { compact }))
    sections.push('')
  }

  // Summary tables
  const tableGroups = [buildSummaryGroup(result), buildNavigationGroup(result)]
  sections.push(formatTableGroups(tableGroups, ctx))

  // Landmarks
  const landmarksSection = formatLandmarks(result, ctx)
  if (landmarksSection) {
    sections.push('')
    sections.push(landmarksSection)
  }

  // Headings (limited in compact mode)
  const headingsSection = formatHeadings(result, ctx, {
    limit: compact ? 10 : undefined,
  })
  if (headingsSection) {
    sections.push('')
    sections.push(headingsSection)
  }

  return sections.join('\n')
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Format screen reader result for terminal output (full or compact mode).
 * JSON format is handled directly by runCommand.
 */
export function formatScreenReaderOutput(
  result: ScreenReaderResult,
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
