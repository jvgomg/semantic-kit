/**
 * Schema utility runner for JS-rendered HTML.
 *
 * Uses Playwright to render the page with JavaScript,
 * then extracts structured data from the rendered HTML.
 */
import { fetchRenderedHtml } from '../../lib/playwright.js'
import type { SchemaJsResult } from '../../lib/results.js'
import {
  OPEN_GRAPH_TAGS,
  TWITTER_CARD_TAGS,
  type MetatagGroup,
  type StructuredData,
} from './types.js'

export interface FetchSchemaJsOptions {
  timeoutMs: number
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Extract structured data from HTML using web-auto-extractor
 */
function extractStructuredData(html: string): StructuredData {
  // Use the same extractor as structured-data-testing-tool
  // Bun supports require() directly in ESM
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const WAE = require('web-auto-extractor').default

  const result = WAE().parse(html)

  return {
    metatags: result.metatags || {},
    jsonld: result.jsonld || {},
    microdata: result.microdata || {},
    rdfa: result.rdfa || {},
  }
}

// ============================================================================
// Metatag Analysis
// ============================================================================

/**
 * Analyze metatags and group by standard
 */
function analyzeMetatags(metatags: Record<string, string[]>): {
  openGraph: MetatagGroup | null
  twitter: MetatagGroup | null
  other: Array<{ name: string; value: string }>
} {
  const ogTags: Array<{ name: string; value: string }> = []
  const twitterTags: Array<{ name: string; value: string }> = []
  const otherTags: Array<{ name: string; value: string }> = []

  for (const [name, values] of Object.entries(metatags)) {
    if (name === 'undefined') continue
    const value = values[0] || ''

    if (name.startsWith('og:')) {
      ogTags.push({ name, value })
    } else if (name.startsWith('twitter:')) {
      twitterTags.push({ name, value })
    } else {
      otherTags.push({ name, value })
    }
  }

  // Analyze Open Graph completeness
  let openGraph: MetatagGroup | null = null
  if (ogTags.length > 0) {
    const foundNames = new Set(ogTags.map((t) => t.name))
    const missingRequired = OPEN_GRAPH_TAGS.required.filter(
      (t) => !foundNames.has(t),
    )
    const missingRecommended = OPEN_GRAPH_TAGS.recommended.filter(
      (t) => !foundNames.has(t),
    )
    openGraph = {
      name: 'Open Graph',
      prefix: 'og:',
      tags: ogTags,
      missingRequired,
      missingRecommended,
      isComplete: missingRequired.length === 0,
    }
  }

  // Analyze Twitter Cards completeness
  let twitter: MetatagGroup | null = null
  if (twitterTags.length > 0) {
    const foundNames = new Set(twitterTags.map((t) => t.name))
    const missingRequired = TWITTER_CARD_TAGS.required.filter(
      (t) => !foundNames.has(t),
    )
    const missingRecommended = TWITTER_CARD_TAGS.recommended.filter(
      (t) => !foundNames.has(t),
    )
    twitter = {
      name: 'Twitter Cards',
      prefix: 'twitter:',
      tags: twitterTags,
      missingRequired,
      missingRecommended,
      isComplete: missingRequired.length === 0,
    }
  }

  return { openGraph, twitter, other: otherTags }
}

/**
 * Build the result object for JSON output
 */
function buildSchemaResult(
  target: string,
  data: StructuredData,
  timedOut: boolean,
): SchemaJsResult {
  const metatagAnalysis = analyzeMetatags(data.metatags)

  return {
    target,
    jsonld: data.jsonld,
    microdata: data.microdata,
    rdfa: data.rdfa,
    openGraph: metatagAnalysis.openGraph
      ? {
          tags: Object.fromEntries(
            metatagAnalysis.openGraph.tags.map((t) => [t.name, t.value]),
          ),
          missingRequired: metatagAnalysis.openGraph.missingRequired,
          missingRecommended: metatagAnalysis.openGraph.missingRecommended,
          isComplete: metatagAnalysis.openGraph.isComplete,
        }
      : null,
    twitter: metatagAnalysis.twitter
      ? {
          tags: Object.fromEntries(
            metatagAnalysis.twitter.tags.map((t) => [t.name, t.value]),
          ),
          missingRequired: metatagAnalysis.twitter.missingRequired,
          missingRecommended: metatagAnalysis.twitter.missingRecommended,
          isComplete: metatagAnalysis.twitter.isComplete,
        }
      : null,
    metatags: Object.fromEntries(
      metatagAnalysis.other.map((t) => [t.name, t.value]),
    ),
    timedOut,
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Fetch JS-rendered HTML and extract structured data.
 * Used by schema:js command.
 */
export async function fetchSchemaJs(
  target: string,
  options: FetchSchemaJsOptions,
): Promise<SchemaJsResult> {
  const { timeoutMs } = options

  // Fetch rendered HTML using Playwright
  const { html, timedOut } = await fetchRenderedHtml(target, timeoutMs)

  // Extract structured data
  const data = extractStructuredData(html)

  return buildSchemaResult(target, data, timedOut)
}
