/**
 * @webspecs/image-ascii
 *
 * Convert images to ANSI art for terminal display using half-block characters.
 */

export { fetchImage } from './fetch.js'
export { renderAscii } from './render.js'
export type {
  FetchImageOptions,
  RenderOptions,
  FetchAndRenderOptions,
  ImageFetchError,
  ImageFetchErrorType,
  ImageRenderError,
  ImageRenderErrorType,
  ImageFetchResult,
  ImageRenderResult,
  AsciiImageResult,
} from './types.js'

import { fetchImage } from './fetch.js'
import { renderAscii } from './render.js'
import type { FetchAndRenderOptions, AsciiImageResult } from './types.js'

/**
 * Fetches an image from a URL and renders it as ANSI art.
 *
 * This is a convenience function that combines fetchImage and renderAscii.
 *
 * @param url - The URL to fetch the image from
 * @param options - Optional configuration for both fetch and render
 * @returns A discriminated union result with either the rendered lines or an error
 *
 * @example
 * ```typescript
 * const result = await fetchAndRenderAscii('https://example.com/og-image.jpg', { width: 48 })
 * if (result.ok) {
 *   console.log(result.lines.join('\n'))
 * } else {
 *   console.error(result.error.message)
 * }
 * ```
 */
export async function fetchAndRenderAscii(
  url: string,
  options: FetchAndRenderOptions = {},
): Promise<AsciiImageResult> {
  // Extract fetch options
  const { timeout, headers, ...renderOptions } = options

  // Fetch the image
  const fetchResult = await fetchImage(url, { timeout, headers })

  if (!fetchResult.ok) {
    return fetchResult
  }

  // Render the image
  const renderResult = await renderAscii(fetchResult.buffer, renderOptions)

  if (!renderResult.ok) {
    return renderResult
  }

  return {
    ok: true,
    lines: renderResult.lines,
    width: renderResult.width,
    height: renderResult.height,
    contentType: fetchResult.contentType,
  }
}
