import type { OutputModeOptions } from '../../lib/output-mode.js'
import type { SchemaTestResult } from '../../lib/results.js'
import type { OutputFormat } from '../../lib/validation.js'

export const VALID_FORMATS: readonly OutputFormat[] = ['full', 'compact', 'json']

export interface ValidateSchemaOptions extends OutputModeOptions {
  presets?: string
  format?: OutputFormat
}

// Internal result type from structured-data-testing-tool
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

export interface PresetMap {
  google: Preset
  twitter: Preset
  facebook: Preset
  'social-media': Preset
}

export interface SchemaValidationResult {
  testResult: StructuredDataResult
  requiredGroups: string[]
  infoGroups: string[]
  detectedDisplayNames: string[]
  requiredFailedCount: number
}

export interface SchemaRenderOptions {
  format: OutputFormat
  target: string
  presetsOption: string | undefined
}
