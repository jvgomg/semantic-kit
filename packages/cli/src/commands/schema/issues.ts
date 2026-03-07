/**
 * Schema command issue types and builders.
 *
 * Re-exports from @webspecs/core for backwards compatibility.
 */
import type {
  AnyIssue,
  SchemaResult,
  SchemaCompareResult,
} from '@webspecs/core'
import {
  buildSchemaIssues,
  buildSchemaCompareIssues,
  SCHEMA_CODES,
} from '@webspecs/core'

// ============================================================================
// Re-exports from core
// ============================================================================

export { SCHEMA_CODES }

// ============================================================================
// Issue Type
// ============================================================================

/**
 * Schema command uses AnyIssue type since it combines base issues
 * with SocialValidationIssue which has metadata.
 */
export type SchemaIssue = AnyIssue

// ============================================================================
// Issue Builders (wrapper functions for backwards compatibility)
// ============================================================================

/**
 * Build an array of issues from the schema result.
 */
export function buildIssues(result: SchemaResult): SchemaIssue[] {
  return buildSchemaIssues({ result })
}

/**
 * Build an array of issues from the schema compare result.
 */
export function buildCompareIssues(result: SchemaCompareResult): SchemaIssue[] {
  return buildSchemaCompareIssues({ result })
}
