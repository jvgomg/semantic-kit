/**
 * Social preview building with platform-accurate fallback chains.
 *
 * Fallback behavior matches Facebook, Twitter, WhatsApp, etc:
 * - Title: twitter:title → og:title → <title>
 * - Description: twitter:description → og:description → <meta name="description">
 * - Image: twitter:image → og:image → null
 * - URL: og:url → <link rel="canonical"> → target URL
 * - Site name: og:site_name → null
 *
 * @see research/topics/social-metadata/open-graph-validation.md
 */

import { parseHTML } from 'linkedom'

// ============================================================================
// Types
// ============================================================================

/**
 * Extracted metadata from the page for fallback purposes.
 */
export interface PageMetadata {
  /** Content of <title> element */
  title: string | null
  /** Content of <meta name="description"> */
  description: string | null
  /** Content of <link rel="canonical"> href */
  canonicalUrl: string | null
}

/**
 * Social meta tags organized by prefix.
 */
export interface SocialTags {
  /** Open Graph tags (og:*) */
  openGraph: Record<string, string>
  /** Twitter Card tags (twitter:*) */
  twitter: Record<string, string>
}

/**
 * Resolved preview data for display.
 * Uses platform-accurate fallback chains.
 */
export interface SocialPreview {
  /** Title: twitter:title → og:title → <title> */
  title: string | null
  /** Description: twitter:description → og:description → meta description */
  description: string | null
  /** Image: twitter:image → og:image → null */
  image: string | null
  /** URL: og:url → canonical → target URL */
  url: string
  /** Site name: og:site_name → null */
  siteName: string | null
}

// ============================================================================
// Page Metadata Extraction
// ============================================================================

/**
 * Extract page metadata for preview fallbacks using linkedom.
 *
 * Extracts:
 * - <title> element content
 * - <meta name="description"> content
 * - <link rel="canonical"> href
 */
export function extractPageMetadata(html: string): PageMetadata {
  const { document } = parseHTML(html)

  // Extract <title>
  const titleElement = document.querySelector('title')
  const title = titleElement?.textContent?.trim() || null

  // Extract <meta name="description">
  const descriptionMeta = document.querySelector('meta[name="description"]')
  const description = descriptionMeta?.getAttribute('content')?.trim() || null

  // Extract <link rel="canonical">
  const canonicalLink = document.querySelector('link[rel="canonical"]')
  const canonicalUrl = canonicalLink?.getAttribute('href')?.trim() || null

  return { title, description, canonicalUrl }
}

// ============================================================================
// Preview Building
// ============================================================================

/**
 * Build preview data using platform-accurate fallback chains.
 *
 * Matches how Facebook, Twitter, WhatsApp, etc. resolve preview content.
 */
export function buildSocialPreview(
  openGraph: Record<string, string>,
  twitter: Record<string, string>,
  pageMetadata: PageMetadata,
  targetUrl: string,
): SocialPreview {
  return {
    title:
      twitter['twitter:title'] ||
      openGraph['og:title'] ||
      pageMetadata.title ||
      null,
    description:
      twitter['twitter:description'] ||
      openGraph['og:description'] ||
      pageMetadata.description ||
      null,
    image: twitter['twitter:image'] || openGraph['og:image'] || null,
    url: openGraph['og:url'] || pageMetadata.canonicalUrl || targetUrl,
    siteName: openGraph['og:site_name'] || null,
  }
}

/**
 * Build preview data from SocialTags format.
 *
 * This is a convenience wrapper for buildSocialPreview that accepts
 * the SocialTags format used in older code.
 */
export function buildPreview(
  tags: SocialTags,
  pageMetadata: PageMetadata,
  targetUrl: string,
): SocialPreview {
  return buildSocialPreview(tags.openGraph, tags.twitter, pageMetadata, targetUrl)
}
