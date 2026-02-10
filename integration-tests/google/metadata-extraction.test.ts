/**
 * Integration tests for metadata extraction in the `google` command
 *
 * Tests that page metadata (title, description, canonical, language)
 * is correctly extracted from HTML.
 */

import { describe, it, expect } from 'bun:test'
import { runGoogle } from '../utils/cli.js'
import { getBaseUrl } from '../utils/server.js'

describe('google command - metadata extraction', () => {
  describe('page metadata', () => {
    it('extracts title, description, canonical, and language', async () => {
      const { data, exitCode } = await runGoogle(
        `${getBaseUrl()}/good/semantic-article.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()

      // Title from <title> element
      expect(data!.metadata.title).toBe('Understanding Semantic HTML - My Blog')

      // Description from <meta name="description">
      expect(data!.metadata.description).toContain(
        'A comprehensive guide to semantic HTML',
      )

      // Canonical from <link rel="canonical">
      expect(data!.metadata.canonical).toBe(
        'http://localhost:4000/good/semantic-article.html',
      )

      // Language from <html lang="...">
      expect(data!.metadata.language).toBe('en')
    })

    it('handles missing metadata gracefully', async () => {
      const { data, exitCode } = await runGoogle(
        `${getBaseUrl()}/bad/div-soup.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()

      // Should handle missing elements without error
      // The page may or may not have these - just verify we get a result
      expect(data!.metadata).toBeDefined()
    })
  })

  describe('heading structure', () => {
    it('extracts heading outline with content stats', async () => {
      const { data, exitCode } = await runGoogle(
        `${getBaseUrl()}/good/semantic-article.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()

      // Should find headings
      expect(data!.counts.headings).toBeGreaterThan(0)
      expect(data!.headings.outline.length).toBeGreaterThan(0)

      // First heading should be h1
      const firstHeading = data!.headings.outline[0]
      expect(firstHeading.level).toBe(1)
      expect(firstHeading.text).toBe('Understanding Semantic HTML')
    })

    it('handles pages with no headings', async () => {
      const { data, exitCode } = await runGoogle(
        `${getBaseUrl()}/edge-cases/empty-content.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()

      expect(data!.counts.headings).toBe(0)
      expect(data!.headings.outline.length).toBe(0)
    })
  })
})
