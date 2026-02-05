/**
 * Integration tests for Next.js SSR detection in the `ai` command
 */

import { describe, it, expect } from 'bun:test'
import { runAi } from '../utils/cli.js'
import { getBaseUrl } from '../utils/server.js'

describe('ai command - Next.js SSR detection', () => {
  it('detects Next.js framework on static page', async () => {
    const { data, exitCode, stderr, stdout } = await runAi(`${getBaseUrl()}/nextjs/`)
    if (exitCode !== 0) {
      console.error('Command failed:', { exitCode, stderr, stdout })
    }
    expect(exitCode).toBe(0)
    expect(data).not.toBeNull()
    expect(data!.hiddenContentAnalysis.framework?.name).toBe('Next.js')
    expect(data!.hiddenContentAnalysis.framework?.confidence).toBe('detected')
  })

  it('reports no streaming content on static page', async () => {
    const { data, exitCode } = await runAi(`${getBaseUrl()}/nextjs/`)
    expect(exitCode).toBe(0)
    expect(data).not.toBeNull()
    expect(data!.hiddenContentAnalysis.severity).toBe('none')
    expect(data!.hiddenContentAnalysis.hasStreamingContent).toBe(false)
    expect(data!.hiddenContentAnalysis.hiddenWordCount).toBe(0)
    expect(data!.hiddenContentAnalysis.hiddenPercentage).toBe(0)
  })

  it('detects high severity on streaming page', async () => {
    const { data, exitCode } = await runAi(`${getBaseUrl()}/nextjs/streaming`)
    expect(exitCode).toBe(0)
    expect(data).not.toBeNull()
    expect(data!.hiddenContentAnalysis.framework?.name).toBe('Next.js')
    expect(data!.hiddenContentAnalysis.severity).toBe('high')
    // High severity means >10% hidden content
    expect(data!.hiddenContentAnalysis.hiddenPercentage).toBeGreaterThan(10)
  })

  it('detects low severity on mixed page', async () => {
    const { data, exitCode } = await runAi(`${getBaseUrl()}/nextjs/mixed`)
    expect(exitCode).toBe(0)
    expect(data).not.toBeNull()
    expect(data!.hiddenContentAnalysis.framework?.name).toBe('Next.js')
    expect(data!.hiddenContentAnalysis.severity).toBe('low')
    // Low severity means >0% and <=10% hidden content
    expect(data!.hiddenContentAnalysis.hiddenPercentage).toBeGreaterThan(0)
    expect(data!.hiddenContentAnalysis.hiddenPercentage).toBeLessThanOrEqual(10)
  })

  it('reports hidden content stats on streaming page', async () => {
    const { data, exitCode } = await runAi(`${getBaseUrl()}/nextjs/streaming`)
    expect(exitCode).toBe(0)
    expect(data).not.toBeNull()
    expect(data!.hiddenContentAnalysis.hasStreamingContent).toBe(true)
    expect(data!.hiddenContentAnalysis.hiddenWordCount).toBeGreaterThan(0)
  })

  it('extracts visible content correctly on mixed page', async () => {
    const { data, exitCode } = await runAi(`${getBaseUrl()}/nextjs/mixed`)
    expect(exitCode).toBe(0)
    expect(data).not.toBeNull()
    // The main article content should be extracted
    expect(data!.markdown).toContain('Mixed Content Page')
    expect(data!.markdown).toContain('Main Article Content')
    expect(data!.wordCount).toBeGreaterThan(100)
  })
})
