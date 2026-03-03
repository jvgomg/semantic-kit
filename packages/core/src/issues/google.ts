/**
 * Google command issue generation.
 */
import type { GoogleResult } from '../results.js'
import type { Issue } from '../types.js'

// ============================================================================
// Issue Codes
// ============================================================================

export const GOOGLE_CODES = {
  MISSING_TITLE: 'google-missing-title',
  MISSING_DESCRIPTION: 'google-missing-description',
  MISSING_CANONICAL: 'google-missing-canonical',
  NO_SCHEMAS: 'google-no-schemas',
} as const

export type GoogleCode = (typeof GOOGLE_CODES)[keyof typeof GOOGLE_CODES]

// ============================================================================
// Input Types
// ============================================================================

export interface GoogleIssueInput {
  result: GoogleResult
}

// ============================================================================
// Issue Builder
// ============================================================================

/**
 * Build issues for the Google lens.
 * Issues are warnings about SEO/structured data problems.
 */
export function buildGoogleIssues(input: GoogleIssueInput): Issue[] {
  const { result } = input
  const issues: Issue[] = []

  // Missing page title
  if (!result.metadata.title) {
    issues.push({
      type: 'warning',
      severity: 'high',
      code: GOOGLE_CODES.MISSING_TITLE,
      title: 'Missing Page Title',
      description: 'The page does not have a <title> element.',
      tip: 'Add a descriptive <title> element for better search visibility.',
    })
  }

  // Missing meta description
  if (!result.metadata.description) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      code: GOOGLE_CODES.MISSING_DESCRIPTION,
      title: 'Missing Meta Description',
      description: 'The page does not have a <meta name="description"> tag.',
      tip: 'Add a meta description to control how your page appears in search results.',
    })
  }

  // Missing canonical URL
  if (!result.metadata.canonical) {
    issues.push({
      type: 'info',
      severity: 'low',
      code: GOOGLE_CODES.MISSING_CANONICAL,
      title: 'No Canonical URL',
      description: 'The page does not have a <link rel="canonical"> tag.',
      tip: 'Consider adding a canonical URL to prevent duplicate content issues.',
    })
  }

  // No structured data
  if (result.schemas.length === 0) {
    issues.push({
      type: 'info',
      severity: 'low',
      code: GOOGLE_CODES.NO_SCHEMAS,
      title: 'No Google-Recognized Structured Data',
      description:
        'No JSON-LD schemas found that Google uses for rich results.',
      tip: 'Add structured data (Article, Product, FAQ, etc.) to enable rich results.',
    })
  }

  return issues
}
