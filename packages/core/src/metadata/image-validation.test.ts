/**
 * Unit tests for image URL validation.
 *
 * These tests verify HTTP accessibility, Content-Type, file size, and format validation
 * for og:image and twitter:image URLs.
 *
 * @see research/topics/social-metadata/open-graph-validation.md
 */

import { describe, it, expect } from 'bun:test'
import {
  validateImageUrl,
  validateImageUrls,
  SUPPORTED_IMAGE_TYPES,
  PARTIAL_SUPPORT_IMAGE_TYPES,
  VALID_IMAGE_TYPES,
  PLATFORM_SIZE_LIMITS,
  UNIVERSAL_SIZE_LIMIT,
  DEFAULT_TIMEOUT_MS,
} from './image-validation.js'

// ============================================================================
// Mock fetch helper
// ============================================================================

type MockResponseInit = {
  status?: number
  statusText?: string
  headers?: Record<string, string>
}

function createMockFetch(
  responseInit: MockResponseInit = {},
  shouldThrow?: Error,
) {
  return async (): Promise<Response> => {
    if (shouldThrow) {
      throw shouldThrow
    }

    const { status = 200, statusText = 'OK', headers = {} } = responseInit

    return new Response(null, {
      status,
      statusText,
      headers: new Headers(headers),
    })
  }
}

// ============================================================================
// Constants Tests
// ============================================================================

describe('image validation constants', () => {
  describe('SUPPORTED_IMAGE_TYPES', () => {
    it('includes JPEG', () => {
      expect(SUPPORTED_IMAGE_TYPES).toContain('image/jpeg')
    })

    it('includes PNG', () => {
      expect(SUPPORTED_IMAGE_TYPES).toContain('image/png')
    })

    it('includes GIF', () => {
      expect(SUPPORTED_IMAGE_TYPES).toContain('image/gif')
    })

    it('includes WebP', () => {
      expect(SUPPORTED_IMAGE_TYPES).toContain('image/webp')
    })

    it('has exactly 4 supported types', () => {
      expect(SUPPORTED_IMAGE_TYPES).toHaveLength(4)
    })
  })

  describe('PARTIAL_SUPPORT_IMAGE_TYPES', () => {
    it('includes AVIF', () => {
      expect(PARTIAL_SUPPORT_IMAGE_TYPES).toContain('image/avif')
    })
  })

  describe('VALID_IMAGE_TYPES', () => {
    it('includes all supported types', () => {
      for (const type of SUPPORTED_IMAGE_TYPES) {
        expect(VALID_IMAGE_TYPES).toContain(type)
      }
    })

    it('includes all partial support types', () => {
      for (const type of PARTIAL_SUPPORT_IMAGE_TYPES) {
        expect(VALID_IMAGE_TYPES).toContain(type)
      }
    })
  })

  describe('PLATFORM_SIZE_LIMITS', () => {
    it('Facebook limit is 8MB', () => {
      expect(PLATFORM_SIZE_LIMITS.facebook).toBe(8 * 1024 * 1024)
    })

    it('LinkedIn limit is 5MB', () => {
      expect(PLATFORM_SIZE_LIMITS.linkedin).toBe(5 * 1024 * 1024)
    })

    it('Twitter limit is 5MB', () => {
      expect(PLATFORM_SIZE_LIMITS.twitter).toBe(5 * 1024 * 1024)
    })
  })

  describe('UNIVERSAL_SIZE_LIMIT', () => {
    it('is 5MB (strictest platform limit)', () => {
      expect(UNIVERSAL_SIZE_LIMIT).toBe(5 * 1024 * 1024)
    })

    it('is the minimum of all platform limits', () => {
      const minLimit = Math.min(...Object.values(PLATFORM_SIZE_LIMITS))
      expect(UNIVERSAL_SIZE_LIMIT).toBe(minLimit)
    })
  })

  describe('DEFAULT_TIMEOUT_MS', () => {
    it('is 5 seconds', () => {
      expect(DEFAULT_TIMEOUT_MS).toBe(5000)
    })
  })
})

// ============================================================================
// HTTP Status Code Tests
// ============================================================================

