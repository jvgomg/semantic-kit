/**
 * Section priority system for automatic ordering.
 *
 * Sections are sorted by priority within their container,
 * with lower numbers appearing first.
 */

/**
 * Priority levels for section ordering.
 * Lower values appear first in the section list.
 */
export enum SectionPriority {
  /** Critical errors, blocking issues */
  CRITICAL = 0,
  /** Errors, violations */
  ERROR = 1,
  /** Warnings, potential issues */
  WARNING = 2,
  /** Informational notices */
  INFO = 3,
  /** Quick stats, metrics dashboard */
  SUMMARY = 4,
  /** Main content (extracted markdown, etc.) */
  PRIMARY = 5,
  /** Supporting details, metadata */
  SECONDARY = 6,
  /** Additional context */
  SUPPLEMENTARY = 7,
  /** Technical details, raw data */
  DEBUG = 8,
}

/**
 * Severity levels for visual styling.
 */
export type SectionSeverity =
  | 'critical'
  | 'error'
  | 'warning'
  | 'info'
  | 'success'
  | 'muted'

/**
 * Map severity to default priority.
 * Used when priority is not explicitly set on a section.
 */
export const severityToPriority: Record<SectionSeverity, SectionPriority> = {
  critical: SectionPriority.CRITICAL,
  error: SectionPriority.ERROR,
  warning: SectionPriority.WARNING,
  info: SectionPriority.INFO,
  success: SectionPriority.SUMMARY,
  muted: SectionPriority.SECONDARY,
}

/**
 * Box-drawing characters for section boundaries.
 */
export const boxChars = {
  // Section borders
  topLeft: '┌',
  topRight: '┐',
  bottomLeft: '└',
  bottomRight: '┘',
  horizontal: '─',
  vertical: '│',

  // Tree connectors
  treeVertical: '│',
  treeBranch: '├─',
  treeLastBranch: '└─',

  // Indicators
  expanded: '▼',
  collapsed: '▶',

  // Status
  checkmark: '✓',
  cross: '✗',
  warning: '⚠',
  info: 'ℹ',
}
