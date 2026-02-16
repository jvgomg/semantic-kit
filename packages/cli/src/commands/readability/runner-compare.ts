/**
 * Readability:compare runner.
 *
 * Fetches both static and JS-rendered HTML, extracts content using
 * Readability, and compares the results.
 */
import { extractReadability, fetchHtmlContent, fetchRenderedHtml } from '@webspecs/core'
import type { ReadabilityCompareResult } from './types.js'

/**
 * Extract section headings from HTML content.
 */
function extractSections(html: string): { heading: string; level: number }[] {
  // Use a simple regex approach to avoid importing linkedom here
  const sections: { heading: string; level: number }[] = []
  const headingRegex = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi
  let match

  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1], 10)
    // Strip HTML tags from heading content
    const text = match[2].replace(/<[^>]+>/g, '').trim()
    if (text) {
      sections.push({ heading: text, level })
    }
  }

  return sections
}

/**
 * Find sections that exist in rendered but not in static content.
 */
function findSectionsOnlyInRendered(
  staticSections: { heading: string; level: number }[],
  renderedSections: { heading: string; level: number }[],
): { heading: string; level: number }[] {
  const staticHeadings = new Set(
    staticSections.map((s) => s.heading.toLowerCase()),
  )

  return renderedSections.filter(
    (section) => !staticHeadings.has(section.heading.toLowerCase()),
  )
}

/**
 * Fetch and compare Readability extraction from static vs JS-rendered HTML.
 *
 * @param url - URL to analyze
 * @param timeoutMs - Timeout for page rendering (default: 5000)
 * @returns Comparison result with both extractions and diff metrics
 */
export async function fetchReadabilityCompare(
  url: string,
  timeoutMs: number = 5000,
): Promise<ReadabilityCompareResult> {
  // Fetch both static and rendered HTML in parallel
  const [staticHtml, { html: renderedHtml, timedOut }] = await Promise.all([
    fetchHtmlContent(url),
    fetchRenderedHtml(url, timeoutMs),
  ])

  // Extract content from both
  const staticResult = extractReadability(staticHtml)
  const renderedResult = extractReadability(renderedHtml)

  // Calculate comparison metrics
  const jsDependentWordCount = Math.max(
    0,
    renderedResult.metrics.wordCount - staticResult.metrics.wordCount,
  )
  const jsDependentPercentage =
    renderedResult.metrics.wordCount > 0
      ? Math.round(
          (jsDependentWordCount / renderedResult.metrics.wordCount) * 100,
        )
      : 0

  // Find sections only in rendered version
  const staticSections = extractSections(staticResult.markdown)
  const renderedSections = extractSections(renderedResult.markdown)
  const sectionsOnlyInRendered = findSectionsOnlyInRendered(
    staticSections,
    renderedSections,
  )

  return {
    url,
    static: staticResult,
    rendered: renderedResult,
    comparison: {
      staticWordCount: staticResult.metrics.wordCount,
      renderedWordCount: renderedResult.metrics.wordCount,
      jsDependentWordCount,
      jsDependentPercentage,
      sectionsOnlyInRendered,
    },
    timedOut,
  }
}
