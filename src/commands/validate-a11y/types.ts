import type { OutputModeOptions } from '../../lib/output-mode.js'
import type { AxeViolationResult } from '../../lib/results.js'
import type { OutputFormat } from '../../lib/validation.js'

export const VALID_FORMATS: readonly OutputFormat[] = ['full', 'compact', 'json']

export interface ValidateA11yOptions extends OutputModeOptions {
  level?: string
  format?: string
  timeout?: string
  ignoreIncomplete?: boolean
}

export type WcagLevel = 'a' | 'aa' | 'aaa'

// Internal axe-core result types (from library)
export interface AxeResults {
  violations: AxeViolationResult[]
  passes: unknown[]
  incomplete: unknown[]
  inapplicable: unknown[]
  url: string
  timestamp: string
}

export const WCAG_TAGS: Record<WcagLevel, string[]> = {
  a: ['wcag2a', 'wcag21a', 'wcag22a'],
  aa: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'],
  aaa: [
    'wcag2a',
    'wcag2aa',
    'wcag2aaa',
    'wcag21a',
    'wcag21aa',
    'wcag21aaa',
    'wcag22a',
    'wcag22aa',
  ],
}

export const VALID_LEVELS = ['a', 'aa', 'aaa'] as const

export const SEVERITY_ORDER = ['critical', 'serious', 'moderate', 'minor'] as const
export type Severity = (typeof SEVERITY_ORDER)[number]

export const SEVERITY_ICONS: Record<Severity, string> = {
  critical: '✗',
  serious: '✗',
  moderate: '⚠',
  minor: 'ℹ',
}

export interface AxeAnalysisResult {
  results: AxeResults
  timedOut: boolean
}

export interface RenderOptions {
  format: OutputFormat
  url: string
  level: WcagLevel
  ignoreIncomplete: boolean
}
