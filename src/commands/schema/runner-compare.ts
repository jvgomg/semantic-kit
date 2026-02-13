/**
 * Schema:compare runner.
 *
 * Fetches both static and JS-rendered HTML, extracts structured data from both,
 * and compares the results.
 */
import { fetchHtmlContent } from '../../lib/fetch.js'
import {
  extractStructuredData,
  normalizeMetatags,
  validateSocialTags,
  sortIssuesBySeverity,
  OPEN_GRAPH_REQUIREMENTS,
  TWITTER_CARD_REQUIREMENTS,
} from '../../lib/metadata/index.js'
import { fetchRenderedHtml } from '../../lib/playwright.js'
import type {
  SchemaCompareResult,
  SchemaComparisonMetrics,
  SchemaResult,
} from '../../lib/results.js'
import type { MetatagGroup, StructuredData } from './types.js'

export interface FetchSchemaCompareOptions {
  timeoutMs: number
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
 * Build the schema result object
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
// Comparison Logic
// ============================================================================

/**
 * Get schema type names from a schema record
 */
function getSchemaTypes(schemas: Record<string, unknown[]>): Set<string> {
  return new Set(Object.keys(schemas).filter((k) => k !== 'undefined'))
}

/**
 * Compare Open Graph tags between static and rendered
 */
function compareOpenGraph(
  staticOG: SchemaResult['openGraph'],
  renderedOG: SchemaResult['openGraph'],
): boolean {
  if (!staticOG && !renderedOG) return false
  if (!staticOG || !renderedOG) return true

  const staticTags = JSON.stringify(staticOG.tags)
  const renderedTags = JSON.stringify(renderedOG.tags)
  return staticTags !== renderedTags
}

/**
 * Compare Twitter Card tags between static and rendered
 */
function compareTwitter(
  staticTw: SchemaResult['twitter'],
  renderedTw: SchemaResult['twitter'],
): boolean {
  if (!staticTw && !renderedTw) return false
  if (!staticTw || !renderedTw) return true

  const staticTags = JSON.stringify(staticTw.tags)
  const renderedTags = JSON.stringify(renderedTw.tags)
  return staticTags !== renderedTags
}

/**
 * Build comparison metrics between static and rendered schemas
 */
function buildComparisonMetrics(
  staticResult: SchemaResult,
  renderedResult: SchemaResult,
): SchemaComparisonMetrics {
  const staticJsonld = getSchemaTypes(staticResult.jsonld)
  const renderedJsonld = getSchemaTypes(renderedResult.jsonld)
  const staticMicrodata = getSchemaTypes(staticResult.microdata)
  const renderedMicrodata = getSchemaTypes(renderedResult.microdata)
  const staticRdfa = getSchemaTypes(staticResult.rdfa)
  const renderedRdfa = getSchemaTypes(renderedResult.rdfa)

  // Count added (in rendered but not in static)
  const jsonldAdded = [...renderedJsonld].filter((t) => !staticJsonld.has(t))
    .length
  const microdataAdded = [...renderedMicrodata].filter(
    (t) => !staticMicrodata.has(t),
  ).length
  const rdfaAdded = [...renderedRdfa].filter((t) => !staticRdfa.has(t)).length

  // Count removed (in static but not in rendered) - rare but possible
  const jsonldRemoved = [...staticJsonld].filter((t) => !renderedJsonld.has(t))
    .length
  const microdataRemoved = [...staticMicrodata].filter(
    (t) => !renderedMicrodata.has(t),
  ).length
  const rdfaRemoved = [...staticRdfa].filter((t) => !renderedRdfa.has(t)).length

  const openGraphChanged = compareOpenGraph(
    staticResult.openGraph,
    renderedResult.openGraph,
  )
  const twitterChanged = compareTwitter(
    staticResult.twitter,
    renderedResult.twitter,
  )

  const hasDifferences =
    jsonldAdded > 0 ||
    jsonldRemoved > 0 ||
    microdataAdded > 0 ||
    microdataRemoved > 0 ||
    rdfaAdded > 0 ||
    rdfaRemoved > 0 ||
    openGraphChanged ||
    twitterChanged

  return {
    jsonldAdded,
    jsonldRemoved,
    microdataAdded,
    microdataRemoved,
    rdfaAdded,
    rdfaRemoved,
    openGraphChanged,
    twitterChanged,
    hasDifferences,
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Fetch and compare schema extraction from static vs JS-rendered HTML.
 */
export async function fetchSchemaCompare(
  target: string,
  options: FetchSchemaCompareOptions,
): Promise<SchemaCompareResult> {
  const { timeoutMs } = options

  // Fetch both static and rendered HTML in parallel
  const [staticHtml, { html: renderedHtml, timedOut }] = await Promise.all([
    fetchHtmlContent(target),
    fetchRenderedHtml(target, timeoutMs),
  ])

  // Extract structured data from both
  const staticData = extractStructuredData(staticHtml)
  const renderedData = extractStructuredData(renderedHtml)

  // Build schema results
  const staticResult = buildSchemaResult(target, staticData)
  const renderedResult = buildSchemaResult(target, renderedData)

  // Build comparison metrics
  const comparison = buildComparisonMetrics(staticResult, renderedResult)

  return {
    target,
    static: staticResult,
    rendered: renderedResult,
    comparison,
    timedOut,
  }
}
