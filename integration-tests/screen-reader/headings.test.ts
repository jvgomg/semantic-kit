/**
 * Integration tests for heading detection in the `screen-reader` command.
 *
 * Tests that headings are correctly extracted with level and text.
 */

import { describe, it, expect } from 'bun:test'
import { runScreenReader } from '../utils/cli.js'
import { getBaseUrl } from '../utils/server.js'

describe('screen-reader command - headings', () => {
  describe('heading extraction', () => {
    it('extracts headings in document order', async () => {
      const { data, exitCode } = await runScreenReader(
        `${getBaseUrl()}/good/semantic-article.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.headings.length).toBeGreaterThan(0)
      // First heading should be h1
      expect(data!.headings[0].level).toBe(1)
    })

    it('captures heading text', async () => {
      const { data, exitCode } = await runScreenReader(
        `${getBaseUrl()}/good/semantic-article.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      const h1 = data!.headings.find(h => h.level === 1)
      expect(h1).toBeDefined()
      expect(h1!.text).toContain('Semantic HTML')
    })

    it('captures all heading levels used', async () => {
      const { data, exitCode } = await runScreenReader(
        `${getBaseUrl()}/good/semantic-article.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      const levels = new Set(data!.headings.map(h => h.level))
      // Page uses h1, h2, h3
      expect(levels.has(1)).toBe(true)
      expect(levels.has(2)).toBe(true)
      expect(levels.has(3)).toBe(true)
    })
  })

  describe('heading hierarchy', () => {
    it('preserves heading hierarchy order', async () => {
      const { data, exitCode } = await runScreenReader(
        `${getBaseUrl()}/good/navigation-landmarks.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      // First heading should be h1 (Widgets)
      expect(data!.headings[0].text).toContain('Widgets')
      expect(data!.headings[0].level).toBe(1)
    })
  })

  describe('non-semantic markup', () => {
    it('finds no semantic headings in div soup', async () => {
      const { data, exitCode } = await runScreenReader(
        `${getBaseUrl()}/bad/div-soup.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      // Div soup uses div.title instead of h1
      // May still have zero or very few headings
      expect(data!.summary.headingCount).toBe(0)
    })
  })
})
