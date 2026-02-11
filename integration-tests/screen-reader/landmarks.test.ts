/**
 * Integration tests for landmark detection in the `screen-reader` command.
 *
 * Tests that landmark regions are correctly identified and analyzed.
 */

import { describe, it, expect } from 'bun:test'
import { runScreenReader } from '../utils/cli.js'
import { getBaseUrl } from '../utils/server.js'

describe('screen-reader command - landmarks', () => {
  describe('landmark detection', () => {
    it('detects main landmark in semantic pages', async () => {
      const { data, exitCode } = await runScreenReader(
        `${getBaseUrl()}/good/semantic-article.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.summary.hasMainLandmark).toBe(true)
      const mainLandmark = data!.landmarks.find(l => l.role === 'main')
      expect(mainLandmark).toBeDefined()
    })

    it('detects navigation landmarks', async () => {
      const { data, exitCode } = await runScreenReader(
        `${getBaseUrl()}/good/semantic-article.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.summary.hasNavigation).toBe(true)
      const navLandmarks = data!.landmarks.filter(l => l.role === 'navigation')
      expect(navLandmarks.length).toBeGreaterThan(0)
    })

    it('detects banner (header) landmark', async () => {
      const { data, exitCode } = await runScreenReader(
        `${getBaseUrl()}/good/semantic-article.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      const bannerLandmark = data!.landmarks.find(l => l.role === 'banner')
      expect(bannerLandmark).toBeDefined()
    })

    it('detects contentinfo (footer) landmark', async () => {
      const { data, exitCode } = await runScreenReader(
        `${getBaseUrl()}/good/semantic-article.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      const footerLandmark = data!.landmarks.find(l => l.role === 'contentinfo')
      expect(footerLandmark).toBeDefined()
    })

    it('detects complementary (aside) landmarks', async () => {
      const { data, exitCode } = await runScreenReader(
        `${getBaseUrl()}/good/semantic-article.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      const asideLandmark = data!.landmarks.find(l => l.role === 'complementary')
      expect(asideLandmark).toBeDefined()
    })
  })

  describe('landmark names', () => {
    it('captures aria-label on named landmarks', async () => {
      const { data, exitCode } = await runScreenReader(
        `${getBaseUrl()}/good/navigation-landmarks.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      // Page has named navigations like "Main", "Breadcrumb", "Footer"
      const namedNavs = data!.landmarks.filter(
        l => l.role === 'navigation' && l.name !== null
      )
      expect(namedNavs.length).toBeGreaterThan(0)
    })
  })

  describe('landmark content counts', () => {
    it('counts headings within landmarks', async () => {
      const { data, exitCode } = await runScreenReader(
        `${getBaseUrl()}/good/semantic-article.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      const mainLandmark = data!.landmarks.find(l => l.role === 'main')
      expect(mainLandmark).toBeDefined()
      expect(mainLandmark!.headingCount).toBeGreaterThan(0)
    })

    it('counts links within landmarks', async () => {
      const { data, exitCode } = await runScreenReader(
        `${getBaseUrl()}/good/semantic-article.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      const navLandmark = data!.landmarks.find(l => l.role === 'navigation')
      expect(navLandmark).toBeDefined()
      expect(navLandmark!.linkCount).toBeGreaterThan(0)
    })
  })
})
