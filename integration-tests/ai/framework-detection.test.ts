/**
 * Integration tests for framework detection in the `ai` command
 *
 * Tests that frameworks like Next.js are correctly identified
 * from their HTML signatures.
 */

import { describe, it, expect } from 'bun:test'
import { runAi } from '../utils/cli.js'
import { getBaseUrl } from '../utils/server.js'

describe('ai command - framework detection', () => {
  describe('static HTML', () => {
    it('reports no framework for plain HTML', async () => {
      const { data, exitCode } = await runAi(
        `${getBaseUrl()}/good/semantic-article.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.hiddenContentAnalysis.framework).toBeNull()
    })

    it('reports no framework for non-semantic HTML', async () => {
      const { data, exitCode } = await runAi(
        `${getBaseUrl()}/bad/div-soup.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.hiddenContentAnalysis.framework).toBeNull()
    })
  })

  describe('Next.js', () => {
    it('detects Next.js framework', async () => {
      const { data, exitCode, stderr, stdout } = await runAi(
        `${getBaseUrl()}/nextjs/`
      )
      if (exitCode !== 0) {
        console.error('Command failed:', { exitCode, stderr, stdout })
      }
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.hiddenContentAnalysis.framework?.name).toBe('Next.js')
      expect(data!.hiddenContentAnalysis.framework?.confidence).toBe('detected')
    })

    it('detects Next.js on all page types', async () => {
      const pages = [
        'article-static',
        'article-streaming',
        'article-mixed',
        'nav-static',
        'nav-streaming',
        'nav-mixed',
      ]

      for (const page of pages) {
        const { data, exitCode } = await runAi(`${getBaseUrl()}/nextjs/${page}`)
        expect(exitCode).toBe(0)
        expect(data).not.toBeNull()
        expect(data!.hiddenContentAnalysis.framework?.name).toBe('Next.js')
      }
    })
  })
})
