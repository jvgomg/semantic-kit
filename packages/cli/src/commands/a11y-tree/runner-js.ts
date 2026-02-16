import { analyzeAriaSnapshot, fetchAccessibilitySnapshot, type A11yResult } from '@webspecs/core'

/**
 * Fetch accessibility snapshot with JavaScript enabled.
 */
export async function fetchA11yJs(
  target: string,
  timeoutMs: number,
): Promise<A11yResult> {
  const { snapshot, timedOut } = await fetchAccessibilitySnapshot(target, {
    javaScriptEnabled: true,
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
