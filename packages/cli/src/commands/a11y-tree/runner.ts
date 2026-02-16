import {
  analyzeAriaSnapshot,
  fetchAccessibilitySnapshot,
  type A11yResult,
} from '@webspecs/core'

/**
 * Fetch accessibility snapshot with JavaScript disabled.
 */
export async function fetchA11y(
  target: string,
  timeoutMs: number,
): Promise<A11yResult> {
  const { snapshot, timedOut } = await fetchAccessibilitySnapshot(target, {
    javaScriptEnabled: false,
    timeoutMs,
  })

  const { nodes, counts } = analyzeAriaSnapshot(snapshot)

  return {
    url: target,
    snapshot,
    parsed: nodes,
    counts,
    timedOut,
  }
}
