/**
 * Reader command runner.
 *
 * Extracts content using Mozilla Readability and reports metrics
 * relevant to browser reader modes (Safari Reader, Pocket, etc.).
 */
import {
  extractReadability,
  fetchHtmlContent,
  type ReaderResult,
} from '@webspecs/core'

/**
 * Fetch and extract reader mode content from a URL or file path.
 */
export async function fetchReader(target: string): Promise<ReaderResult> {
  const html = await fetchHtmlContent(target)
  const { extraction, metrics, markdown } = extractReadability(html)

  return {
    url: target,
    title: extraction?.title ?? null,
    byline: extraction?.byline ?? null,
    excerpt: extraction?.excerpt ?? null,
    siteName: extraction?.siteName ?? null,
    publishedTime: extraction?.publishedTime ?? null,
    metrics: {
      wordCount: metrics.wordCount,
      characterCount: metrics.characterCount,
      paragraphCount: metrics.paragraphCount,
      isReaderable: metrics.isReaderable,
    },
    markdown,
    html: extraction?.html ?? '',
  }
}
