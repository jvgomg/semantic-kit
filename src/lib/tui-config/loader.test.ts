/**
 * Unit tests for TUI config loader.
 */
import { join } from 'path'
import { describe, test, expect } from 'bun:test'
import { loadTuiConfig, formatConfigError } from './loader.js'

// Test fixtures directory (co-located with module)
const FIXTURES_DIR = join(import.meta.dir, 'fixtures')

describe('loadTuiConfig', () => {
  test('loads valid simple config', async () => {
    const result = await loadTuiConfig(join(FIXTURES_DIR, 'valid-simple.yaml'))

    expect(result.type).toBe('success')
    if (result.type === 'success') {
      expect(result.config.urls.length).toBe(3)
    }
  })

  test('loads valid grouped config', async () => {
    const result = await loadTuiConfig(join(FIXTURES_DIR, 'valid-grouped.yaml'))

    expect(result.type).toBe('success')
    if (result.type === 'success') {
      expect(result.config.urls.length).toBe(4) // 1 flat + 2 groups + 1 flat
    }
  })

  test('returns error for file not found', async () => {
    const result = await loadTuiConfig(join(FIXTURES_DIR, 'nonexistent.yaml'))

    expect(result.type).toBe('error')
    if (result.type === 'error') {
      expect(result.errorType).toBe('file-not-found')
    }
  })

  test('returns error for invalid YAML syntax', async () => {
    const result = await loadTuiConfig(join(FIXTURES_DIR, 'invalid-syntax.yaml'))

    expect(result.type).toBe('error')
    if (result.type === 'error') {
      expect(result.errorType).toBe('parse-error')
    }
  })

  test('returns error for empty URLs', async () => {
    const result = await loadTuiConfig(join(FIXTURES_DIR, 'invalid-empty.yaml'))

    expect(result.type).toBe('error')
    if (result.type === 'error') {
      expect(result.errorType).toBe('validation-error')
      expect(result.details).toBeDefined()
      expect(result.details!.length).toBeGreaterThan(0)
    }
  })
})

describe('formatConfigError', () => {
  test('formats file not found error', async () => {
    const result = await loadTuiConfig('/nonexistent/path.yaml')
    const formatted = formatConfigError(result)

    expect(formatted).toContain('Error loading config')
    expect(formatted).toContain('not found')
  })

  test('formats validation error with details', async () => {
    const result = await loadTuiConfig(join(FIXTURES_DIR, 'invalid-empty.yaml'))
    const formatted = formatConfigError(result)

    expect(formatted).toContain('Error loading config')
    expect(formatted).toContain('Validation errors')
  })

  test('returns empty string for success', async () => {
    const result = await loadTuiConfig(join(FIXTURES_DIR, 'valid-simple.yaml'))
    const formatted = formatConfigError(result)

    expect(formatted).toBe('')
  })
})
