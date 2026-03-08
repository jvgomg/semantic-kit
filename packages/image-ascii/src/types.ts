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
 * RGB color tuple [r, g, b] with values 0-255.
 */
export type RGB = [number, number, number]

/**
 * A single character cell with foreground and background colors.
 */
export interface ColoredCell {
  /** The character to render (half-block) */
  char: string
  /** Foreground color as RGB tuple */
  fg: RGB
  /** Background color as RGB tuple */
  bg: RGB
}

/**
 * A row of colored cells representing one line of ASCII art.
 */
export type ColoredRow = ColoredCell[]

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
  /**
   * Output mode:
   * - 'ansi': Returns strings with ANSI escape codes (for CLI)
   * - 'data': Returns structured color data (for TUI/React)
   * Default: 'ansi'
   */
  outputMode?: 'ansi' | 'data'
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
 * Result of an ASCII render operation with ANSI output (discriminated union).
 */
export type ImageRenderResultAnsi =
  | { ok: true; mode: 'ansi'; lines: string[]; width: number; height: number }
  | { ok: false; error: ImageRenderError }

/**
 * Result of an ASCII render operation with structured data output.
 */
export type ImageRenderResultData =
  | { ok: true; mode: 'data'; rows: ColoredRow[]; width: number; height: number }
  | { ok: false; error: ImageRenderError }

/**
 * Result of an ASCII render operation (discriminated union).
 */
export type ImageRenderResult = ImageRenderResultAnsi | ImageRenderResultData

/**
 * Combined result for fetch and render operations with ANSI output.
 */
export type AsciiImageResultAnsi =
  | {
      ok: true
      mode: 'ansi'
      lines: string[]
      width: number
      height: number
      contentType: string
    }
  | { ok: false; error: ImageFetchError | ImageRenderError }

/**
 * Combined result for fetch and render operations with data output.
 */
export type AsciiImageResultData =
  | {
      ok: true
      mode: 'data'
      rows: ColoredRow[]
      width: number
      height: number
      contentType: string
    }
  | { ok: false; error: ImageFetchError | ImageRenderError }

/**
 * Combined result for fetch and render operations.
 */
export type AsciiImageResult = AsciiImageResultAnsi | AsciiImageResultData
