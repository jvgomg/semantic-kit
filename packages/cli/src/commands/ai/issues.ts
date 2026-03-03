/**
 * AI command issue types and builders.
 *
 * Re-exports from @webspecs/core for backwards compatibility.
 */
import type { Issue, AiResult } from '@webspecs/core'
import { buildAiIssues, AI_CODES } from '@webspecs/core'

// ============================================================================
// Re-exports from core
// ============================================================================

export { AI_CODES }

// ============================================================================
// Issue Type
// ============================================================================

/**
 * AI command uses base Issue type (no metadata needed).
 */
export type AiIssue = Issue

// ============================================================================
// Issue Builder (wrapper function for backwards compatibility)
// ============================================================================

/**
 * Build an array of issues from the AI result.
 */
export function buildIssues(result: AiResult): AiIssue[] {
  return buildAiIssues({ result })
}
