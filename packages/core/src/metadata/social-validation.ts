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

import {
  type SocialValidationIssue,
  type ValidationSeverity,
  OPEN_GRAPH_REQUIREMENTS,
  TWITTER_CARD_REQUIREMENTS,
  severityToIssue,
} from './types.js'

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
// Validation Options
// ============================================================================

/**
 * Options for configuring validation behavior.
 */
export interface ValidationOptions {
  /** Check for missing required/recommended tags (default: false) */
  checkPresence?: boolean
  /** Check for quality issues like URL format, length, dimensions (default: true) */
  checkQuality?: boolean
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if a URL is absolute (has protocol).
 */
export function isAbsoluteUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://')
}

/**
 * Create a SocialValidationIssue with proper Issue fields populated.
 */
function createIssue(
  code: string,
  severity: ValidationSeverity,
  tag: string,
  message: string,
  tip: string,
  extra?: { value?: string; limit?: number; actual?: number },
): SocialValidationIssue {
  const { type, severity: issueSeverity } = severityToIssue(severity)
  return {
    type,
    severity: issueSeverity,
    title: formatIssueTitle(code),
    description: message,
    tip,
    code,
    tag,
    ...extra,
  }
}

/**
 * Format issue code as a readable title.
 */
function formatIssueTitle(code: string): string {
  const titles: Record<string, string> = {
    // Quality issues
    'og-url-not-absolute': 'Invalid og:url Format',
    'og-title-too-long': 'og:title Too Long',
    'og-description-too-long': 'og:description Too Long',
    'og-image-dimensions-missing': 'Missing Image Dimensions',
    'twitter-card-missing': 'No Twitter Card',
    'image-alt-missing': 'Missing Image Alt Text',
    // Presence issues - Open Graph required
    'og-title-missing': 'Missing og:title',
    'og-type-missing': 'Missing og:type',
    'og-image-missing': 'Missing og:image',
    'og-url-missing': 'Missing og:url',
    // Presence issues - Open Graph recommended
    'og-description-missing': 'Missing og:description',
    'og-site-name-missing': 'Missing og:site_name',
    'og-locale-missing': 'Missing og:locale',
    // Presence issues - Twitter recommended
    'twitter-title-missing': 'Missing twitter:title',
    'twitter-description-missing': 'Missing twitter:description',
    'twitter-image-missing': 'Missing twitter:image',
  }
  return titles[code] || code
}

/**
 * Get actionable tip for an issue.
 */
function getIssueTip(code: string, actual?: number): string {
  const tips: Record<string, string> = {
    // Quality issues
    'og-url-not-absolute':
      'Use a full URL starting with https:// (e.g., https://example.com/page)',
    'og-title-too-long': `Keep og:title under 60 characters to avoid truncation. Current: ${actual} chars.`,
    'og-description-too-long': `Keep og:description under 155 characters. Current: ${actual} chars.`,
    'og-image-dimensions-missing':
      'Add og:image:width and og:image:height to speed up first-share rendering.',
    'twitter-card-missing':
      'Add twitter:card with value "summary" or "summary_large_image" for Twitter previews.',
    'image-alt-missing':
      'Add og:image:alt and/or twitter:image:alt for accessibility.',
    // Presence issues - Open Graph required
    'og-title-missing':
      'Add og:title for proper social sharing previews on Facebook and LinkedIn.',
    'og-type-missing':
      'Add og:type (e.g., "website", "article") for proper categorization.',
    'og-image-missing':
      'Add og:image with a 1200x630px image for rich link previews.',
    'og-url-missing': 'Add og:url with the canonical URL for this content.',
    // Presence issues - Open Graph recommended
    'og-description-missing':
      'Add og:description to provide context in social shares.',
    'og-site-name-missing':
      'Add og:site_name to show your brand in social previews.',
    'og-locale-missing':
      'Add og:locale to specify content language (e.g., "en_US").',
    // Presence issues - Twitter recommended
    'twitter-title-missing':
      'Add twitter:title or twitter:card will fall back to og:title.',
    'twitter-description-missing':
      'Add twitter:description or twitter:card will fall back to og:description.',
    'twitter-image-missing':
      'Add twitter:image for a custom image on Twitter/X.',
  }
  return tips[code] || ''
}

// ============================================================================
// Quality Validation Functions
// ============================================================================

/**
 * Validate og:url is absolute.
 * Per OGP spec, og:url must be a fully qualified URL with protocol.
 */
