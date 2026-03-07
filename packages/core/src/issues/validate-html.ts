/**
 * HTML validation issue generation.
 */
import type {
  Report as HtmlValidateReport,
  Message as HtmlValidateMessage,
} from 'html-validate'
import type { Issue } from '../types.js'
import type { HtmlIssueMetadata } from './types.js'

// ============================================================================
// Issue Type
// ============================================================================

/**
 * HTML validation issue with location metadata.
 */
export type HtmlIssue = Issue<HtmlIssueMetadata>

// ============================================================================
// Issue Codes
// ============================================================================

/**
 * Issue code prefix for HTML validation.
 * Full codes are: html-{ruleId}
 */
export const HTML_CODE_PREFIX = 'html' as const

// ============================================================================
// Input Types
// ============================================================================

export interface HtmlIssueInput {
  report: HtmlValidateReport
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Build a single issue from an html-validate message.
 */
function buildIssueFromMessage(message: HtmlValidateMessage): HtmlIssue {
  const isError = message.severity === 2
  return {
    type: isError ? 'error' : 'warning',
    severity: isError ? 'high' : 'medium',
    code: `${HTML_CODE_PREFIX}-${message.ruleId}`,
    title: message.ruleId,
    description: message.message,
    metadata: {
      ruleId: message.ruleId,
      location: {
        line: message.line,
        column: message.column,
      },
    },
  }
}

// ============================================================================
// Issue Builder
// ============================================================================

/**
 * Build an array of issues from the html-validate report.
 * Severity mapping:
 * - severity 2 -> error/high
 * - severity 1 -> warning/medium
 */
export function buildHtmlIssues(input: HtmlIssueInput): HtmlIssue[] {
  const { report } = input
  const issues: HtmlIssue[] = []

  for (const result of report.results) {
    for (const message of result.messages) {
      issues.push(buildIssueFromMessage(message))
    }
  }

  return issues
}
