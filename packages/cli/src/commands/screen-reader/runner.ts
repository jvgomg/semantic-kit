/**
 * Screen reader command runner.
 *
 * Thin wrapper around core's analyzeScreenReaderExperience function
 * for backward compatibility.
 */
import {
  analyzeScreenReaderExperience,
  type ScreenReaderResult,
} from '@webspecs/core'

/**
 * Fetch and analyze how a screen reader would interpret a page.
 *
 * Always uses JavaScript rendering because real screen readers
 * interact with the rendered page, not static HTML.
 *
 * @deprecated Use analyzeScreenReaderExperience from @webspecs/core instead
 */
export async function fetchScreenReader(
  target: string,
  timeoutMs: number = 5000,
): Promise<ScreenReaderResult> {
  return analyzeScreenReaderExperience(target, timeoutMs)
}