export function validateOgUrl(
  ogUrl: string | undefined,
): SocialValidationIssue | null {
  if (!ogUrl) return null

  if (!isAbsoluteUrl(ogUrl)) {
    return createIssue(
      'og-url-not-absolute',
      'error',
      'og:url',
      'og:url must be an absolute URL with http:// or https:// protocol',
      getIssueTip('og-url-not-absolute'),
      { value: ogUrl },
    )
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
    return createIssue(
      'og-title-too-long',
      'warning',
      'og:title',
      `og:title exceeds ${TITLE_CHAR_LIMIT} characters and will be truncated on most platforms`,
      getIssueTip('og-title-too-long', ogTitle.length),
      { value: ogTitle, limit: TITLE_CHAR_LIMIT, actual: ogTitle.length },
    )
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
    return createIssue(
      'og-description-too-long',
      'warning',
      'og:description',
      `og:description exceeds ${DESCRIPTION_CHAR_LIMIT} characters and may be truncated`,
      getIssueTip('og-description-too-long', ogDescription.length),
      {
        value: ogDescription,
        limit: DESCRIPTION_CHAR_LIMIT,
        actual: ogDescription.length,
      },
    )
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

    return createIssue(
      'og-image-dimensions-missing',
      'warning',
      'og:image',
      `Missing ${missing.join(' and ')} - platforms must fetch image to determine size, delaying first-share rendering`,
      getIssueTip('og-image-dimensions-missing'),
    )
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

    return createIssue(
      'image-alt-missing',
      'info',
      missing[0],
      `Missing ${missing.join(' and ')} - Twitter uses alt text for accessibility`,
      getIssueTip('image-alt-missing'),
    )
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
    return createIssue(
      'twitter-card-missing',
      'info',
      'twitter:card',
      'twitter:card is missing - Twitter/X will show plain text without a preview card',
      getIssueTip('twitter-card-missing'),
    )
  }

  return null
}

// ============================================================================
// Presence Validation Functions
// ============================================================================

/**
 * Validate required Open Graph tags are present.
 */
function validateOgRequiredTags(
  tags: Record<string, string | undefined>,
): SocialValidationIssue[] {
  const issues: SocialValidationIssue[] = []

  for (const tag of OPEN_GRAPH_REQUIREMENTS.required) {
    if (!tags[tag]) {
      const code = `${tag.replace(':', '-')}-missing` as string
      issues.push(
        createIssue(
          code,
          'warning',
          tag,
          `Required Open Graph tag ${tag} is missing`,
          getIssueTip(code),
        ),
      )
    }
  }

  return issues
}

/**
 * Validate recommended Open Graph tags are present.
 */
function validateOgRecommendedTags(
  tags: Record<string, string | undefined>,
): SocialValidationIssue[] {
  const issues: SocialValidationIssue[] = []

  for (const tag of OPEN_GRAPH_REQUIREMENTS.recommended) {
    if (!tags[tag]) {
      const code = `${tag.replace(':', '-')}-missing` as string
      issues.push(
        createIssue(
          code,
          'info',
          tag,
          `Recommended Open Graph tag ${tag} is missing`,
          getIssueTip(code),
        ),
      )
    }
  }

  return issues
}

/**
 * Validate recommended Twitter Card tags are present.
 * Note: twitter:card is checked by validateTwitterCard (quality check).
 */
function validateTwitterRecommendedTags(
  tags: Record<string, string | undefined>,
): SocialValidationIssue[] {
  const issues: SocialValidationIssue[] = []

  for (const tag of TWITTER_CARD_REQUIREMENTS.recommended) {
    if (!tags[tag]) {
      const code = `${tag.replace(':', '-')}-missing` as string
      issues.push(
        createIssue(
          code,
          'info',
          tag,
          `Recommended Twitter Card tag ${tag} is missing`,
          getIssueTip(code),
        ),
      )
    }
  }

  return issues
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
  'og:type'?: string
  'og:description'?: string
  'og:image'?: string
  'og:image:width'?: string
  'og:image:height'?: string
  'og:image:alt'?: string
  'og:site_name'?: string
  'og:locale'?: string
  'twitter:card'?: string
  'twitter:title'?: string
  'twitter:description'?: string
  'twitter:image'?: string
  'twitter:image:alt'?: string
  [key: string]: string | undefined
}

/**
 * Run validation rules and return issues.
 *
 * @param input - Normalized metatags (single values, not arrays)
 * @param options - Validation options (defaults to quality checks only)
 */
export function validateSocialTags(
  input: ValidationInput,
  options: ValidationOptions = {},
): SocialValidationIssue[] {
  const { checkPresence = false, checkQuality = true } = options
  const issues: SocialValidationIssue[] = []

  // Quality validations (enabled by default)
  if (checkQuality) {
    // Error-level validations
    const ogUrlIssue = validateOgUrl(input['og:url'])
    if (ogUrlIssue) issues.push(ogUrlIssue)

    // Warning-level validations
    const titleIssue = validateOgTitleLength(input['og:title'])
    if (titleIssue) issues.push(titleIssue)

    const descriptionIssue = validateOgDescriptionLength(
      input['og:description'],
    )
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
  }

  // Presence validations (disabled by default)
  if (checkPresence) {
    issues.push(...validateOgRequiredTags(input))
    issues.push(...validateOgRecommendedTags(input))
    issues.push(...validateTwitterRecommendedTags(input))
  }

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

  // Map Issue severity back to ValidationSeverity for sorting
  const issueToValidationSeverity: Record<string, ValidationSeverity> = {
    high: 'error',
    medium: 'warning',
    low: 'info',
  }

  return [...issues].sort((a, b) => {
    const aSeverity = issueToValidationSeverity[a.severity] || 'info'
    const bSeverity = issueToValidationSeverity[b.severity] || 'info'
    return severityOrder[aSeverity] - severityOrder[bSeverity]
  })
}
