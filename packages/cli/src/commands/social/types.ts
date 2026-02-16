/**
 * Types for the Social lens command.
 */
import type { SocialPreview, SocialValidationIssue } from '@webspecs/core'
import type { OutputFormat } from '../../lib/arguments.js'
import type { OutputModeOptions } from '../../lib/output-mode.js'

// Re-export types from shared library for consumers
export type { SocialPreview, SocialValidationIssue, ValidationSeverity } from '@webspecs/core'

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
