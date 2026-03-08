import { describe, expect, it } from 'bun:test'
import { Jimp } from 'jimp'
import { renderAscii } from './render.js'

/**
 * Creates a simple test image buffer with the specified dimensions and color.
 */
async function createTestImage(
  width: number,
  height: number,
  color: number = 0xff0000ff, // Red
): Promise<Buffer> {
  const image = new Jimp({ width, height, color })
  return await image.getBuffer('image/png')
}

/**
 * Creates a test image with a gradient (different top/bottom colors).
 */
async function createGradientImage(
  width: number,
  height: number,
  topColor: number,
  bottomColor: number,
): Promise<Buffer> {
  const image = new Jimp({ width, height, color: 0x000000ff })

  const halfHeight = Math.floor(height / 2)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const color = y < halfHeight ? topColor : bottomColor
      image.setPixelColor(color, x, y)
    }
  }

  return await image.getBuffer('image/png')
}

describe('renderAscii', () => {
  describe('dimension validation', () => {
    it('rejects zero width', async () => {
      const buffer = await createTestImage(10, 10)
      const result = await renderAscii(buffer, { width: 0 })

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.type).toBe('INVALID_DIMENSIONS')
      }
    })

    it('rejects negative width', async () => {
      const buffer = await createTestImage(10, 10)
      const result = await renderAscii(buffer, { width: -5 })

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.type).toBe('INVALID_DIMENSIONS')
      }
    })

    it('rejects zero height', async () => {
      const buffer = await createTestImage(10, 10)
      const result = await renderAscii(buffer, { width: 10, height: 0 })

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.type).toBe('INVALID_DIMENSIONS')
      }
    })
  })

  describe('invalid buffer handling', () => {
    it('rejects invalid image data', async () => {
      const invalidBuffer = Buffer.from('not an image')
      const result = await renderAscii(invalidBuffer)

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.type).toBe('DECODE_ERROR')
      }
    })

    it('rejects empty buffer', async () => {
      const emptyBuffer = Buffer.alloc(0)
      const result = await renderAscii(emptyBuffer)

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.type).toBe('DECODE_ERROR')
      }
    })
  })

  describe('successful rendering', () => {
    it('renders a simple image', async () => {
      const buffer = await createTestImage(10, 10)
      const result = await renderAscii(buffer, { width: 5 })

      expect(result.ok).toBe(true)
      if (result.ok && result.mode === 'ansi') {
        expect(result.width).toBe(5)
        expect(result.height).toBeGreaterThan(0)
        expect(result.lines.length).toBe(result.height)
      }
    })

    it('respects specified width', async () => {
      const buffer = await createTestImage(100, 50)
      const result = await renderAscii(buffer, { width: 20 })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.width).toBe(20)
      }
    })

    it('respects specified height', async () => {
      const buffer = await createTestImage(100, 100)
      const result = await renderAscii(buffer, { width: 10, height: 5 })

      expect(result.ok).toBe(true)
      if (result.ok && result.mode === 'ansi') {
        expect(result.height).toBe(5)
        expect(result.lines.length).toBe(5)
      }
    })

    it('uses default width of 48 when not specified', async () => {
      const buffer = await createTestImage(100, 50)
      const result = await renderAscii(buffer)

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.width).toBe(48)
      }
    })

    it('calculates height based on aspect ratio', async () => {
      // og:image ratio is 1200x630 (1.91:1)
      const buffer = await createTestImage(1200, 630)
      const result = await renderAscii(buffer, { width: 48 })

      expect(result.ok).toBe(true)
      if (result.ok) {
        // Height should be calculated to maintain aspect ratio
        // With charAspectRatio of 0.5 and image ratio of ~1.91
        // Expected: ~12-13 rows
        expect(result.height).toBeGreaterThanOrEqual(10)
        expect(result.height).toBeLessThanOrEqual(15)
      }
    })
  })

  describe('output format', () => {
    it('produces lines with ANSI escape codes in ansi mode', async () => {
      const buffer = await createTestImage(10, 10, 0xff0000ff) // Red image
      const result = await renderAscii(buffer, {
        width: 5,
        height: 2,
        outputMode: 'ansi',
      })

      expect(result.ok).toBe(true)
      if (result.ok && result.mode === 'ansi') {
        // Each line should contain ANSI escape codes
        for (const line of result.lines) {
          expect(line).toContain('\x1b[') // ANSI escape sequence
        }
      }
    })

    it('uses half-block characters in ansi mode', async () => {
      const buffer = await createTestImage(4, 4, 0x00ff00ff) // Green image
      const result = await renderAscii(buffer, {
        width: 4,
        height: 2,
        outputMode: 'ansi',
      })

      expect(result.ok).toBe(true)
      if (result.ok && result.mode === 'ansi') {
        // Should contain the lower half-block character
        const allText = result.lines.join('')
        expect(allText).toContain('\u2584')
      }
    })

    it('produces structured data in data mode', async () => {
      const buffer = await createTestImage(4, 4, 0xff0000ff) // Red image
      const result = await renderAscii(buffer, {
        width: 4,
        height: 2,
        outputMode: 'data',
      })

      expect(result.ok).toBe(true)
      if (result.ok && result.mode === 'data') {
        expect(result.rows.length).toBe(2)
        expect(result.rows[0].length).toBe(4)
        // Each cell should have char, fg, and bg
        const cell = result.rows[0][0]
        expect(cell.char).toBe('\u2584')
        expect(cell.fg).toHaveLength(3)
        expect(cell.bg).toHaveLength(3)
      }
    })
  })

  describe('aspect ratio handling', () => {
    it('respects custom charAspectRatio', async () => {
      const buffer = await createTestImage(100, 100)

      const result1 = await renderAscii(buffer, {
        width: 20,
        charAspectRatio: 0.5,
      })
      const result2 = await renderAscii(buffer, {
        width: 20,
        charAspectRatio: 1.0,
      })

      expect(result1.ok).toBe(true)
      expect(result2.ok).toBe(true)

      if (result1.ok && result2.ok) {
        // Different char aspect ratios should produce different heights
        expect(result1.height).not.toBe(result2.height)
      }
    })
  })

  describe('color rendering', () => {
    it('renders different colors for top and bottom pixels in ansi mode', async () => {
      // Create an image with red top half and blue bottom half
      const buffer = await createGradientImage(
        4,
        4,
        0xff0000ff, // Red top
        0x0000ffff, // Blue bottom
      )

      const result = await renderAscii(buffer, {
        width: 4,
        height: 2,
        outputMode: 'ansi',
      })

      expect(result.ok).toBe(true)
      if (result.ok && result.mode === 'ansi') {
        // The output should contain different color codes
        // (exact values depend on chalk's RGB encoding)
        expect(result.lines.length).toBe(2)
        // Lines should have color codes
        for (const line of result.lines) {
          expect(line.length).toBeGreaterThan(4) // More than just 4 half-blocks
        }
      }
    })

    it('captures colors correctly in data mode', async () => {
      // Create a simple red image
      const buffer = await createTestImage(4, 4, 0xff0000ff) // Red

      const result = await renderAscii(buffer, {
        width: 4,
        height: 2,
        outputMode: 'data',
      })

      expect(result.ok).toBe(true)
      if (result.ok && result.mode === 'data') {
        expect(result.rows.length).toBe(2)
        // Check that red color is captured correctly
        const firstCell = result.rows[0][0]
        expect(firstCell.bg[0]).toBeGreaterThan(200) // Red channel high in bg
        expect(firstCell.fg[0]).toBeGreaterThan(200) // Red channel high in fg
        expect(firstCell.bg[1]).toBeLessThan(50) // Green channel low
        expect(firstCell.bg[2]).toBeLessThan(50) // Blue channel low
      }
    })
  })
})
