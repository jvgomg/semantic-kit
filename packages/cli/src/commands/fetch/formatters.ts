import type { FetchResult } from './types.js'

/**
 * Format fetch result as plain prettified HTML.
 */
export function formatFetchOutput(result: FetchResult): string {
  const lines: string[] = []

  if (result.wasMalformed) {
    lines.push('⚠ HTML could not be prettified (possibly malformed)\n')
  }

  lines.push(result.prettyHtml)

  return lines.join('\n')
}
