/**
 * Shared heading outline formatting for CLI output.
 *
 * Used by structure, google, and other commands that display heading trees.
 * Normalizes visual style: uppercase H1/H2, content stats, consistent colors.
 */

import type { HeadingInfo } from '../structure.js'
import { colorize, colors } from './colors.js'
import type { FormatterContext } from './types.js'

// ============================================================================
// Types
// ============================================================================

export interface HeadingFormatOptions {
  /** Include content statistics (word count, paragraphs, lists). Default: true */
  includeStats?: boolean
  /** Maximum text length before truncation. Default: 60 */
  maxTextLength?: number
  /** Indentation string per level. Default: '  ' (2 spaces) */
  indentStr?: string
}

// ============================================================================
// Implementation
// ============================================================================

/**
 * Format content stats string for a heading.
 */
function formatContentStats(heading: HeadingInfo): string {
  const stats: string[] = []

  if (heading.content.wordCount > 0) {
    stats.push(`${heading.content.wordCount} words`)
  }
  if (heading.content.paragraphs > 0) {
    stats.push(`${heading.content.paragraphs}p`)
  }
  if (heading.content.lists > 0) {
    stats.push(`${heading.content.lists}L`)
  }

  return stats.length > 0 ? ` (${stats.join(', ')})` : ''
}

/**
 * Truncate text to a maximum length.
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Format a heading tree recursively into string lines.
 *
 * @param headings - Array of HeadingInfo objects (recursive tree structure)
 * @param ctx - Formatter context for TTY/plain mode detection
 * @param options - Formatting options
 * @param depth - Current indentation depth (internal, starts at 0)
 * @returns Array of formatted lines
 */
export function formatHeadingOutline(
  headings: HeadingInfo[],
  ctx: FormatterContext,
  options: HeadingFormatOptions = {},
  depth: number = 0,
): string[] {
  const {
    includeStats = true,
    maxTextLength = 60,
    indentStr = '  ',
  } = options

  const lines: string[] = []
  const prefix = indentStr.repeat(depth)

  for (const heading of headings) {
    // Uppercase level label (H1, H2, etc.)
    const levelLabel = `H${heading.level}`

    // Truncate text
    const text = truncateText(heading.text, maxTextLength)

    // Content stats (optional)
    const statsStr = includeStats ? formatContentStats(heading) : ''

    // Format line based on TTY mode
    if (ctx.mode === 'tty') {
      const dimLevel = colorize(levelLabel, colors.dim, ctx)
      const dimStats = statsStr ? colorize(statsStr, colors.gray, ctx) : ''
      lines.push(`${prefix}${dimLevel}  ${text}${dimStats}`)
    } else {
      lines.push(`${prefix}${levelLabel}  ${text}${statsStr}`)
    }

    // Recurse into children
    if (heading.children.length > 0) {
      lines.push(
        ...formatHeadingOutline(heading.children, ctx, options, depth + 1),
      )
    }
  }

  return lines
}

/**
 * Format heading counts for compact/summary display.
 * Example: "1×H1, 3×H2, 5×H3"
 *
 * @param counts - Object mapping heading tags to counts (e.g., { h1: 1, h2: 3 })
 * @returns Formatted string
 */
export function formatHeadingCounts(counts: Record<string, number>): string {
  if (Object.keys(counts).length === 0) return '(none)'

  return ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
    .filter((h) => counts[h])
    .map((h) => `${counts[h]}×${h.toUpperCase()}`)
    .join(', ')
}
