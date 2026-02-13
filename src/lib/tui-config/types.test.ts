/**
 * Unit tests for TUI config type guards.
 */
import { describe, test, expect } from 'bun:test'
import { isConfigGroup, isConfigUrl } from './types.js'
import type { ConfigEntry } from './schema.js'

describe('isConfigGroup', () => {
  test('returns true for group entry', () => {
    const entry: ConfigEntry = {
      group: 'Test Group',
      urls: [{ url: 'https://example.com' }],
    }
    expect(isConfigGroup(entry)).toBe(true)
  })

  test('returns false for URL entry', () => {
    const entry: ConfigEntry = {
      url: 'https://example.com',
    }
    expect(isConfigGroup(entry)).toBe(false)
  })

  test('returns false for URL entry with title', () => {
    const entry: ConfigEntry = {
      url: 'https://example.com',
      title: 'Example',
    }
    expect(isConfigGroup(entry)).toBe(false)
  })
})

describe('isConfigUrl', () => {
  test('returns true for URL entry', () => {
    const entry: ConfigEntry = {
      url: 'https://example.com',
    }
    expect(isConfigUrl(entry)).toBe(true)
  })

  test('returns true for URL entry with title', () => {
    const entry: ConfigEntry = {
      url: 'https://example.com',
      title: 'Example',
    }
    expect(isConfigUrl(entry)).toBe(true)
  })

  test('returns false for group entry', () => {
    const entry: ConfigEntry = {
      group: 'Test Group',
      urls: [{ url: 'https://example.com' }],
    }
    expect(isConfigUrl(entry)).toBe(false)
  })
})
