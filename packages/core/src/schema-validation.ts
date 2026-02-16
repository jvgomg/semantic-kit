import { fetchHtmlContent } from './fetch.js'
import type { SchemaTestResult } from './results.js'

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Internal result type from structured-data-testing-tool
 */
export interface StructuredDataResult {
  tests: SchemaTestResult[]
  passed: SchemaTestResult[]
  failed: SchemaTestResult[]
  warnings: SchemaTestResult[]
  optional: SchemaTestResult[]
  skipped: SchemaTestResult[]
  groups: string[]
  schemas: string[]
  structuredData: {
    metatags: Record<string, string[]>
    jsonld: Record<string, unknown[]>
    microdata: Record<string, unknown[]>
    rdfa: Record<string, unknown[]>
  }
}

/**
 * A preset for structured data validation
 */
export interface Preset {
  name: string
  description?: string
  presets?: Preset[]
  tests?: unknown[]
}

/**
 * Valid preset names (lowercase for CLI, mapped to library's PascalCase)
 */
export const VALID_PRESETS = [
  'google',
  'twitter',
  'facebook',
  'social-media',
] as const

export type PresetName = (typeof VALID_PRESETS)[number]

/**
 * Map of preset names to preset objects
 */
export interface PresetMap {
  google: Preset
  twitter: Preset
  facebook: Preset
  'social-media': Preset
}

/**
 * Result of schema validation with grouping information
 */
export interface SchemaValidationResult {
  testResult: StructuredDataResult
  requiredGroups: string[]
  infoGroups: string[]
  detectedDisplayNames: string[]
  requiredFailedCount: number
}

// ============================================================================
// Preset Loading
// ============================================================================

let cachedPresetMap: PresetMap | null = null

/**
 * Get the preset map (cached)
 *
 * Loads presets from the structured-data-testing-tool library using require().
 * Bun supports require() directly in ESM.
 *
 * @returns Map of preset names to preset objects
 */
function getPresetMap(): PresetMap {
  if (cachedPresetMap) return cachedPresetMap

  const { Google, Twitter, Facebook, SocialMedia } =
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('structured-data-testing-tool/presets') as typeof import('structured-data-testing-tool/presets')

  cachedPresetMap = {
    google: Google,
    twitter: Twitter,
    facebook: Facebook,
    'social-media': SocialMedia,
  }

  return cachedPresetMap
}

/**
 * Load presets by name from structured-data-testing-tool.
 *
 * Accepts lowercase/kebab-case names and maps to library's PascalCase.
 * Throws on unknown preset names.
 *
 * @param presetNames - Array of preset names to load (e.g., ['google', 'twitter'])
 * @returns Array of loaded preset objects
 * @throws Error if any preset names are unknown
 *
 * @example
 * ```typescript
 * const presets = loadPresets(['google', 'facebook'])
 * // Returns [Google preset, Facebook preset]
 * ```
 */
function loadPresets(presetNames: string[]): Preset[] {
  const presetMap = getPresetMap()

  const presets: Preset[] = []
  const unknownPresets: string[] = []

  for (const name of presetNames) {
    const normalizedName = name.trim().toLowerCase() as PresetName
    if (normalizedName in presetMap) {
      presets.push(presetMap[normalizedName])
    } else {
      unknownPresets.push(name.trim())
    }
  }

  // Error on unknown presets
  if (unknownPresets.length > 0) {
    const unknown = unknownPresets.map((p) => `"${p}"`).join(', ')
    const valid = VALID_PRESETS.join(', ')
    throw new Error(`Unknown preset(s): ${unknown}\nValid presets: ${valid}`)
  }

  return presets
}

/**
 * Detect which standards are present in the HTML metatags.
 *
 * Checks for Open Graph (og:*) and Twitter Card (twitter:*) tags.
 *
 * @param metatags - Extracted metatags from HTML
 * @returns Object indicating which standards were detected
 *
 * @example
 * ```typescript
 * const metatags = {
 *   'og:title': ['My Page'],
 *   'twitter:card': ['summary']
 * }
 * const { hasOpenGraph, hasTwitter } = detectStandards(metatags)
 * // hasOpenGraph = true, hasTwitter = true
 * ```
 */
function detectStandards(metatags: Record<string, string[]>): {
  hasOpenGraph: boolean
  hasTwitter: boolean
} {
  const tagNames = Object.keys(metatags)
  return {
    hasOpenGraph: tagNames.some((t) => t.startsWith('og:')),
    hasTwitter: tagNames.some((t) => t.startsWith('twitter:')),
  }
}

/**
 * Get presets for detected standards.
 *
 * Maps detected Open Graph tags to Facebook preset and Twitter tags to Twitter preset.
 *
 * @param metatags - Extracted metatags from HTML
 * @returns Object with presets array and detected preset names
 *
 * @example
 * ```typescript
 * const metatags = { 'og:title': ['My Page'] }
 * const { presets, detected } = getDetectedPresets(metatags)
 * // detected = ['facebook'], presets = [Facebook preset]
 * ```
 */
function getDetectedPresets(metatags: Record<string, string[]>): {
  presets: Preset[]
  detected: string[]
} {
  const { hasOpenGraph, hasTwitter } = detectStandards(metatags)
  const presetMap = getPresetMap()

  const presets: Preset[] = []
  const detected: string[] = []

  if (hasOpenGraph) {
    presets.push(presetMap.facebook)
    detected.push('facebook')
  }
  if (hasTwitter) {
    presets.push(presetMap.twitter)
    detected.push('twitter')
  }

  return { presets, detected }
}

