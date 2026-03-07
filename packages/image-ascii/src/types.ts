/**
 * Options for fetching an image from a URL.
 */
export interface FetchImageOptions {
  /** Request timeout in milliseconds. Default: 5000ms */
  timeout?: number
  /** Additional headers to include in the request */
  headers?: Record<string, string>
}

/**
 * Options for rendering an image as ASCII art.
 */
export interface RenderOptions {
  /** Width in characters. Default: 48 (card inner width) */
  width?: number
  /** Height in characters. Auto-calculated from aspect ratio if omitted */
  height?: number
  /** Character aspect ratio (width/height). Default: 0.5 (chars are ~2x taller than wide) */
  charAspectRatio?: number
}

/**
 * Combined options for fetch and render operations.
 */
export interface FetchAndRenderOptions
  extends FetchImageOptions, RenderOptions {}

/**
 * Error types for image fetch operations.
 */
export type ImageFetchErrorType =
  | 'TIMEOUT'
  | 'NETWORK_ERROR'
  | 'HTTP_ERROR'
  | 'INVALID_URL'
  | 'UNSUPPORTED_FORMAT'

/**
 * Error types for image render operations.
 */
export type ImageRenderErrorType =
  | 'DECODE_ERROR'
  | 'INVALID_DIMENSIONS'
  | 'UNSUPPORTED_FORMAT'

/**
 * Error details for fetch operations.
 */
export interface ImageFetchError {
  type: ImageFetchErrorType
  message: string
  statusCode?: number
}

/**
 * Error details for render operations.
 */
export interface ImageRenderError {
  type: ImageRenderErrorType
  message: string
}

/**
 * Result of an image fetch operation (discriminated union).
 */
export type ImageFetchResult =
  | { ok: true; buffer: Buffer; contentType: string }
  | { ok: false; error: ImageFetchError }

/**
 * Result of an ASCII render operation (discriminated union).
 */
export type ImageRenderResult =
  | { ok: true; lines: string[]; width: number; height: number }
  | { ok: false; error: ImageRenderError }

/**
 * Combined result for fetch and render operations.
 */
export type AsciiImageResult =
  | {
      ok: true
      lines: string[]
      width: number
      height: number
      contentType: string
    }
  | { ok: false; error: ImageFetchError | ImageRenderError }
