/**
 * Shared types for social metadata extraction and validation.
 */

import type { Issue, IssueSeverity, IssueType } from '../cli-formatting/types.js'

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Severity levels for validation issues.
 * - error: Breaks functionality (invalid URL format)
 * - warning: Affects quality (truncation, missing dimensions)
 * - info: Best practice (missing alt text, no twitter:card)
 */
export type ValidationSeverity = 'error' | 'warning' | 'info'

/**
 * Social validation issue extending base Issue with metadata-specific fields.
 */
export interface SocialValidationIssue extends Issue {
  /** Unique code identifying this issue type */
  code: string
  /** The tag this issue relates to */
  tag: string
  /** The actual value (if applicable) */
  value?: string
  /** Character limit (for length issues) */
  limit?: number
  /** Actual character count (for length issues) */
  actual?: number
}

// ============================================================================
// Metatag Types
// ============================================================================

/**
 * Normalized metatags where each key maps to a single value (first occurrence).
 */
export type NormalizedMetatags = Record<string, string | undefined>

/**
 * Tag requirements defining required and recommended tags for a standard.
 */
export interface TagRequirements {
  required: string[]
  recommended: string[]
}

/**
 * Required and recommended tags for Open Graph.
 * @see https://ogp.me/
 */
export const OPEN_GRAPH_REQUIREMENTS: TagRequirements = {
  required: ['og:title', 'og:type', 'og:image', 'og:url'],
  recommended: ['og:description', 'og:site_name', 'og:locale'],
}

/**
 * Required and recommended tags for Twitter Cards.
 * @see https://developer.twitter.com/en/docs/twitter-for-websites/cards
 */
export const TWITTER_CARD_REQUIREMENTS: TagRequirements = {
  required: ['twitter:card'],
  recommended: ['twitter:title', 'twitter:description', 'twitter:image'],
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert validation severity to base Issue type and severity.
 */
export function severityToIssue(severity: ValidationSeverity): {
  type: IssueType
  severity: IssueSeverity
} {
  const typeMap: Record<ValidationSeverity, IssueType> = {
    error: 'error',
    warning: 'warning',
    info: 'info',
  }

  const severityMap: Record<ValidationSeverity, IssueSeverity> = {
    error: 'high',
    warning: 'medium',
    info: 'low',
  }

  return {
    type: typeMap[severity],
    severity: severityMap[severity],
  }
}
