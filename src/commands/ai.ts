import { Readability, isProbablyReaderable } from '@mozilla/readability'
import { parseHTML } from 'linkedom'

import { fetchHtmlContent } from '../lib/fetch.js'
import type {
  AiResult,
  FrameworkDetection,
  HiddenContentAnalysis,
} from '../lib/results.js'
import { createTurndownService } from '../lib/turndown.js'
import { validateFormat } from '../lib/validation.js'
import { countWords } from '../lib/words.js'

// ============================================================================
// Types
// ============================================================================

const VALID_FORMATS = ['full', 'compact', 'json'] as const

interface AiOptions {
  raw?: boolean
  format?: string
}

/**
 * Severity level for hidden content warnings
 */
type HiddenContentSeverity = 'none' | 'low' | 'high'

// ============================================================================
// Framework Detection
// ============================================================================

/**
 * Framework detector interface.
 * Add new framework detectors by implementing this interface.
 */
interface FrameworkDetector {
  name: string
  detect: (document: Document) => boolean
  getHiddenContentSelector: () => string
}

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
// Warning Messages
// ============================================================================

/**
 * Format the hidden content warning message based on detection results
 */
function formatHiddenContentWarning(analysis: HiddenContentAnalysis): string {
  const {
    framework,
    severity,
    hiddenWordCount,
    visibleWordCount,
    hiddenPercentage,
  } = analysis

  if (severity === 'none') return ''

  const lines: string[] = []
  const icon = severity === 'high' ? '🚨' : '⚠'

  if (framework) {
    // Framework-specific message
    lines.push(
      `${icon} ${framework.name.toUpperCase()} STREAMING DETECTED — ${hiddenPercentage}% of content hidden\n`,
    )
    lines.push(
      `   Visible: ~${visibleWordCount.toLocaleString()} words | Hidden: ~${hiddenWordCount.toLocaleString()} words\n`,
    )

    if (severity === 'high') {
      lines.push(
        `   ${framework.name} streaming SSR delivers content in hidden elements that`,
      )
      lines.push(
        `   require JavaScript to display. AI crawlers will NOT see this content.\n`,
      )
    } else {
      lines.push(
        `   Some content is delivered via ${framework.name} streaming and requires JavaScript.`,
      )
      lines.push(`   Most content is visible to AI crawlers.\n`)
    }
  } else {
    // Generic message
    lines.push(
      `${icon} HIDDEN CONTENT DETECTED — ${hiddenPercentage}% of content hidden\n`,
    )
    lines.push(
      `   Visible: ~${visibleWordCount.toLocaleString()} words | Hidden: ~${hiddenWordCount.toLocaleString()} words\n`,
    )

    if (severity === 'high') {
      lines.push(
        `   This page contains substantial content in hidden elements that require`,
      )
      lines.push(
        `   JavaScript to display. AI crawlers will NOT see this content.\n`,
      )
      lines.push(
        `   This pattern is common with streaming SSR frameworks like Next.js, Remix,`,
      )
      lines.push(`   Nuxt, or SvelteKit.\n`)
    } else {
      lines.push(`   Some content requires JavaScript to display.`)
      lines.push(
        `   This may be caused by streaming SSR (Next.js, Remix, Nuxt, etc.).\n`,
      )
    }
  }

  lines.push(
    `   To verify: Disable JavaScript in your browser and reload the page.\n`,
  )

  return lines.join('\n')
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Format metadata header for terminal output
 */
function formatHeader(content: AiResult): string {
  const lines: string[] = []

  lines.push('┌─────────────────────────────────────────────────────────────')
  lines.push('│ AI Crawler View')
  lines.push(`│ ${content.url}`)
  lines.push('├─────────────────────────────────────────────────────────────')

  if (content.title) {
    lines.push(`│ Title:   ${content.title}`)
  }
  if (content.author) {
    lines.push(`│ Author:  ${content.author}`)
  }
  if (content.siteName) {
    lines.push(`│ Site:    ${content.siteName}`)
  }
  if (content.excerpt) {
    const excerpt =
      content.excerpt.length > 80
        ? content.excerpt.slice(0, 77) + '...'
        : content.excerpt
    lines.push(`│ Excerpt: ${excerpt}`)
  }
  lines.push(`│ Length:  ${content.wordCount.toLocaleString()} words`)
  lines.push('└─────────────────────────────────────────────────────────────')

  return lines.join('\n')
}

/**
 * Format compact output - summary with truncated content
 */
function formatCompact(content: AiResult): string {
  const lines: string[] = []

  lines.push('┌─────────────────────────────────────────────────────────────')
  lines.push('│ AI Crawler View')
  lines.push(`│ ${content.url}`)
  lines.push('├─────────────────────────────────────────────────────────────')

  if (content.title) {
    lines.push(`│ Title:  ${content.title}`)
  }

  lines.push(`│ Length: ${content.wordCount.toLocaleString()} words`)

  const { hiddenContentAnalysis } = content
  if (hiddenContentAnalysis.hasStreamingContent) {
    lines.push(
      `│ Hidden: ${hiddenContentAnalysis.hiddenWordCount.toLocaleString()} words (${hiddenContentAnalysis.hiddenPercentage}%)`,
    )
  }

  if (!content.isReaderable) {
    lines.push('│ ⚠ Page may not be suitable for extraction')
  } else if (content.wordCount === 0) {
    lines.push('│ ⚠ No main content extracted')
  } else {
    lines.push('│ ✓ Content extracted successfully')
  }

  lines.push('└─────────────────────────────────────────────────────────────')

  return lines.join('\n')
}

/**
 * Extract content using Readability and convert to markdown.
 * Also analyzes hidden content patterns.
 */
function extractContent(html: string, url: string): AiResult {
  // Parse HTML with linkedom
  const { document } = parseHTML(html)

  // Check if page is suitable for content extraction
  const isReaderable = isProbablyReaderable(document)

  // Clone document for Readability (it modifies the DOM)
  const { document: docClone } = parseHTML(html)

  // Run Readability on the document AS-IS (no preprocessing)
  // This shows what AI crawlers actually see
  const reader = new Readability(docClone)
  const article = reader.parse()

  // Get visible word count
  const visibleWordCount = article ? countWords(article.textContent ?? '') : 0

  // Analyze hidden content (needs fresh document parse)
  const { document: docForAnalysis } = parseHTML(html)
  const hiddenContentAnalysis = analyzeHiddenContent(
    docForAnalysis,
    visibleWordCount,
  )

  if (!article) {
    return {
      url,
      title: null,
      author: null,
      excerpt: null,
      siteName: null,
      wordCount: 0,
      isReaderable,
      markdown: '',
      html: '',
      hiddenContentAnalysis,
    }
  }

  // Convert to markdown
  const turndown = createTurndownService()
  const contentHtml = article.content ?? ''
  const markdown = turndown.turndown(contentHtml)

  return {
    url,
    title: article.title ?? null,
    author: article.byline ?? null,
    excerpt: article.excerpt ?? null,
    siteName: article.siteName ?? null,
    wordCount: visibleWordCount,
    isReaderable,
    markdown,
    html: contentHtml,
    hiddenContentAnalysis,
  }
}

// ============================================================================
// Exported Functions for TUI
// ============================================================================

/**
 * Fetch and extract AI-visible content from a URL or file path.
 * This is the main entry point for programmatic use.
 */
export async function fetchAi(target: string): Promise<AiResult> {
  const html = await fetchHtmlContent(target)
  return extractContent(html, target)
}

/**
 * Render AI result to display lines for TUI.
 */
export function renderAiLines(result: AiResult): string[] {
  const lines: string[] = []

  lines.push('═══════════════════════════════════════════════')
  lines.push('  AI Crawler View')
  lines.push('═══════════════════════════════════════════════')
  lines.push('')

  // Warnings first
  if (!result.isReaderable) {
    lines.push(
      '⚠ This page may not be suitable for content extraction (isProbablyReaderable: false)',
    )
    lines.push('')
  }

  // Hidden content warning
  const { hiddenContentAnalysis } = result
  if (hiddenContentAnalysis.severity !== 'none') {
    const icon = hiddenContentAnalysis.severity === 'high' ? '🚨' : '⚠'
    if (hiddenContentAnalysis.framework) {
      lines.push(
        `${icon} ${hiddenContentAnalysis.framework.name.toUpperCase()} STREAMING DETECTED — ${hiddenContentAnalysis.hiddenPercentage}% of content hidden`,
      )
    } else {
      lines.push(
        `${icon} HIDDEN CONTENT DETECTED — ${hiddenContentAnalysis.hiddenPercentage}% of content hidden`,
      )
    }
    lines.push(
      `   Visible: ~${hiddenContentAnalysis.visibleWordCount.toLocaleString()} words | Hidden: ~${hiddenContentAnalysis.hiddenWordCount.toLocaleString()} words`,
    )
    lines.push('')
  }

  if (result.wordCount === 0) {
    lines.push('⚠ No main content could be extracted from this page.')
    lines.push('')
    if (!hiddenContentAnalysis.hasStreamingContent) {
      lines.push('This could mean:')
      lines.push('  • The page relies heavily on JavaScript to render content')
      lines.push("  • The page structure doesn't match common article patterns")
      lines.push('  • The page has very little text content')
    }
    return lines
  }

  // Metadata header
  lines.push('┌─────────────────────────────────────────────────────────────')
  lines.push(`│ ${result.url}`)
  lines.push('├─────────────────────────────────────────────────────────────')
  if (result.title) {
    lines.push(`│ Title:   ${result.title}`)
  }
  if (result.author) {
    lines.push(`│ Author:  ${result.author}`)
  }
  if (result.siteName) {
    lines.push(`│ Site:    ${result.siteName}`)
  }
  if (result.excerpt) {
    const excerpt =
      result.excerpt.length > 60
        ? result.excerpt.slice(0, 57) + '...'
        : result.excerpt
    lines.push(`│ Excerpt: ${excerpt}`)
  }
  lines.push(`│ Length:  ${result.wordCount.toLocaleString()} words`)
  lines.push('└─────────────────────────────────────────────────────────────')
  lines.push('')

  // Markdown content
  const contentLines = result.markdown.split('\n')
  lines.push(...contentLines)

  return lines
}

// ============================================================================
// Main Command
// ============================================================================

export async function aiCrawlerView(
  target: string,
  options: AiOptions,
): Promise<void> {
  // Validate format option
  const format = validateFormat(options.format, VALID_FORMATS)

  try {
    // Fetch the HTML
    const html = await fetchHtmlContent(target)

    // If --raw flag, just output the static HTML
    if (options.raw) {
      console.log(html)
      return
    }

    // Extract content
    const content = extractContent(html, target)

    // JSON output
    if (format === 'json') {
      console.log(JSON.stringify(content, null, 2))
      return
    }

    // Compact output
    if (format === 'compact') {
      console.log(formatCompact(content))
      return
    }

    // Full output (default)
    // Show warnings first
    if (!content.isReaderable) {
      console.log(
        '⚠ This page may not be suitable for content extraction (isProbablyReaderable: false)\n',
      )
    }

    // Hidden content warning (severity-based)
    const hiddenWarning = formatHiddenContentWarning(
      content.hiddenContentAnalysis,
    )
    if (hiddenWarning) {
      console.log(hiddenWarning)
    }

    if (content.wordCount === 0) {
      console.log('⚠ No main content could be extracted from this page.\n')
      if (!content.hiddenContentAnalysis.hasStreamingContent) {
        console.log('This could mean:')
        console.log(
          '  - The page relies heavily on JavaScript to render content',
        )
        console.log(
          "  - The page structure doesn't match common article patterns",
        )
        console.log('  - The page has very little text content\n')
      }
      console.log(
        'Use --raw to see the static HTML that AI crawlers receive.\n',
      )
      return
    }

    if (
      content.wordCount < 100 &&
      !content.hiddenContentAnalysis.hasStreamingContent
    ) {
      console.log(
        `⚠ Very short content extracted (${content.wordCount} words) — page may be JavaScript-heavy\n`,
      )
    }

    // Print header with metadata
    console.log(formatHeader(content))
    console.log('')

    // Print markdown content
    console.log(content.markdown)
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`)
    } else {
      console.error('An unknown error occurred')
    }
    process.exit(1)
  }
}
