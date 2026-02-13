import type { OutputModeOptions } from '../../lib/output-mode.js'
import type { OutputFormat } from '../../lib/arguments.js'

export const VALID_FORMATS: readonly OutputFormat[] = ['full', 'compact', 'json']

export interface ScreenReaderOptions extends OutputModeOptions {
  format?: string
  timeout?: string
}
