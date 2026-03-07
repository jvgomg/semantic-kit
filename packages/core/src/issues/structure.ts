/**
 * Structure command issue generation.
 */
import type { AxeStaticResult } from '../axe-static.js'
import type {
  StructureAnalysis,
  StructureComparison,
  StructureWarning,
} from '../structure.js'
import type { Issue } from '../types.js'

// ============================================================================
// Issue Codes
// ============================================================================

export const STRUCTURE_CODES = {
  MISSING_TITLE: 'structure-missing-title',
  MISSING_LANG: 'structure-missing-lang',
  TIMEOUT: 'structure-timeout',
} as const

export type StructureCode =
  (typeof STRUCTURE_CODES)[keyof typeof STRUCTURE_CODES]

// ============================================================================
// Input Types
// ============================================================================

export interface StructureIssueInput {
  analysis: StructureAnalysis
  axeResult: AxeStaticResult
  timedOut?: boolean
}

export interface StructureCompareIssueInput {
  comparison: StructureComparison
  timedOut?: boolean
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Convert a StructureWarning to an Issue.
 */
function warningToIssue(warning: StructureWarning): Issue {
  return {
    type: warning.severity === 'error' ? 'error' : 'warning',
    severity: warning.severity === 'error' ? 'high' : 'medium',
    code: `structure-${warning.message.toLowerCase().replace(/\s+/g, '-')}`,
    title: warning.message,
    description: warning.details ?? '',
  }
}

// ============================================================================
// Issue Builders
// ============================================================================

/**
 * Build issues for structure command.
 * Issues are ordered by priority:
 * 1. Timeout (if applicable)
 * 2. Missing page title
 * 3. Missing language attribute
 * 4. axe-core violations (converted from StructureWarning)
 */
export function buildStructureIssues(input: StructureIssueInput): Issue[] {
  const { analysis, axeResult, timedOut = false } = input
  const issues: Issue[] = []

  // 1. Timeout
  if (timedOut) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      code: STRUCTURE_CODES.TIMEOUT,
      title: 'Timeout Reached',
      description:
        'Rendering exceeded timeout. Analysis shows partial content.',
      tip: 'Increase timeout with --timeout or optimize page load.',
    })
  }

  // 2. Missing title
  if (!analysis.title) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      code: STRUCTURE_CODES.MISSING_TITLE,
      title: 'Missing Page Title',
      description: 'The page does not have a <title> element.',
      tip: 'Add a descriptive <title> element inside <head>.',
    })
  }

  // 3. Missing language
  if (!analysis.language) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      code: STRUCTURE_CODES.MISSING_LANG,
      title: 'Missing Language Attribute',
      description: 'The <html> element does not have a lang attribute.',
      tip: 'Add lang="en" (or appropriate language code) to the <html> element.',
    })
  }

  // 4. axe-core violations
  for (const violation of axeResult.violationWarnings) {
    issues.push(warningToIssue(violation))
  }

  return issues
}

/**
 * Build issues for structure:compare command.
 */
export function buildStructureCompareIssues(
  input: StructureCompareIssueInput,
): Issue[] {
  const { timedOut = false } = input
  const issues: Issue[] = []

  // 1. Timeout
  if (timedOut) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      code: STRUCTURE_CODES.TIMEOUT,
      title: 'Timeout Reached',
      description: 'Rendering exceeded timeout. Comparison may be incomplete.',
      tip: 'Increase timeout with --timeout or optimize page load.',
    })
  }

  // Note: We don't add issues for differences - that's informational, not an issue.

  return issues
}
