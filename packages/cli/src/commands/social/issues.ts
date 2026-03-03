/**
 * Social command issue types and builders.
 *
 * Re-exports from @webspecs/core for backwards compatibility.
 */
import type { AnyIssue, SocialResult } from '@webspecs/core'
import { buildSocialIssues, SOCIAL_CODES } from '@webspecs/core'

// ============================================================================
// Re-exports from core
// ============================================================================

export { SOCIAL_CODES }

// ============================================================================
// Issue Type
// ============================================================================

/**
 * Social command uses AnyIssue type since it combines base issues
 * with SocialValidationIssue which has metadata.
 */
export type SocialIssue = AnyIssue

// ============================================================================
// Issue Builder (wrapper function for backwards compatibility)
// ============================================================================

/**
 * Build CLI issues from social result.
 */
export function buildIssues(result: SocialResult): SocialIssue[] {
  return buildSocialIssues({ result })
}
