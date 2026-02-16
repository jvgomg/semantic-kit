/**
 * Unit tests for CLI argument validation utilities.
 */

import { describe, it, expect } from 'bun:test'
import { validateFormat, validateTimeout, isUrl } from './arguments.js'
import type { OutputFormat } from './arguments.js'

// ============================================================================
// validateFormat Tests
// ============================================================================

describe('validateFormat', () => {
  const allowedFormats: readonly OutputFormat[] = [
    'full',
    'compact',
    'json',
  ] as const

  describe('valid inputs', () => {
    it('returns full when format is undefined', () => {
      const result = validateFormat(undefined, allowedFormats)
      expect(result).toBe('full')
    })

    it('returns specified format when valid', () => {
      expect(validateFormat('full', allowedFormats)).toBe('full')
      expect(validateFormat('compact', allowedFormats)).toBe('compact')
      expect(validateFormat('json', allowedFormats)).toBe('json')
    })

    it('uses custom default format', () => {
      const result = validateFormat(undefined, allowedFormats, 'compact')
      expect(result).toBe('compact')
    })
  })

  describe('format subsets', () => {
    it('validates against subset of formats', () => {
      const subset: readonly OutputFormat[] = ['full', 'json'] as const
      expect(validateFormat('full', subset)).toBe('full')
      expect(validateFormat('json', subset)).toBe('json')
    })

    it('accepts brief format when in allowed list', () => {
      const withBrief: readonly OutputFormat[] = [
        'full',
        'brief',
        'json',
      ] as const
      expect(validateFormat('brief', withBrief)).toBe('brief')
    })
  })

  // Note: Testing invalid format requires mocking process.exit
  // which is challenging in Bun. In practice, validateFormat will
  // call process.exit(1) when given an invalid format.
  describe('invalid inputs (calls process.exit)', () => {
    it.todo('exits with error when format is invalid')
    it.todo('exits with helpful error message listing allowed formats')
  })
})

// ============================================================================
// validateTimeout Tests
// ============================================================================

describe('validateTimeout', () => {
  describe('valid inputs', () => {
    it('returns default timeout when undefined', () => {
      const result = validateTimeout(undefined)
      expect(result).toBe(5000)
    })

    it('returns custom default when provided', () => {
      const result = validateTimeout(undefined, 10000)
      expect(result).toBe(10000)
    })

    it('parses valid timeout string', () => {
      expect(validateTimeout('1000')).toBe(1000)
      expect(validateTimeout('5000')).toBe(5000)
      expect(validateTimeout('30000')).toBe(30000)
    })

    it('accepts very small timeout', () => {
      expect(validateTimeout('1')).toBe(1)
    })

    it('accepts large timeout', () => {
      expect(validateTimeout('999999')).toBe(999999)
    })
  })

  // Note: Testing invalid timeout requires mocking process.exit
  describe('invalid inputs (calls process.exit)', () => {
    it.todo('exits with error when timeout is not a number')
    it.todo('exits with error when timeout is zero')
    it.todo('exits with error when timeout is negative')
    it.todo('exits with error when timeout is NaN')
  })
})

// ============================================================================
// isUrl Tests
// ============================================================================

describe('isUrl', () => {
  describe('valid URLs', () => {
    it('returns true for http URLs', () => {
      expect(isUrl('http://example.com')).toBe(true)
      expect(isUrl('http://localhost')).toBe(true)
      expect(isUrl('http://example.com/path')).toBe(true)
      expect(isUrl('http://example.com/path?query=1')).toBe(true)
    })

    it('returns true for https URLs', () => {
      expect(isUrl('https://example.com')).toBe(true)
      expect(isUrl('https://localhost:3000')).toBe(true)
      expect(isUrl('https://example.com/path/to/page')).toBe(true)
      expect(isUrl('https://example.com#fragment')).toBe(true)
    })

    it('returns true for URLs with subdomains', () => {
      expect(isUrl('https://www.example.com')).toBe(true)
      expect(isUrl('https://api.example.com')).toBe(true)
      expect(isUrl('https://sub.domain.example.com')).toBe(true)
    })

    it('returns true for URLs with ports', () => {
      expect(isUrl('http://localhost:8080')).toBe(true)
      expect(isUrl('https://example.com:443')).toBe(true)
    })

    it('returns true for URLs with complex paths', () => {
      expect(isUrl('https://example.com/path/to/page.html')).toBe(true)
      expect(isUrl('https://example.com/api/v1/resource?id=123')).toBe(true)
    })
  })

  describe('non-URLs', () => {
    it('returns false for absolute file paths', () => {
      expect(isUrl('/path/to/file.html')).toBe(false)
      expect(isUrl('/Users/user/file.html')).toBe(false)
      expect(isUrl('/var/www/index.html')).toBe(false)
    })

    it('returns false for relative file paths', () => {
      expect(isUrl('./file.html')).toBe(false)
      expect(isUrl('../file.html')).toBe(false)
      expect(isUrl('file.html')).toBe(false)
      expect(isUrl('path/to/file.html')).toBe(false)
    })

    it('returns false for other protocols', () => {
      expect(isUrl('ftp://example.com')).toBe(false)
      expect(isUrl('file:///path/to/file')).toBe(false)
      expect(isUrl('ws://example.com')).toBe(false)
    })

    it('returns false for empty string', () => {
      expect(isUrl('')).toBe(false)
    })

    it('returns true for just protocol (implementation quirk)', () => {
      // Note: isUrl only checks if string starts with http:// or https://
      // It doesn't validate that it's a well-formed URL
      expect(isUrl('http://')).toBe(true)
      expect(isUrl('https://')).toBe(true)
    })

    it('returns false for malformed URLs', () => {
      expect(isUrl('ht tp://example.com')).toBe(false)
      expect(isUrl('https//example.com')).toBe(false)
      expect(isUrl('https:example.com')).toBe(false)
    })
  })
})

// ============================================================================
// requireUrl Tests
// ============================================================================

// Note: requireUrl calls process.exit on failure, which is hard to test
// without mocking. We document the expected behavior here.
describe('requireUrl', () => {
  it.todo('does not exit when target is a valid http URL')
  it.todo('does not exit when target is a valid https URL')
  it.todo('exits with error when target is a file path')
  it.todo('exits with error message including command name')
  it.todo('exits with custom reason when provided')
  it.todo('exits with default reason when not provided')
})
