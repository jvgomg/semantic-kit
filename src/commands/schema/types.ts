import type { OutputFormat } from '../../lib/arguments.js'
import type { OutputModeOptions } from '../../lib/output-mode.js'

export const VALID_FORMATS: readonly OutputFormat[] = ['full', 'compact', 'json']

export interface SchemaOptions extends OutputModeOptions {
  format?: string
}

export interface SchemaJsOptions extends OutputModeOptions {
  format?: string
  timeout?: string
}

export interface SchemaCompareOptions extends OutputModeOptions {
  format?: string
  timeout?: string
}

/**
 * Re-export StructuredData from shared library for local use.
 */
export type { StructuredData } from '../../lib/metadata/extractor.js'

// Tag requirements are in lib/metadata/types.ts
// Use OPEN_GRAPH_REQUIREMENTS and TWITTER_CARD_REQUIREMENTS from there
