import type {
  AxeStaticResult,
  StructureAnalysis,
  StructureComparison,
  StructureWarning,
  LandmarkNode,
  LinkGroup,
} from '@webspecs/core'
import type { OutputFormat } from '../../lib/arguments.js'
import {
  colorize,
  colors,
  createFormatterContext,
  formatHeadingCounts,
  formatHeadingOutline,
  formatIssues,
  formatTable,
  type FormatterContext,
  type Issue,
  type TableRow,
} from '../../lib/cli-formatting/index.js'
import type { OutputMode } from '../../lib/output-mode.js'
import type {
  TuiStructureResult,
  StructureJsInternalResult,
  StructureCompareResult,
  FormatStructureJsOptions,
  FormatStructureCompareOptions,
} from './types.js'

// ============================================================================
// Issue Building
// ============================================================================

/**
 * Convert a StructureWarning to an Issue.
 */
function warningToIssue(warning: StructureWarning): Issue {
  return {
    type: warning.severity === 'error' ? 'error' : 'warning',
    severity: warning.severity === 'error' ? 'high' : 'medium',
    title: warning.message,
    description: warning.details ?? '',
  }
}

/**
 * Build issues for structure command.
 * Issues are ordered by priority:
 * 1. Missing page title
 * 2. Missing language attribute
 * 3. axe-core violations (converted from StructureWarning)
 */
export function buildIssues(
  analysis: StructureAnalysis,
  axeResult: AxeStaticResult,
): Issue[] {
  const issues: Issue[] = []

  // 1. Missing title
  if (!analysis.title) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      title: 'Missing Page Title',
      description: 'The page does not have a <title> element.',
      tip: 'Add a descriptive <title> element inside <head>.',
    })
  }

  // 2. Missing language
  if (!analysis.language) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      title: 'Missing Language Attribute',
      description: 'The <html> element does not have a lang attribute.',
      tip: 'Add lang="en" (or appropriate language code) to the <html> element.',
    })
  }

  // 3. axe-core violations
  for (const violation of axeResult.violationWarnings) {
    issues.push(warningToIssue(violation))
  }

  return issues
}

/**
 * Build issues for structure:js command.
 * Same as structure issues plus timeout warning.
 */
export function buildIssuesJs(
  analysis: StructureAnalysis,
  axeResult: AxeStaticResult,
  timedOut: boolean,
): Issue[] {
  const issues: Issue[] = []

  // 1. Timeout
  if (timedOut) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      title: 'Timeout Reached',
      description:
        'Rendering exceeded timeout. Analysis shows partial content.',
      tip: 'Increase timeout with --timeout or optimize page load.',
    })
  }

  // 2. Missing title
  if (!analysis.title) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      title: 'Missing Page Title',
      description: 'The page does not have a <title> element.',
      tip: 'Add a descriptive <title> element inside <head>.',
    })
  }

  // 3. Missing language
  if (!analysis.language) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      title: 'Missing Language Attribute',
      description: 'The <html> element does not have a lang attribute.',
      tip: 'Add lang="en" (or appropriate language code) to the <html> element.',
    })
  }

  // 4. axe-core violations
  for (const violation of axeResult.violationWarnings) {
    issues.push(warningToIssue(violation))
  }

  return issues
}

/**
 * Build issues for structure:compare command.
 * Returns empty array (success case uses successMessage).
 */
export function buildIssuesCompare(
  _comparison: StructureComparison,
  timedOut: boolean,
): Issue[] {
  const issues: Issue[] = []

  // 1. Timeout
  if (timedOut) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      title: 'Timeout Reached',
      description: 'Rendering exceeded timeout. Comparison may be incomplete.',
      tip: 'Increase timeout with --timeout or optimize page load.',
    })
  }

  // Note: We don't add issues for differences - that's informational, not an issue.
  // The successMessage "No structural differences detected" handles the success case.

  return issues
}

// ============================================================================
// Formatting Helpers
// ============================================================================

/**
 * Format landmark counts for compact display.
 * Example: "banner, navigation, main, contentinfo"
 */
