/**
 * Hidden content analysis for detecting streaming SSR patterns.
 *
 * Analyzes HTML documents to detect hidden content that may indicate
 * streaming server-side rendering (e.g., Next.js App Router, Remix).
 * This is relevant for understanding what AI crawlers see vs what
 * users see after JavaScript hydration.
 */
import { parseHTML } from 'linkedom'

import type { FrameworkDetection, HiddenContentAnalysis } from './results.js'
import { countWords } from './words.js'

// ============================================================================
// Types
// ============================================================================

/**
 * Severity level based on hidden content percentage
 */
export type HiddenContentSeverity = 'none' | 'low' | 'high'

/**
 * Framework detector interface.
 * Implementations detect specific frameworks and provide selectors
 * for finding their hidden content patterns.
 */
export interface FrameworkDetector {
  /** Framework name for display */
  name: string
  /** Check if this framework is present in the document */
  detect: (document: Document) => boolean
  /** CSS selector for hidden content elements */
  getHiddenContentSelector: () => string
}

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
function analyzeDocument(
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
// Public API
// ============================================================================

/**
 * Analyze HTML for hidden content patterns.
 *
 * Detects streaming SSR frameworks (Next.js, Remix, etc.) and calculates
 * how much content is hidden vs visible to non-JavaScript crawlers.
 *
 * @param html - Raw HTML string to analyze
 * @param visibleWordCount - Word count of visible/extracted content
 * @returns Hidden content analysis with framework detection and metrics
 */
export function analyzeHiddenContent(
  html: string,
  visibleWordCount: number,
): HiddenContentAnalysis {
  const { document } = parseHTML(html)
  return analyzeDocument(document, visibleWordCount)
}
