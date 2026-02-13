import {
  extractStructuredData,
  normalizeMetatags,
  validateSocialTags,
  sortIssuesBySeverity,
  OPEN_GRAPH_REQUIREMENTS,
  TWITTER_CARD_REQUIREMENTS,
} from '../../lib/metadata/index.js'
import type { SchemaResult } from '../../lib/results.js'
import type { MetatagGroup, StructuredData } from './types.js'

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Fetch HTML from URL or read from file
 */
async function fetchHtmlContent(target: string): Promise<string> {
  if (target.startsWith('http://') || target.startsWith('https://')) {
    const response = await fetch(target)
    if (!response.ok) {
      throw new Error(`Failed to fetch ${target}: ${response.status}`)
    }
    return response.text()
  }

  return Bun.file(target).text()
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
    const missingRequired = OPEN_GRAPH_REQUIREMENTS.required.filter(
      (t) => !foundNames.has(t),
    )
    const missingRecommended = OPEN_GRAPH_REQUIREMENTS.recommended.filter(
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
    const missingRequired = TWITTER_CARD_REQUIREMENTS.required.filter(
      (t) => !foundNames.has(t),
    )
    const missingRecommended = TWITTER_CARD_REQUIREMENTS.recommended.filter(
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
function buildSchemaResult(target: string, data: StructuredData): SchemaResult {
  const metatagAnalysis = analyzeMetatags(data.metatags)

  // Normalize metatags for validation
  const normalizedTags = normalizeMetatags(data.metatags)

  // Run validation with both presence and quality checks
  const issues = sortIssuesBySeverity(
    validateSocialTags(normalizedTags, { checkPresence: true, checkQuality: true }),
  )

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
    issues,
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Fetch schema data and return as structured result.
 * Used by TUI and programmatic access.
 */
export async function fetchSchema(target: string): Promise<SchemaResult> {
  const html = await fetchHtmlContent(target)
  const data = extractStructuredData(html)
  return buildSchemaResult(target, data)
}
