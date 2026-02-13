/**
 * Integration tests for content extraction in the `reader` command.
 *
 * Tests that content is correctly extracted for browser reader modes.
 */

import { describe, it, expect } from 'bun:test'
import { run } from '../utils/cli.js'
import { getBaseUrl } from '../utils/server.js'

describe('reader command - content extraction', () => {
  const semanticArticle = () =>
    run(`reader ${getBaseUrl()}/good/semantic-article.html`)

  describe('semantic markup', () => {
    it('extracts article content as markdown', async () => {
      const { data, exitCode } = await semanticArticle()
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      // Readability extracts body content; title is in metadata
      expect(data!.markdown).toContain('Why It Matters')
      expect(data!.markdown).toContain('For Accessibility')
    })

    it('extracts content as HTML', async () => {
      const { data, exitCode } = await semanticArticle()
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      // Readability extracts article body with h2 headings
      expect(data!.html).toContain('<h2>')
      expect(data!.html).toContain('Why It Matters')
    })

    it('includes the target URL in the result', async () => {
      const url = `${getBaseUrl()}/good/semantic-article.html`
      const { data, exitCode } = await run(`reader ${url}`)
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.url).toBe(url)
    })
  })

  describe('non-semantic markup', () => {
    it('extracts content from div-based markup', async () => {
      const { data, exitCode } = await run(
        `reader ${getBaseUrl()}/bad/div-soup.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      // Readability extracts paragraph content even from div soup
      expect(data!.markdown).toContain('This is a paragraph of text')
    })
  })

  describe('edge cases', () => {
    it('handles empty content gracefully', async () => {
      const { data, exitCode } = await run(
        `reader ${getBaseUrl()}/edge-cases/empty-content.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.metrics.wordCount).toBe(0)
      expect(data!.markdown).toBe('')
    })
  })
})
