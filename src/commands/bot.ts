import { Readability, isProbablyReaderable } from '@mozilla/readability'
import { parseHTML } from 'linkedom'

import { fetchHtmlContent } from '../lib/fetch.js'
import type {
  BotResult,
  BotComparisonResult,
  ExtractedContent,
  SectionInfo,
} from '../lib/results.js'
import { createTurndownService } from '../lib/turndown.js'
import {
  validateFormat,
  validateTimeout,
  requireUrl,
} from '../lib/validation.js'
import { countWords } from '../lib/words.js'

// ============================================================================
// Types
// ============================================================================

const VALID_FORMATS = ['full', 'compact', 'json'] as const

interface BotOptions {
  content?: boolean
  timeout?: string
  format?: string
}

// ============================================================================
// Playwright Import (Optional Dependency)
// ============================================================================

interface PlaywrightBrowser {
  newContext(): Promise<PlaywrightContext>
  close(): Promise<void>
}

interface PlaywrightContext {
  newPage(): Promise<PlaywrightPage>
  close(): Promise<void>
}

interface PlaywrightPage {
  goto(
    url: string,
    options?: { waitUntil?: string; timeout?: number },
  ): Promise<unknown>
  content(): Promise<string>
}

interface PlaywrightChromium {
  launch(options?: { headless?: boolean }): Promise<PlaywrightBrowser>
}

async function getPlaywright(): Promise<PlaywrightChromium | null> {
  try {
    const playwright = await import('playwright')
    return playwright.chromium
  } catch {
    return null
  }
}

// ============================================================================
// Content Extraction
// ============================================================================

/**
 * Extract content using Readability and convert to markdown
 */
function extractContent(html: string, url: string): ExtractedContent {
  const { document } = parseHTML(html)
  const isReaderable = isProbablyReaderable(document)

  // Clone document for Readability (it modifies the DOM)
  const { document: docClone } = parseHTML(html)
  const reader = new Readability(docClone)
  const article = reader.parse()

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
    }
  }

  const turndown = createTurndownService()
  const contentHtml = article.content ?? ''
  const markdown = turndown.turndown(contentHtml)
  const wordCount = countWords(article.textContent ?? '')

  return {
    url,
    title: article.title ?? null,
    author: article.byline ?? null,
    excerpt: article.excerpt ?? null,
    siteName: article.siteName ?? null,
    wordCount,
    isReaderable,
    markdown,
    html: contentHtml,
  }
}

/**
 * Extract section headings from HTML content
 */
function extractSections(html: string): SectionInfo[] {
  const { document } = parseHTML(html)
  const sections: SectionInfo[] = []

  // Find all headings
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')

  for (const heading of Array.from(headings)) {
    const tagName = heading.tagName.toLowerCase()
    const level = parseInt(tagName.charAt(1), 10)
    const text = heading.textContent?.trim() ?? ''

    if (text) {
      // Count words in the section (approximation: content until next heading)
      let wordCount = 0
      let sibling = heading.nextElementSibling
      while (sibling && !/^h[1-6]$/i.test(sibling.tagName)) {
        wordCount += countWords(sibling.textContent ?? '')
        sibling = sibling.nextElementSibling
      }

      sections.push({
        heading: text,
        level,
        wordCount,
      })
    }
  }

  return sections
}

/**
 * Find sections that exist in rendered but not in static HTML
 */
function findJsDependentSections(
  staticSections: SectionInfo[],
  renderedSections: SectionInfo[],
): SectionInfo[] {
  const staticHeadings = new Set(
    staticSections.map((s) => s.heading.toLowerCase()),
  )

  return renderedSections.filter(
    (section) => !staticHeadings.has(section.heading.toLowerCase()),
  )
}

// ============================================================================
// Rendering
// ============================================================================

/**
 * Fetch rendered HTML using Playwright
 */
async function fetchRenderedHtml(
  url: string,
  timeoutMs: number,
): Promise<{ html: string; timedOut: boolean }> {
  const chromium = await getPlaywright()

  if (!chromium) {
    console.error(`Error: The 'bot' command requires Playwright to render JavaScript.

Install it with:
  bun add playwright
  bunx playwright install chromium
`)
    process.exit(1)
  }

  const browser = await chromium.launch({ headless: true })
  let timedOut = false

  try {
    const context = await browser.newContext()
    const page = await context.newPage()

    try {
      // Wait for network idle with user-configurable timeout
      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: timeoutMs,
      })
    } catch (error) {
      // Check if it's a timeout error
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes('timeout')
      ) {
        timedOut = true
        // Continue with partial content
      } else {
        throw error
      }
    }

    const html = await page.content()
    await context.close()

    return { html, timedOut }
  } finally {
    await browser.close()
  }
}

// ============================================================================
// Output Formatting
// ============================================================================

/**
 * Format comparison output for terminal (this is the main output)
 */
