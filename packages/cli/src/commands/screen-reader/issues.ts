/**
 * Screen reader command issue types and builders.
 *
 * Re-exports from @webspecs/core for backwards compatibility.
 */
import type { Issue, ScreenReaderResult } from '@webspecs/core'
import { buildScreenReaderIssues, SCREEN_READER_CODES } from '@webspecs/core'

// ============================================================================
// Re-exports from core
// ============================================================================

export { SCREEN_READER_CODES }

// ============================================================================
// Issue Type
// ============================================================================

/**
 * Screen reader command uses base Issue type (no metadata needed).
 */
export type ScreenReaderIssue = Issue

// ============================================================================
// Issue Builder (wrapper function for backwards compatibility)
// ============================================================================

/**
 * Build issues based on accessibility analysis.
 */
export function buildIssues(result: ScreenReaderResult): ScreenReaderIssue[] {
  return buildScreenReaderIssues({ result })
}
