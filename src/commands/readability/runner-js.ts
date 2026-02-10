/**
 * Readability utility runner for JS-rendered HTML.
 *
 * Uses Playwright to render the page with JavaScript,
 * then applies Readability extraction to the rendered HTML.
 */
import { fetchRenderedHtml } from '../../lib/playwright.js'
import { extractReadability } from '../../lib/readability.js'
import type { ReadabilityJsResult } from '../../lib/results.js'

export interface FetchReadabilityJsOptions {
  timeoutMs: number
}

/**
 * Fetch JS-rendered HTML and extract Readability content with full metrics.
 */
export async function fetchReadabilityJs(
  target: string,
  options: FetchReadabilityJsOptions,
): Promise<ReadabilityJsResult> {
  const { timeoutMs } = options

  // Fetch rendered HTML using Playwright
  const { html, timedOut } = await fetchRenderedHtml(target, timeoutMs)

  // Extract Readability content
  const { extraction, metrics, markdown } = extractReadability(html)

  return {
    url: target,
    extraction: extraction
      ? {
          title: extraction.title,
          byline: extraction.byline,
          excerpt: extraction.excerpt,
          siteName: extraction.siteName,
          publishedTime: extraction.publishedTime,
        }
      : null,
    metrics: {
      wordCount: metrics.wordCount,
      characterCount: metrics.characterCount,
      paragraphCount: metrics.paragraphCount,
      linkDensity: metrics.linkDensity,
      isReaderable: metrics.isReaderable,
    },
    markdown,
    html: extraction?.html ?? '',
    timedOut,
  }
}
