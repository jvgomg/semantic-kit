/**
 * Screen reader command issue generation.
 */
import type { ScreenReaderResult } from '../results.js'
import type { Issue } from '../types.js'

// ============================================================================
// Issue Codes
// ============================================================================

export const SCREEN_READER_CODES = {
  TIMEOUT: 'screen-reader-timeout',
  MISSING_MAIN: 'screen-reader-missing-main',
  NO_HEADINGS: 'screen-reader-no-headings',
  NO_SKIP_LINK: 'screen-reader-no-skip-link',
} as const

export type ScreenReaderCode =
  (typeof SCREEN_READER_CODES)[keyof typeof SCREEN_READER_CODES]

// ============================================================================
// Input Types
// ============================================================================

export interface ScreenReaderIssueInput {
  result: ScreenReaderResult
}

// ============================================================================
// Issue Builder
// ============================================================================

/**
 * Build issues based on accessibility analysis.
 */
export function buildScreenReaderIssues(
  input: ScreenReaderIssueInput,
): Issue[] {
  const { result } = input
  const { summary } = result
  const issues: Issue[] = []

  // Timeout warning
  if (result.timedOut) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      code: SCREEN_READER_CODES.TIMEOUT,
      title: 'Page Load Timeout',
      description:
        'The page did not finish loading within the timeout period. The accessibility analysis may be incomplete.',
      tip: 'Increase the timeout with --timeout or check if the page has performance issues.',
    })
  }

  // Missing main landmark
  if (!summary.hasMainLandmark) {
    issues.push({
      type: 'warning',
      severity: 'high',
      code: SCREEN_READER_CODES.MISSING_MAIN,
      title: 'Missing Main Landmark',
      description:
        'No <main> element found. Screen reader users rely on landmarks to quickly navigate to primary content.',
      tip: 'Add a <main> element to wrap your primary content.',
    })
  }

  // No headings
  if (summary.headingCount === 0) {
    issues.push({
      type: 'warning',
      severity: 'high',
      code: SCREEN_READER_CODES.NO_HEADINGS,
      title: 'No Headings Found',
      description:
        'No heading elements found. Screen reader users navigate by headings to understand page structure.',
      tip: 'Add heading elements (h1-h6) to organize your content hierarchically.',
    })
  }

  // No skip link (info level)
  if (!summary.hasSkipLink && summary.linkCount > 10) {
    issues.push({
      type: 'info',
      severity: 'low',
      code: SCREEN_READER_CODES.NO_SKIP_LINK,
      title: 'No Skip Link Detected',
      description:
        'No skip link found. Skip links help keyboard and screen reader users bypass navigation.',
      tip: 'Add a "Skip to main content" link at the start of the page.',
    })
  }

  return issues
}
