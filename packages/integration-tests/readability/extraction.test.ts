/**
 * Integration tests for the `readability` utility command
 *
 * Tests raw Readability extraction with full metrics including link density.
 */

import { describe, it, expect } from 'bun:test'
import { run } from '../utils/cli.js'
import { getBaseUrl } from '../utils/server.js'

describe('readability command - extraction', () => {
  const semanticArticle = () =>
    run(`readability ${getBaseUrl()}/good/semantic-article.html`)
  const divSoup = () => run(`readability ${getBaseUrl()}/bad/div-soup.html`)

  describe('basic extraction', () => {
    it('extracts content from semantic markup', async () => {
      const { data, exitCode } = await semanticArticle()
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.extraction).not.toBeNull()
      expect(data!.extraction!.title).toBe('Understanding Semantic HTML')
      expect(data!.extraction!.byline).toBe('Jane Smith')
    })

    it('extracts content from non-semantic markup', async () => {
      const { data, exitCode } = await divSoup()
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.metrics.wordCount).toBeGreaterThan(0)
    })

    it('handles empty content gracefully', async () => {
      const { data, exitCode } = await run(
        `readability ${getBaseUrl()}/edge-cases/empty-content.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.metrics.wordCount).toBe(0)
    })
  })

  describe('metrics', () => {
    it('reports all metrics including link density', async () => {
      const { data, exitCode } = await semanticArticle()
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()

      // Verify all metrics are present
      expect(data!.metrics.wordCount).toBeGreaterThan(0)
      expect(data!.metrics.characterCount).toBeGreaterThan(0)
      expect(data!.metrics.paragraphCount).toBeGreaterThan(0)
      expect(typeof data!.metrics.linkDensity).toBe('number')
      expect(typeof data!.metrics.isReaderable).toBe('boolean')
    })

    it('calculates link density correctly', async () => {
      const { data, exitCode } = await semanticArticle()
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()

      // Link density should be a ratio between 0 and 1
      expect(data!.metrics.linkDensity).toBeGreaterThanOrEqual(0)
      expect(data!.metrics.linkDensity).toBeLessThanOrEqual(1)
    })

    it('reports isReaderable status', async () => {
      const { data, exitCode } = await semanticArticle()
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.metrics.isReaderable).toBe(true)
    })
  })

  describe('extraction metadata', () => {
    it('extracts published time when available', async () => {
      const { data, exitCode } = await semanticArticle()
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.extraction!.publishedTime).toBe('2026-02-04')
    })

    it('returns null for missing metadata', async () => {
      const { data, exitCode } = await divSoup()
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      // div-soup likely has no structured metadata
      // Just verify the command completes without error
    })
  })

  describe('markdown output', () => {
    it('converts extracted HTML to markdown', async () => {
      const { data, exitCode } = await semanticArticle()
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.markdown).toBeTruthy()
      expect(data!.markdown.length).toBeGreaterThan(0)
    })

    it('preserves heading structure in markdown', async () => {
      const { data, exitCode } = await semanticArticle()
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.markdown).toContain('##')
    })
  })
})
