/**
 * Integration tests for content extraction in the `ai` command
 *
 * Tests that markdown is correctly extracted from various HTML sources.
 */

import { describe, it, expect } from 'bun:test'
import { run } from '../utils/cli.js'
import { getBaseUrl } from '../utils/server.js'

describe('ai command - content extraction', () => {
  const semanticArticle = () =>
    run(`ai ${getBaseUrl()}/good/semantic-article.html`)

  describe('static HTML', () => {
    it('extracts content from semantic markup', async () => {
      const { data, exitCode } = await semanticArticle()
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.wordCount).toBeGreaterThan(0)
    })

    it('extracts content from non-semantic markup', async () => {
      const { data, exitCode } = await run(
        `ai ${getBaseUrl()}/bad/div-soup.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.wordCount).toBeGreaterThan(0)
    })

    it('handles empty content gracefully', async () => {
      const { data, exitCode } = await run(
        `ai ${getBaseUrl()}/edge-cases/empty-content.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.wordCount).toBe(0)
    })
  })

  describe('Next.js pages', () => {
    it('extracts full content from static article', async () => {
      const { data, exitCode } = await run(
        `ai ${getBaseUrl()}/nextjs/article-static`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.markdown).toContain('Understanding Modern Web Rendering')
      expect(data!.markdown).toContain('Introduction to Server-Side Rendering')
      expect(data!.markdown).toContain('Further Reading')
    })

    it('extracts only visible content from streaming article', async () => {
      const { data, exitCode } = await run(
        `ai ${getBaseUrl()}/nextjs/article-streaming`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      // Header should be visible
      expect(data!.markdown).toContain('Understanding Modern Web Rendering')
      // Body content should NOT be visible (streamed)
      expect(data!.markdown).not.toContain(
        'Introduction to Server-Side Rendering',
      )
    })

    it('extracts static portion from mixed streaming article', async () => {
      const { data, exitCode } = await run(
        `ai ${getBaseUrl()}/nextjs/article-mixed`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      // Static part should be visible
      expect(data!.markdown).toContain('Introduction to Server-Side Rendering')
      // Streamed part should NOT be visible
      expect(data!.markdown).not.toContain('Further Reading')
    })

    it('extracts main content from navigation pages', async () => {
      const pages = ['nav-static', 'nav-streaming', 'nav-mixed']

      for (const page of pages) {
        const { data, exitCode } = await run(
          `ai ${getBaseUrl()}/nextjs/${page}`,
        )
        expect(exitCode).toBe(0)
        expect(data).not.toBeNull()
        // Main content should always be visible (not in Suspense)
        expect(data!.markdown).toContain('Welcome to Our Website')
      }
    })
  })
})
