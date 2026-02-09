/**
 * Integration tests for readability detection in the `ai` command
 *
 * Tests the isProbablyReaderable flag that indicates whether
 * the page has enough content to be considered an article.
 */

import { describe, it, expect } from 'bun:test'
import { runAi } from '../utils/cli.js'
import { getBaseUrl } from '../utils/server.js'

describe('ai command - readability detection', () => {
  it('detects readable content in semantic article', async () => {
    const { data, exitCode } = await runAi(
      `${getBaseUrl()}/good/semantic-article.html`
    )
    expect(exitCode).toBe(0)
    expect(data).not.toBeNull()
    expect(data!.isReaderable).toBe(true)
  })

  it('detects readable content in Next.js articles', async () => {
    const pages = ['article-static', 'article-streaming', 'article-mixed']

    for (const page of pages) {
      const { data, exitCode } = await runAi(`${getBaseUrl()}/nextjs/${page}`)
      expect(exitCode).toBe(0)
      expect(data).not.toBeNull()
      expect(data!.isReaderable).toBe(true)
    }
  })
})
