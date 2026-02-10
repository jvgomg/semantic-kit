/**
 * Types for the Social lens command.
 */
import type { OutputModeOptions } from '../../lib/output-mode.js'
import type { OutputFormat } from '../../lib/validation.js'

// ============================================================================
// Constants
// ============================================================================

/**
 * Valid output formats for the social command.
 */
export const VALID_FORMATS: readonly OutputFormat[] = ['full', 'compact', 'json']
export type SocialFormat = (typeof VALID_FORMATS)[number]

/**
 * Required and recommended Open Graph tags.
 * Based on Open Graph Protocol specification.
 *
 * Note: og:image is technically required per OGP spec, but many pages
 * work fine without it, so we treat it as recommended.
 *
 * @see https://ogp.me/
 */
export const OPEN_GRAPH_TAGS = {
  required: ['og:title', 'og:type', 'og:url'],
  recommended: ['og:image', 'og:description', 'og:site_name', 'og:locale'],
  /** Image-specific tags to check when og:image is present */
  imageOptional: ['og:image:width', 'og:image:height', 'og:image:alt'],
} as const

/**
 * Required and recommended Twitter Card tags.
 * Based on Twitter Cards documentation.
 *
 * @see https://developer.twitter.com/en/docs/twitter-for-websites/cards
 */
export const TWITTER_CARD_TAGS = {
  required: ['twitter:card', 'twitter:title', 'twitter:description'],
  recommended: ['twitter:image', 'twitter:site', 'twitter:creator'],
} as const

// ============================================================================
// Result Types
// ============================================================================

/**
 * A group of social meta tags with completeness analysis.
 */
export interface SocialTagGroup {
  /** Human-readable name (e.g., "Open Graph") */
  name: string
  /** Tag prefix (e.g., "og:") */
  prefix: string
  /** The extracted tags */
  tags: Record<string, string>
  /** Required tags that are missing */
  missingRequired: string[]
  /** Recommended tags that are missing */
  missingRecommended: string[]
  /** Whether all required tags are present */
  isComplete: boolean
  /** Image-related tags that are missing (only relevant when og:image is present) */
  missingImageTags?: string[]
}

/**
 * Resolved preview data for display.
 * Falls back from Twitter to OG to page metadata.
 */
export interface SocialPreview {
  /** Title for the preview card */
  title: string | null
  /** Description for the preview card */
  description: string | null
  /** Image URL for the preview card */
  image: string | null
  /** URL for the preview card */
  url: string | null
  /** Site name or domain */
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
  /** Completeness scores */
  completeness: {
    /** Open Graph completeness (0-100, null if no tags) */
    openGraph: number | null
    /** Twitter Card completeness (0-100, null if no tags) */
    twitter: number | null
  }
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
