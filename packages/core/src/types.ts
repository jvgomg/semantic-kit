/**
 * Shared types for @webspecs/core.
 */

// ============================================================================
// Issue Types
// ============================================================================

export type IssueType = 'error' | 'warning' | 'info'
export type IssueSeverity = 'low' | 'medium' | 'high'

/**
 * Unique code identifying an issue type.
 * Format: "command-issue-name" (e.g., "structure-missing-title", "html-element-closed")
 */
export type IssueCode = string

/**
 * Location within source for issues that reference specific code positions.
 */
export interface SourceLocation {
  /** Line number (1-indexed) */
  line?: number
  /** Column number (1-indexed) */
  column?: number
  /** CSS selector identifying the element */
  selector?: string
}

/**
 * Base issue type with optional generic metadata.
 * Commands that need extra context extend this with their metadata type.
 *
 * @example Simple issue (no metadata)
 * ```ts
 * const issue: Issue = {
 *   type: 'warning',
 *   severity: 'medium',
 *   code: 'structure-missing-title',
 *   title: 'Missing Page Title',
 *   description: 'The page does not have a <title> element.',
 * }
 * ```
 *
 * @example Issue with metadata
 * ```ts
 * interface HtmlIssueMetadata {
 *   ruleId: string
 *   location: SourceLocation
 * }
 *
 * const issue: Issue<HtmlIssueMetadata> = {
 *   type: 'error',
 *   severity: 'high',
 *   code: 'html-element-closed',
 *   title: 'element-closed',
 *   description: 'Unclosed element at line 10',
 *   metadata: {
 *     ruleId: 'element-closed',
 *     location: { line: 10, column: 5 }
 *   }
 * }
 * ```
 */
export interface Issue<TMetadata = undefined> {
  type: IssueType
  severity: IssueSeverity
  title: string
  description: string
  tip?: string
  /** Unique code identifying this issue type */
  code?: IssueCode
  /** Command-specific metadata (typed per command) */
  metadata?: TMetadata
}

/**
 * Type alias for display contexts that accept any issue type.
 * Use this in shared formatting functions that don't care about metadata type.
 */
export type AnyIssue = Issue<unknown>
