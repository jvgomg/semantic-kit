import type { OutputModeOptions } from '../../lib/output-mode.js'
import type { ReadabilityResult } from '../../lib/readability.js'
import type { OutputFormat } from '../../lib/arguments.js'

export const VALID_FORMATS: readonly OutputFormat[] = ['full', 'compact', 'json']

export interface ReadabilityOptions extends OutputModeOptions {
  format?: string
}

export interface ReadabilityJsOptions extends OutputModeOptions {
  format?: string
  timeout?: string
}

export interface ReadabilityCompareOptions extends OutputModeOptions {
  format?: string
  timeout?: string
}

/**
 * Section information for sections found only after JS rendering.
 */
export interface SectionInfo {
  heading: string
  level: number
}

/**
 * Comparison metrics between static and rendered content.
 */
export interface ReadabilityComparison {
  /** Word count in static HTML */
  staticWordCount: number
  /** Word count after JavaScript rendering */
  renderedWordCount: number
  /** Words only visible after JavaScript execution */
  jsDependentWordCount: number
  /** Percentage of content that requires JavaScript */
  jsDependentPercentage: number
  /** Sections that only appear after JavaScript */
  sectionsOnlyInRendered: SectionInfo[]
}

/**
 * Result for readability:compare command.
 */
export interface ReadabilityCompareResult {
  /** Target URL analyzed */
  url: string
  /** Readability extraction from static HTML */
  static: ReadabilityResult
  /** Readability extraction from JS-rendered HTML */
  rendered: ReadabilityResult
  /** Comparison metrics */
  comparison: ReadabilityComparison
  /** Whether the page load timed out */
  timedOut: boolean
}
