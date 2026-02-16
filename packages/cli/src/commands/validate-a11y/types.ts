import type { WcagLevel, AxeResults, AxeAnalysisResult } from '@webspecs/core'
import { WCAG_TAGS, WCAG_VALID_LEVELS } from '@webspecs/core'
import type { OutputFormat } from '../../lib/arguments.js'
import type { OutputModeOptions } from '../../lib/output-mode.js'

export const VALID_FORMATS: readonly OutputFormat[] = [
  'full',
  'compact',
  'json',
]

export interface ValidateA11yOptions extends OutputModeOptions {
  level?: string
  format?: string
  timeout?: string
  ignoreIncomplete?: boolean
}

// Re-export core types for backward compatibility
export type { WcagLevel, AxeResults, AxeAnalysisResult }
export { WCAG_TAGS }
export const VALID_LEVELS = WCAG_VALID_LEVELS

export const SEVERITY_ORDER = [
  'critical',
  'serious',
  'moderate',
  'minor',
] as const
export type Severity = (typeof SEVERITY_ORDER)[number]

export const SEVERITY_ICONS: Record<Severity, string> = {
  critical: '✗',
  serious: '✗',
  moderate: '⚠',
  minor: 'ℹ',
}

export interface RenderOptions {
  format: OutputFormat
  url: string
  level: WcagLevel
  ignoreIncomplete: boolean
}
