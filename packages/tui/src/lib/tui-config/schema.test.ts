/**
 * Unit tests for TUI config schema validation.
 */
import { describe, test, expect } from 'bun:test'
import {
  TuiConfigSchema,
  ConfigUrlSchema,
  ConfigGroupSchema,
  ConfigEntrySchema,
} from './schema.js'

describe('ConfigUrlSchema', () => {
  test('accepts valid URL entry', () => {
    const result = ConfigUrlSchema.safeParse({
      url: 'https://example.com',
    })
    expect(result.success).toBe(true)
  })

  test('accepts URL with title', () => {
    const result = ConfigUrlSchema.safeParse({
      url: 'https://example.com',
      title: 'Example Site',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe('Example Site')
    }
  })

  test('rejects invalid URL', () => {
    const result = ConfigUrlSchema.safeParse({
      url: 'not-a-valid-url',
    })
    expect(result.success).toBe(false)
  })

  test('rejects missing URL', () => {
    const result = ConfigUrlSchema.safeParse({
      title: 'No URL here',
    })
    expect(result.success).toBe(false)
  })
})

describe('ConfigGroupSchema', () => {
  test('accepts valid group', () => {
    const result = ConfigGroupSchema.safeParse({
      group: 'Blog Posts',
      urls: [{ url: 'https://example.com/post-1' }],
    })
    expect(result.success).toBe(true)
  })

  test('accepts group with multiple URLs', () => {
    const result = ConfigGroupSchema.safeParse({
      group: 'Pages',
      urls: [
        { url: 'https://example.com/page-1' },
        { url: 'https://example.com/page-2', title: 'Page 2' },
      ],
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.urls.length).toBe(2)
    }
  })

  test('rejects empty group name', () => {
    const result = ConfigGroupSchema.safeParse({
      group: '',
      urls: [{ url: 'https://example.com' }],
    })
    expect(result.success).toBe(false)
  })

  test('rejects empty URLs array', () => {
    const result = ConfigGroupSchema.safeParse({
      group: 'Empty Group',
      urls: [],
    })
    expect(result.success).toBe(false)
  })
})

describe('ConfigEntrySchema', () => {
  test('accepts URL entry', () => {
    const result = ConfigEntrySchema.safeParse({
      url: 'https://example.com',
    })
    expect(result.success).toBe(true)
  })

  test('accepts group entry', () => {
    const result = ConfigEntrySchema.safeParse({
      group: 'Test',
      urls: [{ url: 'https://example.com' }],
    })
    expect(result.success).toBe(true)
  })
})

describe('TuiConfigSchema', () => {
  test('accepts config with flat URLs', () => {
    const result = TuiConfigSchema.safeParse({
      urls: [
        { url: 'https://example.com' },
        { url: 'https://example.org', title: 'Another Site' },
      ],
    })
    expect(result.success).toBe(true)
  })

  test('accepts config with grouped URLs', () => {
    const result = TuiConfigSchema.safeParse({
      urls: [
        {
          group: 'Blog',
          urls: [
            { url: 'https://example.com/blog/1' },
            { url: 'https://example.com/blog/2' },
          ],
        },
      ],
    })
    expect(result.success).toBe(true)
  })

  test('accepts mixed flat and grouped URLs', () => {
    const result = TuiConfigSchema.safeParse({
      urls: [
        { url: 'https://example.com' },
        {
          group: 'Blog',
          urls: [{ url: 'https://example.com/blog/1' }],
        },
        { url: 'https://example.org' },
      ],
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.urls.length).toBe(3)
    }
  })

  test('rejects empty URLs array', () => {
    const result = TuiConfigSchema.safeParse({
      urls: [],
    })
    expect(result.success).toBe(false)
  })

  test('rejects missing urls field', () => {
    const result = TuiConfigSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})
