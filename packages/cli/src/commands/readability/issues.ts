/**
 * Readability command issue types and builders.
 *
 * Re-exports from @webspecs/core for backwards compatibility.
 */
import type { Issue, ReadabilityCompareResult } from '@webspecs/core'
import {
  buildReadabilityCompareIssues,
  READABILITY_CODES,
} from '@webspecs/core'

// ============================================================================
// Re-exports from core
// ============================================================================

export { READABILITY_CODES }

// ============================================================================
// Issue Type
// ============================================================================

/**
 * Readability command uses base Issue type (no metadata needed).
 */
export type ReadabilityIssue = Issue

// ============================================================================
// Issue Builder (wrapper function for backwards compatibility)
// ============================================================================

/**
 * Build an array of issues from the compare result.
 */
export function buildCompareIssues(
  result: ReadabilityCompareResult,
): ReadabilityIssue[] {
  return buildReadabilityCompareIssues({ result })
}