function formatComparison(
  url: string,
  comparison: BotComparisonResult,
  timedOut?: boolean,
): string {
  const lines: string[] = []

  lines.push('┌─────────────────────────────────────────────────────────────')
  lines.push('│ Bot View (Static vs JavaScript)')
  lines.push(`│ ${url}`)
  if (timedOut) {
    lines.push('│ ⚠ Timeout reached — showing partial content')
  }
  lines.push('├─────────────────────────────────────────────────────────────')
  lines.push(
    `│ Static HTML:    ${comparison.staticWordCount.toLocaleString()} words`,
  )
  lines.push(
    `│ Rendered DOM:   ${comparison.renderedWordCount.toLocaleString()} words`,
  )
  lines.push(
    `│ JS-dependent:   ${comparison.jsDependentWordCount.toLocaleString()} words (${comparison.jsDependentPercentage}%)`,
  )

  if (comparison.sectionsOnlyInRendered.length > 0) {
    lines.push('├─────────────────────────────────────────────────────────────')
    lines.push('│ Sections only visible after JavaScript execution:')
    for (const section of comparison.sectionsOnlyInRendered) {
      const wordInfo =
        section.wordCount > 0 ? ` (~${section.wordCount} words)` : ''
      lines.push(`│   • ${section.heading}${wordInfo}`)
    }
  } else if (comparison.jsDependentWordCount > 0) {
    lines.push('├─────────────────────────────────────────────────────────────')
    lines.push('│ Additional content was added by JavaScript, but no new')
    lines.push('│ section headings were detected.')
  }

  lines.push('└─────────────────────────────────────────────────────────────')

  return lines.join('\n')
}

/**
 * Format compact output - summary only
 */
function formatCompact(
  url: string,
  comparison: BotComparisonResult,
  timedOut?: boolean,
): string {
  const lines: string[] = []

  lines.push('┌─────────────────────────────────────────────────────────────')
  lines.push('│ Bot View (Static vs JavaScript)')
  lines.push(`│ ${url}`)
  if (timedOut) {
    lines.push('│ ⚠ Timeout reached')
  }
  lines.push('├─────────────────────────────────────────────────────────────')
  lines.push(
    `│ Static: ${comparison.staticWordCount.toLocaleString()} words · Rendered: ${comparison.renderedWordCount.toLocaleString()} words`,
  )
  lines.push(
    `│ JS-dependent: ${comparison.jsDependentWordCount.toLocaleString()} words (${comparison.jsDependentPercentage}%)`,
  )

  if (comparison.jsDependentPercentage === 0) {
    lines.push('│ ✓ No JavaScript-dependent content detected')
  } else if (comparison.jsDependentPercentage > 50) {
    lines.push('│ ⚠ High JavaScript dependency')
  }

  lines.push('└─────────────────────────────────────────────────────────────')

  return lines.join('\n')
}

// ============================================================================
// Exported Functions for TUI
// ============================================================================

/**
 * Fetch and compare static vs rendered content from a URL.
 * Requires Playwright to be installed.
 */
export async function fetchBot(target: string): Promise<BotResult> {
  // Validate that target is a URL (bot requires live pages)
  requireUrl(target, 'bot')

  const timeoutMs = 30000 // Default timeout

  // Fetch both static and rendered HTML
  const [staticHtml, { html: renderedHtml, timedOut }] = await Promise.all([
    fetchHtmlContent(target),
    fetchRenderedHtml(target, timeoutMs),
  ])

  // Extract content from both
  const staticContent = extractContent(staticHtml, target)
  const renderedContent = extractContent(renderedHtml, target)

  // Calculate comparison
  const jsDependentWordCount = Math.max(
    0,
    renderedContent.wordCount - staticContent.wordCount,
  )
  const jsDependentPercentage =
    renderedContent.wordCount > 0
      ? Math.round((jsDependentWordCount / renderedContent.wordCount) * 100)
      : 0

  // Find sections only in rendered version
  const staticSections = extractSections(staticContent.html)
  const renderedSections = extractSections(renderedContent.html)
  const sectionsOnlyInRendered = findJsDependentSections(
    staticSections,
    renderedSections,
  )

  const comparison: BotComparisonResult = {
    staticWordCount: staticContent.wordCount,
    renderedWordCount: renderedContent.wordCount,
    jsDependentWordCount,
    jsDependentPercentage,
    sectionsOnlyInRendered,
  }

  return {
    url: target,
    content: renderedContent,
    comparison,
    timedOut,
  }
}

/**
 * Render bot result to display lines for TUI.
 */
