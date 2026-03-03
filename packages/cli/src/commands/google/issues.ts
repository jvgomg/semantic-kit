/**
 * Google command issue types and builders.
 *
 * Re-exports from @webspecs/core for backwards compatibility.
 */
import type { Issue, GoogleResult } from '@webspecs/core'
import { buildGoogleIssues, GOOGLE_CODES } from '@webspecs/core'

// ============================================================================
// Re-exports from core
// ============================================================================

export { GOOGLE_CODES }

// ============================================================================
// Issue Type
// ============================================================================

/**
 * Google command uses base Issue type (no metadata needed).
 */
export type GoogleIssue = Issue

// ============================================================================
// Issue Builder (wrapper function for backwards compatibility)
// ============================================================================

/**
 * Build issues for the Google lens.
 */
export function buildIssues(result: GoogleResult): GoogleIssue[] {
  return buildGoogleIssues({ result })
}
