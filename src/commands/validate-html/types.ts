import type { OutputModeOptions } from '../../lib/output-mode.js'
import type { OutputFormat } from '../../lib/validation.js'

export const VALID_FORMATS: readonly OutputFormat[] = [
  'full',
  'brief',
  'compact',
  'json',
]

export type FormatterName = 'stylish' | 'codeframe' | 'text'

/**
 * Map --format values to html-validate formatters
 */
export const FORMAT_TO_FORMATTER: Record<
  Exclude<OutputFormat, 'json'>,
  FormatterName
> = {
  full: 'codeframe', // Shows code context around errors
  brief: 'text', // Minimal one-line per error
  compact: 'stylish', // Concise grouped errors
}

export interface ValidateHtmlOptions extends OutputModeOptions {
  config?: string
  format?: OutputFormat
}
