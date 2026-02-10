/**
 * Integration tests for the `readability:js` utility command
 *
 * Tests Readability extraction from JavaScript-rendered HTML.
 */

import { describe, it, expect } from 'bun:test'
import { runReadabilityJs } from '../utils/cli.js'
import { getBaseUrl } from '../utils/server.js'

describe('readability:js command - extraction', () => {
  describe('basic extraction', () => {
    it('extracts content from static HTML via Playwright', async () => {
      const { data, exitCode } = await runReadabilityJs(
        `${getBaseUrl()}/good/semantic-article.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.extraction).not.toBeNull()
      expect(data!.extraction!.title).toBe('Understanding Semantic HTML')
      expect(data!.extraction!.byline).toBe('Jane Smith')
    })

    it('reports timedOut status', async () => {
      const { data, exitCode } = await runReadabilityJs(
        `${getBaseUrl()}/good/semantic-article.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(typeof data!.timedOut).toBe('boolean')
      expect(data!.timedOut).toBe(false)
    })

    it('handles empty content gracefully', async () => {
      const { data, exitCode } = await runReadabilityJs(
        `${getBaseUrl()}/edge-cases/empty-content.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.metrics.wordCount).toBe(0)
    })
  })

  describe('metrics', () => {
    it('reports all metrics including link density', async () => {
      const { data, exitCode } = await runReadabilityJs(
        `${getBaseUrl()}/good/semantic-article.html`,
      )
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
      const { data, exitCode } = await runReadabilityJs(
        `${getBaseUrl()}/good/semantic-article.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()

      // Link density should be a ratio between 0 and 1
      expect(data!.metrics.linkDensity).toBeGreaterThanOrEqual(0)
      expect(data!.metrics.linkDensity).toBeLessThanOrEqual(1)
    })
  })

  describe('markdown output', () => {
    it('converts extracted HTML to markdown', async () => {
      const { data, exitCode } = await runReadabilityJs(
        `${getBaseUrl()}/good/semantic-article.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.markdown).toBeTruthy()
      expect(data!.markdown.length).toBeGreaterThan(0)
    })

    it('preserves heading structure in markdown', async () => {
      const { data, exitCode } = await runReadabilityJs(
        `${getBaseUrl()}/good/semantic-article.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.markdown).toContain('##')
    })
  })

  describe('timeout option', () => {
    it('accepts custom timeout', async () => {
      const { data, exitCode } = await runReadabilityJs(
        `${getBaseUrl()}/good/semantic-article.html`,
        ['--timeout', '10000'],
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
    })
  })
})
