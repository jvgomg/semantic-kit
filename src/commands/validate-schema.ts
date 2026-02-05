import type { ValidateSchemaResult, SchemaTestResult } from '../lib/results.js'

// ============================================================================
// Types
// ============================================================================

type OutputFormat = 'full' | 'compact' | 'json'

const VALID_FORMATS: OutputFormat[] = ['full', 'compact', 'json']

interface ValidateSchemaOptions {
  presets?: string
  format?: OutputFormat
}

// Internal result type from structured-data-testing-tool
interface StructuredDataResult {
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

interface Preset {
  name: string
  description?: string
  presets?: Preset[]
  tests?: unknown[]
}

// ============================================================================
// Preset Loading
// ============================================================================

/**
 * Valid preset names (lowercase for CLI, mapped to library's PascalCase)
 */
const VALID_PRESETS = ['google', 'twitter', 'facebook', 'social-media'] as const
type PresetName = (typeof VALID_PRESETS)[number]

interface PresetMap {
  google: Preset
  twitter: Preset
  facebook: Preset
  'social-media': Preset
}

let cachedPresetMap: PresetMap | null = null

/**
 * Get the preset map (cached)
 * Bun supports require() directly in ESM
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
 * Accepts lowercase/kebab-case names and maps to library's PascalCase.
 * Throws on unknown preset names.
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
 * Detect which standards are present in the HTML
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
 * Get presets for detected standards
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

// ============================================================================
// Output Formatting
// ============================================================================

/**
 * Format the header showing what was scanned
 */
function formatHeader(
  target: string,
  schemas: string[],
  detectedStandards?: string[],
): string {
  const lines: string[] = []

  lines.push('┌─────────────────────────────────────────────────────────────')
  lines.push('│ Structured Data Validation')
  lines.push(`│ ${target}`)
  lines.push('├─────────────────────────────────────────────────────────────')

  if (schemas.length > 0) {
    lines.push(`│ Schemas: ${schemas.join(', ')}`)
  }

  if (detectedStandards && detectedStandards.length > 0) {
    lines.push(`│ Metatags: ${detectedStandards.join(', ')}`)
  }

  if (
    schemas.length === 0 &&
    (!detectedStandards || detectedStandards.length === 0)
  ) {
    lines.push('│ No structured data found')
  }

  lines.push('└─────────────────────────────────────────────────────────────')

  return lines.join('\n')
}

/**
 * Format a single test result
 */
function formatSchemaTestResult(test: SchemaTestResult): string {
  const icon = test.passed ? '✓' : test.warning ? '⚠' : '✗'

  let line = `  ${icon} ${test.description || test.test}`

  if (test.type && test.type !== 'any') {
    line += ` (${test.type})`
  }

  if (test.error) {
    line += `\n      ${test.error.message}`
    if (test.error.expected !== undefined) {
      line += `\n      Expected: ${JSON.stringify(test.error.expected)}`
    }
    if (test.error.found !== undefined) {
      line += `\n      Found: ${JSON.stringify(test.error.found)}`
    }
  }

  return line
}

/**
 * Format compact summary output
 */
function formatCompact(
  result: StructuredDataResult,
  target: string,
  requiredGroups?: string[],
  detectedStandards?: string[],
): string {
  const lines: string[] = []

  lines.push('┌─────────────────────────────────────────────────────────────')
  lines.push('│ Structured Data Validation')
  lines.push(`│ ${target}`)
  lines.push('├─────────────────────────────────────────────────────────────')

  if (result.schemas.length > 0) {
    lines.push(`│ Schemas:  ${result.schemas.join(', ')}`)
  }

  if (detectedStandards && detectedStandards.length > 0) {
    lines.push(`│ Metatags: ${detectedStandards.join(', ')}`)
  }

  // Filter to required failures if --require was specified
  const isRequired = (group: string) =>
    !requiredGroups || requiredGroups.includes(group)

  const requiredPassed = result.passed.filter((t) => isRequired(t.group))
  const requiredFailed = result.failed.filter((t) => isRequired(t.group))
  const requiredWarnings = result.warnings.filter((t) => isRequired(t.group))

  lines.push(
    `│ Passed:   ${requiredPassed.length} · Failed: ${requiredFailed.length} · Warnings: ${requiredWarnings.length}`,
  )

  if (requiredFailed.length === 0) {
    lines.push('│ ✓ All required tests passed')
  } else {
    lines.push(`│ ✗ ${requiredFailed.length} required test(s) failed`)
  }

  lines.push('└─────────────────────────────────────────────────────────────')

  return lines.join('\n')
}

/**
 * Format the complete results
 */
function formatResults(
  result: StructuredDataResult,
  target: string,
  requiredGroups?: string[],
  detectedStandards?: string[],
): string {
  const lines: string[] = []

  // Header
  lines.push(formatHeader(target, result.schemas, detectedStandards))
  lines.push('')

  // Check if we have any test results (including metatag validation)
  const hasSchemaTestResults =
    result.passed.length > 0 ||
    result.failed.length > 0 ||
    result.warnings.length > 0

  // No structured data found (no JSON-LD schemas AND no metatag tests ran)
  if (result.schemas.length === 0 && !hasSchemaTestResults) {
    lines.push('⚠ No structured data found on this page.\n')
    lines.push('Structured data helps search engines understand your content.')
    lines.push('Consider adding JSON-LD markup for your content type.\n')
    lines.push('Learn more: https://schema.org/')
    return lines.join('\n')
  }

  // Separate required vs info results if requiredGroups specified
  const isRequired = (group: string) =>
    !requiredGroups || requiredGroups.includes(group)

  const requiredFailed = result.failed.filter((t) => isRequired(t.group))
  const requiredWarnings = result.warnings.filter((t) => isRequired(t.group))
  const requiredPassed = result.passed.filter((t) => isRequired(t.group))
  const infoFailed = result.failed.filter((t) => !isRequired(t.group))
  const infoWarnings = result.warnings.filter((t) => !isRequired(t.group))

  // Group required results
  const groupedFailed = new Map<string, SchemaTestResult[]>()
  const groupedWarnings = new Map<string, SchemaTestResult[]>()

  for (const test of requiredFailed) {
    const group = test.group || 'Other'
    if (!groupedFailed.has(group)) groupedFailed.set(group, [])
    groupedFailed.get(group)!.push(test)
  }

  for (const test of requiredWarnings) {
    const group = test.group || 'Other'
    if (!groupedWarnings.has(group)) groupedWarnings.set(group, [])
    groupedWarnings.get(group)!.push(test)
  }

  // Summary (only counts required)
  const totalRequired = requiredPassed.length + requiredFailed.length

  if (requiredFailed.length === 0) {
    lines.push(`✓ All ${totalRequired} required tests passed\n`)
  } else {
    lines.push(
      `✗ ${requiredFailed.length} of ${totalRequired} required tests failed\n`,
    )
  }

  if (requiredWarnings.length > 0) {
    lines.push(`⚠ ${requiredWarnings.length} warnings\n`)
  }

  // Failed tests (required only)
  if (requiredFailed.length > 0) {
    lines.push('Failed Tests:')
    for (const [group, tests] of groupedFailed) {
      lines.push(`\n  ${group}:`)
      for (const test of tests) {
        lines.push(formatSchemaTestResult(test))
      }
    }
    lines.push('')
  }

  // Warnings (required only)
  if (requiredWarnings.length > 0) {
    lines.push('Warnings:')
    for (const [group, tests] of groupedWarnings) {
      lines.push(`\n  ${group}:`)
      for (const test of tests) {
        lines.push(formatSchemaTestResult(test))
      }
    }
    lines.push('')
  }

  // Show raw structured data summary
  lines.push('Structured Data Summary:')

  const { jsonld, microdata, rdfa, metatags } = result.structuredData

  const jsonldSchemas = Object.keys(jsonld).filter((k) => k !== 'undefined')
  const microdataSchemas = Object.keys(microdata).filter(
    (k) => k !== 'undefined',
  )
  const rdfaSchemas = Object.keys(rdfa).filter((k) => k !== 'undefined')
  const metatagCount = Object.keys(metatags).filter(
    (k) => k !== 'undefined',
  ).length

  if (jsonldSchemas.length > 0) {
    lines.push(`  JSON-LD: ${jsonldSchemas.join(', ')}`)
  }
  if (microdataSchemas.length > 0) {
    lines.push(`  Microdata: ${microdataSchemas.join(', ')}`)
  }
  if (rdfaSchemas.length > 0) {
    lines.push(`  RDFa: ${rdfaSchemas.join(', ')}`)
  }
  if (metatagCount > 0) {
    lines.push(`  Metatags: ${metatagCount} found`)
  }

  // Info about detected-but-not-required issues
  if (infoFailed.length > 0 || infoWarnings.length > 0) {
    const infoGrouped = new Map<string, number>()
    for (const test of [...infoFailed, ...infoWarnings]) {
      const group = test.group || 'Other'
      infoGrouped.set(group, (infoGrouped.get(group) || 0) + 1)
    }

    lines.push('')
    for (const [group, count] of infoGrouped) {
      lines.push(
        `ℹ Detected ${group} with ${count} issue${count > 1 ? 's' : ''} (not required)`,
      )
    }
  }

  return lines.join('\n')
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Fetch HTML from URL or read from file
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
 * Test structured data in HTML content
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

// ============================================================================
// Main Command
// ============================================================================

/**
 * Extract structured data from HTML (for detection)
 * Bun supports require() directly in ESM
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
 * Filter test results by group (Facebook, Twitter, etc.)
 */
function filterResultsByGroup(
  results: SchemaTestResult[],
  groups: string[],
): SchemaTestResult[] {
  return results.filter((r) => groups.includes(r.group))
}

export async function validateSchema(
  target: string,
  options: ValidateSchemaOptions,
): Promise<void> {
  // Validate format option
  const format: OutputFormat = options.format ?? 'full'
  if (!VALID_FORMATS.includes(format)) {
    console.error(
      `Error: Invalid --format value: "${options.format}". Must be one of: ${VALID_FORMATS.join(', ')}`,
    )
    process.exit(1)
  }

  try {
    // Fetch HTML content
    const html = await fetchHtmlContent(target)

    // Extract structured data to detect what's present
    const extracted = extractStructuredData(html)

    // Detect standards present in the HTML
    const { presets: detectedPresets, detected: detectedNames } =
      getDetectedPresets(extracted.metatags)

    // Load explicitly required presets
    const requiredNames = options.presets
      ? options.presets.split(',').map((s) => s.trim().toLowerCase())
      : []
    const requiredPresets = options.presets
      ? loadPresets(requiredNames)
      : []

    // Determine which presets to validate
    let presetsToValidate: Preset[]
    let requiredGroups: string[]
    let infoGroups: string[]

    if (options.presets) {
      // --presets specified: combine required + detected, but only required affects exit code
      const allPresets = [...requiredPresets]
      const requiredSet = new Set(requiredNames)

      // Add detected presets not already in required
      for (let i = 0; i < detectedNames.length; i++) {
        if (!requiredSet.has(detectedNames[i]!)) {
          allPresets.push(detectedPresets[i]!)
        }
      }

      presetsToValidate = allPresets

      // Map preset names to group names for filtering
      const groupMap: Record<string, string> = {
        facebook: 'Facebook',
        twitter: 'Twitter',
        google: 'Google',
        'social-media': 'SocialMedia',
      }

      requiredGroups = requiredNames.map((n) => groupMap[n] || n)
      infoGroups = detectedNames
        .filter((n) => !requiredSet.has(n))
        .map((n) => groupMap[n] || n)
    } else {
      // No --presets: validate all detected, all affect exit code
      presetsToValidate = detectedPresets
      requiredGroups = detectedNames.map((n) => {
        const groupMap: Record<string, string> = {
          facebook: 'Facebook',
          twitter: 'Twitter',
          google: 'Google',
        }
        return groupMap[n] || n
      })
      infoGroups = []
    }

    // Test structured data with all relevant presets
    const result = await testStructuredData(html, presetsToValidate)

    // Filter to just required failures for exit code
    const requiredFailed = options.presets
      ? filterResultsByGroup(result.failed, requiredGroups)
      : result.failed

    // Map detected names to display names for header
    const detectedDisplayNames = detectedNames.map((n) => {
      const displayMap: Record<string, string> = {
        facebook: 'Open Graph',
        twitter: 'Twitter Cards',
      }
      return displayMap[n] || n
    })

    // JSON output
    if (format === 'json') {
      const jsonResult: ValidateSchemaResult = {
        target,
        schemas: result.schemas,
        passed: result.passed.length,
        failed: requiredFailed.length,
        warnings: result.warnings.length,
        requiredGroups,
        infoGroups,
        tests: result.tests,
        structuredData: result.structuredData,
      }
      console.log(JSON.stringify(jsonResult, null, 2))

      // Exit with error code only if required tests failed
      if (jsonResult.failed > 0) {
        process.exit(1)
      }
      return
    }

    // Compact output
    if (format === 'compact') {
      console.log(
        formatCompact(
          result,
          target,
          options.presets ? requiredGroups : undefined,
          detectedDisplayNames,
        ),
      )

      // Exit with error code only if required tests failed
      if (requiredFailed.length > 0) {
        process.exit(1)
      }
      return
    }

    // Full output (default)
    console.log(
      formatResults(
        result,
        target,
        options.presets ? requiredGroups : undefined,
        detectedDisplayNames,
      ),
    )

    // Exit with error code only if required tests failed
    if (requiredFailed.length > 0) {
      process.exit(1)
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`)
    } else {
      console.error('An unknown error occurred')
    }
    process.exit(1)
  }
}