describe('validateImageUrl - HTTP status codes', () => {
  const testUrl = 'https://example.com/image.jpg'

  it('returns valid=true for 200 OK with image content-type', async () => {
    const result = await validateImageUrl(testUrl, 'og:image', {
      fetch: createMockFetch({
        status: 200,
        headers: { 'content-type': 'image/jpeg' },
      }),
    })

    expect(result.valid).toBe(true)
    expect(result.statusCode).toBe(200)
    expect(result.issues).toHaveLength(0)
  })

  it('returns error for 404 Not Found', async () => {
    const result = await validateImageUrl(testUrl, 'og:image', {
      fetch: createMockFetch({
        status: 404,
        headers: { 'content-type': 'text/html' },
      }),
    })

    expect(result.valid).toBe(false)
    expect(result.statusCode).toBe(404)
    expect(result.issues).toHaveLength(1)
    expect(result.issues[0].code).toBe('og-image-not-found')
    expect(result.issues[0].severity).toBe('high')
  })

  it('returns error for 403 Forbidden', async () => {
    const result = await validateImageUrl(testUrl, 'og:image', {
      fetch: createMockFetch({
        status: 403,
        headers: { 'content-type': 'text/html' },
      }),
    })

    expect(result.valid).toBe(false)
    expect(result.statusCode).toBe(403)
    expect(result.issues).toHaveLength(1)
    expect(result.issues[0].code).toBe('og-image-not-found')
    expect(result.issues[0].description).toContain('403')
  })

  it('returns error for 401 Unauthorized', async () => {
    const result = await validateImageUrl(testUrl, 'og:image', {
      fetch: createMockFetch({
        status: 401,
        headers: { 'content-type': 'text/html' },
      }),
    })

    expect(result.valid).toBe(false)
    expect(result.statusCode).toBe(401)
    expect(result.issues[0].code).toBe('og-image-not-found')
  })

  it('returns warning for 500 Internal Server Error', async () => {
    const result = await validateImageUrl(testUrl, 'og:image', {
      fetch: createMockFetch({
        status: 500,
        headers: { 'content-type': 'text/html' },
      }),
    })

    expect(result.valid).toBe(false)
    expect(result.statusCode).toBe(500)
    expect(result.issues).toHaveLength(1)
    expect(result.issues[0].code).toBe('og-image-server-error')
    expect(result.issues[0].severity).toBe('medium')
  })

  it('returns warning for 502 Bad Gateway', async () => {
    const result = await validateImageUrl(testUrl, 'og:image', {
      fetch: createMockFetch({
        status: 502,
        headers: { 'content-type': 'text/html' },
      }),
    })

    expect(result.valid).toBe(false)
    expect(result.statusCode).toBe(502)
    expect(result.issues[0].code).toBe('og-image-server-error')
  })

  it('returns warning for 503 Service Unavailable', async () => {
    const result = await validateImageUrl(testUrl, 'og:image', {
      fetch: createMockFetch({
        status: 503,
        headers: { 'content-type': 'text/html' },
      }),
    })

    expect(result.valid).toBe(false)
    expect(result.issues[0].code).toBe('og-image-server-error')
  })
})

// ============================================================================
// Content-Type Tests
// ============================================================================

