/**
 * Mode-aware issue formatting for CLI output.
 * Provides different formatting for TTY and plain modes.
 */

import { colorize, colors } from './colors.js'
import { wrapText } from './text.js'
import type { FormatterContext, Issue, IssueType } from './types.js'

// ============================================================================
// Constants
// ============================================================================

const ISSUE_ICONS: Record<IssueType, string> = {
  error: '\u2717',
  warning: '\u26A0',
  info: '\u2139',
}

const ISSUE_COLORS: Record<IssueType, (s: string) => string> = {
  error: colors.red,
  warning: colors.yellow,
  info: colors.blue,
}

// ============================================================================
// TTY Mode Formatting
// ============================================================================

/**
 * Format a single issue for TTY mode.
 *
 * Output format:
 * ```
 * ✗ error/high    No Content Extracted
 *                 No main content could be extracted from this page.
 *                 Tip: Use --raw to see the static HTML.
 * ```
 */
function formatIssueTty(
  issue: Issue,
  ctx: FormatterContext,
  options?: { compact?: boolean },
): string {
  const icon = ISSUE_ICONS[issue.type]
  const colorFn = ISSUE_COLORS[issue.type]
  const typeLabel = `${issue.type}/${issue.severity}`

  // Calculate indentation to align description/tip with title
  // Format: "✗ warning/high  " (icon + space + type/severity + two spaces)
  const prefixLength = icon.length + 1 + typeLabel.length + 2
  const indentStr = ' '.repeat(prefixLength)

  const lines: string[] = []

  // First line: icon, type/severity (colored), title (bold)
  const coloredPrefix = colorize(`${icon} ${typeLabel}`, colorFn, ctx)
  const boldTitle = colorize(issue.title, colors.bold, ctx)
  lines.push(`${coloredPrefix}  ${boldTitle}`)

  // Description line (indented, wrapped at terminal width)
  const wrappedDescription = wrapText(issue.description, ctx, {
    indent: prefixLength,
    maxWidth: ctx.width,
  })
  lines.push(`${indentStr}${wrappedDescription}`)

  // Tip line (only in full mode, dim/gray)
  if (!options?.compact && issue.tip) {
    const tipText = colorize(`Tip: ${issue.tip}`, colors.gray, ctx)
    const wrappedTip = wrapText(tipText, ctx, {
      indent: prefixLength,
      maxWidth: ctx.width,
    })
    lines.push(`${indentStr}${wrappedTip}`)
  }

  return lines.join('\n')
}

// ============================================================================
// Plain Mode Formatting
// ============================================================================

/**
 * Format a single issue for plain mode.
 *
 * Output format:
 * ```
 * error/high: No Content Extracted
 * No main content could be extracted from this page.
 * Tip: Use --raw to see the static HTML.
 * ```
 */
function formatIssuePlain(
  issue: Issue,
  options?: { compact?: boolean },
): string {
  const typeLabel = `${issue.type}/${issue.severity}`

  const lines: string[] = []

  // First line: type/severity: title
  lines.push(`${typeLabel}: ${issue.title}`)

  // Description line
  lines.push(issue.description)

  // Tip line (only in full mode)
  if (!options?.compact && issue.tip) {
    lines.push(`Tip: ${issue.tip}`)
  }

  return lines.join('\n')
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Format a single issue for terminal display.
 * Automatically uses TTY or plain formatting based on context mode.
 *
 * @param issue - The issue to format
 * @param ctx - Formatter context with mode and width
 * @param options - Formatting options
 * @param options.compact - If true, omit the tip line
 * @returns Formatted issue string
 */
export function formatIssue(
  issue: Issue,
  ctx: FormatterContext,
  options?: { compact?: boolean },
): string {
  if (ctx.mode === 'tty') {
    return formatIssueTty(issue, ctx, options)
  }
  return formatIssuePlain(issue, options)
}

/**
 * Format multiple issues for terminal display.
 * Issues are separated by blank lines for readability.
 * Includes a header in TTY mode.
 *
 * @param issues - Array of issues to format
 * @param ctx - Formatter context with mode and width
 * @param options - Formatting options
 * @param options.compact - If true, omit tip lines from all issues
 * @param options.successMessage - Message to show when no issues (if not provided, returns empty string)
 * @returns Formatted issues string, or empty string if no issues and no successMessage
 */
export function formatIssues(
  issues: Issue[],
  ctx: FormatterContext,
  options?: { compact?: boolean; successMessage?: string },
): string {
  if (issues.length === 0) {
    if (!options?.successMessage) {
      return ''
    }

    // Format success message
    if (ctx.mode === 'tty') {
      const header = colorize('ISSUES', colors.gray, ctx)
      const checkmark = colorize('\u2713', colors.green, ctx)
      return `${header}\n\n${checkmark} ${options.successMessage}`
    }

    // Plain mode
    return `ISSUES\n\nOK: ${options.successMessage}`
  }

  const formattedIssues = issues
    .map((issue) => formatIssue(issue, ctx, options))
    .join('\n\n')

  // Add header in TTY mode
  if (ctx.mode === 'tty') {
    const header = colorize('ISSUES', colors.gray, ctx)
    return `${header}\n\n${formattedIssues}`
  }

  // Plain mode: simple header
  return `ISSUES\n\n${formattedIssues}`
}
