import type {
  StructuredDataResult,
  Preset,
  PresetName,
  PresetMap,
  SchemaValidationResult,
} from '@webspecs/core'
import { VALID_PRESETS } from '@webspecs/core'
import type { OutputFormat } from '../../lib/arguments.js'
import type { OutputModeOptions } from '../../lib/output-mode.js'

export const VALID_FORMATS: readonly OutputFormat[] = [
  'full',
  'compact',
  'json',
]

export interface ValidateSchemaOptions extends OutputModeOptions {
  presets?: string
  format?: OutputFormat
}

// Re-export types from core for compatibility
export type {
  StructuredDataResult,
  Preset,
  PresetName,
  PresetMap,
  SchemaValidationResult,
}
export { VALID_PRESETS }

export interface SchemaRenderOptions {
  format: OutputFormat
  target: string
  presetsOption: string | undefined
}
