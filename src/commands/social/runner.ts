/**
 * Social lens runner - extracts Open Graph and Twitter Card data.
 */
import { parseHTML } from 'linkedom'
import { buildPreview, type PageMetadata, type SocialTags } from './preview.js'
import type { SocialResult, SocialTagGroup } from './types.js'
import { validateSocialTags, sortIssuesBySeverity } from './validation.js'

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

  return {
    name,
    prefix,
    tags,
  }
}

/**
 * Build flat tags object for validation.
 */
function buildValidationInput(
  openGraph: SocialTagGroup | null,
  twitter: SocialTagGroup | null,
): Record<string, string | undefined> {
  const input: Record<string, string | undefined> = {}

  if (openGraph) {
    for (const [key, value] of Object.entries(openGraph.tags)) {
      input[key] = value
    }
  }

  if (twitter) {
    for (const [key, value] of Object.entries(twitter.tags)) {
      input[key] = value
    }
  }

  return input
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
  const pageMetadata: PageMetadata = {
    title: extractPageTitle(document),
    description: extractMetaDescription(document),
    canonicalUrl: extractCanonicalUrl(document),
  }

  // Build tag groups
  const openGraph = buildTagGroup('Open Graph', 'og:', allTags)
  const twitter = buildTagGroup('Twitter Cards', 'twitter:', allTags)

  // Build preview with fallbacks
  const socialTags: SocialTags = {
    openGraph: openGraph?.tags || {},
    twitter: twitter?.tags || {},
  }
  const preview = buildPreview(socialTags, pageMetadata, target)

  // Run validation
  const validationInput = buildValidationInput(openGraph, twitter)
  const issues = sortIssuesBySeverity(validateSocialTags(validationInput))

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
