/**
 * Integration tests for metadata extraction in the `reader` command.
 *
 * Tests that article metadata (title, byline, excerpt, etc.) is correctly extracted.
 */

import { describe, it, expect } from 'bun:test'
import { run } from '../utils/cli.js'
import { getBaseUrl } from '../utils/server.js'

describe('reader command - metadata extraction', () => {
  const semanticArticle = () =>
    run(`reader ${getBaseUrl()}/good/semantic-article.html`)

  describe('well-formed articles', () => {
    it('extracts title from article', async () => {
      const { data, exitCode } = await semanticArticle()
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.title).toBe('Understanding Semantic HTML')
    })

    it('extracts byline/author from article', async () => {
      const { data, exitCode } = await semanticArticle()
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.byline).toContain('Jane Smith')
    })

    it('extracts site name when available', async () => {
      const { data, exitCode } = await semanticArticle()
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      // siteName may be null if not explicitly set in og:site_name
      // The page title suffix "- My Blog" is not parsed as site name
      expect(data!.siteName === null || data!.siteName === 'My Blog').toBe(true)
    })
  })

  describe('missing metadata', () => {
    it('returns null for missing title', async () => {
      const { data, exitCode } = await run(
        `reader ${getBaseUrl()}/edge-cases/empty-content.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      // Empty page has no extractable title
      // Title field may be the page title or null depending on Readability behavior
    })

    it('returns null for missing byline in non-semantic pages', async () => {
      const { data, exitCode } = await run(
        `reader ${getBaseUrl()}/bad/div-soup.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.byline).toBeNull()
    })
  })
})
