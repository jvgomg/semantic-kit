/**
 * Google-specific page analysis.
 * Analyzes pages from Google's perspective, extracting metadata, structured data,
 * and content signals that Google uses for indexing and rich results.
 */

import { fetchHtmlContent } from './fetch.js'
import { parseHTML } from './html-parser.js'
import type {
  GoogleResult,
  GooglePageMetadata,
  GoogleSchemaItem,
} from './results.js'
import { extractHeadings, extractLanguage } from './structure.js'

// ============================================================================
// Constants
// ============================================================================

/**
 * Google-recognized JSON-LD schema types for rich results.
 * Based on Google Search Central documentation.
 *
 * These are the structured data types that Google actively uses to generate
 * enhanced search results (rich snippets, knowledge panels, etc.).
 *
 * @see https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
 */
export const GOOGLE_SCHEMA_TYPES = [
  // Content types
  'Article',
  'NewsArticle',
  'BlogPosting',
  'TechArticle',

  // E-commerce
  'Product',
  'Offer',
  'AggregateOffer',

  // Reviews
  'Review',
  'AggregateRating',

  // Recipes
  'Recipe',

  // Events
  'Event',

  // FAQ & How-to
  'FAQPage',
  'HowTo',
  'HowToStep',
  'HowToSection',

  // Business
  'LocalBusiness',
  'Organization',
  'Corporation',

  // People
  'Person',

  // Navigation
  'BreadcrumbList',

  // Media
  'VideoObject',
  'ImageObject',

  // Software
  'SoftwareApplication',
  'MobileApplication',
  'WebApplication',

  // Jobs
  'JobPosting',

  // Courses
  'Course',

  // Books
  'Book',

  // Search features
  'WebSite',
  'SearchAction',
] as const

// ============================================================================
// Metadata Extraction
// ============================================================================

/**
 * Extract page title from the <title> element.
 *
 * The title element is one of the most important ranking signals for Google.
 * It appears in search results and browser tabs.
 *
 * @param document - The DOM document to extract from
 * @returns The page title, or null if not found
 */
function extractTitle(document: Document): string | null {
  const titleEl = document.querySelector('title')
  return titleEl?.textContent?.trim() || null
}

/**
 * Extract meta description from <meta name="description">.
 *
 * While not a direct ranking factor, the meta description often appears
 * as the snippet text in search results.
 *
 * @param document - The DOM document to extract from
 * @returns The meta description content, or null if not found
 */
function extractMetaDescription(document: Document): string | null {
  const metaEl = document.querySelector('meta[name="description"]')
  return metaEl?.getAttribute('content')?.trim() || null
}

/**
 * Extract canonical URL from <link rel="canonical">.
 *
 * The canonical URL tells Google which version of a page to index when
 * multiple URLs have similar or duplicate content.
 *
 * @param document - The DOM document to extract from
 * @returns The canonical URL, or null if not specified
 */
function extractCanonical(document: Document): string | null {
  const linkEl = document.querySelector('link[rel="canonical"]')
  return linkEl?.getAttribute('href')?.trim() || null
}

/**
 * Extract all page metadata relevant to Google.
 *
 * Collects the core metadata signals that Google uses for indexing:
 * - Title: Primary ranking signal and search result headline
 * - Description: Search result snippet text
 * - Canonical: Preferred URL for indexing
 * - Language: Content language declaration
 *
 * @param document - The DOM document to extract from
 * @returns Complete metadata object with all available fields
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
 *
 * Only certain schema.org types are used by Google to generate enhanced
 * search features. This function checks if a type is in that list.
 *
 * @param type - The schema @type value to check
 * @returns True if Google recognizes this type for rich results
 */
function isGoogleSchemaType(type: string): boolean {
  return GOOGLE_SCHEMA_TYPES.includes(
    type as (typeof GOOGLE_SCHEMA_TYPES)[number],
  )
}

/**
 * Extract the @type value(s) from a JSON-LD object.
 *
 * Schema.org objects can have a single type (string) or multiple types (array).
 * This function normalizes both cases into an array of strings.
 *
 * @param schema - The parsed JSON-LD object
 * @returns Array of type strings found in the object
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
 * Extract JSON-LD structured data from HTML, filtered to Google-recognized types.
 *
 * Parses all <script type="application/ld+json"> elements and extracts only
 * the schema types that Google uses for rich results. Handles:
 * - Single objects
 * - Arrays of objects
 * - @graph arrays (common in WordPress and other CMSs)
 * - Multiple types per object
 *
 * Invalid JSON is silently skipped to handle malformed markup gracefully.
 *
 * @param document - The DOM document to extract from
 * @returns Array of schema items with type and data
 */
function extractGoogleSchemas(document: Document): GoogleSchemaItem[] {
  const scripts = document.querySelectorAll(
    'script[type="application/ld+json"]',
  )
  const schemas: GoogleSchemaItem[] = []

  for (const script of Array.from(scripts)) {
    const content = script.textContent?.trim()
    if (!content) continue

    try {
      const parsed = JSON.parse(content)

      // Handle @graph arrays (common in SEO plugins)
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
 * Analyze a page from Google's perspective.
 *
 * Fetches and analyzes a URL or local HTML file to extract the signals that
 * Google uses for indexing and search results:
 *
 * - **Metadata**: Title, description, canonical URL, language
 * - **Structured Data**: JSON-LD schemas recognized for rich results
 * - **Headings**: Content hierarchy and structure (H1-H6)
 *
 * This provides insight into how Googlebot sees and indexes your page.
 *
 * @param target - URL to fetch or local file path to read
 * @returns Analysis result with metadata, schemas, headings, and summary counts
 * @throws {Error} If the URL cannot be fetched or file cannot be read
 *
 * @example
 * ```typescript
 * const result = await analyzeForGoogle('https://example.com')
 * console.log(result.metadata.title) // Page title as Google sees it
 * console.log(result.schemas.length) // Number of rich result schemas found
 * ```
 */
export async function analyzeForGoogle(target: string): Promise<GoogleResult> {
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
