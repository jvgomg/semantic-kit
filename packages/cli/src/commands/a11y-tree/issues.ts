/**
 * A11y tree command issue types and builders.
 *
 * Re-exports from @webspecs/core for backwards compatibility.
 */
import type { Issue, A11yResult, A11yCompareResult } from '@webspecs/core'
import {
  buildA11yTreeIssues,
  buildA11yTreeCompareIssues,
  A11Y_TREE_CODES,
} from '@webspecs/core'

// ============================================================================
// Re-exports from core
// ============================================================================

export { A11Y_TREE_CODES }

// ============================================================================
// Issue Type
// ============================================================================

/**
 * A11y tree command uses base Issue type (no metadata needed).
 */
export type A11yTreeIssue = Issue

// ============================================================================
// Issue Builders (wrapper functions for backwards compatibility)
// ============================================================================

/**
 * Build an array of issues from the A11y result.
 */
export function buildIssues(result: A11yResult): A11yTreeIssue[] {
  return buildA11yTreeIssues({ result })
}

/**
 * Build an array of issues from the A11y:compare result.
 */
export function buildCompareIssues(result: A11yCompareResult): A11yTreeIssue[] {
  return buildA11yTreeCompareIssues({ result })
}
