/**
 * Integration tests for the `readability:compare` utility command
 *
 * Tests comparison of Readability extraction between static and JS-rendered HTML.
 */

import { describe, it, expect } from 'bun:test'
import type { ReadabilityCompareResult } from '../../src/commands/readability/types.js'
import { run, runCommand } from '../utils/cli.js'
import { getBaseUrl } from '../utils/server.js'

describe('readability:compare command', () => {
  const semanticArticle = () =>
    run(`readability:compare ${getBaseUrl()}/good/semantic-article.html`)

  describe('basic comparison', () => {
    it('returns both static and rendered extractions', async () => {
      const { data, exitCode } = await semanticArticle()
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()

      // Both static and rendered should be present
      expect(data!.static).toBeDefined()
      expect(data!.rendered).toBeDefined()
    })

    it('extracts content from both static and rendered HTML', async () => {
      const { data, exitCode } = await semanticArticle()
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()

      // Static extraction
      expect(data!.static.extraction).not.toBeNull()
      expect(data!.static.extraction!.title).toBe('Understanding Semantic HTML')

      // Rendered extraction
      expect(data!.rendered.extraction).not.toBeNull()
      expect(data!.rendered.extraction!.title).toBe(
        'Understanding Semantic HTML',
      )
    })

    it('reports timedOut status', async () => {
      const { data, exitCode } = await semanticArticle()
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(typeof data!.timedOut).toBe('boolean')
      expect(data!.timedOut).toBe(false)
    })
  })

  describe('comparison metrics', () => {
    it('calculates word count comparison', async () => {
      const { data, exitCode } = await semanticArticle()
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()

      expect(data!.comparison).toBeDefined()
      expect(typeof data!.comparison.staticWordCount).toBe('number')
      expect(typeof data!.comparison.renderedWordCount).toBe('number')
      expect(typeof data!.comparison.jsDependentWordCount).toBe('number')
      expect(typeof data!.comparison.jsDependentPercentage).toBe('number')
    })

    it('calculates JS-dependent percentage correctly', async () => {
      const { data, exitCode } = await semanticArticle()
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()

      // For static pages, JS-dependent should be 0 or very low
      expect(data!.comparison.jsDependentPercentage).toBeGreaterThanOrEqual(0)
      expect(data!.comparison.jsDependentPercentage).toBeLessThanOrEqual(100)
    })

    it('tracks sections only in rendered version', async () => {
      const { data, exitCode } = await semanticArticle()
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()

      expect(Array.isArray(data!.comparison.sectionsOnlyInRendered)).toBe(true)
    })
  })

  describe('metrics from both extractions', () => {
    it('includes full metrics for static extraction', async () => {
      const { data, exitCode } = await semanticArticle()
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()

      // Static metrics
      expect(typeof data!.static.metrics.wordCount).toBe('number')
      expect(typeof data!.static.metrics.characterCount).toBe('number')
      expect(typeof data!.static.metrics.paragraphCount).toBe('number')
      expect(typeof data!.static.metrics.linkDensity).toBe('number')
      expect(typeof data!.static.metrics.isReaderable).toBe('boolean')
    })

    it('includes full metrics for rendered extraction', async () => {
      const { data, exitCode } = await semanticArticle()
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()

      // Rendered metrics
      expect(typeof data!.rendered.metrics.wordCount).toBe('number')
      expect(typeof data!.rendered.metrics.characterCount).toBe('number')
      expect(typeof data!.rendered.metrics.paragraphCount).toBe('number')
      expect(typeof data!.rendered.metrics.linkDensity).toBe('number')
      expect(typeof data!.rendered.metrics.isReaderable).toBe('boolean')
    })
  })

  describe('markdown output', () => {
    it('includes markdown for both static and rendered', async () => {
      const { data, exitCode } = await semanticArticle()
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()

      expect(typeof data!.static.markdown).toBe('string')
      expect(typeof data!.rendered.markdown).toBe('string')
    })
  })

  describe('timeout option', () => {
    it('accepts custom timeout', async () => {
      const { data, exitCode } = await runCommand<ReadabilityCompareResult>(
        'readability:compare',
        `${getBaseUrl()}/good/semantic-article.html`,
        ['--timeout', '10000'],
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
    })
  })

  describe('URL validation', () => {
    it('requires URL (rejects file paths)', async () => {
      const { exitCode, stderr } = await runCommand<ReadabilityCompareResult>(
        'readability:compare',
        '/some/local/file.html',
      )
      expect(exitCode).not.toBe(0)
      expect(stderr).toContain('requires a URL')
    })
  })

  describe('issues reporting', () => {
    it('includes issues array in JSON output', async () => {
      const { issues, exitCode } = await semanticArticle()
      expect(exitCode).toBe(0)
      expect(Array.isArray(issues)).toBe(true)
    })
  })
})
