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

      // Open Graph should be present
      expect(data!.openGraph).not.toBeNull()

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

      // Twitter should be present
      expect(data!.twitter).not.toBeNull()

      // Check specific Twitter tags
      expect(data!.twitter!.tags['twitter:card']).toBe('summary_large_image')
      expect(data!.twitter!.tags['twitter:title']).toBe(
        'Complete Social Tags Example',
      )
      expect(data!.twitter!.tags['twitter:site']).toBe('@semantickit')
      expect(data!.twitter!.tags['twitter:creator']).toBe('@example')
    })
  })

  describe('partial social tags', () => {
    it('extracts OG tags from semantic-article', async () => {
      const { data, exitCode } = await runSocial(
        `${getBaseUrl()}/good/semantic-article.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()

      // Open Graph present
      expect(data!.openGraph).not.toBeNull()
    })

    it('handles missing Twitter tags gracefully', async () => {
      const { data, exitCode } = await runSocial(
        `${getBaseUrl()}/good/semantic-article.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()

      // No Twitter tags
      expect(data!.twitter).toBeNull()
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

  describe('issues array', () => {
    it('returns issues array in result', async () => {
      const { data, exitCode } = await runSocial(
        `${getBaseUrl()}/good/social-complete.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(Array.isArray(data!.issues)).toBe(true)
    })
  })
})
