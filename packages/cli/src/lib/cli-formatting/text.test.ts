/**
 * Unit tests for text utilities.
 */

import { describe, it, expect } from 'bun:test'
import { indent, wrapText } from './text.js'
import type { FormatterContext } from './types.js'

// ============================================================================
// Test Helpers
// ============================================================================

const ttyContext: FormatterContext = {
  mode: 'tty',
  width: 80,
}

const plainContext: FormatterContext = {
  mode: 'plain',
}

// ============================================================================
// indent Tests
// ============================================================================

describe('indent', () => {
  it('indents a single line', () => {
    const result = indent('Hello', 4)
    expect(result).toBe('    Hello')
  })

  it('indents multiple lines', () => {
    const result = indent('Line 1\nLine 2\nLine 3', 2)
    expect(result).toBe('  Line 1\n  Line 2\n  Line 3')
  })

  it('handles zero spaces', () => {
    const result = indent('No indent', 0)
    expect(result).toBe('No indent')
  })

  it('handles empty string', () => {
    const result = indent('', 4)
    expect(result).toBe('    ')
  })

  it('handles text with trailing newline', () => {
    const result = indent('Line 1\nLine 2\n', 2)
    expect(result).toBe('  Line 1\n  Line 2\n  ')
  })
})

// ============================================================================
// wrapText Tests
// ============================================================================

describe('wrapText', () => {
  describe('TTY mode', () => {
    it('does not wrap short text', () => {
      const text = 'Short text'
      const result = wrapText(text, ttyContext)
      expect(result).toBe(text)
    })

    it('wraps long text at default width', () => {
      const text =
        'This is a very long text that should definitely wrap when it exceeds the maximum width'
      const result = wrapText(text, { mode: 'tty', width: 40 })
      const lines = result.split('\n')

      // Should be wrapped into multiple lines
      expect(lines.length).toBeGreaterThan(1)

      // Each line should not exceed width
      lines.forEach((line) => {
        expect(line.length).toBeLessThanOrEqual(40)
      })
    })

    it('wraps at custom maxWidth', () => {
      const text = 'This text should wrap at thirty characters which is custom'
      const result = wrapText(text, ttyContext, { maxWidth: 30 })
      const lines = result.split('\n')

      // Should be wrapped
      expect(lines.length).toBeGreaterThan(1)

      // First line should not exceed 30 chars
      expect(lines[0]!.length).toBeLessThanOrEqual(30)
    })

    it('indents wrapped lines', () => {
      const text =
        'This is a long text that will wrap and subsequent lines should be indented'
      const result = wrapText(text, { mode: 'tty', width: 40 }, { indent: 4 })
      const lines = result.split('\n')

      // Should have multiple lines
      expect(lines.length).toBeGreaterThan(1)

      // First line should not be indented
      expect(lines[0]).not.toMatch(/^\s/)

      // Subsequent lines should start with 4 spaces
      for (let i = 1; i < lines.length; i++) {
        expect(lines[i]).toMatch(/^ {4}/)
      }
    })

    it('accounts for indent in wrap width', () => {
      const text = 'Word '.repeat(20) // 100 chars total
      const result = wrapText(text, { mode: 'tty', width: 50 }, { indent: 10 })
      const lines = result.split('\n')

      // Should wrap into multiple lines
      expect(lines.length).toBeGreaterThan(1)

      // First line can use full 50 chars
      expect(lines[0]!.length).toBeLessThanOrEqual(50)

      // Wrapped lines: 10 indent + content <= 50, so content <= 40
      for (let i = 1; i < lines.length; i++) {
        expect(lines[i]!.length).toBeLessThanOrEqual(50)
      }
    })

    it('handles single very long word', () => {
      const text = 'Supercalifragilisticexpialidocious'
      const result = wrapText(text, { mode: 'tty', width: 20 })

      // Single word that exceeds width should stay on one line
      expect(result).toBe(text)
    })

    it('preserves spaces between words', () => {
      const text = 'One two three'
      const result = wrapText(text, { mode: 'tty', width: 100 })

      // Should not wrap, spaces should be preserved
      expect(result).toBe('One two three')
    })

    it('handles empty text', () => {
      const result = wrapText('', ttyContext)
      expect(result).toBe('')
    })

    it('handles text with only spaces', () => {
      const result = wrapText('   ', ttyContext)
      // Text is short enough, returned as-is (implementation behavior)
      expect(result).toBe('   ')
    })
  })

  describe('Plain mode', () => {
    it('does not wrap in plain mode', () => {
      const text =
        'This is a very long text that should NOT wrap in plain mode even if it exceeds any width'
      const result = wrapText(text, plainContext)

      // Should not wrap
      expect(result).toBe(text)
      expect(result.split('\n')).toHaveLength(1)
    })

    it('ignores indent option in plain mode', () => {
      const text = 'Long text that would normally wrap'
      const result = wrapText(text, plainContext, { indent: 10 })

      // Should not have any indentation
      expect(result).toBe(text)
    })

    it('ignores maxWidth option in plain mode', () => {
      const text = 'Very long text that exceeds maxWidth'
      const result = wrapText(text, plainContext, { maxWidth: 10 })

      // Should not wrap
      expect(result).toBe(text)
    })
  })

  describe('Edge cases', () => {
    it('handles text exactly at width boundary', () => {
      const text = 'A'.repeat(80)
      const result = wrapText(text, { mode: 'tty', width: 80 })

      // Should not wrap if exactly at boundary
      expect(result).toBe(text)
    })

    it('handles multiple spaces between words', () => {
      const text = 'Word1    Word2     Word3'
      const result = wrapText(text, { mode: 'tty', width: 100 })

      // Multiple spaces collapse to single in split/join
      expect(result).toContain('Word1')
      expect(result).toContain('Word2')
      expect(result).toContain('Word3')
    })

    it('wraps at word boundaries', () => {
      const text = 'First Second Third'
      const result = wrapText(text, { mode: 'tty', width: 14 })
      const lines = result.split('\n')

      // Should break between words, not in the middle
      expect(lines.some((line) => line.includes('First'))).toBe(true)
      expect(lines.some((line) => line.includes('Second'))).toBe(true)
    })
  })
})
