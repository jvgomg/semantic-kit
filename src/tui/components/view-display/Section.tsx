/**
 * Section component for the expandable sections framework.
 *
 * An individual collapsible section that can be nested within ViewSections.
 * Self-registers with the SectionRegistryContext on mount.
 *
 * Two rendering modes:
 * 1. Collapsed (shows summary)
 * 2. Expanded (shows full content)
 */
import type { ReactNode } from 'react'
import { useSection } from '../../state/sections/index.js'
import {
  boxChars,
  SectionPriority,
  type SectionSeverity,
} from './priorities.js'
import { sectionColors, getSeverityColor } from './section-theme.js'
import { palette } from '../../theme.js'

export interface SectionProps {
  /** Unique identifier within parent container */
  id: string
  /** Display title, e.g., "ERRORS" */
  title: string
  /** For automatic ordering within ViewSections */
  priority?: SectionPriority

  // Summary display (shown in header or when collapsed)
  /** Item count, e.g., 3 for "ERRORS (3)" */
  count?: number
  /** Text summary for collapsed state */
  summary?: string
  /** Max lines for summary (default: 3) */
  summaryLines?: number

  // State
  /** Initial expanded state */
  defaultExpanded?: boolean

  // Visual
  /** Severity level for styling */
  severity?: SectionSeverity
  /** Unicode symbol, e.g., "✗", "⚠", "✓" */
  icon?: string


  // Layout
  /** Whether this section contains scrollable content that should expand */
  scrollable?: boolean

  // Content
  children?: ReactNode
}

/**
 * Get border color based on state.
 */
function getBorderColor(
  isSelected: boolean,
  isExpanded: boolean,
  severity?: SectionSeverity,
): string {
  if (isSelected) return sectionColors.borderSelected
  if (severity) return getSeverityColor(severity)
  if (isExpanded) return sectionColors.borderExpanded
  return sectionColors.borderCollapsed
}

/**
 * Section component.
 *
 * Renders a collapsible section with header, optional body content,
 * and footer. Supports collapsed and expanded modes.
 *
 * Self-registers with the SectionRegistryContext on mount.
 */
export function Section({
  id,
  title,
  priority = SectionPriority.PRIMARY,
  count,
  summary,
  summaryLines = 3,
  defaultExpanded = false,
  severity,
  icon,
  scrollable = false,
  children,
}: SectionProps): ReactNode {
  // Get state from the section hook (self-registers on mount)
  const { isExpanded, isSelected } = useSection(id, defaultExpanded, priority)

  const borderColor = getBorderColor(isSelected, isExpanded, severity)
  const indicator = isExpanded ? boxChars.expanded : boxChars.collapsed
  const countText = count !== undefined ? ` (${count})` : ''
  const titleColor = severity ? getSeverityColor(severity) : palette.white
  const bracketColor = isSelected ? sectionColors.expandIndicator : palette.gray

  // Build title with indicator on the left: [▼] {icon} TITLE (count)
  const titleContent = (
    <text>
      <span fg={bracketColor}>[</span>
      <span fg={sectionColors.expandIndicator}>{indicator}</span>
      <span fg={bracketColor}>]</span>
      {icon && <span fg={titleColor}> {icon}</span>}
      <span fg={titleColor}> {title}</span>
      {countText && <span fg={sectionColors.countBadge}>{countText}</span>}
    </text>
  )

  // Collapsed state: show summary
  // Non-scrollable sections should not shrink, scrollable sections can
  if (!isExpanded) {
    const summaryLines_ = summary
      ? summary.split('\n').slice(0, summaryLines)
      : []

    return (
      <box
        flexDirection="column"
        flexShrink={scrollable ? 1 : 0}
        border
        borderStyle="rounded"
        borderColor={borderColor}
        paddingLeft={1}
        paddingRight={1}
      >
        {titleContent}
        {summaryLines_.length > 0 && (
          <box flexDirection="column" marginTop={1}>
            {summaryLines_.map((line, i) => (
              <text key={i} fg={sectionColors.summaryText}>
                {line}
              </text>
            ))}
          </box>
        )}
      </box>
    )
  }

  // Expanded state: show children
  // Scrollable sections grow to fill space, non-scrollable sections don't shrink
  return (
    <box
      flexDirection="column"
      flexGrow={scrollable ? 1 : 0}
      flexShrink={scrollable ? 1 : 0}
      border
      borderStyle="rounded"
      borderColor={borderColor}
      paddingLeft={1}
      paddingRight={1}
    >
      {titleContent}
      {children && (
        <box flexDirection="column" flexGrow={scrollable ? 1 : 0} marginTop={1}>
          {children}
        </box>
      )}
    </box>
  )
}

/**
 * Export priority for convenience.
 */
export { SectionPriority } from './priorities.js'
export type { SectionSeverity } from './priorities.js'