function formatLandmarksCompact(analysis: StructureAnalysis): string {
  const parts: string[] = []
  for (const landmark of analysis.landmarks.skeleton) {
    if (landmark.count > 0) {
      const countSuffix = landmark.count > 1 ? ` (${landmark.count})` : ''
      parts.push(`${landmark.role}${countSuffix}`)
    }
  }
  return parts.length > 0 ? parts.join(', ') : '(none)'
}

/**
 * Format links for compact display.
 * Example: "12 internal, 4 external"
 */
function formatLinksCompact(analysis: StructureAnalysis): string {
  return `${analysis.links.internal.count} internal, ${analysis.links.external.count} external`
}

/**
 * Format skip links as a table.
 */
function buildSkipLinksTable(analysis: StructureAnalysis): TableRow[] {
  if (analysis.skipLinks.length === 0) {
    return [{ key: 'Skip Links', value: '(none)' }]
  }

  return analysis.skipLinks.map((link, idx) => ({
    key: idx === 0 ? 'Skip Links' : '',
    value: `"${link.text}" -> ${link.target}`,
  }))
}

/**
 * Format landmark skeleton for full display.
 */
function formatLandmarkSkeletonFull(
  analysis: StructureAnalysis,
  ctx: FormatterContext,
): string {
  const lines: string[] = []

  // Role counts
  const rows: TableRow[] = analysis.landmarks.skeleton.map((landmark) => ({
    key: landmark.role,
    value: landmark.count,
  }))
  lines.push(formatTable(rows, ctx))

  // Outline (nested structure)
  if (analysis.landmarks.outline.length > 0) {
    lines.push('')
    if (ctx.mode === 'tty') {
      lines.push(colorize('Outline:', colors.dim, ctx))
    } else {
      lines.push('Outline:')
    }
    lines.push(...formatOutlineLines(analysis.landmarks.outline, ctx, 0))
  }

  return lines.join('\n')
}

/**
 * Format outline with indentation (no box-drawing characters).
 */
function formatOutlineLines(
  nodes: LandmarkNode[],
  ctx: FormatterContext,
  indent: number,
): string[] {
  const lines: string[] = []
  const prefix = '  '.repeat(indent)

  for (const node of nodes) {
    const markup = node.role
      ? `<${node.tag} role="${node.role}">`
      : `<${node.tag}>`

    if (ctx.mode === 'tty') {
      lines.push(`${prefix}${colorize(markup, colors.dim, ctx)}`)
    } else {
      lines.push(`${prefix}${markup}`)
    }

    if (node.children.length > 0) {
      lines.push(...formatOutlineLines(node.children, ctx, indent + 1))
    }
  }

  return lines
}

/**
 * Format link groups for full display.
 */
function formatLinkGroupsFull(
  groups: LinkGroup[],
  label: string,
  ctx: FormatterContext,
  limit?: number,
): string[] {
  const lines: string[] = []

  if (groups.length === 0) {
    lines.push(`${label}: (none)`)
    return lines
  }

  const groupsToShow = limit ? groups.slice(0, limit) : groups
  const truncated = limit ? groups.length - groupsToShow.length : 0

  lines.push(`${label}:`)
  for (const group of groupsToShow) {
    const countSuffix = group.count > 1 ? ` (${group.count})` : ''
    if (ctx.mode === 'tty') {
      lines.push(
        `  ${colorize(group.destination, colors.dim, ctx)}${countSuffix}`,
      )
    } else {
      lines.push(`  ${group.destination}${countSuffix}`)
    }
  }

  if (truncated > 0) {
    if (ctx.mode === 'tty') {
      lines.push(colorize(`  ... and ${truncated} more`, colors.gray, ctx))
    } else {
      lines.push(`  ... and ${truncated} more`)
    }
  }

  return lines
}

// ============================================================================
// Structure Command
// ============================================================================

interface FormatOptions {
  compact?: boolean
  brief?: boolean
}

/**
 * Format terminal output for structure command.
 */
