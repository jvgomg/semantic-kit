/**
 * Validate HTML command issue types and builders.
 *
 * Re-exports from @webspecs/core for backwards compatibility.
 */
import {
  buildHtmlIssues,
  HTML_CODE_PREFIX,
  type HtmlValidateReport,
  type HtmlIssue,
  type HtmlIssueMetadata,
} from '@webspecs/core'

// ============================================================================
// Re-exports from core
// ============================================================================

export { HTML_CODE_PREFIX }
export type { HtmlIssue, HtmlIssueMetadata }

// ============================================================================
// Issue Builder (wrapper function for backwards compatibility)
// ============================================================================

/**
 * Build an array of issues from the html-validate report.
 */
export function buildIssues(report: HtmlValidateReport): HtmlIssue[] {
  return buildHtmlIssues({ report })
}