/**
 * Extract structured data from HTML (for detection).
 *
 * Uses web-auto-extractor to parse metatags, JSON-LD, microdata, and RDFa.
 * Bun supports require() directly in ESM.
 *
 * @param html - HTML content to extract structured data from
 * @returns Extracted structured data object
 *
 * @example
 * ```typescript
 * const html = '<meta property="og:title" content="My Page">'
 * const data = extractStructuredData(html)
 * // data.metatags = { 'og:title': ['My Page'] }
 * ```
 */
function extractStructuredData(
  html: string,
): StructuredDataResult['structuredData'] {
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
 * Test structured data in HTML content.
 *
 * Runs structured-data-testing-tool validation against the HTML with specified presets.
 * Handles the case where structuredDataTest rejects on validation failures but still
 * provides the full result.
 *
 * @param html - HTML content to test
 * @param presets - Array of presets to validate against
 * @returns Full validation result including passed, failed, and other test results
 * @throws Error if validation fails for reasons other than test failures
 *
 * @example
 * ```typescript
 * const html = '<meta property="og:title" content="My Page">'
 * const presets = loadPresets(['facebook'])
 * const result = await testStructuredData(html, presets)
 * // result.passed, result.failed, result.warnings, etc.
 * ```
 */
async function testStructuredData(
  html: string,
  presets: Preset[],
): Promise<StructuredDataResult> {
  // Dynamic import for CommonJS module
  const { structuredDataTest } = await import('structured-data-testing-tool')

  try {
    const result = await structuredDataTest(html, {
      presets: presets.length > 0 ? presets : undefined,
    })
    return result as StructuredDataResult
  } catch (error) {
    // structuredDataTest rejects on validation failures
    // but still provides the full result
    if (error && typeof error === 'object' && 'res' in error) {
      return (error as { res: StructuredDataResult }).res
    }
    throw error
  }
}

/**
 * Filter test results by group (Facebook, Twitter, etc.).
 *
 * @param results - Array of test results
 * @param groups - Array of group names to filter by
 * @returns Filtered array of test results
 *
 * @example
 * ```typescript
 * const results = [
 *   { group: 'Facebook', test: 'og:title', ... },
 *   { group: 'Twitter', test: 'twitter:card', ... }
 * ]
 * const filtered = filterResultsByGroup(results, ['Facebook'])
 * // Returns only Facebook results
 * ```
 */
function filterResultsByGroup(
  results: SchemaTestResult[],
  groups: string[],
): SchemaTestResult[] {
  return results.filter((r) => groups.includes(r.group))
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Fetch and validate structured data from a URL or file.
 *
 * This is the main entry point for structured data validation. It:
 * 1. Fetches HTML content from the target
 * 2. Extracts structured data (metatags, JSON-LD, etc.)
 * 3. Detects which standards are present (Open Graph, Twitter Cards)
 * 4. Runs validation tests using specified or detected presets
 * 5. Separates required vs informational validation results
 *
 * @param target - URL or file path to validate
 * @param presetsOption - Comma-separated list of preset names (e.g., 'google,facebook')
 *                        If undefined, only detected presets are validated
 * @returns Validation result with test results and grouping information
 * @throws Error if target cannot be fetched or presets are invalid
 *
 * @example
 * ```typescript
 * // Auto-detect standards
 * const result = await validateStructuredData('https://example.com', undefined)
 *
 * // Validate specific presets
 * const result = await validateStructuredData('https://example.com', 'google,facebook')
 *
 * // Access results
 * console.log(result.testResult.passed) // Passed tests
 * console.log(result.testResult.failed) // Failed tests
 * console.log(result.requiredFailedCount) // Number of required failures
 * ```
 */
export async function validateStructuredData(
  target: string,
  presetsOption: string | undefined,
): Promise<SchemaValidationResult> {
  const html = await fetchHtmlContent(target)
  const extracted = extractStructuredData(html)

  const { presets: detectedPresets, detected: detectedNames } =
    getDetectedPresets(extracted.metatags)

  const requiredNames = presetsOption
    ? presetsOption.split(',').map((s) => s.trim().toLowerCase())
    : []
  const requiredPresets = presetsOption ? loadPresets(requiredNames) : []

  let presetsToValidate: Preset[]
  let requiredGroups: string[]
  let infoGroups: string[]

  const groupMap: Record<string, string> = {
    facebook: 'Facebook',
    twitter: 'Twitter',
    google: 'Google',
    'social-media': 'SocialMedia',
  }

  if (presetsOption) {
    const allPresets = [...requiredPresets]
    const requiredSet = new Set(requiredNames)

    for (let i = 0; i < detectedNames.length; i++) {
      if (!requiredSet.has(detectedNames[i]!)) {
        allPresets.push(detectedPresets[i]!)
      }
    }

    presetsToValidate = allPresets
    requiredGroups = requiredNames.map((n) => groupMap[n] || n)
    infoGroups = detectedNames
      .filter((n) => !requiredSet.has(n))
      .map((n) => groupMap[n] || n)
  } else {
    presetsToValidate = detectedPresets
    requiredGroups = detectedNames.map((n) => groupMap[n] || n)
    infoGroups = []
  }

  const testResult = await testStructuredData(html, presetsToValidate)

  const requiredFailed = presetsOption
    ? filterResultsByGroup(testResult.failed, requiredGroups)
    : testResult.failed

  const displayMap: Record<string, string> = {
    facebook: 'Open Graph',
    twitter: 'Twitter Cards',
  }
  const detectedDisplayNames = detectedNames.map((n) => displayMap[n] || n)

  return {
    testResult,
    requiredGroups,
    infoGroups,
    detectedDisplayNames,
    requiredFailedCount: requiredFailed.length,
  }
}
