import { common, createEmphasize } from 'emphasize'
import type { FetchResult } from './types.js'

const emphasize = createEmphasize(common)

/**
 * Format fetch result with syntax highlighting.
 */
export function formatFetchOutput(result: FetchResult): string {
  const lines: string[] = []

  if (result.wasMalformed) {
    lines.push('⚠ HTML could not be prettified (possibly malformed)\n')
  }

  const highlighted = emphasize.highlight('xml', result.prettyHtml)
  lines.push(highlighted.value)

  return lines.join('\n')
}
