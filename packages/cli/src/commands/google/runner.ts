/**
 * Google lens runner - fetches and analyzes a page from Google's perspective.
 */

import { fetchHtmlContent, extractHeadings, extractLanguage  } from '@webspecs/core'
import { parseHTML } from 'linkedom'
import {
  GOOGLE_SCHEMA_TYPES,
  type GooglePageMetadata,
  type GoogleResult,
  type GoogleSchemaItem,
} from './types.js'

// ============================================================================
// Metadata Extraction
// ============================================================================

/**
 * Extract page title from <title> element.
 */
function extractTitle(document: Document): string | null {
  const titleEl = document.querySelector('title')
  return titleEl?.textContent?.trim() || null
}

/**
 * Extract meta description from <meta name="description">.
 */
function extractMetaDescription(document: Document): string | null {
  const metaEl = document.querySelector('meta[name="description"]')
  return metaEl?.getAttribute('content')?.trim() || null
}

/**
 * Extract canonical URL from <link rel="canonical">.
 */
function extractCanonical(document: Document): string | null {
  const linkEl = document.querySelector('link[rel="canonical"]')
  return linkEl?.getAttribute('href')?.trim() || null
}

/**
 * Extract all page metadata relevant to Google.
 */
function extractMetadata(document: Document): GooglePageMetadata {
  return {
    title: extractTitle(document),
    description: extractMetaDescription(document),
    canonical: extractCanonical(document),
    language: extractLanguage(document),
  }
}

// ============================================================================
// Schema Extraction
// ============================================================================

/**
 * Check if a schema type is recognized by Google for rich results.
 */
function isGoogleSchemaType(type: string): boolean {
  return GOOGLE_SCHEMA_TYPES.includes(type as (typeof GOOGLE_SCHEMA_TYPES)[number])
}

/**
 * Extract the @type value(s) from a JSON-LD object.
 * Handles both single types and arrays.
 */
function getSchemaTypes(schema: Record<string, unknown>): string[] {
  const typeValue = schema['@type']
  if (!typeValue) return []

  if (Array.isArray(typeValue)) {
    return typeValue.filter((t): t is string => typeof t === 'string')
  }

  if (typeof typeValue === 'string') {
    return [typeValue]
  }

  return []
}

/**
 * Extract JSON-LD scripts from HTML and filter to Google-recognized types.
 */
function extractGoogleSchemas(document: Document): GoogleSchemaItem[] {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]')
  const schemas: GoogleSchemaItem[] = []

  for (const script of Array.from(scripts)) {
    const content = script.textContent?.trim()
    if (!content) continue

    try {
      const parsed = JSON.parse(content)

      // Handle @graph arrays
      if (parsed['@graph'] && Array.isArray(parsed['@graph'])) {
        for (const item of parsed['@graph']) {
          if (typeof item === 'object' && item !== null) {
            const types = getSchemaTypes(item as Record<string, unknown>)
            for (const type of types) {
              if (isGoogleSchemaType(type)) {
                schemas.push({
                  type,
                  data: item as Record<string, unknown>,
                })
              }
            }
          }
        }
      }
      // Handle single object
      else if (typeof parsed === 'object' && parsed !== null) {
        const types = getSchemaTypes(parsed)
        for (const type of types) {
          if (isGoogleSchemaType(type)) {
            schemas.push({
              type,
              data: parsed,
            })
          }
        }
      }
      // Handle array of objects
      else if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (typeof item === 'object' && item !== null) {
            const types = getSchemaTypes(item as Record<string, unknown>)
            for (const type of types) {
              if (isGoogleSchemaType(type)) {
                schemas.push({
                  type,
                  data: item as Record<string, unknown>,
                })
              }
            }
          }
        }
      }
    } catch {
      // Invalid JSON, skip this script
    }
  }

  return schemas
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Fetch and analyze a page from Google's perspective.
 * Returns metadata, schemas, and heading structure.
 */
export async function fetchGoogle(target: string): Promise<GoogleResult> {
  const html = await fetchHtmlContent(target)
  const { document } = parseHTML(html)

  const metadata = extractMetadata(document)
  const schemas = extractGoogleSchemas(document)
  const headings = extractHeadings(document)

  return {
    target,
    metadata,
    schemas,
    headings,
    counts: {
      schemas: schemas.length,
      headings: headings.total,
    },
  }
}
