/**
 * Integration tests for accessibility feature detection in the `screen-reader` command.
 *
 * Tests detection of skip links and other accessibility features.
 */

import { describe, it, expect } from 'bun:test'
import { runScreenReader } from '../utils/cli.js'
import { getBaseUrl } from '../utils/server.js'

describe('screen-reader command - accessibility features', () => {
  describe('skip link detection', () => {
    it('detects skip links in semantic pages', async () => {
      const { data, exitCode } = await runScreenReader(
        `${getBaseUrl()}/good/semantic-article.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.summary.hasSkipLink).toBe(true)
    })

    it('detects skip links in navigation-heavy pages', async () => {
      const { data, exitCode } = await runScreenReader(
        `${getBaseUrl()}/good/navigation-landmarks.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.summary.hasSkipLink).toBe(true)
    })

    it('reports no skip link in pages without one', async () => {
      const { data, exitCode } = await runScreenReader(
        `${getBaseUrl()}/bad/div-soup.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.summary.hasSkipLink).toBe(false)
    })
  })

  describe('main landmark presence', () => {
    it('detects main landmark in well-structured pages', async () => {
      const { data, exitCode } = await runScreenReader(
        `${getBaseUrl()}/good/semantic-article.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.summary.hasMainLandmark).toBe(true)
    })

    it('reports missing main landmark in non-semantic pages', async () => {
      const { data, exitCode } = await runScreenReader(
        `${getBaseUrl()}/bad/div-soup.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.summary.hasMainLandmark).toBe(false)
    })
  })

  describe('navigation presence', () => {
    it('detects navigation in pages with nav elements', async () => {
      const { data, exitCode } = await runScreenReader(
        `${getBaseUrl()}/good/semantic-article.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.summary.hasNavigation).toBe(true)
    })

    it('reports missing navigation in non-semantic pages', async () => {
      const { data, exitCode } = await runScreenReader(
        `${getBaseUrl()}/bad/div-soup.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.summary.hasNavigation).toBe(false)
    })
  })

  describe('ARIA snapshot', () => {
    it('includes raw ARIA snapshot for reference', async () => {
      const { data, exitCode } = await runScreenReader(
        `${getBaseUrl()}/good/semantic-article.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.snapshot).toBeTruthy()
      expect(data!.snapshot.length).toBeGreaterThan(0)
    })

    it('includes parsed accessibility nodes', async () => {
      const { data, exitCode } = await runScreenReader(
        `${getBaseUrl()}/good/semantic-article.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.parsed).toBeDefined()
      expect(data!.parsed.length).toBeGreaterThan(0)
    })

    it('includes role counts', async () => {
      const { data, exitCode } = await runScreenReader(
        `${getBaseUrl()}/good/semantic-article.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.counts).toBeDefined()
      expect(data!.counts['link']).toBeGreaterThan(0)
    })
  })
})
