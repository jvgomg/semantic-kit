export { runAxeAnalysis } from '@webspecs/core'

import { parseWcagLevel } from '@webspecs/core'
import type { WcagLevel } from '@webspecs/core'

/**
 * Parse WCAG level from CLI option.
 * @deprecated Use parseWcagLevel from @webspecs/core instead
 */
export function parseLevel(levelOption: string | undefined): WcagLevel {
  return parseWcagLevel(levelOption)
}
