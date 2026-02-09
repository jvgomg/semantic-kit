/**
 * Mode-aware table formatting for CLI output.
 * Provides different formatting for TTY and plain modes.
 */

import { colorize, colors } from './colors.js'
import { wrapText } from './text.js'
import type {
  FormatterContext,
  FormatTableOptions,
  TableGroup,
  TableRow,
} from './types.js'

// ============================================================================
// TTY Mode Formatting
// ============================================================================

/**
 * Format a borderless key/value table for TTY mode.
 * Keys are dim colored, values wrap at terminal width.
 */
function formatTableTty(
  rows: TableRow[],
  ctx: FormatterContext,
  options?: FormatTableOptions,
): string {
  const gap = options?.gap ?? 2

  // Filter out rows with undefined or null values
  const validRows = rows.filter(
    (row) => row.value !== undefined && row.value !== null,
  )

  if (validRows.length === 0) {
    return ''
  }

  // Calculate the maximum key width for alignment
  const maxKeyWidth = Math.max(...validRows.map((row) => row.key.length))
  const keyColumnWidth = maxKeyWidth + gap

  // Format each row
  const lines = validRows.map((row) => {
    const paddedKey = row.key.padEnd(keyColumnWidth)
    const dimKey = colorize(paddedKey, colors.dim, ctx)

    const formattedValue =
      typeof row.value === 'number'
        ? row.value.toLocaleString()
        : String(row.value)

    // Wrap value at terminal width, accounting for key column
    const valueWidth = (ctx.width ?? 80) - keyColumnWidth
    const wrappedValue = wrapText(formattedValue, ctx, {
      indent: keyColumnWidth,
      maxWidth: valueWidth,
    })

    return `${dimKey}${wrappedValue}`
  })

  return lines.join('\n')
}

// ============================================================================
// Plain Mode Formatting
// ============================================================================

/**
 * Format a borderless key/value table for plain mode.
 * Simple "Key: Value" format, one per line.
 */
function formatTablePlain(rows: TableRow[]): string {
  // Filter out rows with undefined or null values
  const validRows = rows.filter(
    (row) => row.value !== undefined && row.value !== null,
  )

  if (validRows.length === 0) {
    return ''
  }

  // Format each row as "Key: Value"
  const lines = validRows.map((row) => {
    const formattedValue =
      typeof row.value === 'number'
        ? row.value.toLocaleString()
        : String(row.value)
    return `${row.key}: ${formattedValue}`
  })

  return lines.join('\n')
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Format a borderless key/value table.
 * Returns formatted string ready for console output.
 *
 * @param rows - Array of key/value pairs to display
 * @param ctx - Formatter context with mode and width
 * @param options - Formatting options
 * @returns Formatted table string
 */
export function formatTable(
  rows: TableRow[],
  ctx: FormatterContext,
  options?: FormatTableOptions,
): string {
  if (ctx.mode === 'tty') {
    return formatTableTty(rows, ctx, options)
  }
  return formatTablePlain(rows)
}

/**
 * Format multiple table groups, each with an optional header.
 * Groups are separated by blank lines and headers are displayed uppercase in brackets.
 *
 * @param groups - Array of table groups to format
 * @param ctx - Formatter context with mode and width
 * @returns Formatted groups string
 */
export function formatTableGroups(
  groups: TableGroup[],
  ctx: FormatterContext,
): string {
  const formattedGroups: string[] = []

  for (const group of groups) {
    // Filter out rows with undefined or null values
    const validRows = group.rows.filter(
      (row) => row.value !== undefined && row.value !== null,
    )

    // Skip empty groups
    if (validRows.length === 0) {
      continue
    }

    const parts: string[] = []

    // Add header if present
    if (group.header) {
      const headerText = group.header.toUpperCase()
      if (ctx.mode === 'tty') {
        parts.push(colorize(headerText, colors.gray, ctx))
      } else {
        parts.push(headerText)
      }
    }

    // Add formatted table
    parts.push(formatTable(validRows, ctx))

    formattedGroups.push(parts.join('\n'))
  }

  return formattedGroups.join('\n\n')
}
