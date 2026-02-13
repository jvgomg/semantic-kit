import type { OutputFormat } from '../../lib/arguments.js'
import type { AxeStaticResult } from '../../lib/axe-static.js'
import type { OutputModeOptions } from '../../lib/output-mode.js'
import type { StructureJsResult } from '../../lib/results.js'
import type {
  StructureAnalysis,
  StructureComparison,
} from '../../lib/structure.js'

export const VALID_FORMATS: readonly OutputFormat[] = [
  'full',
  'brief',
  'compact',
  'json',
]

export interface StructureOptions extends OutputModeOptions {
  format?: OutputFormat
  /** Run all JSDOM-safe accessibility rules instead of just structure rules */
  allRules?: boolean
}

export interface StructureJsOptions extends OutputModeOptions {
  format?: OutputFormat
  timeout?: string
  /** Run all JSDOM-safe accessibility rules instead of just structure rules */
  allRules?: boolean
}

export interface StructureCompareOptions extends OutputModeOptions {
  format?: OutputFormat
  timeout?: string
}

/**
 * Structure result for TUI consumption
 */
export interface TuiStructureResult {
  url: string
  analysis: StructureAnalysis
  axeResult: AxeStaticResult
}

export interface StructureJsInternalResult extends StructureJsResult {
  axeResult: AxeStaticResult
}

export interface StructureCompareResult {
  comparison: StructureComparison
  timedOut: boolean
}

export interface FetchStructureJsOptions {
  timeoutMs: number
  allRules?: boolean
}

export interface FormatStructureJsOptions {
  format: OutputFormat
  target: string
}

export interface FormatStructureCompareOptions {
  format: OutputFormat
  target: string
}
