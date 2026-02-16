/**
 * Unit tests for JSON envelope formatting.
 */

import { describe, it, expect, beforeAll, afterAll } from 'bun:test'
import {
  createJsonEnvelope,
  formatJsonEnvelope,
  type JsonEnvelope,
} from './json-envelope.js'
import type { Issue } from './cli-formatting/index.js'

// ============================================================================
// Test Helpers
// ============================================================================

// Mock Date for consistent timestamp testing
let originalDate: DateConstructor
let mockDate: Date

beforeAll(() => {
  originalDate = global.Date
  mockDate = new Date('2024-01-15T12:00:00.000Z')
  global.Date = class extends originalDate {
    constructor() {
      super()
      return mockDate
    }
    static now() {
      return mockDate.getTime()
    }
  } as DateConstructor
})

afterAll(() => {
  global.Date = originalDate
})

const sampleIssues: Issue[] = [
  {
    type: 'warning',
    severity: 'high',
    title: 'Sample Warning',
    description: 'This is a test warning',
    tip: 'Fix it',
  },
  {
    type: 'info',
    severity: 'low',
    title: 'Sample Info',
    description: 'This is informational',
  },
]

// ============================================================================
// createJsonEnvelope Tests
// ============================================================================

describe('createJsonEnvelope', () => {
  describe('basic envelope structure', () => {
    it('creates envelope with all required fields', () => {
      const result = { foo: 'bar', count: 42 }
      const envelope = createJsonEnvelope({
        commandName: 'test-command',
        target: 'https://example.com',
        durationMs: 1234,
        result,
      })

      expect(envelope).toHaveProperty('command')
      expect(envelope).toHaveProperty('result')
      expect(envelope).toHaveProperty('issues')
    })

    it('includes command metadata', () => {
      const envelope = createJsonEnvelope({
        commandName: 'ai',
        target: 'https://example.com/page',
        durationMs: 5678,
        result: {},
      })

      expect(envelope.command.name).toBe('ai')
      expect(envelope.command.target).toBe('https://example.com/page')
      expect(envelope.command.durationMs).toBe(5678)
    })

    it('includes semantic-kit version in command metadata', () => {
      const envelope = createJsonEnvelope({
        commandName: 'test',
        target: 'test.html',
        durationMs: 100,
        result: {},
      })

      expect(envelope.command).toHaveProperty('version')
      expect(typeof envelope.command.version).toBe('string')
      expect(envelope.command.version.length).toBeGreaterThan(0)
    })

    it('includes ISO 8601 timestamp', () => {
      const envelope = createJsonEnvelope({
        commandName: 'test',
        target: 'test.html',
        durationMs: 100,
        result: {},
      })

      expect(envelope.command.timestamp).toBe('2024-01-15T12:00:00.000Z')
    })
  })

  describe('result handling', () => {
    it('preserves result data exactly', () => {
      const result = {
        title: 'Test',
        count: 42,
        nested: { data: 'value' },
        array: [1, 2, 3],
      }

      const envelope = createJsonEnvelope({
        commandName: 'test',
        target: 'test.html',
        durationMs: 100,
        result,
      })

      expect(envelope.result).toEqual(result)
      expect(envelope.result).toBe(result) // Same reference
    })

    it('handles null result', () => {
      const envelope = createJsonEnvelope({
        commandName: 'test',
        target: 'test.html',
        durationMs: 100,
        result: null,
      })

      expect(envelope.result).toBeNull()
    })

    it('handles empty object result', () => {
      const envelope = createJsonEnvelope({
        commandName: 'test',
        target: 'test.html',
        durationMs: 100,
        result: {},
      })

      expect(envelope.result).toEqual({})
    })

    it('preserves result type information', () => {
      interface CustomResult {
        id: number
        name: string
      }

      const result: CustomResult = { id: 1, name: 'Test' }
      const envelope: JsonEnvelope<CustomResult> = createJsonEnvelope({
        commandName: 'test',
        target: 'test.html',
        durationMs: 100,
        result,
      })

      // TypeScript should infer the correct type
      expect(envelope.result.id).toBe(1)
      expect(envelope.result.name).toBe('Test')
    })
  })

  describe('issues handling', () => {
    it('includes provided issues', () => {
      const envelope = createJsonEnvelope({
        commandName: 'test',
        target: 'test.html',
        durationMs: 100,
        result: {},
        issues: sampleIssues,
      })

      expect(envelope.issues).toEqual(sampleIssues)
      expect(envelope.issues).toHaveLength(2)
    })

    it('defaults to empty array when issues not provided', () => {
      const envelope = createJsonEnvelope({
        commandName: 'test',
        target: 'test.html',
        durationMs: 100,
        result: {},
      })

      expect(envelope.issues).toEqual([])
      expect(envelope.issues).toHaveLength(0)
    })

    it('preserves issue structure', () => {
      const envelope = createJsonEnvelope({
        commandName: 'test',
        target: 'test.html',
        durationMs: 100,
        result: {},
        issues: sampleIssues,
      })

      const firstIssue = envelope.issues[0]!
      expect(firstIssue.type).toBe('warning')
      expect(firstIssue.severity).toBe('high')
      expect(firstIssue.title).toBe('Sample Warning')
      expect(firstIssue.description).toBeDefined()
      expect(firstIssue.tip).toBeDefined()
    })
  })

  describe('command names', () => {
    it('handles standard command names', () => {
      const commands = [
        'ai',
        'reader',
        'google',
        'social',
        'screen-reader',
        'structure',
        'a11y-tree',
        'validate:html',
        'validate:schema',
        'validate:a11y',
      ]

      commands.forEach((cmd) => {
        const envelope = createJsonEnvelope({
          commandName: cmd,
          target: 'test.html',
          durationMs: 100,
          result: {},
        })
        expect(envelope.command.name).toBe(cmd)
      })
    })

    it('handles variant command names', () => {
      const variants = [
        'structure:js',
        'structure:compare',
        'readability:js',
        'readability:compare',
        'schema:js',
        'schema:compare',
      ]

      variants.forEach((cmd) => {
        const envelope = createJsonEnvelope({
          commandName: cmd,
          target: 'test.html',
          durationMs: 100,
          result: {},
        })
        expect(envelope.command.name).toBe(cmd)
      })
    })
  })

  describe('target formats', () => {
    it('handles URL targets', () => {
      const envelope = createJsonEnvelope({
        commandName: 'test',
        target: 'https://example.com/page?query=1',
        durationMs: 100,
        result: {},
      })

      expect(envelope.command.target).toBe('https://example.com/page?query=1')
    })

    it('handles file path targets', () => {
      const envelope = createJsonEnvelope({
        commandName: 'test',
        target: '/path/to/file.html',
        durationMs: 100,
        result: {},
      })

      expect(envelope.command.target).toBe('/path/to/file.html')
    })

    it('handles relative path targets', () => {
      const envelope = createJsonEnvelope({
        commandName: 'test',
        target: './relative/path.html',
        durationMs: 100,
        result: {},
      })

      expect(envelope.command.target).toBe('./relative/path.html')
    })
  })

  describe('duration values', () => {
    it('handles small durations', () => {
      const envelope = createJsonEnvelope({
        commandName: 'test',
        target: 'test.html',
        durationMs: 5,
        result: {},
      })

      expect(envelope.command.durationMs).toBe(5)
    })

    it('handles large durations', () => {
      const envelope = createJsonEnvelope({
        commandName: 'test',
        target: 'test.html',
        durationMs: 30000,
        result: {},
      })

      expect(envelope.command.durationMs).toBe(30000)
    })

    it('handles zero duration', () => {
      const envelope = createJsonEnvelope({
        commandName: 'test',
        target: 'test.html',
        durationMs: 0,
        result: {},
      })

      expect(envelope.command.durationMs).toBe(0)
    })
  })
})

