import {
  extractStructuredData,
  normalizeMetatags,
  validateSocialTags,
  sortIssuesBySeverity,
} from '../../lib/metadata/index.js'
import type { SocialValidationIssue } from '../../lib/metadata/types.js'
import type { SchemaResult } from '../../lib/results.js'
import { fetchHtmlContent } from '../../lib/fetch.js'
import type { StructuredData } from './types.js'

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
 * Build the result object for JSON output
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
