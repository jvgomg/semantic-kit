/**
 * Unit tests for social metadata validation rules.
 *
 * These tests document the validation behavior based on platform research.
 *
 * @see research/topics/social-metadata/open-graph-validation.md
 */

import { describe, it, expect } from 'bun:test'
import {
  TITLE_CHAR_LIMIT,
  DESCRIPTION_CHAR_LIMIT,
  isAbsoluteUrl,
  validateOgUrl,
  validateOgTitleLength,
  validateOgDescriptionLength,
  validateImageDimensions,
  validateImageAltText,
  validateTwitterCard,
  validateSocialTags,
  sortIssuesBySeverity,
} from './validation.js'

describe('validation constants', () => {
  it('TITLE_CHAR_LIMIT is 60 characters', () => {
    expect(TITLE_CHAR_LIMIT).toBe(60)
  })

  it('DESCRIPTION_CHAR_LIMIT is 155 characters', () => {
    expect(DESCRIPTION_CHAR_LIMIT).toBe(155)
  })
})

describe('isAbsoluteUrl', () => {
  it('returns true for https:// URLs', () => {
    expect(isAbsoluteUrl('https://example.com/page')).toBe(true)
  })

  it('returns true for http:// URLs', () => {
    expect(isAbsoluteUrl('http://example.com/page')).toBe(true)
  })

  it('returns false for relative URLs', () => {
    expect(isAbsoluteUrl('/page')).toBe(false)
  })

  it('returns false for protocol-relative URLs', () => {
    expect(isAbsoluteUrl('//example.com/page')).toBe(false)
  })

  it('returns false for URLs without protocol', () => {
    expect(isAbsoluteUrl('example.com/page')).toBe(false)
  })
})

describe('validateOgUrl', () => {
  it('returns null when og:url is undefined', () => {
    expect(validateOgUrl(undefined)).toBeNull()
  })

  it('returns null for valid absolute https URL', () => {
    expect(validateOgUrl('https://example.com/page')).toBeNull()
  })

  it('returns null for valid absolute http URL', () => {
    expect(validateOgUrl('http://example.com/page')).toBeNull()
  })

  it('returns error for relative URL', () => {
    const issue = validateOgUrl('/page')
    expect(issue).not.toBeNull()
    expect(issue!.severity).toBe('error')
    expect(issue!.code).toBe('og-url-not-absolute')
    expect(issue!.tag).toBe('og:url')
    expect(issue!.value).toBe('/page')
  })

  it('returns error for URL without protocol', () => {
    const issue = validateOgUrl('example.com/page')
    expect(issue).not.toBeNull()
    expect(issue!.severity).toBe('error')
  })

  it('returns error for protocol-relative URL', () => {
    const issue = validateOgUrl('//example.com/page')
    expect(issue).not.toBeNull()
    expect(issue!.severity).toBe('error')
  })
})

describe('validateOgTitleLength', () => {
  it('returns null when og:title is undefined', () => {
    expect(validateOgTitleLength(undefined)).toBeNull()
  })

  it('returns null for title at exactly 60 characters', () => {
    const title = 'a'.repeat(60)
    expect(validateOgTitleLength(title)).toBeNull()
  })

  it('returns null for title under 60 characters', () => {
    expect(validateOgTitleLength('Short title')).toBeNull()
  })

  it('returns warning for title over 60 characters', () => {
    const title = 'a'.repeat(61)
    const issue = validateOgTitleLength(title)
    expect(issue).not.toBeNull()
    expect(issue!.severity).toBe('warning')
    expect(issue!.code).toBe('og-title-too-long')
    expect(issue!.tag).toBe('og:title')
    expect(issue!.limit).toBe(60)
    expect(issue!.actual).toBe(61)
  })

  it('returns warning with correct actual length for long title', () => {
    const title = 'a'.repeat(100)
    const issue = validateOgTitleLength(title)
    expect(issue!.actual).toBe(100)
  })
})

describe('validateOgDescriptionLength', () => {
  it('returns null when og:description is undefined', () => {
    expect(validateOgDescriptionLength(undefined)).toBeNull()
  })

  it('returns null for description at exactly 155 characters', () => {
    const desc = 'a'.repeat(155)
    expect(validateOgDescriptionLength(desc)).toBeNull()
  })

  it('returns null for description under 155 characters', () => {
    expect(validateOgDescriptionLength('Short description')).toBeNull()
  })

  it('returns warning for description over 155 characters', () => {
    const desc = 'a'.repeat(156)
    const issue = validateOgDescriptionLength(desc)
    expect(issue).not.toBeNull()
    expect(issue!.severity).toBe('warning')
    expect(issue!.code).toBe('og-description-too-long')
    expect(issue!.tag).toBe('og:description')
    expect(issue!.limit).toBe(155)
    expect(issue!.actual).toBe(156)
  })
})

describe('validateImageDimensions', () => {
  it('returns null when og:image is undefined', () => {
    expect(validateImageDimensions(undefined, undefined, undefined)).toBeNull()
  })

  it('returns null when both dimensions are provided', () => {
    expect(
      validateImageDimensions('https://example.com/img.jpg', '1200', '630'),
    ).toBeNull()
  })

  it('returns warning when width is missing', () => {
    const issue = validateImageDimensions(
      'https://example.com/img.jpg',
      undefined,
      '630',
    )
    expect(issue).not.toBeNull()
    expect(issue!.severity).toBe('warning')
    expect(issue!.code).toBe('og-image-dimensions-missing')
    expect(issue!.message).toContain('og:image:width')
    expect(issue!.message).not.toContain('og:image:height')
  })

  it('returns warning when height is missing', () => {
    const issue = validateImageDimensions(
      'https://example.com/img.jpg',
      '1200',
      undefined,
    )
    expect(issue).not.toBeNull()
    expect(issue!.severity).toBe('warning')
    expect(issue!.message).toContain('og:image:height')
    expect(issue!.message).not.toContain('og:image:width')
  })

  it('returns warning mentioning both when both dimensions missing', () => {
    const issue = validateImageDimensions(
      'https://example.com/img.jpg',
      undefined,
      undefined,
    )
    expect(issue).not.toBeNull()
    expect(issue!.severity).toBe('warning')
    expect(issue!.message).toContain('og:image:width')
    expect(issue!.message).toContain('og:image:height')
  })
})

