/**
 * Structure command issue types and builders.
 *
 * Re-exports from @webspecs/core for backwards compatibility.
 */
import type { Issue, StructureAnalysis, StructureComparison } from '@webspecs/core'
import type { AxeStaticResult } from '@webspecs/core'
import {
  buildStructureIssues,
  buildStructureCompareIssues,
  STRUCTURE_CODES,
} from '@webspecs/core'

// ============================================================================
// Re-exports from core
// ============================================================================

export { STRUCTURE_CODES }

// ============================================================================
// Issue Type
// ============================================================================

/**
 * Structure command uses base Issue type (no metadata needed).
 */
export type StructureIssue = Issue

// ============================================================================
// Issue Builders (wrapper functions for backwards compatibility)
// ============================================================================

/**
 * Build issues for structure command.
 */
export function buildIssues(
  analysis: StructureAnalysis,
  axeResult: AxeStaticResult,
): StructureIssue[] {
  return buildStructureIssues({ analysis, axeResult })
}

/**
 * Build issues for structure:js command.
 */
export function buildIssuesJs(
  analysis: StructureAnalysis,
  axeResult: AxeStaticResult,
  timedOut: boolean,
): StructureIssue[] {
  return buildStructureIssues({ analysis, axeResult, timedOut })
}

/**
 * Build issues for structure:compare command.
 */
export function buildIssuesCompare(
  comparison: StructureComparison,
  timedOut: boolean,
): StructureIssue[] {
  return buildStructureCompareIssues({ comparison, timedOut })
}
