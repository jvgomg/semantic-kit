import { Chalk } from 'chalk'
import { Jimp, intToRGBA } from 'jimp'
import type {
  RenderOptions,
  ImageRenderResult,
  ColoredRow,
  ColoredCell,
  RGB,
} from './types.js'

/** Unicode lower half-block character for half-block rendering */
const HALF_BLOCK = '\u2584'

/** Chalk instance with forced truecolor (level 3) support */
const chalk = new Chalk({ level: 3 })

/** Default width in characters (fits typical terminal card width) */
const DEFAULT_WIDTH = 48

/** Default character aspect ratio (chars are typically ~2x taller than wide) */
const DEFAULT_CHAR_ASPECT_RATIO = 0.5

/**
 * Renders an image buffer as ANSI art using half-block characters.
 *
 * Uses the Unicode lower half-block character (▄) with 24-bit RGB colors:
 * - Background color = top pixel of each character cell
 * - Foreground color = bottom pixel of each character cell
 *
 * This technique doubles the vertical resolution compared to using
 * full block characters.
 *
 * @param buffer - The image data as a Buffer
 * @param options - Optional render configuration
 * @returns A discriminated union result with either the rendered lines or an error
 */
export async function renderAscii(
  buffer: Buffer,
  options: RenderOptions = {},
): Promise<ImageRenderResult> {
  const {
    width = DEFAULT_WIDTH,
    height,
    charAspectRatio = DEFAULT_CHAR_ASPECT_RATIO,
    outputMode = 'ansi',
  } = options

  // Validate dimensions
  if (width <= 0 || (height !== undefined && height <= 0)) {
    return {
      ok: false,
      error: {
        type: 'INVALID_DIMENSIONS',
        message: `Invalid dimensions: width=${width}, height=${height}`,
      },
    }
  }

  let image: Awaited<ReturnType<typeof Jimp.fromBuffer>>

  try {
    image = await Jimp.fromBuffer(buffer)
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to decode image'
    return {
      ok: false,
      error: {
        type: 'DECODE_ERROR',
        message,
      },
    }
  }

  const originalWidth = image.width
  const originalHeight = image.height

  if (originalWidth <= 0 || originalHeight <= 0) {
    return {
      ok: false,
      error: {
        type: 'INVALID_DIMENSIONS',
        message: `Invalid image dimensions: ${originalWidth}x${originalHeight}`,
      },
    }
  }

  // Calculate target dimensions
  // Each character represents 2 vertical pixels (top and bottom of half-block)
  const targetWidth = width

  // Calculate height to maintain visual aspect ratio, accounting for:
  // 1. Image aspect ratio (width/height)
  // 2. Character aspect ratio (chars are ~2x taller than wide)
  let targetHeight: number
  if (height !== undefined) {
    targetHeight = height
  } else {
    const imageAspectRatio = originalWidth / originalHeight
    // For correct visual aspect ratio in terminal:
    // targetHeight = targetWidth * charAspectRatio / imageAspectRatio
    // This accounts for the fact that terminal chars are taller than wide
    targetHeight = Math.round(
      (targetWidth * charAspectRatio) / imageAspectRatio,
    )
    // Ensure at least 1 row
    targetHeight = Math.max(1, targetHeight)
  }

  // Resize image to fit target dimensions
  // Pixel height is 2x char height because each char row uses 2 pixel rows
  const pixelWidth = targetWidth
  const pixelHeight = targetHeight * 2

  try {
    image.resize({ w: pixelWidth, h: pixelHeight })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to resize image'
    return {
      ok: false,
      error: {
        type: 'DECODE_ERROR',
        message,
      },
    }
  }

  // Render the image using half-block characters
  if (outputMode === 'data') {
    // Return structured color data for React/TUI rendering
    const rows: ColoredRow[] = []

    for (let charRow = 0; charRow < targetHeight; charRow++) {
      const row: ColoredCell[] = []
      const topPixelY = charRow * 2
      const bottomPixelY = charRow * 2 + 1

      for (let x = 0; x < targetWidth; x++) {
        const topColor = image.getPixelColor(x, topPixelY)
        const bottomColor = image.getPixelColor(x, bottomPixelY)

        const topRgba = intToRGBA(topColor)
        const bottomRgba = intToRGBA(bottomColor)

        row.push({
          char: HALF_BLOCK,
          fg: [bottomRgba.r, bottomRgba.g, bottomRgba.b] as RGB,
          bg: [topRgba.r, topRgba.g, topRgba.b] as RGB,
        })
      }

      rows.push(row)
    }

    return {
      ok: true,
      mode: 'data',
      rows,
      width: targetWidth,
      height: targetHeight,
    }
  }

  // Return ANSI-colored strings for CLI rendering
  const lines: string[] = []

  for (let charRow = 0; charRow < targetHeight; charRow++) {
    let line = ''
    const topPixelY = charRow * 2
    const bottomPixelY = charRow * 2 + 1

    for (let x = 0; x < targetWidth; x++) {
      // Get top and bottom pixel colors
      const topColor = image.getPixelColor(x, topPixelY)
      const bottomColor = image.getPixelColor(x, bottomPixelY)

      const topRgba = intToRGBA(topColor)
      const bottomRgba = intToRGBA(bottomColor)

      // Create styled half-block: background = top pixel, foreground = bottom pixel
      const styledChar = chalk
        .bgRgb(topRgba.r, topRgba.g, topRgba.b)
        .rgb(bottomRgba.r, bottomRgba.g, bottomRgba.b)(HALF_BLOCK)

      line += styledChar
    }

    lines.push(line)
  }

  return {
    ok: true,
    mode: 'ansi',
    lines,
    width: targetWidth,
    height: targetHeight,
  }
}
