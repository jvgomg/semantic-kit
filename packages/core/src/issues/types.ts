/**
 * Issue metadata types for domain-specific issue data.
 *
 * These types define the structured metadata that accompanies issues
 * from different commands, enabling consumers to access additional
 * context beyond the base issue fields.
 */

import type { SourceLocation } from '../types.js'

// ============================================================================
// Validation Issue Metadata
// ============================================================================

/**
 * Metadata for HTML validation issues.
 */
export interface HtmlIssueMetadata {
  /** The html-validate rule ID */
  ruleId: string
  /** Location in source */
  location: SourceLocation
}

/**
 * Metadata for accessibility validation issues.
 */
export interface A11yIssueMetadata {
  /** Axe-core impact level */
  impact: string
  /** Number of elements affected */
  nodeCount: number
  /** URL to help documentation */
  helpUrl?: string
}

/**
 * Metadata for schema validation issues.
 */
export interface SchemaValidationIssueMetadata {
  /** The schema group (e.g., 'Article', 'Product') */
  group: string
  /** The specific test that failed */
  test: string
}

// ============================================================================
// Re-export SocialIssueMetadata from metadata module
// ============================================================================

export type { SocialIssueMetadata } from '../metadata/types.js'
