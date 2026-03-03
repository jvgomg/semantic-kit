/**
 * A11y tree command issue generation.
 */
import type { A11yResult, A11yCompareResult } from '../results.js'
import type { Issue } from '../types.js'

// ============================================================================
// Issue Codes
// ============================================================================

export const A11Y_TREE_CODES = {
  TIMEOUT: 'a11y-tree-timeout',
  MISSING_MAIN: 'a11y-tree-missing-main',
  NO_HEADINGS: 'a11y-tree-no-headings',
  JS_REMOVES_ELEMENTS: 'a11y-tree-js-removes',
  JS_ADDS_ELEMENTS: 'a11y-tree-js-adds',
} as const

export type A11yTreeCode =
  (typeof A11Y_TREE_CODES)[keyof typeof A11Y_TREE_CODES]

// ============================================================================
// Input Types
// ============================================================================

export interface A11yTreeIssueInput {
  result: A11yResult
}

export interface A11yTreeCompareIssueInput {
  result: A11yCompareResult
}

// ============================================================================
// Issue Builders
// ============================================================================

/**
 * Build an array of issues from the A11y result.
 * Issues are ordered by priority:
 * 1. Timeout (warning/medium)
 * 2. Missing main landmark (warning/medium)
 * 3. No headings found (warning/medium)
 */
export function buildA11yTreeIssues(input: A11yTreeIssueInput): Issue[] {
  const { result } = input
  const issues: Issue[] = []

  // 1. Timeout
  if (result.timedOut) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      code: A11Y_TREE_CODES.TIMEOUT,
      title: 'Page Load Timeout',
      description:
        'The page did not finish loading within the timeout period. The accessibility tree may be incomplete.',
      tip: 'Increase the timeout with --timeout or check if the page has performance issues.',
    })
  }

  // 2. Missing main landmark
  if (!result.counts['main']) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      code: A11Y_TREE_CODES.MISSING_MAIN,
      title: 'Missing Main Landmark',
      description:
        'No <main> element found. Screen readers use landmarks for navigation.',
      tip: 'Add a <main> element to wrap your primary content.',
    })
  }

  // 3. No headings
  if (!result.counts['heading']) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      code: A11Y_TREE_CODES.NO_HEADINGS,
      title: 'No Headings Found',
      description:
        'No heading elements found. Headings provide document structure and navigation.',
      tip: 'Add heading elements (h1-h6) to organize your content.',
    })
  }

  return issues
}

/**
 * Build an array of issues from the A11y:compare result.
 * Issues are ordered by priority:
 * 1. Timeout (warning/medium)
 * 2. JS removes elements (warning/medium)
 * 3. JS adds many elements (info/low)
 */
export function buildA11yTreeCompareIssues(
  input: A11yTreeCompareIssueInput,
): Issue[] {
  const { result } = input
  const issues: Issue[] = []

  // 1. Timeout
  if (result.static.timedOut || result.hydrated.timedOut) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      code: A11Y_TREE_CODES.TIMEOUT,
      title: 'Page Load Timeout',
      description:
        'One or more page loads timed out. The comparison may be incomplete.',
      tip: 'Increase the timeout with --timeout or check if the page has performance issues.',
    })
  }

  // 2. JS removes elements
  if (result.diff.removed.length > 0) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      code: A11Y_TREE_CODES.JS_REMOVES_ELEMENTS,
      title: `JavaScript Removes ${result.diff.removed.length} Elements`,
      description:
        'JavaScript removes some accessibility elements. This may indicate content that disappears after hydration.',
      tip: 'Check if important content is being hidden or replaced by JavaScript.',
    })
  }

  // 3. JS adds many elements
  if (result.diff.added.length > 10) {
    issues.push({
      type: 'info',
      severity: 'low',
      code: A11Y_TREE_CODES.JS_ADDS_ELEMENTS,
      title: `JavaScript Adds ${result.diff.added.length} Elements`,
      description:
        'JavaScript adds many accessibility elements. This content is not available to crawlers that do not execute JavaScript.',
      tip: 'Consider server-side rendering for important content.',
    })
  }

  return issues
}
