import { fetchHtmlContent } from '../../lib/fetch.js'
import { analyzeHiddenContent } from '../../lib/hidden-content.js'
import { extractReadability } from '../../lib/readability.js'
import type { AiResult } from '../../lib/results.js'

// ============================================================================
// Core Extraction
// ============================================================================

/**
 * Extract content using Readability and convert to markdown.
 * Also analyzes hidden content patterns (specific to AI crawler use case).
 */
function extractContent(html: string, url: string): AiResult {
  // Use shared Readability extraction
  const { extraction, metrics, markdown } = extractReadability(html)

  // Analyze hidden content (specific to AI command - detects streaming SSR)
  const hiddenContentAnalysis = analyzeHiddenContent(html, metrics.wordCount)

  return {
    url,
    title: extraction?.title ?? null,
    byline: extraction?.byline ?? null,
    excerpt: extraction?.excerpt ?? null,
    siteName: extraction?.siteName ?? null,
    wordCount: metrics.wordCount,
    isReaderable: metrics.isReaderable,
    markdown,
    html: extraction?.html ?? '',
    hiddenContentAnalysis,
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Fetch and extract AI-visible content from a URL or file path.
 * This is the main entry point for programmatic use.
 */
export async function fetchAi(target: string): Promise<AiResult> {
  const html = await fetchHtmlContent(target)
  return extractContent(html, target)
}
