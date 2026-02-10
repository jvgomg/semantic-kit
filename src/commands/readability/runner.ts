/**
 * Readability utility runner.
 *
 * Provides raw Readability extraction and analysis from static HTML.
 * Developer-focused utility showing all metrics including link density.
 */
import { fetchHtmlContent } from '../../lib/fetch.js'
import { extractReadability } from '../../lib/readability.js'
import type { ReadabilityUtilityResult } from '../../lib/results.js'

/**
 * Fetch and extract Readability content with full metrics.
 */
export async function fetchReadability(
  target: string,
): Promise<ReadabilityUtilityResult> {
  const html = await fetchHtmlContent(target)
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
  }
}
