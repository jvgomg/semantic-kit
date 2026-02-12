/**
 * Social metadata validation with tiered severity levels.
 *
 * Validation rules based on platform research:
 * - error: Breaks functionality (invalid URL format)
 * - warning: Affects quality (truncation, missing dimensions)
 * - info: Best practice (missing alt text, no twitter:card)
 *
 * @see research/topics/social-metadata/open-graph-validation.md
 */

import type { SocialValidationIssue, ValidationSeverity } from './types.js'

// ============================================================================
// Constants (from research)
// ============================================================================

/**
 * Safe character limit for og:title to avoid truncation on most platforms.
 * Facebook truncates at 88 chars, LinkedIn at 119, Twitter at ~70.
 */
export const TITLE_CHAR_LIMIT = 60

/**
 * Safe character limit for og:description to avoid truncation.
 * Facebook shows 55-60 chars/line, LinkedIn shows 69 chars.
 */
export const DESCRIPTION_CHAR_LIMIT = 155

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Check if a URL is absolute (has protocol).
 */
export function isAbsoluteUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://')
}

/**
 * Validate og:url is absolute.
 * Per OGP spec, og:url must be a fully qualified URL with protocol.
 */
export function validateOgUrl(
  ogUrl: string | undefined,
): SocialValidationIssue | null {
  if (!ogUrl) return null

  if (!isAbsoluteUrl(ogUrl)) {
    return {
      code: 'og-url-not-absolute',
      severity: 'error',
      message:
        'og:url must be an absolute URL with http:// or https:// protocol',
      tag: 'og:url',
      value: ogUrl,
    }
  }

  return null
}

/**
 * Validate og:title character length.
 * Titles over 60 characters will truncate on most platforms.
 */
export function validateOgTitleLength(
  ogTitle: string | undefined,
): SocialValidationIssue | null {
  if (!ogTitle) return null

  if (ogTitle.length > TITLE_CHAR_LIMIT) {
    return {
      code: 'og-title-too-long',
      severity: 'warning',
      message: `og:title exceeds ${TITLE_CHAR_LIMIT} characters and will be truncated on most platforms`,
      tag: 'og:title',
      value: ogTitle,
      limit: TITLE_CHAR_LIMIT,
      actual: ogTitle.length,
    }
  }

  return null
}

/**
 * Validate og:description character length.
 * Descriptions over 155 characters will truncate on most platforms.
 */
export function validateOgDescriptionLength(
  ogDescription: string | undefined,
): SocialValidationIssue | null {
  if (!ogDescription) return null

  if (ogDescription.length > DESCRIPTION_CHAR_LIMIT) {
    return {
      code: 'og-description-too-long',
      severity: 'warning',
      message: `og:description exceeds ${DESCRIPTION_CHAR_LIMIT} characters and may be truncated`,
      tag: 'og:description',
      value: ogDescription,
      limit: DESCRIPTION_CHAR_LIMIT,
      actual: ogDescription.length,
    }
  }

  return null
}

/**
 * Validate image dimensions are provided when og:image is present.
 * Missing dimensions delay first-share rendering as platforms must fetch the image.
 */
export function validateImageDimensions(
  ogImage: string | undefined,
  ogImageWidth: string | undefined,
  ogImageHeight: string | undefined,
): SocialValidationIssue | null {
  if (!ogImage) return null

  const missingWidth = !ogImageWidth
  const missingHeight = !ogImageHeight

  if (missingWidth || missingHeight) {
    const missing = []
    if (missingWidth) missing.push('og:image:width')
    if (missingHeight) missing.push('og:image:height')

    return {
      code: 'og-image-dimensions-missing',
      severity: 'warning',
      message: `Missing ${missing.join(' and ')} - platforms must fetch image to determine size, delaying first-share rendering`,
      tag: 'og:image',
    }
  }

  return null
}

/**
 * Validate image alt text is provided.
 * Twitter uses twitter:image:alt for accessibility; Facebook ignores og:image:alt.
 */
export function validateImageAltText(
  ogImage: string | undefined,
  twitterImage: string | undefined,
  ogImageAlt: string | undefined,
  twitterImageAlt: string | undefined,
): SocialValidationIssue | null {
  // Only check if there's an image to describe
  if (!ogImage && !twitterImage) return null

  const missingOgAlt = ogImage && !ogImageAlt
  const missingTwitterAlt = twitterImage && !twitterImageAlt

  if (missingOgAlt || missingTwitterAlt) {
    const missing = []
    if (missingOgAlt) missing.push('og:image:alt')
    if (missingTwitterAlt) missing.push('twitter:image:alt')

    return {
      code: 'image-alt-missing',
      severity: 'info',
      message: `Missing ${missing.join(' and ')} - Twitter uses alt text for accessibility`,
      tag: missing[0],
    }
  }

  return null
}

/**
 * Check if twitter:card is missing.
 * Without twitter:card, Twitter shows plain text with no preview card.
 */
export function validateTwitterCard(
  twitterCard: string | undefined,
): SocialValidationIssue | null {
  if (!twitterCard) {
    return {
      code: 'twitter-card-missing',
      severity: 'info',
      message:
        'twitter:card is missing - Twitter/X will show plain text without a preview card',
      tag: 'twitter:card',
    }
  }

  return null
}

// ============================================================================
// Main Validation Function
// ============================================================================

/**
 * Input for validation - all relevant social tags.
 */
export interface ValidationInput {
  'og:url'?: string
  'og:title'?: string
  'og:description'?: string
  'og:image'?: string
  'og:image:width'?: string
  'og:image:height'?: string
  'og:image:alt'?: string
  'twitter:card'?: string
  'twitter:image'?: string
  'twitter:image:alt'?: string
}

/**
 * Run all validation rules and return issues.
 */
export function validateSocialTags(
  input: ValidationInput,
): SocialValidationIssue[] {
  const issues: SocialValidationIssue[] = []

  // Error-level validations
  const ogUrlIssue = validateOgUrl(input['og:url'])
  if (ogUrlIssue) issues.push(ogUrlIssue)

  // Warning-level validations
  const titleIssue = validateOgTitleLength(input['og:title'])
  if (titleIssue) issues.push(titleIssue)

  const descriptionIssue = validateOgDescriptionLength(input['og:description'])
  if (descriptionIssue) issues.push(descriptionIssue)

  const dimensionsIssue = validateImageDimensions(
    input['og:image'],
    input['og:image:width'],
    input['og:image:height'],
  )
  if (dimensionsIssue) issues.push(dimensionsIssue)

  // Info-level validations
  const twitterCardIssue = validateTwitterCard(input['twitter:card'])
  if (twitterCardIssue) issues.push(twitterCardIssue)

  const altTextIssue = validateImageAltText(
    input['og:image'],
    input['twitter:image'],
    input['og:image:alt'],
    input['twitter:image:alt'],
  )
  if (altTextIssue) issues.push(altTextIssue)

  return issues
}

/**
 * Sort issues by severity (errors first, then warnings, then info).
 */
export function sortIssuesBySeverity(
  issues: SocialValidationIssue[],
): SocialValidationIssue[] {
  const severityOrder: Record<ValidationSeverity, number> = {
    error: 0,
    warning: 1,
    info: 2,
  }

  return [...issues].sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity],
  )
}
