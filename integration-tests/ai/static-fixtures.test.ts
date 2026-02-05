/**
 * Baseline integration tests for the `ai` command against static fixtures
 */

import { describe, it, expect } from 'bun:test'
import { runAi } from '../utils/cli.js'
import { getBaseUrl } from '../utils/server.js'

describe('ai command - static fixtures', () => {
  describe('good/semantic-article.html', () => {
    it('extracts content from semantic article', async () => {
      const { data, exitCode } = await runAi(
        `${getBaseUrl()}/good/semantic-article.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.hiddenContentAnalysis.framework).toBeNull()
      expect(data!.isReaderable).toBe(true)
      expect(data!.wordCount).toBeGreaterThan(0)
    })

    it('reports no streaming content for static HTML', async () => {
      const { data, exitCode } = await runAi(
        `${getBaseUrl()}/good/semantic-article.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.hiddenContentAnalysis.severity).toBe('none')
      expect(data!.hiddenContentAnalysis.hasStreamingContent).toBe(false)
      expect(data!.hiddenContentAnalysis.hiddenWordCount).toBe(0)
      expect(data!.hiddenContentAnalysis.hiddenPercentage).toBe(0)
    })
  })

  describe('bad/div-soup.html', () => {
    it('extracts content from non-semantic markup', async () => {
      const { data, exitCode } = await runAi(
        `${getBaseUrl()}/bad/div-soup.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      // Non-semantic but Readability can still extract text
      expect(data!.wordCount).toBeGreaterThan(0)
      expect(data!.hiddenContentAnalysis.framework).toBeNull()
      expect(data!.hiddenContentAnalysis.hasStreamingContent).toBe(false)
    })
  })

  describe('edge-cases/empty-content.html', () => {
    it('handles empty content gracefully', async () => {
      const { data, exitCode } = await runAi(
        `${getBaseUrl()}/edge-cases/empty-content.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.wordCount).toBe(0)
      expect(data!.hiddenContentAnalysis.hasStreamingContent).toBe(false)
      expect(data!.hiddenContentAnalysis.severity).toBe('none')
    })
  })
})
