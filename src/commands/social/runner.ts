/**
 * Social lens runner - extracts Open Graph and Twitter Card data.
 */
import { parseHTML } from 'linkedom'
import type { SocialResult, SocialTagGroup, SocialPreview } from './types.js'
import { OPEN_GRAPH_TAGS, TWITTER_CARD_TAGS } from './types.js'

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

/**
 * Extract all meta tags from the document.
 * Returns a map of property/name to content values.
 */
function extractMetaTags(document: Document): Record<string, string[]> {
  const tags: Record<string, string[]> = {}

  // Get all meta elements
  const metaElements = document.querySelectorAll('meta')

  for (const meta of metaElements) {
    // Check for property attribute (Open Graph, Facebook)
    const property = meta.getAttribute('property')
    // Check for name attribute (Twitter, general)
    const name = meta.getAttribute('name')
    const content = meta.getAttribute('content')

    const key = property || name
    if (!key || !content) continue

    if (!tags[key]) {
      tags[key] = []
    }
    tags[key].push(content)
  }

  return tags
}

/**
 * Extract page title from document.
 */
function extractPageTitle(document: Document): string | null {
  const titleElement = document.querySelector('title')
  return titleElement?.textContent?.trim() || null
}

/**
 * Extract meta description from document.
 */
function extractMetaDescription(document: Document): string | null {
  const meta = document.querySelector('meta[name="description"]')
  return meta?.getAttribute('content')?.trim() || null
}

/**
 * Extract canonical URL from document.
 */
function extractCanonicalUrl(document: Document): string | null {
  const link = document.querySelector('link[rel="canonical"]')
  return link?.getAttribute('href')?.trim() || null
}

// ============================================================================
// Analysis Functions
// ============================================================================

/**
 * Build a social tag group from extracted meta tags.
 */
function buildTagGroup(
  name: string,
  prefix: string,
  allTags: Record<string, string[]>,
  requiredTags: readonly string[],
  recommendedTags: readonly string[],
  imageOptionalTags?: readonly string[],
): SocialTagGroup | null {
  // Filter to tags with this prefix
  const tags: Record<string, string> = {}
  for (const [key, values] of Object.entries(allTags)) {
    if (key.startsWith(prefix)) {
      tags[key] = values[0] || ''
    }
  }

  // No tags found for this group
  if (Object.keys(tags).length === 0) {
    return null
  }

  const foundNames = new Set(Object.keys(tags))
  const missingRequired = requiredTags.filter((t) => !foundNames.has(t))
  const missingRecommended = recommendedTags.filter((t) => !foundNames.has(t))

  // Check for missing image-related tags when og:image is present
  let missingImageTags: string[] | undefined
  if (imageOptionalTags && tags['og:image']) {
    missingImageTags = imageOptionalTags.filter((t) => !foundNames.has(t))
  }

  return {
    name,
    prefix,
    tags,
    missingRequired,
    missingRecommended,
    isComplete: missingRequired.length === 0,
    missingImageTags,
  }
}

/**
 * Calculate completeness percentage for a tag group.
 */
function calculateCompleteness(
  group: SocialTagGroup | null,
  requiredTags: readonly string[],
  recommendedTags: readonly string[],
): number | null {
  if (!group) return null

  const presentRequired = requiredTags.length - group.missingRequired.length
  const presentRecommended = recommendedTags.length - group.missingRecommended.length

  // Weight required tags more heavily (60% for required, 40% for recommended)
  const requiredScore =
    requiredTags.length > 0 ? (presentRequired / requiredTags.length) * 60 : 60
  const recommendedScore =
    recommendedTags.length > 0
      ? (presentRecommended / recommendedTags.length) * 40
      : 40

  return Math.round(requiredScore + recommendedScore)
}

/**
 * Build preview data with fallbacks.
 * Priority: Twitter -> Open Graph -> Page metadata
 */
function buildPreview(
  openGraph: SocialTagGroup | null,
  twitter: SocialTagGroup | null,
  pageTitle: string | null,
  pageDescription: string | null,
  canonicalUrl: string | null,
): SocialPreview {
  const og = openGraph?.tags || {}
  const tw = twitter?.tags || {}

  return {
    title: tw['twitter:title'] || og['og:title'] || pageTitle,
    description:
      tw['twitter:description'] || og['og:description'] || pageDescription,
    image: tw['twitter:image'] || og['og:image'] || null,
    url: og['og:url'] || canonicalUrl || null,
    siteName: og['og:site_name'] || null,
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
  const { document } = parseHTML(html)

  // Extract all meta tags
  const allTags = extractMetaTags(document)

  // Extract page metadata for fallbacks
  const pageTitle = extractPageTitle(document)
  const pageDescription = extractMetaDescription(document)
  const canonicalUrl = extractCanonicalUrl(document)

  // Build tag groups
  const openGraph = buildTagGroup(
    'Open Graph',
    'og:',
    allTags,
    OPEN_GRAPH_TAGS.required,
    OPEN_GRAPH_TAGS.recommended,
    OPEN_GRAPH_TAGS.imageOptional,
  )

  const twitter = buildTagGroup(
    'Twitter Cards',
    'twitter:',
    allTags,
    TWITTER_CARD_TAGS.required,
    TWITTER_CARD_TAGS.recommended,
  )

  // Build preview with fallbacks
  const preview = buildPreview(
    openGraph,
    twitter,
    pageTitle,
    pageDescription,
    canonicalUrl,
  )

  // Calculate completeness
  const completeness = {
    openGraph: calculateCompleteness(
      openGraph,
      OPEN_GRAPH_TAGS.required,
      OPEN_GRAPH_TAGS.recommended,
    ),
    twitter: calculateCompleteness(
      twitter,
      TWITTER_CARD_TAGS.required,
      TWITTER_CARD_TAGS.recommended,
    ),
  }

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
    completeness,
  }
}
