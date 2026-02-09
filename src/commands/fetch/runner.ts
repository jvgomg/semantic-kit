import * as prettier from 'prettier'
import type { FetchResult } from './types.js'

/**
 * Fetch URL and prettify the HTML.
 */
export async function fetchAndFormat(url: string): Promise<FetchResult> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`)
  }
  const rawHtml = await response.text()

  // Prettify the HTML (fall back to raw if formatting fails)
  let prettyHtml: string
  let wasMalformed = false
  try {
    prettyHtml = await prettier.format(rawHtml, {
      parser: 'html',
      printWidth: 100,
      tabWidth: 2,
      htmlWhitespaceSensitivity: 'ignore',
    })
  } catch {
    wasMalformed = true
    prettyHtml = rawHtml
  }

  return { prettyHtml, wasMalformed }
}
