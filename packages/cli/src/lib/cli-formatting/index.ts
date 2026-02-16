/**
 * Mode-aware CLI formatting primitives.
 *
 * This module provides formatting utilities that adapt their output based on
 * whether the CLI is running in TTY mode (interactive terminal) or plain mode
 * (piped output, CI, etc.).
 *
 * TTY mode: Colors, bold, proper indentation, screen-width-aware wrapping
 * Plain mode: Simple text, no ANSI codes, just newlines
 */

// Types
export {
  createFormatterContext,
  getTerminalWidth,
  type FormatterContext,
  type FormatTableOptions,
  type Issue,
  type IssueSeverity,
  type IssueType,
  type TableGroup,
  type TableRow,
} from './types.js'

// Colors
export { colorize, colors } from './colors.js'

// Text utilities
export { indent, wrapText } from './text.js'

// Issues
export { formatIssue, formatIssues } from './issues.js'

// Tables
export { formatTable, formatTableGroups } from './table.js'

// Headings
export {
  formatHeadingOutline,
  formatHeadingCounts,
  type HeadingFormatOptions,
} from './headings.js'
