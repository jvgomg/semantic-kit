import type { OutputModeOptions } from '../../lib/output-mode.js'
import type { OutputFormat } from '../../lib/validation.js'

export const VALID_FORMATS_BASIC: readonly OutputFormat[] = ['full', 'compact', 'json']
export const VALID_FORMATS_COMPARE: readonly OutputFormat[] = [
  'full',
  'compact',
  'json',
]

export interface A11yOptions extends OutputModeOptions {
  format?: OutputFormat
  timeout?: string
}

export interface A11yJsOptions extends OutputModeOptions {
  format?: OutputFormat
  timeout?: string
}

export interface A11yCompareOptions extends OutputModeOptions {
  format?: OutputFormat
  timeout?: string
}
