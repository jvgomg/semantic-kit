/**
 * Validate Schema command issue types and builders.
 *
 * Re-exports from @webspecs/core for backwards compatibility.
 */
import type { SchemaValidationResult } from '@webspecs/core'
import {
  buildSchemaValidationIssues,
  SCHEMA_CODE_PREFIX,
  type SchemaValidationIssue,
  type SchemaValidationIssueMetadata,
} from '@webspecs/core'

// ============================================================================
// Re-exports from core
// ============================================================================

export { SCHEMA_CODE_PREFIX }
export type { SchemaValidationIssue as SchemaIssue, SchemaValidationIssueMetadata as SchemaIssueMetadata }

// ============================================================================
// Issue Builder (wrapper function for backwards compatibility)
// ============================================================================

/**
 * Build an array of issues from the schema validation result.
 */
export function buildIssues(
  result: SchemaValidationResult,
  requiredGroups: string[] = [],
): SchemaValidationIssue[] {
  return buildSchemaValidationIssues({ result, requiredGroups })
}