function formatStructureTerminal(
  result: TuiStructureResult,
  ctx: FormatterContext,
  options?: FormatOptions,
): string {
  const compact = options?.compact ?? false
  const brief = options?.brief ?? false
  const { analysis, axeResult } = result
  const sections: string[] = []

  // [ISSUES] section
  const issues = buildIssues(analysis, axeResult)
  if (issues.length > 0) {
    sections.push(formatIssues(issues, ctx, { compact }))
    sections.push('')
  }

  // [PAGE] section
  if (ctx.mode === 'tty') {
    sections.push(colorize('PAGE', colors.gray, ctx))
  } else {
    sections.push('PAGE')
  }

  const pageRows: TableRow[] = [
    { key: 'Title', value: analysis.title ?? '(none)' },
    { key: 'Language', value: analysis.language ?? '(not set)' },
    ...buildSkipLinksTable(analysis),
  ]
  sections.push(formatTable(pageRows, ctx))

  if (compact) {
    // Compact mode: add summary section
    sections.push('')
    if (ctx.mode === 'tty') {
      sections.push(colorize('SUMMARY', colors.gray, ctx))
    } else {
      sections.push('SUMMARY')
    }
    const summaryRows: TableRow[] = [
      { key: 'Landmarks', value: formatLandmarksCompact(analysis) },
      { key: 'Headings', value: formatHeadingCounts(analysis.headings.counts) },
      { key: 'Links', value: formatLinksCompact(analysis) },
    ]
    sections.push(formatTable(summaryRows, ctx))
  } else {
    // Full mode: detailed sections
    const limit = brief ? 5 : undefined

    // [LANDMARKS] section
    sections.push('')
    if (ctx.mode === 'tty') {
      sections.push(colorize('LANDMARKS', colors.gray, ctx))
    } else {
      sections.push('LANDMARKS')
    }
    sections.push(formatLandmarkSkeletonFull(analysis, ctx))

    // [HEADINGS] section
    sections.push('')
    if (ctx.mode === 'tty') {
      sections.push(colorize('HEADINGS', colors.gray, ctx))
    } else {
      sections.push('HEADINGS')
    }
    if (analysis.headings.outline.length > 0) {
      sections.push(...formatHeadingOutline(analysis.headings.outline, ctx))
    } else {
      sections.push('(no headings)')
    }

    // [LINKS] section
    sections.push('')
    if (ctx.mode === 'tty') {
      sections.push(colorize('LINKS', colors.gray, ctx))
    } else {
      sections.push('LINKS')
    }
    sections.push(
      ...formatLinkGroupsFull(
        analysis.links.internal.groups,
        `Internal (${analysis.links.internal.count})`,
        ctx,
        limit,
      ),
    )
    sections.push('')
    sections.push(
      ...formatLinkGroupsFull(
        analysis.links.external.groups,
        `External (${analysis.links.external.count})`,
        ctx,
        limit,
      ),
    )
  }

  return sections.join('\n')
}

/**
 * Format structure result based on output format.
 */
export function formatStructureOutput(
  result: TuiStructureResult,
  format: OutputFormat,
  mode: OutputMode,
): string {
  const ctx = createFormatterContext(mode)

  switch (format) {
    case 'compact':
      return formatStructureTerminal(result, ctx, { compact: true })
    case 'brief':
      return formatStructureTerminal(result, ctx, { brief: true })
    case 'full':
    default:
      return formatStructureTerminal(result, ctx)
  }
}

// ============================================================================
// Structure:js Command
// ============================================================================

/**
 * Format comparison section for structure:js (when differences exist).
 */
function formatComparisonSection(
  comparison: StructureComparison,
  ctx: FormatterContext,
): string {
  const lines: string[] = []

  if (ctx.mode === 'tty') {
    lines.push(colorize('COMPARISON', colors.gray, ctx))
  } else {
    lines.push('COMPARISON')
  }

  const rows: TableRow[] = []

  if (
    comparison.summary.staticLandmarks !== comparison.summary.hydratedLandmarks
  ) {
    rows.push({
      key: 'Landmarks',
      value: `${comparison.summary.staticLandmarks} -> ${comparison.summary.hydratedLandmarks}`,
    })
  }
  if (
    comparison.summary.staticHeadings !== comparison.summary.hydratedHeadings
  ) {
    rows.push({
      key: 'Headings',
      value: `${comparison.summary.staticHeadings} -> ${comparison.summary.hydratedHeadings}`,
    })
  }
  if (comparison.summary.staticLinks !== comparison.summary.hydratedLinks) {
    rows.push({
      key: 'Links',
      value: `${comparison.summary.staticLinks} -> ${comparison.summary.hydratedLinks}`,
    })
  }

  if (rows.length > 0) {
    lines.push(formatTable(rows, ctx))
  } else {
    lines.push('No differences detected')
  }

  return lines.join('\n')
}