export function renderBotLines(result: BotResult): string[] {
  const { url, comparison, timedOut, content } = result
  const lines: string[] = []

  lines.push('═══════════════════════════════════════════════')
  lines.push('  Bot View (Static vs JavaScript)')
  lines.push('═══════════════════════════════════════════════')
  lines.push('')

  if (timedOut) {
    lines.push('⚠ Timeout reached — showing partial content')
    lines.push('')
  }

  // Comparison stats
  lines.push('┌─────────────────────────────────────────────────────────────')
  lines.push(`│ ${url}`)
  lines.push('├─────────────────────────────────────────────────────────────')
  lines.push(
    `│ Static HTML:    ${comparison.staticWordCount.toLocaleString()} words`,
  )
  lines.push(
    `│ Rendered DOM:   ${comparison.renderedWordCount.toLocaleString()} words`,
  )
  lines.push(
    `│ JS-dependent:   ${comparison.jsDependentWordCount.toLocaleString()} words (${comparison.jsDependentPercentage}%)`,
  )

  // Status indicator
  if (comparison.jsDependentPercentage === 0) {
    lines.push('│')
    lines.push('│ ✓ No JavaScript-dependent content detected')
  } else if (comparison.jsDependentPercentage > 50) {
    lines.push('│')
    lines.push('│ ⚠ High JavaScript dependency')
  }
  lines.push('└─────────────────────────────────────────────────────────────')
  lines.push('')

  // Sections only in rendered
  if (comparison.sectionsOnlyInRendered.length > 0) {
    lines.push('Sections only visible after JavaScript execution:')
    lines.push('─────────────────────────────────────────────────────────────')
    for (const section of comparison.sectionsOnlyInRendered) {
      const wordInfo =
        section.wordCount > 0 ? ` (~${section.wordCount} words)` : ''
      lines.push(`  • ${section.heading}${wordInfo}`)
    }
    lines.push('')
  } else if (comparison.jsDependentWordCount > 0) {
    lines.push('Additional content was added by JavaScript, but no new')
    lines.push('section headings were detected.')
    lines.push('')
  }

  // Show extracted content summary
  if (content.wordCount > 0) {
    lines.push('Extracted Content')
    lines.push('─────────────────────────────────────────────────────────────')
    if (content.title) {
      lines.push(`  Title: ${content.title}`)
    }
    if (content.excerpt) {
      const excerpt =
        content.excerpt.length > 60
          ? content.excerpt.slice(0, 57) + '...'
          : content.excerpt
      lines.push(`  Excerpt: ${excerpt}`)
    }
    lines.push(`  Length: ${content.wordCount.toLocaleString()} words`)
  }

  return lines
}

// ============================================================================
// Main Command
// ============================================================================

export async function botView(
  target: string,
  options: BotOptions,
): Promise<void> {
  // Validate URL
  requireUrl(target, 'bot')

  // Validate options
  const format = validateFormat(options.format, VALID_FORMATS)
  const timeoutMs = validateTimeout(options.timeout)

  try {
    // Fetch both static and rendered HTML
    const [staticHtml, { html: renderedHtml, timedOut }] = await Promise.all([
      fetchHtmlContent(target),
      fetchRenderedHtml(target, timeoutMs),
    ])

    // Extract content from both
    const staticContent = extractContent(staticHtml, target)
    const renderedContent = extractContent(renderedHtml, target)

    // Calculate comparison
    const jsDependentWordCount = Math.max(
      0,
      renderedContent.wordCount - staticContent.wordCount,
    )
    const jsDependentPercentage =
      renderedContent.wordCount > 0
        ? Math.round((jsDependentWordCount / renderedContent.wordCount) * 100)
        : 0

    // Find sections only in rendered version
    const staticSections = extractSections(staticContent.html)
    const renderedSections = extractSections(renderedContent.html)
    const sectionsOnlyInRendered = findJsDependentSections(
      staticSections,
      renderedSections,
    )

    const comparison: BotComparisonResult = {
      staticWordCount: staticContent.wordCount,
      renderedWordCount: renderedContent.wordCount,
      jsDependentWordCount,
      jsDependentPercentage,
      sectionsOnlyInRendered,
    }

    // Build result object
    const result: BotResult = {
      url: target,
      content: renderedContent,
      comparison,
      timedOut,
    }

    // JSON output
    if (format === 'json') {
      console.log(JSON.stringify(result, null, 2))
      return
    }

    // Compact output
    if (format === 'compact') {
      console.log(formatCompact(target, comparison, timedOut))
      return
    }

    // Full output (default)
    console.log(formatComparison(target, comparison, timedOut))

    // Print markdown content only if --content flag is set
    if (options.content) {
      console.log('')
      console.log(
        '─────────────────────────────────────────────────────────────',
      )
      console.log('Extracted Content (Markdown)')
      console.log(
        '─────────────────────────────────────────────────────────────',
      )
      console.log('')

      if (renderedContent.wordCount === 0) {
        console.log('⚠ No main content could be extracted from this page.')
      } else {
        console.log(renderedContent.markdown)
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`)
    } else {
      console.error('An unknown error occurred')
    }
    process.exit(1)
  }
}
