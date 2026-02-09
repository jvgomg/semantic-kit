/**
 * Integration tests for hidden content analysis in the `ai` command
 *
 * Tests detection of streaming SSR content that may be hidden from
 * AI crawlers, including severity levels and hidden word counts.
 */

import { describe, it, expect } from 'bun:test'
import { runAi } from '../utils/cli.js'
import { getBaseUrl } from '../utils/server.js'

describe('ai command - hidden content analysis', () => {
  describe('no streaming (severity: none)', () => {
    it('static HTML has no hidden content', async () => {
      const { data, exitCode } = await runAi(
        `${getBaseUrl()}/good/semantic-article.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.hiddenContentAnalysis.severity).toBe('none')
      expect(data!.hiddenContentAnalysis.hasStreamingContent).toBe(false)
      expect(data!.hiddenContentAnalysis.hiddenWordCount).toBe(0)
      expect(data!.hiddenContentAnalysis.hiddenPercentage).toBe(0)
    })

    it('empty content has no hidden content', async () => {
      const { data, exitCode } = await runAi(
        `${getBaseUrl()}/edge-cases/empty-content.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.hiddenContentAnalysis.severity).toBe('none')
      expect(data!.hiddenContentAnalysis.hasStreamingContent).toBe(false)
    })

    it('Next.js static page has no hidden content', async () => {
      const { data, exitCode } = await runAi(`${getBaseUrl()}/nextjs/`)
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.hiddenContentAnalysis.severity).toBe('none')
      expect(data!.hiddenContentAnalysis.hasStreamingContent).toBe(false)
      expect(data!.hiddenContentAnalysis.hiddenWordCount).toBe(0)
    })

    it('Next.js article-static has no hidden content', async () => {
      const { data, exitCode } = await runAi(
        `${getBaseUrl()}/nextjs/article-static`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.hiddenContentAnalysis.severity).toBe('none')
      expect(data!.hiddenContentAnalysis.hasStreamingContent).toBe(false)
    })

    it('Next.js nav-static has no hidden content', async () => {
      const { data, exitCode } = await runAi(
        `${getBaseUrl()}/nextjs/nav-static`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.hiddenContentAnalysis.severity).toBe('none')
      expect(data!.hiddenContentAnalysis.hasStreamingContent).toBe(false)
    })
  })

  describe('partial streaming (severity: low)', () => {
    it('article-mixed has low severity (small portion streamed)', async () => {
      const { data, exitCode } = await runAi(
        `${getBaseUrl()}/nextjs/article-mixed`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.hiddenContentAnalysis.severity).toBe('low')
      expect(data!.hiddenContentAnalysis.hasStreamingContent).toBe(true)
      // Low severity means <=10% hidden
      expect(data!.hiddenContentAnalysis.hiddenPercentage).toBeLessThanOrEqual(10)
    })
  })

  describe('heavy streaming (severity: high)', () => {
    it('article-streaming has high severity (main content streamed)', async () => {
      const { data, exitCode } = await runAi(
        `${getBaseUrl()}/nextjs/article-streaming`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.hiddenContentAnalysis.severity).toBe('high')
      expect(data!.hiddenContentAnalysis.hasStreamingContent).toBe(true)
      // High severity means >10% hidden
      expect(data!.hiddenContentAnalysis.hiddenPercentage).toBeGreaterThan(10)
    })
  })

  describe('streaming detection', () => {
    it('detects streaming in nav-streaming', async () => {
      const { data, exitCode } = await runAi(
        `${getBaseUrl()}/nextjs/nav-streaming`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.hiddenContentAnalysis.hasStreamingContent).toBe(true)
    })

    it('detects streaming in nav-mixed', async () => {
      const { data, exitCode } = await runAi(
        `${getBaseUrl()}/nextjs/nav-mixed`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.hiddenContentAnalysis.hasStreamingContent).toBe(true)
    })
  })
})
