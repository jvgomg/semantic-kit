/**
 * Types for the Google lens command.
 */
import type { HeadingAnalysis } from '@webspecs/core'

// ============================================================================
// Constants
// ============================================================================

/**
 * Google-recognized JSON-LD schema types for rich results.
 * Based on Google Search Central documentation.
 *
 * @see https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
 */
export const GOOGLE_SCHEMA_TYPES = [
  // Content types
  'Article',
  'NewsArticle',
  'BlogPosting',
  'TechArticle',

  // E-commerce
  'Product',
  'Offer',
  'AggregateOffer',

  // Reviews
  'Review',
  'AggregateRating',

  // Recipes
  'Recipe',

  // Events
  'Event',

  // FAQ & How-to
  'FAQPage',
  'HowTo',
  'HowToStep',
  'HowToSection',

  // Business
  'LocalBusiness',
  'Organization',
  'Corporation',

  // People
  'Person',

  // Navigation
  'BreadcrumbList',

  // Media
  'VideoObject',
  'ImageObject',

  // Software
  'SoftwareApplication',
  'MobileApplication',
  'WebApplication',

  // Jobs
  'JobPosting',

  // Courses
  'Course',

  // Books
  'Book',

  // Search features
  'WebSite',
  'SearchAction',
] as const

export type GoogleSchemaType = (typeof GOOGLE_SCHEMA_TYPES)[number]

/**
 * Valid output formats for the google command.
 */
export const VALID_FORMATS = ['full', 'compact', 'json'] as const
export type GoogleFormat = (typeof VALID_FORMATS)[number]

// ============================================================================
// Result Types
// ============================================================================

/**
 * Page metadata as Google sees it.
 */
export interface GooglePageMetadata {
  /** Page title from <title> element */
  title: string | null
  /** Meta description from <meta name="description"> */
  description: string | null
  /** Canonical URL from <link rel="canonical"> */
  canonical: string | null
  /** Language from <html lang="..."> */
  language: string | null
}

/**
 * A single JSON-LD schema object with type info.
 */
export interface GoogleSchemaItem {
  /** The @type value */
  type: string
  /** The full schema data */
  data: Record<string, unknown>
}

/**
 * Result for the `google` command.
 * Shows what Googlebot sees when crawling a page.
 */
export interface GoogleResult {
  /** Target URL or file path */
  target: string
  /** Page metadata */
  metadata: GooglePageMetadata
  /** Google-recognized JSON-LD schemas found */
  schemas: GoogleSchemaItem[]
  /** Heading structure (same as structure command) */
  headings: HeadingAnalysis
  /** Summary counts */
  counts: {
    /** Number of JSON-LD schemas found (Google-recognized only) */
    schemas: number
    /** Total headings */
    headings: number
  }
}

// ============================================================================
// Command Options
// ============================================================================

/**
 * Options for the google command.
 */
export interface GoogleOptions {
  /** Output format */
  format?: string
  /** Plain text mode (no spinners) */
  plain?: boolean
  /** CI mode */
  ci?: boolean
}
