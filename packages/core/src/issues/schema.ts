/**
 * Schema command issue generation.
 */
import type { SchemaResult, SchemaCompareResult } from '../results.js'
import type { AnyIssue } from '../types.js'

// ============================================================================
// Issue Codes
// ============================================================================

export const SCHEMA_CODES = {
  NO_STRUCTURED_DATA: 'schema-no-data',
  TIMEOUT: 'schema-timeout',
  NO_DIFFERENCES: 'schema-no-diff',
  JSONLD_ADDED: 'schema-jsonld-added',
  MICRODATA_ADDED: 'schema-microdata-added',
  RDFA_ADDED: 'schema-rdfa-added',
  OG_CHANGED: 'schema-og-changed',
  TWITTER_CHANGED: 'schema-twitter-changed',
} as const

export type SchemaCode = (typeof SCHEMA_CODES)[keyof typeof SCHEMA_CODES]

// ============================================================================
// Input Types
// ============================================================================

export interface SchemaIssueInput {
  result: SchemaResult
}

export interface SchemaCompareIssueInput {
  result: SchemaCompareResult
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Check if result has any structured data
 */
function hasAnyData(result: SchemaResult): boolean {
  const jsonldSchemas = Object.keys(result.jsonld).filter(
    (k) => k !== 'undefined',
  )
  const microdataSchemas = Object.keys(result.microdata).filter(
    (k) => k !== 'undefined',
  )
  const rdfaSchemas = Object.keys(result.rdfa).filter((k) => k !== 'undefined')

  return (
    jsonldSchemas.length > 0 ||
    microdataSchemas.length > 0 ||
    rdfaSchemas.length > 0 ||
    result.openGraph !== null ||
    result.twitter !== null
  )
}

// ============================================================================
// Issue Builders
// ============================================================================

/**
 * Build an array of issues from the schema result.
 *
 * Issues include:
 * 1. No structured data (info) - when no data found at all
 * 2. Validation issues from result.issues (presence + quality checks)
 */
export function buildSchemaIssues(input: SchemaIssueInput): AnyIssue[] {
  const { result } = input
  const issues: AnyIssue[] = []

  // 1. No structured data found
  if (!hasAnyData(result)) {
    issues.push({
      type: 'info',
      severity: 'low',
      code: SCHEMA_CODES.NO_STRUCTURED_DATA,
      title: 'No Structured Data Found',
      description: 'This page has no structured data.',
      tip: 'Consider adding JSON-LD for rich search results, Open Graph for social sharing.',
    })
    return issues
  }

  // 2. Include validation issues (presence + quality checks)
  // These are already SocialValidationIssue which extends Issue
  if (result.issues) {
    issues.push(...result.issues)
  }

  return issues
}

/**
 * Build an array of issues from the schema compare result.
 */
export function buildSchemaCompareIssues(
  input: SchemaCompareIssueInput,
): AnyIssue[] {
  const { result } = input
  const { comparison, timedOut } = result
  const issues: AnyIssue[] = []

  // 1. Timeout warning
  if (timedOut) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      code: SCHEMA_CODES.TIMEOUT,
      title: 'Page Load Timeout',
      description:
        'Rendering exceeded timeout. Analysis shows partial content.',
      tip: 'Increase timeout with --timeout or optimize page load.',
    })
  }

  // 2. No differences found
  if (!comparison.hasDifferences) {
    issues.push({
      type: 'info',
      severity: 'low',
      code: SCHEMA_CODES.NO_DIFFERENCES,
      title: 'No Schema Differences',
      description:
        'Static and JavaScript-rendered pages have identical structured data.',
    })
    return issues
  }

  // 3. JSON-LD added by JavaScript
  if (comparison.jsonldAdded > 0) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      code: SCHEMA_CODES.JSONLD_ADDED,
      title: 'JSON-LD Added by JavaScript',
      description: `${comparison.jsonldAdded} JSON-LD schema type${comparison.jsonldAdded === 1 ? '' : 's'} only appear after JavaScript execution.`,
      tip: 'Search engines may not see JavaScript-injected schemas. Consider server-side rendering.',
    })
  }

  // 4. Microdata added by JavaScript
  if (comparison.microdataAdded > 0) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      code: SCHEMA_CODES.MICRODATA_ADDED,
      title: 'Microdata Added by JavaScript',
      description: `${comparison.microdataAdded} Microdata schema type${comparison.microdataAdded === 1 ? '' : 's'} only appear after JavaScript execution.`,
    })
  }

  // 5. RDFa added by JavaScript
  if (comparison.rdfaAdded > 0) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      code: SCHEMA_CODES.RDFA_ADDED,
      title: 'RDFa Added by JavaScript',
      description: `${comparison.rdfaAdded} RDFa schema type${comparison.rdfaAdded === 1 ? '' : 's'} only appear after JavaScript execution.`,
    })
  }

  // 6. Open Graph changed
  if (comparison.openGraphChanged) {
    issues.push({
      type: 'info',
      severity: 'low',
      code: SCHEMA_CODES.OG_CHANGED,
      title: 'Open Graph Tags Changed',
      description:
        'Open Graph tags differ between static and JavaScript-rendered pages.',
    })
  }

  // 7. Twitter Cards changed
  if (comparison.twitterChanged) {
    issues.push({
      type: 'info',
      severity: 'low',
      code: SCHEMA_CODES.TWITTER_CHANGED,
      title: 'Twitter Card Tags Changed',
      description:
        'Twitter Card tags differ between static and JavaScript-rendered pages.',
    })
  }

  return issues
}
