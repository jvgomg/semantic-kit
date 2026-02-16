/**
 * Integration tests for schema extraction in the `google` command
 *
 * Tests that Google-recognized JSON-LD schemas are correctly extracted
 * and filtered from HTML.
 */

import { describe, it, expect } from 'bun:test'
import { run } from '../utils/cli.js'
import { getBaseUrl } from '../utils/server.js'

describe('google command - schema extraction', () => {
  const semanticArticle = () =>
    run(`google ${getBaseUrl()}/good/semantic-article.html`)

  describe('JSON-LD extraction', () => {
    it('extracts Article schema from semantic article', async () => {
      // TODO: update the google integration tests with better fixture cases
      const { data, exitCode } = await semanticArticle()
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()

      // Should find at least one schema
      expect(data!.counts.schemas).toBeGreaterThan(0)
      expect(data!.schemas.length).toBeGreaterThan(0)

      // Should find the Article schema
      const articleSchema = data!.schemas.find((s) => s.type === 'Article')
      expect(articleSchema).toBeDefined()

      // Should have key properties
      expect(articleSchema!.data['headline']).toBe(
        'Understanding Semantic HTML',
      )
      expect(articleSchema!.data['datePublished']).toBe('2026-02-04')
    })

    it('handles pages with no structured data', async () => {
      const { data, exitCode } = await run(
        `google ${getBaseUrl()}/bad/div-soup.html`,
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()

      // Should return empty schemas array
      expect(data!.counts.schemas).toBe(0)
      expect(data!.schemas).toEqual([])
    })
  })

  describe('schema filtering', () => {
    it('only includes Google-recognized schema types', async () => {
      const { data, exitCode } = await semanticArticle()
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()

      // All schemas should be Google-recognized types
      const googleTypes = [
        'Article',
        'NewsArticle',
        'BlogPosting',
        'Product',
        'Recipe',
        'Event',
        'FAQPage',
        'HowTo',
        'LocalBusiness',
        'Organization',
        'Person',
        'BreadcrumbList',
        'VideoObject',
        'Review',
        'AggregateRating',
        'SoftwareApplication',
        'WebSite',
        'JobPosting',
        'Course',
        'Book',
      ]

      for (const schema of data!.schemas) {
        expect(googleTypes).toContain(schema.type)
      }
    })
  })
})
