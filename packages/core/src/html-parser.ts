/**
 * HTML parsing utilities using linkedom.
 *
 * Provides a lightweight DOM implementation for server-side HTML parsing.
 */
import { parseHTML as linkedomParseHTML } from 'linkedom'

/**
 * Parse HTML string into a DOM document.
 *
 * Uses linkedom for lightweight server-side DOM implementation.
 *
 * @param html - The HTML string to parse
 * @returns Object with document and window properties
 *
 * @example
 * ```typescript
 * const { document } = parseHTML('<html><body><h1>Hello</h1></body></html>')
 * const h1 = document.querySelector('h1')
 * ```
 */
export function parseHTML(html: string) {
  return linkedomParseHTML(html)
}
