/**
 * Shared helpers for issue generation.
 *
 * These utilities are used across multiple issue builders and can be
 * consumed by both CLI and TUI for consistent behavior.
 */

import type { IssueType, IssueSeverity } from '../types.js'

/**
 * Axe-core impact levels.
 */
export type AxeImpact = 'critical' | 'serious' | 'moderate' | 'minor'

/**
 * Map axe-core impact to issue type and severity.
 *
 * Mapping:
 * - critical → error/high
 * - serious → error/medium
 * - moderate → warning/medium
 * - minor → info/low
 *
 * Used by validate-a11y and structure commands.
 */
export function mapAxeImpactToSeverity(impact: AxeImpact | null | undefined): {
  type: IssueType
  severity: IssueSeverity
} {
  switch (impact) {
    case 'critical':
      return { type: 'error', severity: 'high' }
    case 'serious':
      return { type: 'error', severity: 'medium' }
    case 'moderate':
      return { type: 'warning', severity: 'medium' }
    case 'minor':
    default:
      return { type: 'info', severity: 'low' }
  }
}

/**
 * Sort issues by severity (high → medium → low).
 */
export function sortIssuesBySeverity<T extends { severity: IssueSeverity }>(
  issues: T[],
): T[] {
  const order: Record<IssueSeverity, number> = { high: 0, medium: 1, low: 2 }
  return [...issues].sort((a, b) => order[a.severity] - order[b.severity])
}

/**
 * Count issues by severity.
 */
export function countIssuesBySeverity<T extends { severity: IssueSeverity }>(
  issues: T[],
): Record<IssueSeverity, number> {
  const counts: Record<IssueSeverity, number> = { high: 0, medium: 0, low: 0 }
  for (const issue of issues) {
    counts[issue.severity]++
  }
  return counts
}

/**
 * Check if any issues have high severity.
 */
export function hasHighSeverityIssues<T extends { severity: IssueSeverity }>(
  issues: T[],
): boolean {
  return issues.some((issue) => issue.severity === 'high')
}

/**
 * Get the highest severity from a list of issues.
 */
export function getHighestSeverity<T extends { severity: IssueSeverity }>(
  issues: T[],
): IssueSeverity | null {
  if (issues.length === 0) return null
  if (issues.some((i) => i.severity === 'high')) return 'high'
  if (issues.some((i) => i.severity === 'medium')) return 'medium'
  return 'low'
}
