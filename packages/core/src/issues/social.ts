/**
 * Social command issue generation.
 */
import type { SocialResult } from '../results.js'
import type { AnyIssue } from '../types.js'

// ============================================================================
// Issue Codes
// ============================================================================

export const SOCIAL_CODES = {
  NO_SOCIAL_TAGS: 'social-no-tags',
  NO_OPEN_GRAPH: 'social-no-og',
  NO_PREVIEW_IMAGE: 'social-no-image',
} as const

export type SocialCode = (typeof SOCIAL_CODES)[keyof typeof SOCIAL_CODES]

// ============================================================================
// Input Types
// ============================================================================

export interface SocialIssueInput {
  result: SocialResult
}

// ============================================================================
// Issue Builder
// ============================================================================

/**
 * Build CLI issues from social result.
 *
 * SocialValidationIssue extends Issue, so validation issues can be used directly.
 */
export function buildSocialIssues(input: SocialIssueInput): AnyIssue[] {
  const { result } = input
  const issues: AnyIssue[] = []

  // No social tags at all
  if (!result.openGraph && !result.twitter) {
    issues.push({
      type: 'warning',
      severity: 'high',
      code: SOCIAL_CODES.NO_SOCIAL_TAGS,
      title: 'No Social Meta Tags',
      description: 'The page has no Open Graph or Twitter Card tags.',
      tip: 'Add og:title, og:description, and og:image tags for better link previews.',
    })
    return issues
  }

  // Include validation issues directly (they extend Issue)
  issues.push(...result.issues)

  // No Open Graph tags
  if (!result.openGraph) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      code: SOCIAL_CODES.NO_OPEN_GRAPH,
      title: 'No Open Graph Tags',
      description:
        'The page has no Open Graph tags. Facebook, LinkedIn, WhatsApp, and other platforms will use fallbacks.',
      tip: 'Add og:title, og:description, og:image, og:url, and og:type tags.',
    })
  }

  // No preview image
  if (!result.preview.image) {
    issues.push({
      type: 'info',
      severity: 'low',
      code: SOCIAL_CODES.NO_PREVIEW_IMAGE,
      title: 'No Preview Image',
      description:
        'No og:image or twitter:image found. Link previews will appear without an image.',
      tip: 'Add an og:image tag with a 1200x630px image for best results.',
    })
  }

  return issues
}
