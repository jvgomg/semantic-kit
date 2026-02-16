import { hasDifferences, type SnapshotDiff, A11yCompareResult, A11yResult  } from '@webspecs/core'
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
// Role Categories
// ============================================================================

const LANDMARK_ROLES = [
  'banner',
  'navigation',
  'main',
  'contentinfo',
  'complementary',
  'region',
]

const STRUCTURE_ROLES = [
  'heading',
  'list',
  'listitem',
  'table',
  'row',
  'cell',
  'img',
]

const INTERACTIVE_ROLES = [
  'link',
  'button',
  'textbox',
  'checkbox',
  'radio',
  'combobox',
  'listbox',
  'slider',
]

// ============================================================================
// Issue Building - A11y / A11y:js
// ============================================================================

/**
 * Build an array of issues from the A11y result.
 * Issues are ordered by priority:
 * 1. Timeout (warning/medium)
 * 2. Missing main landmark (warning/medium)
 * 3. No headings found (warning/medium)
 */
export function buildIssues(result: A11yResult): Issue[] {
  const issues: Issue[] = []

  // 1. Timeout
  if (result.timedOut) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      title: 'Page Load Timeout',
      description:
        'The page did not finish loading within the timeout period. The accessibility tree may be incomplete.',
      tip: 'Increase the timeout with --timeout or check if the page has performance issues.',
    })
  }

  // 2. Missing main landmark
  if (!result.counts['main']) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      title: 'Missing Main Landmark',
      description:
        'No <main> element found. Screen readers use landmarks for navigation.',
      tip: 'Add a <main> element to wrap your primary content.',
    })
  }

  // 3. No headings
  if (!result.counts['heading']) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      title: 'No Headings Found',
      description:
        'No heading elements found. Headings provide document structure and navigation.',
      tip: 'Add heading elements (h1-h6) to organize your content.',
    })
  }

  return issues
}

// ============================================================================
// Issue Building - A11y:compare
// ============================================================================

/**
 * Build an array of issues from the A11y:compare result.
 * Issues are ordered by priority:
 * 1. Timeout (warning/medium)
 * 2. JS removes elements (warning/medium)
 * 3. JS adds many elements (info/low)
 */
export function buildCompareIssues(result: A11yCompareResult): Issue[] {
  const issues: Issue[] = []

  // 1. Timeout
  if (result.static.timedOut || result.hydrated.timedOut) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      title: 'Page Load Timeout',
      description:
        'One or more page loads timed out. The comparison may be incomplete.',
      tip: 'Increase the timeout with --timeout or check if the page has performance issues.',
    })
  }

  // 2. JS removes elements
  if (result.diff.removed.length > 0) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      title: `JavaScript Removes ${result.diff.removed.length} Elements`,
      description:
        'JavaScript removes some accessibility elements. This may indicate content that disappears after hydration.',
      tip: 'Check if important content is being hidden or replaced by JavaScript.',
    })
  }

  // 3. JS adds many elements
  if (result.diff.added.length > 10) {
    issues.push({
      type: 'info',
      severity: 'low',
      title: `JavaScript Adds ${result.diff.added.length} Elements`,
      description:
        'JavaScript adds many accessibility elements. This content is not available to crawlers that do not execute JavaScript.',
      tip: 'Consider server-side rendering for important content.',
    })
  }

  return issues
}

// ============================================================================
// Table Groups - A11y / A11y:js
// ============================================================================

/**
 * Build role count rows for a specific category.
 */
function buildRoleCountRows(
  counts: Record<string, number>,
  roles: string[],
): { key: string; value: number | undefined }[] {
  return roles
    .filter((role) => counts[role])
    .map((role) => ({ key: role, value: counts[role] }))
}

/**
 * Build table groups for the A11y result.
 */
function buildTableGroups(result: A11yResult): TableGroup[] {
  const groups: TableGroup[] = []

  // Landmarks group
  const landmarkRows = buildRoleCountRows(result.counts, LANDMARK_ROLES)
  if (landmarkRows.length > 0) {
    groups.push({ header: 'Landmarks', rows: landmarkRows })
  }

  // Structure group
  const structureRows = buildRoleCountRows(result.counts, STRUCTURE_ROLES)
  if (structureRows.length > 0) {
    groups.push({ header: 'Structure', rows: structureRows })
  }

  // Interactive group
  const interactiveRows = buildRoleCountRows(result.counts, INTERACTIVE_ROLES)
  if (interactiveRows.length > 0) {
    groups.push({ header: 'Interactive', rows: interactiveRows })
  }

  return groups
}

// ============================================================================
// Table Groups - A11y:compare
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
 * Build role changes table group.
 */
function buildRoleChangesGroup(
  diff: SnapshotDiff,
  limit?: number,
): TableGroup | null {
  if (diff.countChanges.length === 0) {
    return null
  }

  const changes = limit ? diff.countChanges.slice(0, limit) : diff.countChanges

  const rows = changes.map((change) => {
    const delta = change.hydrated - change.static
    return {
      key: change.role,
      value: `${change.static} -> ${change.hydrated} (${formatChange(delta)})`,
    }
  })

  return { header: 'Role Changes', rows }
}

