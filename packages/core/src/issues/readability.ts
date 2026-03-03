/**
 * Readability command issue generation.
 */
import type { ReadabilityCompareResult } from '../results.js'
import type { Issue } from '../types.js'

// ============================================================================
// Issue Codes
// ============================================================================

export const READABILITY_CODES = {
  TIMEOUT: 'readability-timeout',
  NO_CONTENT: 'readability-no-content',
  HIGH_JS_DEPENDENCY: 'readability-high-js-dependency',
  SOME_JS_CONTENT: 'readability-some-js-content',
  SECTIONS_HIDDEN: 'readability-sections-hidden',
} as const

export type ReadabilityCode =
  (typeof READABILITY_CODES)[keyof typeof READABILITY_CODES]

// ============================================================================
// Input Types
// ============================================================================

export interface ReadabilityCompareIssueInput {
  result: ReadabilityCompareResult
}

// ============================================================================
// Issue Builder
// ============================================================================

/**
 * Build an array of issues from the readability compare result.
 */
export function buildReadabilityCompareIssues(
  input: ReadabilityCompareIssueInput,
): Issue[] {
  const { result } = input
  const { comparison, timedOut, rendered } = result
  const issues: Issue[] = []

  // 1. Timeout warning
  if (timedOut) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      code: READABILITY_CODES.TIMEOUT,
      title: 'Page Load Timeout',
      description:
        'Rendering exceeded timeout. Analysis shows partial content.',
      tip: 'Increase timeout with --timeout or optimize page load.',
    })
  }

  // 2. No content extracted
  if (rendered.metrics.wordCount === 0) {
    issues.push({
      type: 'warning',
      severity: 'high',
      code: READABILITY_CODES.NO_CONTENT,
      title: 'No Content Extracted',
      description: 'No main content could be extracted from the rendered page.',
    })
  }

  // 3. High JS dependency (>50%)
  if (comparison.jsDependentPercentage > 50) {
    issues.push({
      type: 'warning',
      severity: 'high',
      code: READABILITY_CODES.HIGH_JS_DEPENDENCY,
      title: 'High JavaScript Dependency',
      description: `${comparison.jsDependentPercentage}% of content requires JavaScript. Search bots may miss ${comparison.jsDependentWordCount.toLocaleString()} words.`,
      tip: 'Consider server-side rendering for SEO-critical content.',
    })
  }
  // 4. Some JS dependency (>0% and <=50%)
  else if (comparison.jsDependentPercentage > 0) {
    issues.push({
      type: 'info',
      severity: 'low',
      code: READABILITY_CODES.SOME_JS_CONTENT,
      title: 'Some JavaScript Content',
      description: `${comparison.jsDependentPercentage}% of content requires JavaScript (${comparison.jsDependentWordCount.toLocaleString()} words).`,
    })
  }

  // 5. Sections hidden from bots
  if (comparison.sectionsOnlyInRendered.length > 0) {
    const count = comparison.sectionsOnlyInRendered.length
    issues.push({
      type: 'info',
      severity: 'low',
      code: READABILITY_CODES.SECTIONS_HIDDEN,
      title: 'Sections Hidden from Bots',
      description: `${count} section${count === 1 ? '' : 's'} only appear after JavaScript execution.`,
    })
  }

  return issues
}
