/**
 * Theme values for the expandable sections framework.
 */
import { usePalette } from '../../theme.js'

/**
 * Section-specific theme colors.
 */
export interface SectionColors {
  // Borders
  borderExpanded: string
  borderCollapsed: string
  borderSelected: string

  // Severity colors
  severityCritical: string
  severityError: string
  severityWarning: string
  severityInfo: string
  severitySuccess: string
  severityMuted: string

  // Text
  titleExpanded: string
  titleCollapsed: string
  summaryText: string
  defaultText: string

  // Indicators
  expandIndicator: string
  countBadge: string
}

/**
 * Hook to get section-specific theme colors.
 */
export function useSectionColors(): SectionColors {
  const palette = usePalette()

  return {
    // Borders
    borderExpanded: palette.base0D, // accent/cyan
    borderCollapsed: palette.base03, // muted/gray
    borderSelected: palette.base0A, // highlight/yellow

    // Severity colors
    severityCritical: palette.base08, // red
    severityError: palette.base08, // red
    severityWarning: palette.base0A, // yellow
    severityInfo: palette.base0D, // blue/cyan
    severitySuccess: palette.base0B, // green
    severityMuted: palette.base03, // gray

    // Text
    titleExpanded: palette.base05, // default foreground
    titleCollapsed: palette.base03, // muted
    summaryText: palette.base03, // muted
    defaultText: palette.base05, // default foreground

    // Indicators
    expandIndicator: palette.base0D, // accent/cyan
    countBadge: palette.base0A, // highlight/yellow
  }
}

/**
 * Get severity color for a given severity level.
 */
export function getSeverityColor(
  sectionColors: SectionColors,
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
      return sectionColors.defaultText
  }
}
