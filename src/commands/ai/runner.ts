import { parseHTML } from 'linkedom'

import { fetchHtmlContent } from '../../lib/fetch.js'
import { extractReadability } from '../../lib/readability.js'
import type {
  AiResult,
  FrameworkDetection,
  HiddenContentAnalysis,
} from '../../lib/results.js'
import { countWords } from '../../lib/words.js'
import type { FrameworkDetector, HiddenContentSeverity } from './types.js'

// ============================================================================
// Framework Detection
// ============================================================================

/**
 * Next.js App Router detector.
 * Detects streaming SSR pattern with hidden divs.
 */
const nextJsDetector: FrameworkDetector = {
  name: 'Next.js',
  detect: (document: Document): boolean => {
    // Check for Next.js streaming SSR hidden divs
    const hasStreamingDivs =
      document.querySelectorAll('div[hidden][id^="S:"]').length > 0

    // Check for Next.js script patterns
    const scripts = Array.from(document.querySelectorAll('script'))
    const hasNextScripts = scripts.some((script) => {
      const content = script.textContent ?? ''
      return (
        content.includes('self.__next_f') ||
        content.includes('$RC') ||
        content.includes('__NEXT_DATA__')
      )
    })

    // Check for Next.js asset URLs
    const hasNextAssets =
      document.querySelector('script[src*="/_next/"]') !== null ||
      document.querySelector('link[href*="/_next/"]') !== null

    return hasStreamingDivs || hasNextScripts || hasNextAssets
  },
  getHiddenContentSelector: () => 'div[hidden][id^="S:"]',
}

/**
 * Registry of all framework detectors.
 * Add new detectors here to extend framework detection.
 */
const frameworkDetectors: FrameworkDetector[] = [
  nextJsDetector,
  // Future: Add Remix, Nuxt, SvelteKit detectors here
]

// ============================================================================
// Hidden Content Detection
// ============================================================================

/**
 * Calculate severity based on hidden content percentage
 * - 0% = none (no streaming content)
 * - >0% to 10% = low (minor streaming content)
 * - >10% = high (significant streaming content)
 */
function calculateSeverity(hiddenPercentage: number): HiddenContentSeverity {
  if (hiddenPercentage === 0) return 'none'
  if (hiddenPercentage <= 10) return 'low'
  return 'high'
}

/**
 * Detect hidden content and identify framework if possible.
 *
 * Detection strategy:
 * 1. Try to detect specific frameworks first
 * 2. If framework detected, use its specific selector for hidden content
 * 3. Also run generic hidden content detection
 * 4. Calculate ratios and severity
 */
function analyzeHiddenContent(
  document: Document,
  visibleWordCount: number,
): HiddenContentAnalysis {
  let framework: FrameworkDetection | null = null
  let hiddenWordCount = 0

  // Try to detect specific frameworks
  for (const detector of frameworkDetectors) {
    if (detector.detect(document)) {
      framework = { name: detector.name, confidence: 'detected' }

      // Count hidden content using framework-specific selector
      const hiddenElements = document.querySelectorAll(
        detector.getHiddenContentSelector(),
      )
      Array.from(hiddenElements).forEach((el) => {
        hiddenWordCount += countWords(el.textContent ?? '')
      })

      break // Use first matching framework
    }
  }

  // If no specific framework detected, do generic hidden content scan
  if (!framework) {
    const hiddenElements = document.querySelectorAll('[hidden]')
    Array.from(hiddenElements).forEach((el) => {
      const words = countWords(el.textContent ?? '')
      // Only count if substantial content (avoid counting hidden UI elements)
      if (words > 50) {
        hiddenWordCount += words
      }
    })
  }

  // Calculate metrics
  const totalWords = visibleWordCount + hiddenWordCount
  const hiddenPercentage =
    totalWords > 0 ? Math.round((hiddenWordCount / totalWords) * 100) : 0
  const severity = calculateSeverity(hiddenPercentage)
  const hasStreamingContent = hiddenWordCount > 0

  return {
    hiddenWordCount,
    visibleWordCount,
    hiddenPercentage,
    severity,
    framework,
    hasStreamingContent,
  }
}

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
  const { document: docForAnalysis } = parseHTML(html)
  const hiddenContentAnalysis = analyzeHiddenContent(
    docForAnalysis,
    metrics.wordCount,
  )

  return {
    url,
    title: extraction?.title ?? null,
    author: extraction?.byline ?? null,
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
