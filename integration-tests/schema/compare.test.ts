/**
 * Integration tests for the `schema:compare` utility command
 *
 * Tests structured data comparison between static and JS-rendered HTML.
 */

import { describe, it, expect } from 'bun:test'
import type { SchemaCompareResult } from '../../src/lib/results.js'
import { run, runCommand } from '../utils/cli.js'
import { getBaseUrl } from '../utils/server.js'

describe('schema:compare command', () => {
  const semanticArticle = () =>
    run(`schema:compare ${getBaseUrl()}/good/semantic-article.html`)

  describe('basic functionality', () => {
    it('compares schema between static and rendered HTML', async () => {
      const { data, exitCode } = await semanticArticle()
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.target).toBe(`${getBaseUrl()}/good/semantic-article.html`)
    })

    it('returns both static and rendered schema results', async () => {
      const { data, exitCode } = await semanticArticle()
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.static).toBeDefined()
      expect(data!.rendered).toBeDefined()
      expect(data!.static.target).toBe(data!.target)
      expect(data!.rendered.target).toBe(data!.target)
    })

    it('reports timedOut status', async () => {
      const { data, exitCode } = await semanticArticle()
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(typeof data!.timedOut).toBe('boolean')
      expect(data!.timedOut).toBe(false)
    })
  })

  describe('comparison metrics', () => {
    it('provides hasDifferences flag', async () => {
      const { data, exitCode } = await semanticArticle()
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.comparison).toBeDefined()
      // TODO: improve these tests, generally. Testing the type isn't helpful.
      expect(typeof data!.comparison.hasDifferences).toBe('boolean')
    })

    it('tracks JSON-LD changes', async () => {
      const { data, exitCode } = await semanticArticle()
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(typeof data!.comparison.jsonldAdded).toBe('number')
      expect(typeof data!.comparison.jsonldRemoved).toBe('number')
    })

    it('tracks Open Graph and Twitter changes', async () => {
      const { data, exitCode } = await semanticArticle()
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(typeof data!.comparison.openGraphChanged).toBe('boolean')
      expect(typeof data!.comparison.twitterChanged).toBe('boolean')
    })
  })

  describe('static page (no JS-dependent schema)', () => {
    it('reports no differences for static content', async () => {
      const { data, exitCode } = await semanticArticle()
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()

      // Static page should have identical schema in both versions
      expect(data!.comparison.hasDifferences).toBe(false)
      expect(data!.comparison.jsonldAdded).toBe(0)
      expect(data!.comparison.jsonldRemoved).toBe(0)
    })
  })

  describe('timeout option', () => {
    it('accepts custom timeout', async () => {
      const { data, exitCode } = await runCommand<SchemaCompareResult>(
        'schema:compare',
        `${getBaseUrl()}/good/semantic-article.html`,
        ['--timeout', '10000'],
      )
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
    })
  })

  describe('URL validation', () => {
    it('requires URL (not file path)', async () => {
      const { exitCode, stderr } = await runCommand<SchemaCompareResult>(
        'schema:compare',
        'test-server/fixtures/good/semantic-article.html',
      )
      expect(exitCode).toBe(1)
      expect(stderr).toContain('requires a URL')
    })
  })
})
