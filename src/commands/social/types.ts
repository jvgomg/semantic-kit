/**
 * Types for the Social lens command.
 */
import type { OutputModeOptions } from '../../lib/output-mode.js'
import type { OutputFormat } from '../../lib/arguments.js'

// ============================================================================
// Constants
// ============================================================================

/**
 * Valid output formats for the social command.
 */
export const VALID_FORMATS: readonly OutputFormat[] = [
  'full',
  'compact',
  'json',
]
export type SocialFormat = (typeof VALID_FORMATS)[number]

/**
 * Open Graph tags to extract.
 * @see https://ogp.me/
 */
export const OPEN_GRAPH_TAGS = [
  'og:title',
  'og:type',
  'og:url',
  'og:image',
  'og:description',
  'og:site_name',
  'og:locale',
  'og:image:width',
  'og:image:height',
  'og:image:alt',
  'og:image:type',
  'og:image:secure_url',
] as const

/**
 * Twitter Card tags to extract.
 * @see https://developer.twitter.com/en/docs/twitter-for-websites/cards
 */
export const TWITTER_CARD_TAGS = [
  'twitter:card',
  'twitter:title',
  'twitter:description',
  'twitter:image',
  'twitter:image:alt',
  'twitter:site',
  'twitter:creator',
] as const

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
 * A validation issue found in social metadata.
 */
export interface SocialValidationIssue {
  /** Unique code identifying this issue type */
  code: string
  /** Severity level */
  severity: ValidationSeverity
  /** Human-readable message */
  message: string
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
// Result Types
// ============================================================================

/**
 * A group of social meta tags.
 */
export interface SocialTagGroup {
  /** Human-readable name (e.g., "Open Graph") */
  name: string
  /** Tag prefix (e.g., "og:") */
  prefix: string
  /** The extracted tags */
  tags: Record<string, string>
}

/**
 * Resolved preview data for display.
 * Uses platform-accurate fallback chains.
 *
 * @see research/topics/social-metadata/open-graph-validation.md
 */
export interface SocialPreview {
  /** Title: twitter:title → og:title → <title> */
  title: string | null
  /** Description: twitter:description → og:description → meta description */
  description: string | null
  /** Image: twitter:image → og:image → null */
  image: string | null
  /** URL: og:url → canonical → target URL */
  url: string
  /** Site name: og:site_name → null */
  siteName: string | null
}

/**
 * Result for the `social` command.
 * Shows what social media platforms see when a link is shared.
 */
export interface SocialResult {
  /** Target URL or file path */
  target: string
  /** Open Graph tag group (null if no OG tags found) */
  openGraph: SocialTagGroup | null
  /** Twitter Card tag group (null if no Twitter tags found) */
  twitter: SocialTagGroup | null
  /** Resolved preview values (with fallbacks) */
  preview: SocialPreview
  /** Summary counts */
  counts: {
    /** Number of Open Graph tags found */
    openGraph: number
    /** Number of Twitter Card tags found */
    twitter: number
    /** Total social meta tags */
    total: number
  }
  /** Validation issues found */
  issues: SocialValidationIssue[]
}

// ============================================================================
// Command Options
// ============================================================================

/**
 * Options for the social command.
 */
export interface SocialOptions extends OutputModeOptions {
  /** Output format */
  format?: string
}
