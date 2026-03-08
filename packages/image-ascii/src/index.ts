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
  ImageRenderResultAnsi,
  ImageRenderResultData,
  AsciiImageResult,
  AsciiImageResultAnsi,
  AsciiImageResultData,
  RGB,
  ColoredCell,
  ColoredRow,
} from './types.js'

import { fetchImage } from './fetch.js'
import { renderAscii } from './render.js'
import type { FetchAndRenderOptions, AsciiImageResult } from './types.js'

/**
 * Fetches an image from a URL and renders it as ASCII art.
 *
 * This is a convenience function that combines fetchImage and renderAscii.
 *
 * @param url - The URL to fetch the image from
 * @param options - Optional configuration for both fetch and render
 * @returns A discriminated union result with either the rendered lines/rows or an error
 *
 * @example
 * ```typescript
 * // CLI mode (default) - returns ANSI strings
 * const result = await fetchAndRenderAscii('https://example.com/og-image.jpg', { width: 48 })
 * if (result.ok && result.mode === 'ansi') {
 *   console.log(result.lines.join('\n'))
 * }
 *
 * // TUI mode - returns structured color data
 * const result = await fetchAndRenderAscii('https://example.com/og-image.jpg', {
 *   width: 48,
 *   outputMode: 'data'
 * })
 * if (result.ok && result.mode === 'data') {
 *   // Render rows with React color props
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

  // Return appropriate result based on mode
  if (renderResult.mode === 'data') {
    return {
      ok: true,
      mode: 'data',
      rows: renderResult.rows,
      width: renderResult.width,
      height: renderResult.height,
      contentType: fetchResult.contentType,
    }
  }

  return {
    ok: true,
    mode: 'ansi',
    lines: renderResult.lines,
    width: renderResult.width,
    height: renderResult.height,
    contentType: fetchResult.contentType,
  }
}
