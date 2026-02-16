/**
 * Schema:compare runner.
 *
 * Fetches both static and JS-rendered HTML, extracts structured data from both,
 * and compares the results.
 */
import {
  extractStructuredData,
  fetchHtmlContent,
  fetchRenderedHtml,
  normalizeMetatags,
  sortIssuesBySeverity,
  validateSocialTags,
  type SchemaCompareResult,
  type SchemaComparisonMetrics,
  type SchemaResult,
  type SocialValidationIssue,
} from '@webspecs/core'
import type { StructuredData } from './types.js'

export interface FetchSchemaCompareOptions {
  timeoutMs: number
}

// ============================================================================
// Types
// ============================================================================

interface TagGroup {
  name: string
  prefix: string
  tags: Array<{ name: string; value: string }>
}

// ============================================================================
// Metatag Analysis
// ============================================================================

/**
 * Group metatags by standard (Open Graph, Twitter, other)
 */
function groupMetatags(metatags: Record<string, string[]>): {
  openGraph: TagGroup | null
  twitter: TagGroup | null
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

  const openGraph: TagGroup | null =
    ogTags.length > 0
      ? { name: 'Open Graph', prefix: 'og:', tags: ogTags }
      : null

  const twitter: TagGroup | null =
    twitterTags.length > 0
      ? { name: 'Twitter Cards', prefix: 'twitter:', tags: twitterTags }
      : null

  return { openGraph, twitter, other: otherTags }
}

/**
 * Filter issues by tag prefix
 */
function filterIssuesByPrefix(
  issues: SocialValidationIssue[],
  prefix: string,
): SocialValidationIssue[] {
  return issues.filter((issue) => issue.tag.startsWith(prefix))
}

/**
 * Build the schema result object
 */
function buildSchemaResult(target: string, data: StructuredData): SchemaResult {
  const metatagGroups = groupMetatags(data.metatags)

  // Normalize metatags for validation
  const normalizedTags = normalizeMetatags(data.metatags)

  // Run validation with both presence and quality checks
  const allIssues = sortIssuesBySeverity(
    validateSocialTags(normalizedTags, { checkPresence: true, checkQuality: true }),
  )

  // Filter issues by prefix for each group
  const ogIssues = filterIssuesByPrefix(allIssues, 'og:')
  const twitterIssues = filterIssuesByPrefix(allIssues, 'twitter:')

  return {
    target,
    jsonld: data.jsonld,
    microdata: data.microdata,
    rdfa: data.rdfa,
    openGraph: metatagGroups.openGraph
      ? {
          tags: Object.fromEntries(
            metatagGroups.openGraph.tags.map((t) => [t.name, t.value]),
          ),
          issues: ogIssues,
        }
      : null,
    twitter: metatagGroups.twitter
      ? {
          tags: Object.fromEntries(
            metatagGroups.twitter.tags.map((t) => [t.name, t.value]),
          ),
          issues: twitterIssues,
        }
      : null,
    metatags: Object.fromEntries(
      metatagGroups.other.map((t) => [t.name, t.value]),
    ),
    issues: allIssues,
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
