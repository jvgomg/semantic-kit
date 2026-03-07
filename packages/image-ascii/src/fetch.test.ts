import { describe, expect, it, mock, afterEach } from 'bun:test'
import { fetchImage } from './fetch.js'

/**
 * Creates a mock fetch function with proper typing for Bun.
 */
function createFetchMock(
  fn: (url: string, init?: RequestInit) => Promise<Response>,
): typeof fetch {
  const mockFn = mock(fn) as unknown as typeof fetch & {
    preconnect: typeof fetch.preconnect
  }
  // Add preconnect stub to satisfy Bun's fetch type
  mockFn.preconnect = () => {}
  return mockFn
}

describe('fetchImage', () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  describe('URL validation', () => {
    it('rejects invalid URLs', async () => {
      const result = await fetchImage('not-a-url')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.type).toBe('INVALID_URL')
        expect(result.error.message).toContain('Invalid URL')
      }
    })

    it('rejects non-HTTP URLs', async () => {
      const result = await fetchImage('ftp://example.com/image.jpg')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.type).toBe('INVALID_URL')
      }
    })

    it('accepts valid HTTP URLs', async () => {
      const imageBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]) // PNG magic bytes

      globalThis.fetch = createFetchMock(() =>
        Promise.resolve(
          new Response(imageBuffer, {
            status: 200,
            headers: { 'content-type': 'image/png' },
          }),
        ),
      )

      const result = await fetchImage('http://example.com/image.png')
      expect(result.ok).toBe(true)
    })

    it('accepts valid HTTPS URLs', async () => {
      const imageBuffer = Buffer.from([0xff, 0xd8, 0xff]) // JPEG magic bytes

      globalThis.fetch = createFetchMock(() =>
        Promise.resolve(
          new Response(imageBuffer, {
            status: 200,
            headers: { 'content-type': 'image/jpeg' },
          }),
        ),
      )

      const result = await fetchImage('https://example.com/image.jpg')
      expect(result.ok).toBe(true)
    })
  })

  describe('HTTP error handling', () => {
    it('handles 404 errors', async () => {
      globalThis.fetch = createFetchMock(() =>
        Promise.resolve(
          new Response('Not Found', { status: 404, statusText: 'Not Found' }),
        ),
      )

      const result = await fetchImage('https://example.com/missing.jpg')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.type).toBe('HTTP_ERROR')
        expect(result.error.statusCode).toBe(404)
        expect(result.error.message).toContain('404')
      }
    })

    it('handles 500 errors', async () => {
      globalThis.fetch = createFetchMock(() =>
        Promise.resolve(
          new Response('Internal Server Error', {
            status: 500,
            statusText: 'Internal Server Error',
          }),
        ),
      )

      const result = await fetchImage('https://example.com/error.jpg')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.type).toBe('HTTP_ERROR')
        expect(result.error.statusCode).toBe(500)
      }
    })
  })

  describe('content type validation', () => {
    it('accepts image/jpeg', async () => {
      globalThis.fetch = createFetchMock(() =>
        Promise.resolve(
          new Response(Buffer.from([0xff, 0xd8, 0xff]), {
            status: 200,
            headers: { 'content-type': 'image/jpeg' },
          }),
        ),
      )

      const result = await fetchImage('https://example.com/image.jpg')
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.contentType).toBe('image/jpeg')
      }
    })

    it('accepts image/png', async () => {
      globalThis.fetch = createFetchMock(() =>
        Promise.resolve(
          new Response(Buffer.from([0x89, 0x50, 0x4e, 0x47]), {
            status: 200,
            headers: { 'content-type': 'image/png' },
          }),
        ),
      )

      const result = await fetchImage('https://example.com/image.png')
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.contentType).toBe('image/png')
      }
    })

    it('accepts image/webp', async () => {
      globalThis.fetch = createFetchMock(() =>
        Promise.resolve(
          new Response(Buffer.from([0x52, 0x49, 0x46, 0x46]), {
            status: 200,
            headers: { 'content-type': 'image/webp' },
          }),
        ),
      )

      const result = await fetchImage('https://example.com/image.webp')
      expect(result.ok).toBe(true)
    })

    it('accepts content-type with charset', async () => {
      globalThis.fetch = createFetchMock(() =>
        Promise.resolve(
          new Response(Buffer.from([0x89, 0x50, 0x4e, 0x47]), {
            status: 200,
            headers: { 'content-type': 'image/png; charset=utf-8' },
          }),
        ),
      )

      const result = await fetchImage('https://example.com/image.png')
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.contentType).toBe('image/png')
      }
    })

    it('rejects unsupported content types', async () => {
      globalThis.fetch = createFetchMock(() =>
        Promise.resolve(
          new Response('not an image', {
            status: 200,
            headers: { 'content-type': 'text/html' },
          }),
        ),
      )

      const result = await fetchImage('https://example.com/page.html')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.type).toBe('UNSUPPORTED_FORMAT')
        expect(result.error.message).toContain('text/html')
      }
    })
  })

  describe('network error handling', () => {
    it('handles network failures', async () => {
      globalThis.fetch = createFetchMock(() =>
        Promise.reject(new Error('Network error')),
      )

      const result = await fetchImage('https://example.com/image.jpg')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.type).toBe('NETWORK_ERROR')
        expect(result.error.message).toContain('Network error')
      }
    })
  })

  describe('successful fetch', () => {
    it('returns buffer and content type on success', async () => {
      const imageData = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      ])

      globalThis.fetch = createFetchMock(() =>
        Promise.resolve(
          new Response(imageData, {
            status: 200,
            headers: { 'content-type': 'image/png' },
          }),
        ),
      )

      const result = await fetchImage('https://example.com/image.png')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.buffer).toBeInstanceOf(Buffer)
        expect(result.buffer.length).toBe(8)
        expect(result.contentType).toBe('image/png')
      }
    })

    it('passes custom headers', async () => {
      let capturedHeaders: HeadersInit | undefined

      globalThis.fetch = createFetchMock((_url, init) => {
        capturedHeaders = init?.headers
        return Promise.resolve(
          new Response(Buffer.from([0xff, 0xd8, 0xff]), {
            status: 200,
            headers: { 'content-type': 'image/jpeg' },
          }),
        )
      })

      await fetchImage('https://example.com/image.jpg', {
        headers: { Authorization: 'Bearer token123' },
      })

      expect(capturedHeaders).toBeDefined()
      expect((capturedHeaders as Record<string, string>)['Authorization']).toBe(
        'Bearer token123',
      )
    })
  })
})
