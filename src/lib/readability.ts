/**
 * Shared Readability extraction utilities.
 *
 * Provides core functionality for extracting content using Mozilla Readability,
 * shared between the `ai` and `reader` commands.
 */
import { Readability, isProbablyReaderable } from '@mozilla/readability'
import { parseHTML } from 'linkedom'
import { createTurndownService } from './turndown.js'
import { countWords } from './words.js'

// ============================================================================
// Types
// ============================================================================

/**
 * Raw extraction result from Readability.
 * This is the direct output before any post-processing.
 */
export interface ReadabilityExtraction {
  /** Page title extracted by Readability */
  title: string | null
  /** Author/byline */
  byline: string | null
  /** Brief excerpt */
  excerpt: string | null
  /** Site name */
  siteName: string | null
  /** Extracted HTML content */
  html: string
  /** Text content (for word counting) */
  textContent: string
  /** Published date (if detected) */
  publishedTime: string | null
}

/**
 * Metrics about the extraction process.
 */
export interface ReadabilityMetrics {
  /** Word count of extracted content */
  wordCount: number
  /** Character count of extracted content */
  characterCount: number
  /** Number of paragraphs in extracted content */
  paragraphCount: number
  /** Link density (links / total text length) - lower is better */
  linkDensity: number
  /** Whether Readability considers page suitable for extraction */
  isReaderable: boolean
}

/**
 * Complete extraction result with content and metrics.
 */
export interface ReadabilityResult {
  /** The extraction data (null if extraction failed) */
  extraction: ReadabilityExtraction | null
  /** Metrics about the extraction */
  metrics: ReadabilityMetrics
  /** Extracted content as markdown */
  markdown: string
}

// ============================================================================
// Internal Helpers
// ============================================================================

/**
 * Count paragraphs in HTML content.
 */
function countParagraphs(html: string): number {
  const { document } = parseHTML(html)
  // Count <p> tags and elements that act as paragraphs
  const paragraphs = document.querySelectorAll('p')
  return paragraphs.length
}

/**
 * Calculate link density for content.
 * Link density = total link text length / total text length
 */
function calculateLinkDensity(html: string, totalText: string): number {
  const { document } = parseHTML(html)
  const links = document.querySelectorAll('a')

  let linkTextLength = 0
  for (const link of links) {
    linkTextLength += (link.textContent ?? '').length
  }

  const totalLength = totalText.length
  if (totalLength === 0) return 0

  return Math.round((linkTextLength / totalLength) * 100) / 100
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Extract content from HTML using Mozilla Readability.
 * Returns both the extraction result and detailed metrics.
 */
export function extractReadability(html: string): ReadabilityResult {
  // Parse HTML with linkedom
  const { document } = parseHTML(html)

  // Check if page is suitable for content extraction
  const isReaderable = isProbablyReaderable(document)

  // Clone document for Readability (it modifies the DOM)
  const { document: docClone } = parseHTML(html)

  // Run Readability
  const reader = new Readability(docClone)
  const article = reader.parse()

  if (!article) {
    return {
      extraction: null,
      metrics: {
        wordCount: 0,
        characterCount: 0,
        paragraphCount: 0,
        linkDensity: 0,
        isReaderable,
      },
      markdown: '',
    }
  }

  const contentHtml = article.content ?? ''
  const textContent = article.textContent ?? ''

  // Calculate metrics
  const wordCount = countWords(textContent)
  const characterCount = textContent.length
  const paragraphCount = countParagraphs(contentHtml)
  const linkDensity = calculateLinkDensity(contentHtml, textContent)

  // Convert to markdown
  const turndown = createTurndownService()
  const markdown = turndown.turndown(contentHtml)

  return {
    extraction: {
      title: article.title ?? null,
      byline: article.byline ?? null,
      excerpt: article.excerpt ?? null,
      siteName: article.siteName ?? null,
      html: contentHtml,
      textContent,
      publishedTime: article.publishedTime ?? null,
    },
    metrics: {
      wordCount,
      characterCount,
      paragraphCount,
      linkDensity,
      isReaderable,
    },
    markdown,
  }
}

/**
 * Check if HTML document is probably suitable for content extraction.
 */
export function checkReaderable(html: string): boolean {
  const { document } = parseHTML(html)
  return isProbablyReaderable(document)
}
