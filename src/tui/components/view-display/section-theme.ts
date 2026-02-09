/**
 * Theme values for the expandable sections framework.
 */
import { palette } from '../../theme.js'

/**
 * Section-specific theme colors.
 */
export const sectionColors = {
  // Borders
  borderExpanded: palette.cyan,
  borderCollapsed: palette.gray,
  borderSelected: palette.yellow,

  // Severity colors
  severityCritical: palette.red,
  severityError: palette.red,
  severityWarning: palette.yellow,
  severityInfo: palette.blue,
  severitySuccess: palette.green,
  severityMuted: palette.gray,

  // Text
  titleExpanded: palette.white,
  titleCollapsed: palette.gray,
  summaryText: palette.gray,

  // Indicators
  expandIndicator: palette.cyan,
  countBadge: palette.yellow,
} as const

/**
 * Get severity color for a given severity level.
 */
export function getSeverityColor(
  severity?: 'critical' | 'error' | 'warning' | 'info' | 'success' | 'muted',
): string {
  switch (severity) {
    case 'critical':
      return sectionColors.severityCritical
    case 'error':
      return sectionColors.severityError
    case 'warning':
      return sectionColors.severityWarning
    case 'info':
      return sectionColors.severityInfo
    case 'success':
      return sectionColors.severitySuccess
    case 'muted':
      return sectionColors.severityMuted
    default:
      return palette.white
  }
}
