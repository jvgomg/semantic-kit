/**
 * Accessibility validation issue generation.
 */
import type { AxeAnalysisResult } from '../accessibility-validation.js'
import type { AxeViolationResult } from '../results.js'
import type { Issue } from '../types.js'
import { mapAxeImpactToSeverity } from './helpers.js'
import type { A11yIssueMetadata } from './types.js'

// ============================================================================
// Issue Type
// ============================================================================

/**
 * Accessibility validation issue with impact metadata.
 */
export type A11yIssue = Issue<A11yIssueMetadata>

// ============================================================================
// Issue Codes
// ============================================================================

/**
 * Issue code prefix for accessibility validation.
 * Full codes are: a11y-{ruleId}
 */
export const A11Y_CODE_PREFIX = 'a11y' as const

// ============================================================================
// Input Types
// ============================================================================

export interface A11yIssueInput {
  result: AxeAnalysisResult
  ignoreIncomplete?: boolean
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Build a single issue from an axe violation.
 */
function buildIssueFromViolation(violation: AxeViolationResult): A11yIssue {
  const impact = violation.impact ?? 'moderate'
  const { type, severity } = mapAxeImpactToSeverity(impact)

  const title = `[${impact}] ${violation.id}`
  const nodeCount = violation.nodes.length
  const description = `${violation.help}. Affects ${nodeCount} element(s).`

  return {
    type,
    severity,
    code: `${A11Y_CODE_PREFIX}-${violation.id}`,
    title,
    description,
    tip: violation.helpUrl || undefined,
    metadata: {
      impact,
      nodeCount,
      helpUrl: violation.helpUrl,
    },
  }
}

/**
 * Build a single issue from an incomplete check.
 */
function buildIssueFromIncomplete(incomplete: AxeViolationResult): A11yIssue {
  const nodeCount = incomplete.nodes.length
  const description = `${incomplete.help}. Affects ${nodeCount} element(s).`

  return {
    type: 'warning',
    severity: 'low',
    code: `${A11Y_CODE_PREFIX}-incomplete-${incomplete.id}`,
    title: `Needs manual review: ${incomplete.id}`,
    description,
    tip: incomplete.helpUrl || undefined,
    metadata: {
      impact: 'incomplete',
      nodeCount,
      helpUrl: incomplete.helpUrl,
    },
  }
}

// ============================================================================
// Issue Builder
// ============================================================================

/**
 * Build an array of issues from the axe analysis result.
 * Severity mapping:
 * - critical -> error/high
 * - serious -> error/medium
 * - moderate -> warning/medium
 * - minor -> info/low
 * - Incomplete (if not ignored) -> warning/low with "Needs manual review: " prefix
 */
export function buildA11yIssues(input: A11yIssueInput): A11yIssue[] {
  const { result, ignoreIncomplete = false } = input
  const { results } = result
  const issues: A11yIssue[] = []

  // Process violations
  for (const violation of results.violations) {
    issues.push(buildIssueFromViolation(violation))
  }

  // Process incomplete checks (if not ignored)
  if (!ignoreIncomplete) {
    for (const incomplete of results.incomplete as AxeViolationResult[]) {
      issues.push(buildIssueFromIncomplete(incomplete))
    }
  }

  return issues
}
