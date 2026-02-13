/**
 * Structured data extraction using web-auto-extractor.
 *
 * Provides a unified interface for extracting metatags, JSON-LD,
 * microdata, and RDFa from HTML content.
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Raw structured data extracted from HTML.
 */
export interface StructuredData {
  /** Meta tags as key -> array of values (WAE format) */
  metatags: Record<string, string[]>
  /** JSON-LD schemas grouped by @type */
  jsonld: Record<string, unknown[]>
  /** Microdata schemas grouped by itemtype */
  microdata: Record<string, unknown[]>
  /** RDFa schemas grouped by typeof */
  rdfa: Record<string, unknown[]>
}

/**
 * Metatags grouped by prefix.
 */
export interface GroupedMetatags {
  /** Open Graph tags (og:*) as normalized key-value pairs */
  openGraph: Record<string, string>
  /** Twitter Card tags (twitter:*) as normalized key-value pairs */
  twitter: Record<string, string>
  /** All other metatags as normalized key-value pairs */
  other: Record<string, string>
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Extract structured data from HTML using web-auto-extractor.
 *
 * This is the single source of truth for metatag extraction across all commands.
 */
export function extractStructuredData(html: string): StructuredData {
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

/**
 * Normalize raw metatags from WAE format (string[]) to single values (string | undefined).
 *
 * Takes the first value for each key, which matches how browsers handle duplicate tags.
 */
export function normalizeMetatags(
  metatags: Record<string, string[]>,
): Record<string, string | undefined> {
  const normalized: Record<string, string | undefined> = {}

  for (const [key, values] of Object.entries(metatags)) {
    if (key === 'undefined') continue
    normalized[key] = values[0]
  }

  return normalized
}

/**
 * Group metatags by prefix into Open Graph, Twitter Cards, and other tags.
 *
 * Returns normalized key-value pairs (first value wins) for each group.
 */
export function groupMetatagsByPrefix(
  metatags: Record<string, string[]>,
): GroupedMetatags {
  const openGraph: Record<string, string> = {}
  const twitter: Record<string, string> = {}
  const other: Record<string, string> = {}

  for (const [key, values] of Object.entries(metatags)) {
    if (key === 'undefined') continue
    const value = values[0] || ''

    if (key.startsWith('og:')) {
      openGraph[key] = value
    } else if (key.startsWith('twitter:')) {
      twitter[key] = value
    } else {
      other[key] = value
    }
  }

  return { openGraph, twitter, other }
}