describe('validateImageAltText', () => {
  it('returns null when no images are present', () => {
    expect(
      validateImageAltText(undefined, undefined, undefined, undefined),
    ).toBeNull()
  })

  it('returns null when og:image has og:image:alt', () => {
    expect(
      validateImageAltText(
        'https://example.com/og.jpg',
        undefined,
        'Alt text',
        undefined,
      ),
    ).toBeNull()
  })

  it('returns null when twitter:image has twitter:image:alt', () => {
    expect(
      validateImageAltText(
        undefined,
        'https://example.com/twitter.jpg',
        undefined,
        'Alt text',
      ),
    ).toBeNull()
  })

  it('returns null when both images have alt text', () => {
    expect(
      validateImageAltText(
        'https://example.com/og.jpg',
        'https://example.com/twitter.jpg',
        'OG alt',
        'Twitter alt',
      ),
    ).toBeNull()
  })

  it('returns info when og:image missing og:image:alt', () => {
    const issue = validateImageAltText(
      'https://example.com/og.jpg',
      undefined,
      undefined,
      undefined,
    )
    expect(issue).not.toBeNull()
    expect(issue!.severity).toBe('info')
    expect(issue!.code).toBe('image-alt-missing')
    expect(issue!.message).toContain('og:image:alt')
  })

  it('returns info when twitter:image missing twitter:image:alt', () => {
    const issue = validateImageAltText(
      undefined,
      'https://example.com/twitter.jpg',
      undefined,
      undefined,
    )
    expect(issue).not.toBeNull()
    expect(issue!.severity).toBe('info')
    expect(issue!.message).toContain('twitter:image:alt')
  })

  it('returns info mentioning both when both alt texts missing', () => {
    const issue = validateImageAltText(
      'https://example.com/og.jpg',
      'https://example.com/twitter.jpg',
      undefined,
      undefined,
    )
    expect(issue).not.toBeNull()
    expect(issue!.severity).toBe('info')
    expect(issue!.message).toContain('og:image:alt')
    expect(issue!.message).toContain('twitter:image:alt')
  })
})

describe('validateTwitterCard', () => {
  it('returns info when twitter:card is missing', () => {
    const issue = validateTwitterCard(undefined)
    expect(issue).not.toBeNull()
    expect(issue!.severity).toBe('info')
    expect(issue!.code).toBe('twitter-card-missing')
    expect(issue!.tag).toBe('twitter:card')
  })

  it('returns null when twitter:card is present', () => {
    expect(validateTwitterCard('summary_large_image')).toBeNull()
  })

  it('returns null for any twitter:card value', () => {
    expect(validateTwitterCard('summary')).toBeNull()
    expect(validateTwitterCard('player')).toBeNull()
    expect(validateTwitterCard('app')).toBeNull()
  })
})

describe('validateSocialTags', () => {
  it('returns empty array for valid tags', () => {
    const issues = validateSocialTags({
      'og:url': 'https://example.com',
      'og:title': 'Valid Title',
      'og:description': 'Valid description',
      'og:image': 'https://example.com/img.jpg',
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:image:alt': 'Image description',
      'twitter:card': 'summary_large_image',
      'twitter:image': 'https://example.com/img.jpg',
      'twitter:image:alt': 'Image description',
    })
    expect(issues).toHaveLength(0)
  })

  it('returns multiple issues for multiple problems', () => {
    const issues = validateSocialTags({
      'og:url': '/relative', // error
      'og:title': 'a'.repeat(70), // warning
      'og:image': 'https://example.com/img.jpg', // missing dimensions = warning
      // missing twitter:card = info
      // missing alt text = info
    })
    expect(issues.length).toBeGreaterThanOrEqual(4)
  })

  it('returns no issues for empty input', () => {
    const issues = validateSocialTags({})
    // Only twitter:card missing would be reported
    expect(issues).toHaveLength(1)
    expect(issues[0].code).toBe('twitter-card-missing')
  })
})

describe('sortIssuesBySeverity', () => {
  it('sorts errors before warnings before info', () => {
    const issues = [
      { code: 'info-1', severity: 'info' as const, message: '', tag: '' },
      { code: 'error-1', severity: 'error' as const, message: '', tag: '' },
      { code: 'warning-1', severity: 'warning' as const, message: '', tag: '' },
      { code: 'info-2', severity: 'info' as const, message: '', tag: '' },
      { code: 'error-2', severity: 'error' as const, message: '', tag: '' },
    ]

    const sorted = sortIssuesBySeverity(issues)

    expect(sorted[0].severity).toBe('error')
    expect(sorted[1].severity).toBe('error')
    expect(sorted[2].severity).toBe('warning')
    expect(sorted[3].severity).toBe('info')
    expect(sorted[4].severity).toBe('info')
  })

  it('does not mutate original array', () => {
    const issues = [
      { code: 'info-1', severity: 'info' as const, message: '', tag: '' },
      { code: 'error-1', severity: 'error' as const, message: '', tag: '' },
    ]

    sortIssuesBySeverity(issues)

    expect(issues[0].code).toBe('info-1')
    expect(issues[1].code).toBe('error-1')
  })
})
