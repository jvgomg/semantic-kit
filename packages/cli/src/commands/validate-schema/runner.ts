import type { SchemaTestResult } from '@webspecs/core'
import { fetchHtmlContent } from '@webspecs/core'
import {
  VALID_PRESETS,
  type Preset,
  type PresetMap,
  type PresetName,
  type SchemaValidationResult,
  type StructuredDataResult,
} from './types.js'

// ============================================================================
// Preset Loading
// ============================================================================

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

/**
 * Filter test results by group (Facebook, Twitter, etc.)
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
 * Fetch and validate schema data.
 */
export async function fetchSchemaValidation(
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
