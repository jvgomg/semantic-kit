/**
 * Integration tests for readability metrics in the `reader` command.
 *
 * Tests that metrics (wordCount, characterCount, paragraphCount, isReaderable)
 * are correctly computed.
 */

import { describe, it, expect } from 'bun:test'
import { runReader } from '../utils/cli.js'
import { getBaseUrl } from '../utils/server.js'

describe('reader command - metrics', () => {
  describe('word and character counts', () => {
    it('computes word count for content-rich pages', async () => {
      const { data, exitCode } = await runReader(
        `${getBaseUrl()}/good/semantic-article.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.metrics.wordCount).toBeGreaterThan(100)
    })

    it('computes character count for content-rich pages', async () => {
      const { data, exitCode } = await runReader(
        `${getBaseUrl()}/good/semantic-article.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.metrics.characterCount).toBeGreaterThan(500)
    })

    it('returns zero counts for empty content', async () => {
      const { data, exitCode } = await runReader(
        `${getBaseUrl()}/edge-cases/empty-content.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.metrics.wordCount).toBe(0)
      expect(data!.metrics.characterCount).toBe(0)
    })
  })

  describe('paragraph count', () => {
    it('counts paragraphs in structured content', async () => {
      const { data, exitCode } = await runReader(
        `${getBaseUrl()}/good/semantic-article.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.metrics.paragraphCount).toBeGreaterThan(0)
    })

    it('returns zero paragraphs for empty content', async () => {
      const { data, exitCode } = await runReader(
        `${getBaseUrl()}/edge-cases/empty-content.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.metrics.paragraphCount).toBe(0)
    })
  })

  describe('isReaderable flag', () => {
    it('marks content-rich article pages as readerable', async () => {
      const { data, exitCode } = await runReader(
        `${getBaseUrl()}/good/semantic-article.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.metrics.isReaderable).toBe(true)
    })

    it('marks empty pages as not readerable', async () => {
      const { data, exitCode } = await runReader(
        `${getBaseUrl()}/edge-cases/empty-content.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.metrics.isReaderable).toBe(false)
    })
  })
})
