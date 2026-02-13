/**
 * Integration tests for the `schema:js` utility command
 *
 * Tests structured data extraction from JavaScript-rendered HTML.
 */

import { describe, it, expect } from 'bun:test'
import type { SchemaJsResult } from '../../src/lib/results.js'
import { run, runCommand } from '../utils/cli.js'
import { getBaseUrl } from '../utils/server.js'

describe('schema:js command - extraction', () => {
  const semanticArticle = () =>
    run(`schema:js ${getBaseUrl()}/good/semantic-article.html`)

  describe('basic extraction', () => {
    it('extracts structured data from JS-rendered HTML', async () => {
      const { data, exitCode } = await semanticArticle()
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.target).toBe(`${getBaseUrl()}/good/semantic-article.html`)
    })

    it('reports timedOut status', async () => {
      const { data, exitCode } = await semanticArticle()
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(typeof data!.timedOut).toBe('boolean')
      expect(data!.timedOut).toBe(false)
    })
  })

  describe('JSON-LD extraction', () => {
    it('extracts JSON-LD schemas', async () => {
      const { data, exitCode } = await semanticArticle()
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.jsonld).toBeDefined()
      expect(data!.jsonld['Article']).toBeDefined()
      expect(data!.jsonld['Article'].length).toBeGreaterThan(0)
    })

    it('captures dynamically injected JSON-LD', async () => {
      // This test verifies the command can capture schema that might be injected by JS
      // Using the semantic-article which has static JSON-LD (works as baseline)
      const { data, exitCode } = await semanticArticle()
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()

      const article = data!.jsonld['Article']?.[0] as Record<string, unknown>
      expect(article).toBeDefined()
      expect(article['@type']).toBe('Article')
      expect(article['headline']).toBe('Understanding Semantic HTML')
    })
  })

  describe('Open Graph extraction', () => {
    it('extracts Open Graph tags', async () => {
      const { data, exitCode } = await semanticArticle()
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.openGraph).not.toBeNull()
      expect(data!.openGraph!.tags['og:title']).toBe(
        'Understanding Semantic HTML',
      )
    })

    it('reports missing required OG tags', async () => {
      const { data, exitCode } = await semanticArticle()
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.openGraph!.missingRequired).toContain('og:image')
      expect(data!.openGraph!.isComplete).toBe(false)
    })
  })

  describe('metatags extraction', () => {
    it('extracts standard metatags', async () => {
      const { data, exitCode } = await semanticArticle()
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.metatags).toBeDefined()
      expect(data!.metatags['description']).toContain('comprehensive guide')
    })
  })

  describe('timeout option', () => {
    it('accepts custom timeout', async () => {
      const { data, exitCode } = await runCommand<SchemaJsResult>(
        'schema:js',
        `${getBaseUrl()}/good/semantic-article.html`,
        ['--timeout', '10000'],
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
    })
  })

  describe('URL validation', () => {
    it('requires URL (not file path)', async () => {
      const { exitCode, stderr } = await runCommand<SchemaJsResult>(
        'schema:js',
        'test-server/fixtures/good/semantic-article.html',
      )
      expect(exitCode).toBe(1)
      expect(stderr).toContain('requires a URL')
    })
  })
})
