/**
 * Text utilities for CLI output.
 * Provides text wrapping and indentation with mode awareness.
 */

import type { FormatterContext } from './types.js'

// ============================================================================
// Text Utilities
// ============================================================================

/**
 * Indent all lines of text by a number of spaces.
 */
export function indent(text: string, spaces: number): string {
  const prefix = ' '.repeat(spaces)
  return text
    .split('\n')
    .map((line) => prefix + line)
    .join('\n')
}

/**
 * Wrap text to a maximum width, preserving indentation.
 * Only wraps in TTY mode; in plain mode, returns text unchanged.
 */
export function wrapText(
  text: string,
  ctx: FormatterContext,
  options?: {
    /** Number of spaces to indent wrapped lines */
    indent?: number
    /** Override ctx.width */
    maxWidth?: number
  },
): string {
  // In plain mode, don't wrap
  if (ctx.mode === 'plain') {
    return text
  }

  const maxWidth = options?.maxWidth ?? ctx.width ?? 80
  const wrapIndent = options?.indent ?? 0

  // If text is already short enough, return as-is
  if (text.length <= maxWidth) {
    return text
  }

  const words = text.split(/\s+/)
  const lines: string[] = []
  let currentLine = ''
  let isFirstLine = true

  for (const word of words) {
    const effectiveMaxWidth = isFirstLine ? maxWidth : maxWidth - wrapIndent

    if (currentLine.length === 0) {
      currentLine = word
    } else if (currentLine.length + 1 + word.length <= effectiveMaxWidth) {
      currentLine += ' ' + word
    } else {
      lines.push(currentLine)
      currentLine = word
      isFirstLine = false
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine)
  }

  // Apply indent to wrapped lines (not the first line)
  const indentPrefix = ' '.repeat(wrapIndent)
  return lines
    .map((line, i) => (i === 0 ? line : indentPrefix + line))
    .join('\n')
}
