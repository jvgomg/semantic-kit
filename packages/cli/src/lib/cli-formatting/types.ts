/**
 * Shared types and utilities for mode-aware CLI formatting.
 */

import type { OutputMode } from '../output-mode.js'

// ============================================================================
// Types
// ============================================================================

export interface FormatterContext {
  mode: OutputMode
  /** Terminal width (only relevant in TTY mode) */
  width?: number
}

// ============================================================================
// Issue Types (moved from issues.ts)
// ============================================================================

export type IssueType = 'error' | 'warning' | 'info'
export type IssueSeverity = 'low' | 'medium' | 'high'

export interface Issue {
  type: IssueType
  severity: IssueSeverity
  title: string
  description: string
  tip?: string
}

// ============================================================================
// Table Types (moved from format-table.ts)
// ============================================================================

export interface TableRow {
  key: string
  value: string | number | undefined
}

export interface FormatTableOptions {
  /** Minimum padding between key and value (default: 2) */
  gap?: number
}

export interface TableGroup {
  /** Optional section header (displayed uppercase in brackets) */
  header?: string
  rows: TableRow[]
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get the current terminal width, with a sensible default.
 */
export function getTerminalWidth(): number {
  return process.stdout.columns || 80
}

/**
 * Create a formatter context from output mode.
 */
export function createFormatterContext(mode: OutputMode): FormatterContext {
  return {
    mode,
    width: mode === 'tty' ? getTerminalWidth() : undefined,
  }
}
