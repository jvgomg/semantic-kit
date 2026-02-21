/**
 * TagList Component
 *
 * A shared component for rendering key-value pairs (metadata tags).
 * Used by Social and Schema views for displaying Open Graph and Twitter tags.
 */
import type { ReactNode } from 'react'
import { useSemanticColors, type ResolvedColors } from '../../theme.js'
import type { SocialValidationIssue } from '@webspecs/core'
import type { MetatagGroupResult } from '@webspecs/core'

/**
 * Props for the TagList component.
 */
export interface TagListProps {
  /** Tags as key-value pairs */
  tags: Record<string, string>
  /** Maximum length for values before truncation (default: 50) */
  maxValueLength?: number
}

/**
 * Truncate a string to a maximum length with ellipsis.
 */
function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen - 3) + '...'
}

/**
 * Renders a list of key-value tag pairs.
 *
 * @example
 * ```tsx
 * <TagList
 *   tags={{ "og:title": "My Page", "og:description": "A description" }}
 *   maxValueLength={40}
 * />
 * ```
 */
export function TagList({
  tags,
  maxValueLength = 50,
}: TagListProps): ReactNode {
  const colors = useSemanticColors()

  return (
    <box flexDirection="column" gap={0}>
      {Object.entries(tags).map(([key, value], idx) => (
        <box key={idx} paddingLeft={0}>
          <text>
            <span fg={colors.accent}>{key}:</span>{' '}
            <span fg={colors.text}>{truncate(value, maxValueLength)}</span>
          </text>
        </box>
      ))}
    </box>
  )
}

// ============================================================================
// Issue Display Components
// ============================================================================

/**
 * Get severity colors for issue display.
 */
function getSeverityColors(colors: ResolvedColors): Record<string, string> {
  return {
    high: colors.error,
    medium: colors.warning,
    low: colors.textMuted,
  }
}

/**
 * Props for IssuesDisplay component.
 */
export interface IssuesDisplayProps {
  /** Validation issues to display */
  issues: SocialValidationIssue[]
}

/**
 * Display validation issues with severity indicators.
 */
export function IssuesDisplay({ issues }: IssuesDisplayProps): ReactNode {
  const colors = useSemanticColors()

  if (issues.length === 0) return null

  const severityColors = getSeverityColors(colors)

  const severityLabels: Record<string, string> = {
    high: 'ERROR',
    medium: 'WARN',
    low: 'INFO',
  }

  return (
    <box flexDirection="column" gap={0} marginTop={1}>
      {issues.map((issue, idx) => (
        <text key={idx}>
          <span fg={severityColors[issue.severity]}>
            [{severityLabels[issue.severity]}]
          </span>{' '}
          <span>{issue.description}</span>
        </text>
      ))}
    </box>
  )
}

/**
 * Check if a metatag group has any high-severity issues.
 */
export function hasHighSeverityIssues(
  group: MetatagGroupResult | null,
): boolean {
  if (!group) return false
  return group.issues.some((issue) => issue.severity === 'high')
}

/**
 * Props for IssuesContent component.
 */
export interface IssuesContentProps {
  /** Validation issues to display */
  issues: SocialValidationIssue[]
}

/**
 * Display validation issues with a success message when empty.
 * Use this for standalone issues sections.
 */
export function IssuesContent({ issues }: IssuesContentProps): ReactNode {
  const colors = useSemanticColors()

  if (issues.length === 0) {
    return <text fg={colors.success}>No issues found</text>
  }

  const severityColors = getSeverityColors(colors)

  const severityLabels: Record<string, string> = {
    high: 'ERROR',
    medium: 'WARN',
    low: 'INFO',
  }

  return (
    <box flexDirection="column" gap={0}>
      {issues.map((issue, idx) => (
        <text key={idx}>
          <span fg={severityColors[issue.severity]}>
            [{severityLabels[issue.severity]}]
          </span>{' '}
          <span>{issue.description}</span>
        </text>
      ))}
    </box>
  )
}

/**
 * Compute section severity from issues array.
 */
export function getIssuesSeverity(
  issues: SocialValidationIssue[],
): 'error' | 'warning' | undefined {
  const hasErrors = issues.some((i) => i.severity === 'high')
  const hasWarnings = issues.some((i) => i.severity === 'medium')
  return hasErrors ? 'error' : hasWarnings ? 'warning' : undefined
}
