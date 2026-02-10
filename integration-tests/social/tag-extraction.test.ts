/**
 * Integration tests for tag extraction in the `social` command
 *
 * Tests that Open Graph and Twitter Card tags are correctly extracted from HTML.
 */

import { describe, it, expect } from 'bun:test'
import { runSocial } from '../utils/cli.js'
import { getBaseUrl } from '../utils/server.js'

describe('social command - tag extraction', () => {
  describe('complete social tags', () => {
    it('extracts all Open Graph tags', async () => {
      const { data, exitCode } = await runSocial(
        `${getBaseUrl()}/good/social-complete.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()

      // Open Graph should be present and complete
      expect(data!.openGraph).not.toBeNull()
      expect(data!.openGraph!.isComplete).toBe(true)
      expect(data!.openGraph!.missingRequired).toHaveLength(0)

      // Check specific OG tags
      expect(data!.openGraph!.tags['og:title']).toBe(
        'Complete Social Tags Example',
      )
      expect(data!.openGraph!.tags['og:type']).toBe('article')
      expect(data!.openGraph!.tags['og:image']).toBe(
        'http://localhost:4000/images/social-preview.png',
      )
      expect(data!.openGraph!.tags['og:url']).toBe(
        'http://localhost:4000/good/social-complete.html',
      )
      expect(data!.openGraph!.tags['og:site_name']).toBe('Semantic Kit')
    })

    it('extracts all Twitter Card tags', async () => {
      const { data, exitCode } = await runSocial(
        `${getBaseUrl()}/good/social-complete.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()

      // Twitter should be present and complete
      expect(data!.twitter).not.toBeNull()
      expect(data!.twitter!.isComplete).toBe(true)
      expect(data!.twitter!.missingRequired).toHaveLength(0)

      // Check specific Twitter tags
      expect(data!.twitter!.tags['twitter:card']).toBe('summary_large_image')
      expect(data!.twitter!.tags['twitter:title']).toBe(
        'Complete Social Tags Example',
      )
      expect(data!.twitter!.tags['twitter:site']).toBe('@semantickit')
      expect(data!.twitter!.tags['twitter:creator']).toBe('@example')
    })

    it('reports 100% completeness for complete tags', async () => {
      const { data, exitCode } = await runSocial(
        `${getBaseUrl()}/good/social-complete.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()

      expect(data!.completeness.openGraph).toBe(100)
      expect(data!.completeness.twitter).toBe(100)
    })
  })

  describe('partial social tags', () => {
    it('extracts OG tags and reports missing recommended', async () => {
      const { data, exitCode } = await runSocial(
        `${getBaseUrl()}/good/semantic-article.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()

      // Open Graph present - og:image is recommended, not required
      expect(data!.openGraph).not.toBeNull()
      expect(data!.openGraph!.isComplete).toBe(true)
      expect(data!.openGraph!.missingRecommended).toContain('og:image')
    })

    it('handles missing Twitter tags gracefully', async () => {
      const { data, exitCode } = await runSocial(
        `${getBaseUrl()}/good/semantic-article.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()

      // No Twitter tags
      expect(data!.twitter).toBeNull()
      expect(data!.completeness.twitter).toBeNull()
    })
  })

  describe('no social tags', () => {
    it('handles pages with no social tags', async () => {
      const { data, exitCode } = await runSocial(
        `${getBaseUrl()}/bad/div-soup.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()

      expect(data!.openGraph).toBeNull()
      expect(data!.twitter).toBeNull()
      expect(data!.counts.total).toBe(0)
    })
  })

  describe('preview data', () => {
    it('builds preview from social tags', async () => {
      const { data, exitCode } = await runSocial(
        `${getBaseUrl()}/good/social-complete.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()

      expect(data!.preview.title).toBe('Complete Social Tags Example')
      expect(data!.preview.description).toBe(
        'A page demonstrating complete Open Graph and Twitter Card implementations.',
      )
      expect(data!.preview.image).toBe(
        'http://localhost:4000/images/social-preview.png',
      )
      expect(data!.preview.siteName).toBe('Semantic Kit')
    })

    it('falls back to page metadata when social tags missing', async () => {
      const { data, exitCode } = await runSocial(
        `${getBaseUrl()}/bad/div-soup.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()

      // Should use page title/description fallbacks
      // These may be null if page has no metadata either
      expect(data!.preview).toBeDefined()
    })
  })

  describe('tag counts', () => {
    it('counts tags correctly', async () => {
      const { data, exitCode } = await runSocial(
        `${getBaseUrl()}/good/social-complete.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()

      // 7 OG tags + 6 Twitter tags = 13 total
      expect(data!.counts.openGraph).toBe(7)
      expect(data!.counts.twitter).toBe(6)
      expect(data!.counts.total).toBe(13)
    })
  })

  describe('image metadata', () => {
    it('reports missing image dimensions and alt when og:image present', async () => {
      const { data, exitCode } = await runSocial(
        `${getBaseUrl()}/good/social-complete.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()

      // Has og:image but missing dimensions and alt
      expect(data!.openGraph!.tags['og:image']).toBeDefined()
      expect(data!.openGraph!.missingImageTags).toContain('og:image:width')
      expect(data!.openGraph!.missingImageTags).toContain('og:image:height')
      expect(data!.openGraph!.missingImageTags).toContain('og:image:alt')
    })

    it('does not report image metadata when no og:image', async () => {
      const { data, exitCode } = await runSocial(
        `${getBaseUrl()}/good/semantic-article.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()

      // No og:image, so no missing image tags
      expect(data!.openGraph!.tags['og:image']).toBeUndefined()
      expect(data!.openGraph!.missingImageTags).toBeUndefined()
    })
  })
})
