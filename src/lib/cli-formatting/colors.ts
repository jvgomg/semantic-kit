/**
 * ANSI color utilities for CLI output.
 * Provides mode-aware colorization that only applies colors in TTY mode.
 */

import type { FormatterContext } from './types.js'

// ============================================================================
// ANSI Escape Codes
// ============================================================================

export const colors = {
  dim: (text: string) => `\x1b[2m${text}\x1b[22m`,
  bold: (text: string) => `\x1b[1m${text}\x1b[22m`,
  red: (text: string) => `\x1b[31m${text}\x1b[39m`,
  green: (text: string) => `\x1b[32m${text}\x1b[39m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[39m`,
  blue: (text: string) => `\x1b[34m${text}\x1b[39m`,
  cyan: (text: string) => `\x1b[36m${text}\x1b[39m`,
  gray: (text: string) => `\x1b[90m${text}\x1b[39m`,
}

// ============================================================================
// Mode-Aware Colorization
// ============================================================================

/**
 * Apply a color function only if in TTY mode.
 */
export function colorize(
  text: string,
  colorFn: (s: string) => string,
  ctx: FormatterContext,
): string {
  return ctx.mode === 'tty' ? colorFn(text) : text
}
