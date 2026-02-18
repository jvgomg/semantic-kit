/**
 * Theme values for the expandable sections framework.
 *
 * @deprecated Import directly from '../../theme.js' instead.
 * This file provides backwards compatibility for components using SectionColors.
 */
import {
  useSemanticColors,
  getSeverityColor as getSemanticSeverityColor,
  type SemanticColors,
  type SeverityLevel,
} from '../../theme.js'

/**
 * Section-specific theme colors.
 * @deprecated Use SemanticColors from '../../theme.js' instead.
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
 * Maps SemanticColors to SectionColors for backwards compatibility.
 */
function mapToSectionColors(colors: SemanticColors): SectionColors {
  return {
    // Borders
    borderExpanded: colors.borderFocused,
    borderCollapsed: colors.borderUnfocused,
    borderSelected: colors.borderSelected,

    // Severity colors
    severityCritical: colors.severityCritical,
    severityError: colors.severityError,
    severityWarning: colors.severityWarning,
    severityInfo: colors.severityInfo,
    severitySuccess: colors.severitySuccess,
    severityMuted: colors.severityMuted,

    // Text
    titleExpanded: colors.text,
    titleCollapsed: colors.textMuted,
    summaryText: colors.textMuted,
    defaultText: colors.text,

    // Indicators
    expandIndicator: colors.accent,
    countBadge: colors.highlight,
  }
}

/**
 * Hook to get section-specific theme colors.
 * @deprecated Use useSemanticColors() from '../../theme.js' instead.
 */
export function useSectionColors(): SectionColors {
  const colors = useSemanticColors()
  return mapToSectionColors(colors)
}

/**
 * Get severity color for a given severity level.
 * @deprecated Use getSeverityColor() from '../../theme.js' instead.
 */
export function getSeverityColor(
  sectionColors: SectionColors,
  severity?: SeverityLevel,
): string {
  // Re-use the semantic implementation with semantic color values
  const colors = {
    severityCritical: sectionColors.severityCritical,
    severityError: sectionColors.severityError,
    severityWarning: sectionColors.severityWarning,
    severityInfo: sectionColors.severityInfo,
    severitySuccess: sectionColors.severitySuccess,
    severityMuted: sectionColors.severityMuted,
    text: sectionColors.defaultText,
  } as SemanticColors
  return getSemanticSeverityColor(colors, severity)
}
