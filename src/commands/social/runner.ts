/**
 * Social lens runner - extracts Open Graph and Twitter Card data.
 */
import {
  extractStructuredData,
  groupMetatagsByPrefix,
  normalizeMetatags,
  validateSocialTags,
  sortIssuesBySeverity,
} from '../../lib/metadata/index.js'
import {
  extractPageMetadata,
  buildSocialPreview,
} from '../../lib/preview.js'
import type { SocialResult, SocialTagGroup } from './types.js'

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Fetch HTML from URL or read from file.
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
// Analysis Functions
// ============================================================================

/**
 * Build a social tag group from grouped metatags.
 */
function buildTagGroup(
  name: string,
  prefix: string,
  tags: Record<string, string>,
): SocialTagGroup | null {
  // No tags found for this group
  if (Object.keys(tags).length === 0) {
    return null
  }

  return {
    name,
    prefix,
    tags,
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Fetch social metadata and return as structured result.
 * Used by CLI and TUI.
 */
export async function fetchSocial(target: string): Promise<SocialResult> {
  const html = await fetchHtmlContent(target)

  // Extract structured data using WAE (single source of truth)
  const data = extractStructuredData(html)
  const grouped = groupMetatagsByPrefix(data.metatags)

  // Extract page metadata for preview fallbacks (linkedom)
  const pageMetadata = extractPageMetadata(html)

  // Build tag groups
  const openGraph = buildTagGroup('Open Graph', 'og:', grouped.openGraph)
  const twitter = buildTagGroup('Twitter Cards', 'twitter:', grouped.twitter)

  // Build preview with fallback chains
  const preview = buildSocialPreview(
    grouped.openGraph,
    grouped.twitter,
    pageMetadata,
    target,
  )

  // Normalize metatags for validation
  const normalizedTags = normalizeMetatags(data.metatags)

  // Validate with both presence and quality checks
  const issues = sortIssuesBySeverity(
    validateSocialTags(normalizedTags, { checkPresence: true, checkQuality: true }),
  )

  // Count tags
  const ogCount = openGraph ? Object.keys(openGraph.tags).length : 0
  const twCount = twitter ? Object.keys(twitter.tags).length : 0

  return {
    target,
    openGraph,
    twitter,
    preview,
    counts: {
      openGraph: ogCount,
      twitter: twCount,
      total: ogCount + twCount,
    },
    issues,
  }
}
