import type { OutputModeOptions } from '../../lib/output-mode.js'
import type { OutputFormat } from '../../lib/validation.js'

export const VALID_FORMATS: readonly OutputFormat[] = ['full', 'compact', 'json']

export interface AiOptions extends OutputModeOptions {
  raw?: boolean
  format?: string
}

/**
 * Severity level for hidden content warnings
 */
export type HiddenContentSeverity = 'none' | 'low' | 'high'

/**
 * Framework detector interface.
 * Add new framework detectors by implementing this interface.
 */
export interface FrameworkDetector {
  name: string
  detect: (document: Document) => boolean
  getHiddenContentSelector: () => string
}
