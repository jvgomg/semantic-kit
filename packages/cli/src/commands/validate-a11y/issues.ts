/**
 * Validate A11y command issue types and builders.
 *
 * Re-exports from @webspecs/core for backwards compatibility.
 */
import type { AxeAnalysisResult } from '@webspecs/core'
import {
  buildA11yIssues,
  A11Y_CODE_PREFIX,
  type A11yIssue,
  type A11yIssueMetadata,
} from '@webspecs/core'

// ============================================================================
// Re-exports from core
// ============================================================================

export { A11Y_CODE_PREFIX }
export type { A11yIssue, A11yIssueMetadata }

// ============================================================================
// Issue Builder (wrapper function for backwards compatibility)
// ============================================================================

/**
 * Build an array of issues from the axe analysis result.
 */
export function buildIssues(
  result: AxeAnalysisResult,
  ignoreIncomplete: boolean = false,
): A11yIssue[] {
  return buildA11yIssues({ result, ignoreIncomplete })
}
