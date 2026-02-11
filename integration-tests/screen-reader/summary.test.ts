/**
 * Integration tests for screen reader summary in the `screen-reader` command.
 *
 * Tests the high-level summary of accessibility features visible to screen reader users.
 */

import { describe, it, expect } from 'bun:test'
import { runScreenReader } from '../utils/cli.js'
import { getBaseUrl } from '../utils/server.js'

describe('screen-reader command - summary', () => {
  describe('page title detection', () => {
    it('extracts page title from semantic pages', async () => {
      const { data, exitCode } = await runScreenReader(
        `${getBaseUrl()}/good/semantic-article.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.summary.pageTitle).not.toBeNull()
    })

    it('extracts page title from navigation-focused pages', async () => {
      const { data, exitCode } = await runScreenReader(
        `${getBaseUrl()}/good/navigation-landmarks.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.summary.pageTitle).not.toBeNull()
    })
  })

  describe('element counts', () => {
    it('counts landmarks in well-structured pages', async () => {
      const { data, exitCode } = await runScreenReader(
        `${getBaseUrl()}/good/navigation-landmarks.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      // Page has multiple landmarks: banner, multiple navs, main, complementary, contentinfo
      expect(data!.summary.landmarkCount).toBeGreaterThan(3)
    })

    it('counts headings in content pages', async () => {
      const { data, exitCode } = await runScreenReader(
        `${getBaseUrl()}/good/semantic-article.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.summary.headingCount).toBeGreaterThan(3)
    })

    it('counts links in pages with navigation', async () => {
      const { data, exitCode } = await runScreenReader(
        `${getBaseUrl()}/good/navigation-landmarks.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.summary.linkCount).toBeGreaterThan(10)
    })

    it('counts form controls when present', async () => {
      const { data, exitCode } = await runScreenReader(
        `${getBaseUrl()}/good/semantic-article.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      // Page has search form with input and button
      expect(data!.summary.formControlCount).toBeGreaterThan(0)
    })
  })

  describe('non-semantic markup', () => {
    it('detects lack of landmarks in div soup', async () => {
      const { data, exitCode } = await runScreenReader(
        `${getBaseUrl()}/bad/div-soup.html`
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      // Div soup has no semantic landmarks
      expect(data!.summary.hasMainLandmark).toBe(false)
      expect(data!.summary.hasNavigation).toBe(false)
    })
  })
})