/**
 * Format terminal output for structure:js command.
 */
function formatStructureJsTerminal(
  result: StructureJsInternalResult,
  ctx: FormatterContext,
  options?: FormatOptions,
): string {
  const compact = options?.compact ?? false
  const brief = options?.brief ?? false
  const { hydrated, comparison, timedOut, axeResult } = result
  const sections: string[] = []

  // [ISSUES] section
  const issues = buildIssuesJs(hydrated, axeResult, timedOut)
  if (issues.length > 0) {
    sections.push(formatIssues(issues, ctx, { compact }))
    sections.push('')
  }

  // [PAGE] section
  if (ctx.mode === 'tty') {
    sections.push(colorize('PAGE', colors.gray, ctx))
  } else {
    sections.push('PAGE')
  }

  const pageRows: TableRow[] = [
    { key: 'Title', value: hydrated.title ?? '(none)' },
    { key: 'Language', value: hydrated.language ?? '(not set)' },
    ...buildSkipLinksTable(hydrated),
  ]
  sections.push(formatTable(pageRows, ctx))

  // [COMPARISON] section (when differences exist)
  if (comparison.hasDifferences) {
    sections.push('')
    sections.push(formatComparisonSection(comparison, ctx))
  }

  if (compact) {
    // Compact mode: add summary section
    sections.push('')
    if (ctx.mode === 'tty') {
      sections.push(colorize('SUMMARY', colors.gray, ctx))
    } else {
      sections.push('SUMMARY')
    }
    const summaryRows: TableRow[] = [
      { key: 'Landmarks', value: formatLandmarksCompact(hydrated) },
      { key: 'Headings', value: formatHeadingCounts(hydrated.headings.counts) },
      { key: 'Links', value: formatLinksCompact(hydrated) },
    ]
    sections.push(formatTable(summaryRows, ctx))
  } else {
    // Full mode: detailed sections
    const limit = brief ? 5 : undefined

    // [LANDMARKS] section
    sections.push('')
    if (ctx.mode === 'tty') {
      sections.push(colorize('LANDMARKS', colors.gray, ctx))
    } else {
      sections.push('LANDMARKS')
    }
    sections.push(formatLandmarkSkeletonFull(hydrated, ctx))

    // [HEADINGS] section
    sections.push('')
    if (ctx.mode === 'tty') {
      sections.push(colorize('HEADINGS', colors.gray, ctx))
    } else {
      sections.push('HEADINGS')
    }
    if (hydrated.headings.outline.length > 0) {
      sections.push(...formatHeadingOutline(hydrated.headings.outline, ctx))
    } else {
      sections.push('(no headings)')
    }

    // [LINKS] section
    sections.push('')
    if (ctx.mode === 'tty') {
      sections.push(colorize('LINKS', colors.gray, ctx))
    } else {
      sections.push('LINKS')
    }
    sections.push(
      ...formatLinkGroupsFull(
        hydrated.links.internal.groups,
        `Internal (${hydrated.links.internal.count})`,
        ctx,
        limit,
      ),
    )
    sections.push('')
    sections.push(
      ...formatLinkGroupsFull(
        hydrated.links.external.groups,
        `External (${hydrated.links.external.count})`,
        ctx,
        limit,
      ),
    )
  }

  return sections.join('\n')
}

/**
 * Format structure:js result based on output format.
 */
export function formatStructureJsOutput(
  result: StructureJsInternalResult,
  options: FormatStructureJsOptions,
  mode: OutputMode,
): string {
  const ctx = createFormatterContext(mode)
  const { format } = options

  switch (format) {
    case 'compact':
      return formatStructureJsTerminal(result, ctx, { compact: true })
    case 'brief':
      return formatStructureJsTerminal(result, ctx, { brief: true })
    case 'full':
    default:
      return formatStructureJsTerminal(result, ctx)
  }
}