// ============================================================================
// ARIA Snapshot Formatting
// ============================================================================

/**
 * Format the ARIA snapshot as indented text (without box-drawing).
 */
function formatAriaSnapshotText(snapshot: string): string {
  const lines = snapshot.split('\n').filter((line) => line.trim())
  return lines.join('\n')
}

// ============================================================================
// Added/Removed Elements Formatting
// ============================================================================

/**
 * Format added or removed elements section.
 */
function formatElementsList(
  elements: string[],
  header: string,
  limit: number,
  ctx: ReturnType<typeof createFormatterContext>,
): string {
  if (elements.length === 0) {
    return ''
  }

  const lines: string[] = []

  // Header
  const headerText = header.toUpperCase()
  if (ctx.mode === 'tty') {
    lines.push(colorize(headerText, colors.gray, ctx))
  } else {
    lines.push(headerText)
  }

  // Elements
  const elementsToShow = elements.slice(0, limit)
  for (const element of elementsToShow) {
    const trimmed = element.trim()
    const display = trimmed.length > 60 ? trimmed.slice(0, 57) + '...' : trimmed
    lines.push(display)
  }

  // Show count of remaining
  if (elements.length > limit) {
    lines.push(`... and ${elements.length - limit} more`)
  }

  return lines.join('\n')
}

// ============================================================================
// Output Formats - A11y / A11y:js
// ============================================================================

/**
 * Format terminal output for a11y/a11y:js commands.
 */
function formatA11yTerminal(
  result: A11yResult,
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

  // Summary table groups
  const tableGroups = buildTableGroups(result)
  if (tableGroups.length > 0) {
    sections.push(formatTableGroups(tableGroups, ctx))
  }

  // ARIA snapshot (full mode only)
  if (!compact && result.snapshot) {
    sections.push('')
    sections.push('---')
    sections.push('')
    const header = ctx.mode === 'tty' ? colorize('ARIA SNAPSHOT', colors.gray, ctx) : 'ARIA SNAPSHOT'
    sections.push(header)
    sections.push(formatAriaSnapshotText(result.snapshot))
  }

  return sections.join('\n')
}

// ============================================================================
// Output Formats - A11y:compare
// ============================================================================

/**
 * Format terminal output for a11y:compare command.
 */
function formatA11yCompareTerminal(
  result: A11yCompareResult,
  ctx: ReturnType<typeof createFormatterContext>,
  options?: { compact?: boolean },
): string {
  const compact = options?.compact ?? false
  const sections: string[] = []

  // Issues section (with success message when no differences)
  const issues = buildCompareIssues(result)
  const successMessage = !hasDifferences(result.diff)
    ? 'No accessibility differences found'
    : undefined

  sections.push(formatIssues(issues, ctx, { compact, successMessage }))
  sections.push('') // blank line after issues

  // Role changes group
  const roleChangesGroup = buildRoleChangesGroup(
    result.diff,
    compact ? 5 : undefined,
  )
  if (roleChangesGroup) {
    sections.push(formatTableGroups([roleChangesGroup], ctx))
  }

  // Added/Removed sections (full mode, or top 5 in compact)
  if (!compact) {
    // Full mode: show added and removed with limit of 15
    const addedSection = formatElementsList(
      result.diff.added,
      'Added by JavaScript',
      15,
      ctx,
    )
    if (addedSection) {
      sections.push('')
      sections.push(addedSection)
    }

    const removedSection = formatElementsList(
      result.diff.removed,
      'Removed by JavaScript',
      15,
      ctx,
    )
    if (removedSection) {
      sections.push('')
      sections.push(removedSection)
    }
  } else {
    // Compact mode: show top 5 added only
    const addedSection = formatElementsList(
      result.diff.added,
      'Added by JavaScript',
      5,
      ctx,
    )
    if (addedSection) {
      sections.push('')
      sections.push(addedSection)
    }
  }

  return sections.join('\n')
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Format a11y output for terminal output (full or compact mode).
 * JSON format is handled directly by runCommand.
 */
export function formatA11yOutput(
  result: A11yResult,
  format: OutputFormat,
  mode: OutputMode,
): string {
  const ctx = createFormatterContext(mode)

  switch (format) {
    case 'compact':
      return formatA11yTerminal(result, ctx, { compact: true })
    case 'full':
    default:
      return formatA11yTerminal(result, ctx)
  }
}

/**
 * Format a11y:js output for terminal output (full or compact mode).
 * JSON format is handled directly by runCommand.
 */
export function formatA11yJsOutput(
  result: A11yResult,
  format: OutputFormat,
  mode: OutputMode,
): string {
  // Same formatting as a11y
  return formatA11yOutput(result, format, mode)
}

/**
 * Format a11y:compare output for terminal output (full or compact mode).
 * JSON format is handled directly by runCommand.
 */
export function formatA11yCompareOutput(
  result: A11yCompareResult,
  format: OutputFormat,
  mode: OutputMode,
): string {
  const ctx = createFormatterContext(mode)

  switch (format) {
    case 'compact':
      return formatA11yCompareTerminal(result, ctx, { compact: true })
    case 'full':
    default:
      return formatA11yCompareTerminal(result, ctx)
  }
}
