/**
 * Integration tests for social metadata validation.
 *
 * Tests that validation issues are correctly reported based on platform research.
 *
 * @see research/topics/social-metadata/open-graph-validation.md
 */

import { describe, it, expect } from 'bun:test'
import { run } from '../utils/cli.js'
import { getBaseUrl } from '../utils/server.js'

describe('social command - validation', () => {
  describe('valid tags (no issues)', () => {
    it('reports no issues for fully valid tags', async () => {
      const { data, exitCode } = await run(
        `social ${getBaseUrl()}/good/social-valid.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.issues).toHaveLength(0)
    })
  })

  describe('og:url validation', () => {
    it('reports error for relative og:url', async () => {
      const { data, exitCode } = await run(
        `social ${getBaseUrl()}/bad/social-relative-url.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()

      const urlIssue = data!.issues.find(
        (i) => i.code === 'og-url-not-absolute',
      )
      expect(urlIssue).toBeDefined()
      expect(urlIssue!.severity).toBe('high')
      expect(urlIssue!.tag).toBe('og:url')
    })
  })

  describe('og:title length validation', () => {
    it('reports warning for og:title over 60 characters', async () => {
      const { data, exitCode } = await run(
        `social ${getBaseUrl()}/bad/social-long-title.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()

      const titleIssue = data!.issues.find(
        (i) => i.code === 'og-title-too-long',
      )
      expect(titleIssue).toBeDefined()
      expect(titleIssue!.severity).toBe('medium')
      expect(titleIssue!.tag).toBe('og:title')
      expect(titleIssue!.limit).toBe(60)
      expect(titleIssue!.actual).toBeGreaterThan(60)
    })
  })

  describe('og:description length validation', () => {
    it('reports warning for og:description over 155 characters', async () => {
      const { data, exitCode } = await run(
        `social ${getBaseUrl()}/bad/social-long-description.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()

      const descIssue = data!.issues.find(
        (i) => i.code === 'og-description-too-long',
      )
      expect(descIssue).toBeDefined()
      expect(descIssue!.severity).toBe('medium')
      expect(descIssue!.tag).toBe('og:description')
      expect(descIssue!.limit).toBe(155)
      expect(descIssue!.actual).toBeGreaterThan(155)
    })
  })

  describe('image dimension validation', () => {
    it('reports warning for missing og:image dimensions', async () => {
      const { data, exitCode } = await run(
        `social ${getBaseUrl()}/bad/social-missing-image-dimensions.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()

      const dimIssue = data!.issues.find(
        (i) => i.code === 'og-image-dimensions-missing',
      )
      expect(dimIssue).toBeDefined()
      expect(dimIssue!.severity).toBe('medium')
      expect(dimIssue!.description).toContain('og:image:width')
      expect(dimIssue!.description).toContain('og:image:height')
    })
  })

  describe('twitter:card validation', () => {
    it('reports info for missing twitter:card', async () => {
      const { data, exitCode } = await run(
        `social ${getBaseUrl()}/bad/social-no-twitter-card.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()

      const cardIssue = data!.issues.find(
        (i) => i.code === 'twitter-card-missing',
      )
      expect(cardIssue).toBeDefined()
      expect(cardIssue!.severity).toBe('low')
      expect(cardIssue!.tag).toBe('twitter:card')
    })
  })

  describe('image alt text validation', () => {
    it('reports info for missing image alt text', async () => {
      const { data, exitCode } = await run(
        `social ${getBaseUrl()}/bad/social-missing-alt-text.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()

      const altIssue = data!.issues.find((i) => i.code === 'image-alt-missing')
      expect(altIssue).toBeDefined()
      expect(altIssue!.severity).toBe('low')
      expect(altIssue!.description).toContain('alt')
    })
  })

  describe('issue sorting', () => {
    it('sorts issues by severity (errors first)', async () => {
      const { data, exitCode } = await run(
        `social ${getBaseUrl()}/bad/social-relative-url.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()

      // Should have multiple issues, errors should come first
      // Severity is now 'high' | 'medium' | 'low' (IssueSeverity)
      if (data!.issues.length > 1) {
        const severityOrder = { high: 0, medium: 1, low: 2 }
        for (let i = 1; i < data!.issues.length; i++) {
          const prev =
            severityOrder[
              data!.issues[i - 1].severity as keyof typeof severityOrder
            ]
          const curr =
            severityOrder[
              data!.issues[i].severity as keyof typeof severityOrder
            ]
          expect(prev).toBeLessThanOrEqual(curr)
        }
      }
    })
  })
})
