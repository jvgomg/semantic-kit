import {
  analyzeAriaSnapshot,
  compareSnapshots,
  hasDifferences,
} from '../../lib/aria-snapshot.js'
import { fetchAccessibilityComparison } from '../../lib/playwright.js'
import type { A11yCompareResult } from '../../lib/results.js'

/**
 * Fetch and compare accessibility snapshots (static vs hydrated).
 */
export async function fetchA11yCompare(
  target: string,
  timeoutMs: number,
): Promise<A11yCompareResult> {
  const { static: staticResult, hydrated: hydratedResult } =
    await fetchAccessibilityComparison(target, timeoutMs)

  // Compare the snapshots
  const diff = compareSnapshots(
    staticResult.snapshot,
    hydratedResult.snapshot,
  )
  const staticAnalysis = analyzeAriaSnapshot(staticResult.snapshot)
  const hydratedAnalysis = analyzeAriaSnapshot(hydratedResult.snapshot)

  return {
    url: target,
    hasDifferences: hasDifferences(diff),
    static: {
      snapshot: staticResult.snapshot,
      counts: staticAnalysis.counts,
      timedOut: staticResult.timedOut,
    },
    hydrated: {
      snapshot: hydratedResult.snapshot,
      counts: hydratedAnalysis.counts,
      timedOut: hydratedResult.timedOut,
    },
    diff,
  }
}