describe('validateImageUrl - Content-Type validation', () => {
  const testUrl = 'https://example.com/image.jpg'

  it('accepts image/jpeg', async () => {
    const result = await validateImageUrl(testUrl, 'og:image', {
      fetch: createMockFetch({
        status: 200,
        headers: { 'content-type': 'image/jpeg' },
      }),
    })

    expect(result.valid).toBe(true)
    expect(result.contentType).toBe('image/jpeg')
    expect(result.format).toBe('JPEG')
    expect(result.issues).toHaveLength(0)
  })

  it('accepts image/png', async () => {
    const result = await validateImageUrl(testUrl, 'og:image', {
      fetch: createMockFetch({
        status: 200,
        headers: { 'content-type': 'image/png' },
      }),
    })

    expect(result.valid).toBe(true)
    expect(result.contentType).toBe('image/png')
    expect(result.format).toBe('PNG')
  })

  it('accepts image/gif', async () => {
    const result = await validateImageUrl(testUrl, 'og:image', {
      fetch: createMockFetch({
        status: 200,
        headers: { 'content-type': 'image/gif' },
      }),
    })

    expect(result.valid).toBe(true)
    expect(result.format).toBe('GIF')
  })

  it('accepts image/webp', async () => {
    const result = await validateImageUrl(testUrl, 'og:image', {
      fetch: createMockFetch({
        status: 200,
        headers: { 'content-type': 'image/webp' },
      }),
    })

    expect(result.valid).toBe(true)
    expect(result.format).toBe('WEBP')
  })

  it('accepts image/jpeg with charset parameter', async () => {
    const result = await validateImageUrl(testUrl, 'og:image', {
      fetch: createMockFetch({
        status: 200,
        headers: { 'content-type': 'image/jpeg; charset=utf-8' },
      }),
    })

    expect(result.valid).toBe(true)
    expect(result.format).toBe('JPEG')
  })

  it('warns for image/avif (partial support)', async () => {
    const result = await validateImageUrl(testUrl, 'og:image', {
      fetch: createMockFetch({
        status: 200,
        headers: { 'content-type': 'image/avif' },
      }),
    })

    // Still valid but with warning
    expect(result.valid).toBe(true)
    expect(result.format).toBe('AVIF')
    expect(result.issues).toHaveLength(1)
    expect(result.issues[0].code).toBe('og-image-partial-support')
    expect(result.issues[0].severity).toBe('medium')
  })

  it('errors for text/html (not an image)', async () => {
    const result = await validateImageUrl(testUrl, 'og:image', {
      fetch: createMockFetch({
        status: 200,
        headers: { 'content-type': 'text/html' },
      }),
    })

    expect(result.valid).toBe(false)
    expect(result.issues).toHaveLength(1)
    expect(result.issues[0].code).toBe('og-image-not-image')
    expect(result.issues[0].severity).toBe('high')
  })

  it('errors for application/json (not an image)', async () => {
    const result = await validateImageUrl(testUrl, 'og:image', {
      fetch: createMockFetch({
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    })

    expect(result.valid).toBe(false)
    expect(result.issues[0].code).toBe('og-image-not-image')
  })

  it('errors when no Content-Type header', async () => {
    const result = await validateImageUrl(testUrl, 'og:image', {
      fetch: createMockFetch({
        status: 200,
        headers: {},
      }),
    })

    expect(result.valid).toBe(false)
    expect(result.issues[0].code).toBe('og-image-not-image')
    expect(result.issues[0].description).toContain('none')
  })

  it('warns for unknown image format like image/bmp', async () => {
    const result = await validateImageUrl(testUrl, 'og:image', {
      fetch: createMockFetch({
        status: 200,
        headers: { 'content-type': 'image/bmp' },
      }),
    })

    // It's an image, so not an error, but has compatibility warning
    expect(result.valid).toBe(true)
    expect(result.issues).toHaveLength(1)
    expect(result.issues[0].code).toBe('og-image-invalid-content-type')
    expect(result.issues[0].severity).toBe('medium')
  })

  it('can skip format check with checkFormat=false', async () => {
    const result = await validateImageUrl(testUrl, 'og:image', {
      checkFormat: false,
      fetch: createMockFetch({
        status: 200,
        headers: { 'content-type': 'image/avif' },
      }),
    })

    expect(result.valid).toBe(true)
    expect(result.issues).toHaveLength(0)
  })
})

// ============================================================================
// File Size Tests
// ============================================================================

describe('validateImageUrl - File size validation', () => {
  const testUrl = 'https://example.com/image.jpg'

  it('accepts image under 5MB', async () => {
    const result = await validateImageUrl(testUrl, 'og:image', {
      fetch: createMockFetch({
        status: 200,
        headers: {
          'content-type': 'image/jpeg',
          'content-length': String(4 * 1024 * 1024), // 4MB
        },
      }),
    })

    expect(result.valid).toBe(true)
    expect(result.contentLength).toBe(4 * 1024 * 1024)
    expect(result.issues).toHaveLength(0)
  })

  it('accepts image at exactly 5MB', async () => {
    const result = await validateImageUrl(testUrl, 'og:image', {
      fetch: createMockFetch({
        status: 200,
        headers: {
          'content-type': 'image/jpeg',
          'content-length': String(5 * 1024 * 1024),
        },
      }),
    })

    expect(result.valid).toBe(true)
    expect(result.issues).toHaveLength(0)
  })

  it('warns for image over 5MB (exceeds LinkedIn/Twitter)', async () => {
    const result = await validateImageUrl(testUrl, 'og:image', {
      fetch: createMockFetch({
        status: 200,
        headers: {
          'content-type': 'image/jpeg',
          'content-length': String(6 * 1024 * 1024), // 6MB
        },
      }),
    })

    expect(result.valid).toBe(true) // Warning, not error
    expect(result.issues).toHaveLength(1)
    expect(result.issues[0].code).toBe('og-image-too-large')
    expect(result.issues[0].severity).toBe('medium')
    expect(result.issues[0].description).toContain('linkedin')
    expect(result.issues[0].description).toContain('twitter')
    expect(result.issues[0].description).not.toContain('facebook')
  })

  it('warns for image over 8MB (exceeds all platforms)', async () => {
    const result = await validateImageUrl(testUrl, 'og:image', {
      fetch: createMockFetch({
        status: 200,
        headers: {
          'content-type': 'image/jpeg',
          'content-length': String(10 * 1024 * 1024), // 10MB
        },
      }),
    })

    expect(result.valid).toBe(true) // Warning, not error
    expect(result.issues).toHaveLength(1)
    expect(result.issues[0].description).toContain('linkedin')
    expect(result.issues[0].description).toContain('twitter')
    expect(result.issues[0].description).toContain('facebook')
  })

  it('includes actual size in issue metadata', async () => {
    const size = 7 * 1024 * 1024
    const result = await validateImageUrl(testUrl, 'og:image', {
      fetch: createMockFetch({
        status: 200,
        headers: {
          'content-type': 'image/jpeg',
          'content-length': String(size),
        },
      }),
    })

    expect(result.issues[0].metadata.actual).toBe(size)
    expect(result.issues[0].metadata.limit).toBe(UNIVERSAL_SIZE_LIMIT)
  })

  it('skips size check when Content-Length header missing', async () => {
    const result = await validateImageUrl(testUrl, 'og:image', {
      fetch: createMockFetch({
        status: 200,
        headers: {
          'content-type': 'image/jpeg',
          // no content-length
        },
      }),
    })

    expect(result.valid).toBe(true)
    expect(result.contentLength).toBeUndefined()
    expect(result.issues).toHaveLength(0)
  })

  it('can skip size check with checkSize=false', async () => {
    const result = await validateImageUrl(testUrl, 'og:image', {
      checkSize: false,
      fetch: createMockFetch({
        status: 200,
        headers: {
          'content-type': 'image/jpeg',
          'content-length': String(100 * 1024 * 1024), // 100MB
        },
      }),
    })

    expect(result.valid).toBe(true)
    expect(result.issues).toHaveLength(0)
  })
})

// ============================================================================
// Network Error Tests
// ============================================================================

describe('validateImageUrl - Network errors', () => {
  const testUrl = 'https://example.com/image.jpg'

  it('handles network error', async () => {
    const result = await validateImageUrl(testUrl, 'og:image', {
      fetch: createMockFetch({}, new Error('Network error')),
    })

    expect(result.valid).toBe(false)
    expect(result.error).toBe('Network error')
    expect(result.issues).toHaveLength(1)
    expect(result.issues[0].code).toBe('og-image-fetch-failed')
    expect(result.issues[0].severity).toBe('high')
  })

  it('handles DNS resolution failure', async () => {
    const result = await validateImageUrl(testUrl, 'og:image', {
      fetch: createMockFetch({}, new Error('getaddrinfo ENOTFOUND')),
    })

    expect(result.valid).toBe(false)
    expect(result.issues[0].code).toBe('og-image-fetch-failed')
    expect(result.issues[0].description).toContain('getaddrinfo')
  })

  it('handles connection refused', async () => {
    const result = await validateImageUrl(testUrl, 'og:image', {
      fetch: createMockFetch({}, new Error('ECONNREFUSED')),
    })

    expect(result.valid).toBe(false)
    expect(result.issues[0].code).toBe('og-image-fetch-failed')
  })

  it('handles timeout with AbortError', async () => {
    const abortError = new Error('Aborted')
    abortError.name = 'AbortError'

    const result = await validateImageUrl(testUrl, 'og:image', {
      timeout: 1000,
      fetch: createMockFetch({}, abortError),
    })

    expect(result.valid).toBe(false)
    expect(result.error).toBe('Timeout')
    expect(result.issues).toHaveLength(1)
    expect(result.issues[0].code).toBe('og-image-timeout')
    expect(result.issues[0].severity).toBe('medium')
    expect(result.issues[0].description).toContain('1000ms')
  })
})

// ============================================================================
// Tag Parameter Tests
// ============================================================================

describe('validateImageUrl - Tag parameter', () => {
  it('uses og:image as default tag', async () => {
    const result = await validateImageUrl('https://example.com/img.jpg', undefined, {
      fetch: createMockFetch({
        status: 404,
        headers: { 'content-type': 'text/html' },
      }),
    })

    expect(result.issues[0].metadata.tag).toBe('og:image')
  })

  it('uses custom tag for twitter:image', async () => {
    const result = await validateImageUrl(
      'https://example.com/img.jpg',
      'twitter:image',
      {
        fetch: createMockFetch({
          status: 404,
          headers: { 'content-type': 'text/html' },
        }),
      },
    )

    expect(result.issues[0].metadata.tag).toBe('twitter:image')
  })
})

// ============================================================================
// Result Structure Tests
// ============================================================================

describe('validateImageUrl - Result structure', () => {
  const testUrl = 'https://example.com/image.jpg'

  it('includes URL in result', async () => {
    const result = await validateImageUrl(testUrl, 'og:image', {
      fetch: createMockFetch({
        status: 200,
        headers: { 'content-type': 'image/jpeg' },
      }),
    })

    expect(result.url).toBe(testUrl)
  })

  it('includes all metadata for successful request', async () => {
    const result = await validateImageUrl(testUrl, 'og:image', {
      fetch: createMockFetch({
        status: 200,
        headers: {
          'content-type': 'image/png',
          'content-length': '12345',
        },
      }),
    })

    expect(result.url).toBe(testUrl)
    expect(result.valid).toBe(true)
    expect(result.statusCode).toBe(200)
    expect(result.contentType).toBe('image/png')
    expect(result.contentLength).toBe(12345)
    expect(result.format).toBe('PNG')
    expect(result.issues).toEqual([])
    expect(result.error).toBeUndefined()
  })
})

// ============================================================================
// validateImageUrls (batch validation) Tests
// ============================================================================

describe('validateImageUrls - Batch validation', () => {
  it('validates multiple URLs in parallel', async () => {
    const results = await validateImageUrls(
      {
        'og:image': 'https://example.com/og.jpg',
        'twitter:image': 'https://example.com/twitter.jpg',
      },
      {
        fetch: createMockFetch({
          status: 200,
          headers: { 'content-type': 'image/jpeg' },
        }),
      },
    )

    expect(Object.keys(results)).toHaveLength(2)
    expect(results['og:image'].valid).toBe(true)
    expect(results['twitter:image'].valid).toBe(true)
  })

  it('skips undefined URLs', async () => {
    const results = await validateImageUrls(
      {
        'og:image': 'https://example.com/og.jpg',
        'twitter:image': undefined,
      },
      {
        fetch: createMockFetch({
          status: 200,
          headers: { 'content-type': 'image/jpeg' },
        }),
      },
    )

    expect(Object.keys(results)).toHaveLength(1)
    expect(results['og:image']).toBeDefined()
    expect(results['twitter:image']).toBeUndefined()
  })

  it('handles mixed success and failure', async () => {
    let callCount = 0
    const results = await validateImageUrls(
      {
        'og:image': 'https://example.com/valid.jpg',
        'twitter:image': 'https://example.com/broken.jpg',
      },
      {
        fetch: async () => {
          callCount++
          if (callCount === 1) {
            return new Response(null, {
              status: 200,
              headers: { 'content-type': 'image/jpeg' },
            })
          }
          return new Response(null, {
            status: 404,
            headers: { 'content-type': 'text/html' },
          })
        },
      },
    )

    // One should be valid, one should have issues
    const validResults = Object.values(results).filter((r) => r.valid)
    const invalidResults = Object.values(results).filter((r) => !r.valid)

    expect(validResults.length + invalidResults.length).toBe(2)
  })

  it('returns empty object for empty input', async () => {
    const results = await validateImageUrls(
      {},
      {
        fetch: createMockFetch({
          status: 200,
          headers: { 'content-type': 'image/jpeg' },
        }),
      },
    )

    expect(results).toEqual({})
  })
})
