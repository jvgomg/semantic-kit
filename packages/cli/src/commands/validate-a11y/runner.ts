import {
  validateAccessibility,
  parseWcagLevel,
  type AxeAnalysisResult,
  type WcagLevel,
} from '@webspecs/core'

// ============================================================================
// Public API
// ============================================================================

/**
 * Parse WCAG level from CLI option.
 * @deprecated Use parseWcagLevel from @webspecs/core instead
 */
export function parseLevel(levelOption: string | undefined): WcagLevel {
  return parseWcagLevel(levelOption)
}

/**
 * Run axe-core analysis on a URL.
 * @deprecated Use validateAccessibility from @webspecs/core instead
 */
export async function runAxeAnalysis(
  url: string,
  level: WcagLevel,
  timeoutMs: number,
): Promise<AxeAnalysisResult> {
  return validateAccessibility(url, level, timeoutMs)
}
