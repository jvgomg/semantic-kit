/**
 * Unit tests for social preview fallback behavior.
 *
 * These tests document how platforms (Facebook, Twitter, WhatsApp, etc.)
 * resolve preview content when social meta tags are missing.
 *
 * @see research/topics/social-metadata/open-graph-validation.md
 */

import { describe, it, expect } from 'bun:test'
import { buildPreview, type PageMetadata, type SocialTags } from './preview.js'

const emptyTags: SocialTags = {
  openGraph: {},
  twitter: {},
}

const emptyPageMetadata: PageMetadata = {
  title: null,
  description: null,
  canonicalUrl: null,
}

describe('buildPreview', () => {
  describe('title fallback', () => {
    it('uses twitter:title when present', () => {
      const tags: SocialTags = {
        openGraph: { 'og:title': 'OG Title' },
        twitter: { 'twitter:title': 'Twitter Title' },
      }
      const result = buildPreview(
        tags,
        emptyPageMetadata,
        'https://example.com',
      )
      expect(result.title).toBe('Twitter Title')
    })

    it('falls back to og:title when twitter:title missing', () => {
      const tags: SocialTags = {
        openGraph: { 'og:title': 'OG Title' },
        twitter: {},
      }
      const result = buildPreview(
        tags,
        emptyPageMetadata,
        'https://example.com',
      )
      expect(result.title).toBe('OG Title')
    })

    it('falls back to <title> when both social tags missing', () => {
      const pageMetadata: PageMetadata = {
        title: 'Page Title',
        description: null,
        canonicalUrl: null,
      }
      const result = buildPreview(
        emptyTags,
        pageMetadata,
        'https://example.com',
      )
      expect(result.title).toBe('Page Title')
    })

    it('returns null when all title sources missing', () => {
      const result = buildPreview(
        emptyTags,
        emptyPageMetadata,
        'https://example.com',
      )
      expect(result.title).toBeNull()
    })
  })

  describe('description fallback', () => {
    it('uses twitter:description when present', () => {
      const tags: SocialTags = {
        openGraph: { 'og:description': 'OG Description' },
        twitter: { 'twitter:description': 'Twitter Description' },
      }
      const result = buildPreview(
        tags,
        emptyPageMetadata,
        'https://example.com',
      )
      expect(result.description).toBe('Twitter Description')
    })

    it('falls back to og:description when twitter:description missing', () => {
      const tags: SocialTags = {
        openGraph: { 'og:description': 'OG Description' },
        twitter: {},
      }
      const result = buildPreview(
        tags,
        emptyPageMetadata,
        'https://example.com',
      )
      expect(result.description).toBe('OG Description')
    })

    it('falls back to <meta name="description"> when both social tags missing', () => {
      const pageMetadata: PageMetadata = {
        title: null,
        description: 'Meta Description',
        canonicalUrl: null,
      }
      const result = buildPreview(
        emptyTags,
        pageMetadata,
        'https://example.com',
      )
      expect(result.description).toBe('Meta Description')
    })

    it('returns null when all description sources missing', () => {
      const result = buildPreview(
        emptyTags,
        emptyPageMetadata,
        'https://example.com',
      )
      expect(result.description).toBeNull()
    })
  })

  describe('image fallback', () => {
    it('uses twitter:image when present', () => {
      const tags: SocialTags = {
        openGraph: { 'og:image': 'https://example.com/og.jpg' },
        twitter: { 'twitter:image': 'https://example.com/twitter.jpg' },
      }
      const result = buildPreview(
        tags,
        emptyPageMetadata,
        'https://example.com',
      )
      expect(result.image).toBe('https://example.com/twitter.jpg')
    })

    it('falls back to og:image when twitter:image missing', () => {
      const tags: SocialTags = {
        openGraph: { 'og:image': 'https://example.com/og.jpg' },
        twitter: {},
      }
      const result = buildPreview(
        tags,
        emptyPageMetadata,
        'https://example.com',
      )
      expect(result.image).toBe('https://example.com/og.jpg')
    })

    it('returns null when both image tags missing (no content heuristics)', () => {
      const result = buildPreview(
        emptyTags,
        emptyPageMetadata,
        'https://example.com',
      )
      expect(result.image).toBeNull()
    })
  })

  describe('url fallback', () => {
    it('uses og:url when present', () => {
      const tags: SocialTags = {
        openGraph: { 'og:url': 'https://example.com/canonical' },
        twitter: {},
      }
      const pageMetadata: PageMetadata = {
        title: null,
        description: null,
        canonicalUrl: 'https://example.com/link-canonical',
      }
      const result = buildPreview(
        tags,
        pageMetadata,
        'https://example.com/actual',
      )
      expect(result.url).toBe('https://example.com/canonical')
    })

    it('falls back to <link rel="canonical"> when og:url missing', () => {
      const pageMetadata: PageMetadata = {
        title: null,
        description: null,
        canonicalUrl: 'https://example.com/link-canonical',
      }
      const result = buildPreview(
        emptyTags,
        pageMetadata,
        'https://example.com/actual',
      )
      expect(result.url).toBe('https://example.com/link-canonical')
    })

    it('falls back to target URL when both og:url and canonical missing', () => {
      const result = buildPreview(
        emptyTags,
        emptyPageMetadata,
        'https://example.com/actual',
      )
      expect(result.url).toBe('https://example.com/actual')
    })
  })

  describe('siteName', () => {
    it('uses og:site_name when present', () => {
      const tags: SocialTags = {
        openGraph: { 'og:site_name': 'Example Site' },
        twitter: {},
      }
      const result = buildPreview(
        tags,
        emptyPageMetadata,
        'https://example.com',
      )
      expect(result.siteName).toBe('Example Site')
    })

    it('returns null when og:site_name missing (no domain extraction)', () => {
      const result = buildPreview(
        emptyTags,
        emptyPageMetadata,
        'https://example.com',
      )
      expect(result.siteName).toBeNull()
    })
  })
})