// ============================================================================
// formatJsonEnvelope Tests
// ============================================================================

describe('formatJsonEnvelope', () => {
  it('returns pretty-printed JSON string', () => {
    const json = formatJsonEnvelope({
      commandName: 'test',
      target: 'test.html',
      durationMs: 100,
      result: { foo: 'bar' },
    })

    // Should be a string
    expect(typeof json).toBe('string')

    // Should be parseable
    const parsed = JSON.parse(json)
    expect(parsed).toHaveProperty('command')
    expect(parsed).toHaveProperty('result')
    expect(parsed).toHaveProperty('issues')
  })

  it('uses 2-space indentation', () => {
    const json = formatJsonEnvelope({
      commandName: 'test',
      target: 'test.html',
      durationMs: 100,
      result: { nested: { data: 'value' } },
    })

    // Pretty-printed JSON should contain newlines and spaces
    expect(json).toContain('\n')
    expect(json).toContain('  ')
  })

  it('produces valid JSON', () => {
    const json = formatJsonEnvelope({
      commandName: 'test',
      target: 'test.html',
      durationMs: 100,
      result: { foo: 'bar', count: 42 },
      issues: sampleIssues,
    })

    // Should not throw when parsing
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('preserves all data in JSON output', () => {
    const result = {
      title: 'Test',
      count: 123,
      nested: { value: 'data' },
    }

    const json = formatJsonEnvelope({
      commandName: 'ai',
      target: 'https://example.com',
      durationMs: 1234,
      result,
      issues: sampleIssues,
    })

    const parsed = JSON.parse(json)

    expect(parsed.command.name).toBe('ai')
    expect(parsed.command.target).toBe('https://example.com')
    expect(parsed.command.durationMs).toBe(1234)
    expect(parsed.result).toEqual(result)
    expect(parsed.issues).toHaveLength(2)
  })

  it('handles empty result object', () => {
    const json = formatJsonEnvelope({
      commandName: 'test',
      target: 'test.html',
      durationMs: 100,
      result: {},
    })

    const parsed = JSON.parse(json)
    expect(parsed.result).toEqual({})
  })

  it('handles complex nested structures', () => {
    const complexResult = {
      level1: {
        level2: {
          level3: {
            array: [1, 2, 3],
            boolean: true,
            null: null,
            string: 'value',
          },
        },
      },
    }

    const json = formatJsonEnvelope({
      commandName: 'test',
      target: 'test.html',
      durationMs: 100,
      result: complexResult,
    })

    const parsed = JSON.parse(json)
    expect(parsed.result).toEqual(complexResult)
  })
})

// ============================================================================
// Integration Tests
// ============================================================================

describe('JSON envelope integration', () => {
  it('envelope can be created and formatted consistently', () => {
    const result = { data: 'test' }
    const issues: Issue[] = [
      {
        type: 'error',
        severity: 'high',
        title: 'Error',
        description: 'Test error',
      },
    ]

    // Create envelope
    const envelope = createJsonEnvelope({
      commandName: 'validate:html',
      target: 'https://example.com',
      durationMs: 5000,
      result,
      issues,
    })

    // Format envelope
    const formatted = formatJsonEnvelope({
      commandName: 'validate:html',
      target: 'https://example.com',
      durationMs: 5000,
      result,
      issues,
    })

    // Parse formatted JSON
    const parsed = JSON.parse(formatted)

    // Should be equivalent
    expect(parsed).toEqual(envelope)
  })

  it('roundtrip preserves all information', () => {
    const original = {
      commandName: 'structure:compare',
      target: '/path/to/file.html',
      durationMs: 999,
      result: {
        title: 'Test Page',
        count: 42,
        nested: { data: [1, 2, 3] },
      },
      issues: sampleIssues,
    }

    // Create -> Format -> Parse
    const envelope = createJsonEnvelope(original)
    const formatted = JSON.stringify(envelope, null, 2)
    const parsed = JSON.parse(formatted)

    // All data should be preserved
    expect(parsed.command.name).toBe(original.commandName)
    expect(parsed.command.target).toBe(original.target)
    expect(parsed.command.durationMs).toBe(original.durationMs)
    expect(parsed.result).toEqual(original.result)
    expect(parsed.issues).toEqual(original.issues)
  })
})