// ============================================================================
// Structure:compare Command
// ============================================================================

/**
 * Format a change value with + or - prefix.
 */
function formatChange(value: number): string {
  if (value > 0) return `+${value}`
  if (value < 0) return `${value}`
  return '0'
}

/**
 * Format terminal output for structure:compare command.
 */
function formatCompareTerminal(
  result: StructureCompareResult,
  ctx: FormatterContext,
  options?: FormatOptions,
): string {
  const compact = options?.compact ?? false
  const brief = options?.brief ?? false
  const { comparison, timedOut } = result
  const sections: string[] = []

  // [ISSUES] section with success message
  const issues = buildIssuesCompare(comparison, timedOut)
  sections.push(
    formatIssues(issues, ctx, {
      compact,
      successMessage: 'No structural differences detected',
    }),
  )
  sections.push('')

  // If no differences, stop here
  if (!comparison.hasDifferences) {
    return sections.join('\n')
  }

  // [SUMMARY] section
  if (ctx.mode === 'tty') {
    sections.push(colorize('SUMMARY', colors.gray, ctx))
  } else {
    sections.push('SUMMARY')
  }

  const { summary } = comparison
  const summaryRows: TableRow[] = [
    {
      key: 'Landmarks',
      value: `${summary.staticLandmarks} -> ${summary.hydratedLandmarks} (${formatChange(summary.hydratedLandmarks - summary.staticLandmarks)})`,
    },
    {
      key: 'Headings',
      value: `${summary.staticHeadings} -> ${summary.hydratedHeadings} (${formatChange(summary.hydratedHeadings - summary.staticHeadings)})`,
    },
    {
      key: 'Links',
      value: `${summary.staticLinks} -> ${summary.hydratedLinks} (${formatChange(summary.hydratedLinks - summary.staticLinks)})`,
    },
  ]
  sections.push(formatTable(summaryRows, ctx))

  // In compact mode, stop here
  if (compact) {
    return sections.join('\n')
  }

  // [CHANGES] section (full only)
  sections.push('')
  if (ctx.mode === 'tty') {
    sections.push(colorize('CHANGES', colors.gray, ctx))
  } else {
    sections.push('CHANGES')
  }

  const limit = brief ? 10 : undefined
  let hasChanges = false

  // Metadata changes
  if (comparison.metadata.title || comparison.metadata.language) {
    hasChanges = true
    if (ctx.mode === 'tty') {
      sections.push(colorize('Metadata:', colors.dim, ctx))
    } else {
      sections.push('Metadata:')
    }
    if (comparison.metadata.title) {
      sections.push(
        `  Title: "${comparison.metadata.title.static || '(none)'}" -> "${comparison.metadata.title.hydrated || '(none)'}"`,
      )
    }
    if (comparison.metadata.language) {
      sections.push(
        `  Language: "${comparison.metadata.language.static || '(none)'}" -> "${comparison.metadata.language.hydrated || '(none)'}"`,
      )
    }
  }

  // Landmark changes
  if (comparison.landmarks.length > 0) {
    hasChanges = true
    if (sections[sections.length - 1] !== 'CHANGES') {
      sections.push('')
    }
    if (ctx.mode === 'tty') {
      sections.push(colorize('Landmarks:', colors.dim, ctx))
    } else {
      sections.push('Landmarks:')
    }
    for (const diff of comparison.landmarks) {
      const prefix = diff.change > 0 ? '+' : '-'
      sections.push(
        `  ${prefix} ${diff.role}: ${diff.staticCount} -> ${diff.hydratedCount}`,
      )
    }
  }

  // Heading changes
  if (comparison.headings.length > 0) {
    hasChanges = true
    if (sections[sections.length - 1] !== 'CHANGES') {
      sections.push('')
    }
    if (ctx.mode === 'tty') {
      sections.push(colorize('Headings:', colors.dim, ctx))
    } else {
      sections.push('Headings:')
    }

    const added = comparison.headings.filter((h) => h.status === 'added')
    const removed = comparison.headings.filter((h) => h.status === 'removed')
    const addedToShow = limit ? added.slice(0, limit) : added
    const removedToShow = limit ? removed.slice(0, limit) : removed

    for (const h of addedToShow) {
      const text = h.text.length > 40 ? h.text.slice(0, 37) + '...' : h.text
      sections.push(`  + h${h.level}: "${text}"`)
    }
    for (const h of removedToShow) {
      const text = h.text.length > 40 ? h.text.slice(0, 37) + '...' : h.text
      sections.push(`  - h${h.level}: "${text}"`)
    }

    const truncated =
      added.length -
      addedToShow.length +
      (removed.length - removedToShow.length)
    if (truncated > 0) {
      if (ctx.mode === 'tty') {
        sections.push(colorize(`  ... and ${truncated} more`, colors.gray, ctx))
      } else {
        sections.push(`  ... and ${truncated} more`)
      }
    }
  }

  // Link changes
  const { links } = comparison
  if (
    links.internalAdded > 0 ||
    links.internalRemoved > 0 ||
    links.externalAdded > 0 ||
    links.externalRemoved > 0
  ) {
    hasChanges = true
    if (sections[sections.length - 1] !== 'CHANGES') {
      sections.push('')
    }
    if (ctx.mode === 'tty') {
      sections.push(colorize('Links:', colors.dim, ctx))
    } else {
      sections.push('Links:')
    }

    if (links.internalAdded > 0 || links.internalRemoved > 0) {
      const parts: string[] = []
      if (links.internalAdded > 0) parts.push(`+${links.internalAdded}`)
      if (links.internalRemoved > 0) parts.push(`-${links.internalRemoved}`)
      sections.push(`  Internal: ${parts.join(', ')}`)

      if (links.newInternalDestinations.length > 0) {
        const destsToShow = limit
          ? links.newInternalDestinations.slice(0, limit)
          : links.newInternalDestinations
        for (const dest of destsToShow) {
          sections.push(`    + ${dest}`)
        }
        if (limit && links.newInternalDestinations.length > limit) {
          const truncated = links.newInternalDestinations.length - limit
          if (ctx.mode === 'tty') {
            sections.push(
              colorize(
                `    ... and ${truncated} more destinations`,
                colors.gray,
                ctx,
              ),
            )
          } else {
            sections.push(`    ... and ${truncated} more destinations`)
          }
        }
      }
    }

    if (links.externalAdded > 0 || links.externalRemoved > 0) {
      const parts: string[] = []
      if (links.externalAdded > 0) parts.push(`+${links.externalAdded}`)
      if (links.externalRemoved > 0) parts.push(`-${links.externalRemoved}`)
      sections.push(`  External: ${parts.join(', ')}`)

      if (links.newExternalDomains.length > 0) {
        const domainsToShow = limit
          ? links.newExternalDomains.slice(0, limit)
          : links.newExternalDomains
        for (const domain of domainsToShow) {
          sections.push(`    + ${domain}`)
        }
        if (limit && links.newExternalDomains.length > limit) {
          const truncated = links.newExternalDomains.length - limit
          if (ctx.mode === 'tty') {
            sections.push(
              colorize(
                `    ... and ${truncated} more domains`,
                colors.gray,
                ctx,
              ),
            )
          } else {
            sections.push(`    ... and ${truncated} more domains`)
          }
        }
      }
    }
  }

  if (!hasChanges) {
    sections.push('(no detailed changes)')
  }

  return sections.join('\n')
}

/**
 * Format structure:compare result based on output format.
 */
export function formatStructureCompareOutput(
  result: StructureCompareResult,
  options: FormatStructureCompareOptions,
  mode: OutputMode,
): string {
  const ctx = createFormatterContext(mode)
  const { format } = options

  switch (format) {
    case 'compact':
      return formatCompareTerminal(result, ctx, { compact: true })
    case 'brief':
      return formatCompareTerminal(result, ctx, { brief: true })
    case 'full':
    default:
      return formatCompareTerminal(result, ctx)
  }
}
