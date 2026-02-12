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

import type { SocialPreview } from './types.js'

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
 * Build preview data using platform-accurate fallback chains.
 *
 * Matches how Facebook, Twitter, WhatsApp, etc. resolve preview content.
 */
export function buildPreview(
  tags: SocialTags,
  pageMetadata: PageMetadata,
  targetUrl: string,
): SocialPreview {
  const { openGraph: og, twitter: tw } = tags

  return {
    title: tw['twitter:title'] || og['og:title'] || pageMetadata.title || null,
    description:
      tw['twitter:description'] ||
      og['og:description'] ||
      pageMetadata.description ||
      null,
    image: tw['twitter:image'] || og['og:image'] || null,
    url: og['og:url'] || pageMetadata.canonicalUrl || targetUrl,
    siteName: og['og:site_name'] || null,
  }
}
