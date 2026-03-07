import type { FetchImageOptions, ImageFetchResult } from './types.js'

const DEFAULT_TIMEOUT = 5000

const SUPPORTED_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/tiff',
])

/**
 * Validates that a string is a valid HTTP/HTTPS URL.
 */
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Extracts the base content type, removing any charset or parameters.
 */
function parseContentType(header: string | null): string {
  if (!header) return 'application/octet-stream'
  const semicolonIndex = header.indexOf(';')
  return (semicolonIndex >= 0 ? header.slice(0, semicolonIndex) : header)
    .trim()
    .toLowerCase()
}

/**
 * Fetches an image from a URL with timeout and error handling.
 *
 * @param url - The URL to fetch the image from
 * @param options - Optional fetch configuration
 * @returns A discriminated union result with either the image buffer or an error
 */
export async function fetchImage(
  url: string,
  options: FetchImageOptions = {},
): Promise<ImageFetchResult> {
  const { timeout = DEFAULT_TIMEOUT, headers = {} } = options

  // Validate URL format
  if (!isValidUrl(url)) {
    return {
      ok: false,
      error: {
        type: 'INVALID_URL',
        message: `Invalid URL: ${url}`,
      },
    }
  }

  // Create AbortController for timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'webspecs-image-ascii/1.0',
        Accept: 'image/*',
        ...headers,
      },
    })

    clearTimeout(timeoutId)

    // Check for HTTP errors
    if (!response.ok) {
      return {
        ok: false,
        error: {
          type: 'HTTP_ERROR',
          message: `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status,
        },
      }
    }

    // Validate content type
    const contentType = parseContentType(response.headers.get('content-type'))
    if (!SUPPORTED_CONTENT_TYPES.has(contentType)) {
      return {
        ok: false,
        error: {
          type: 'UNSUPPORTED_FORMAT',
          message: `Unsupported content type: ${contentType}`,
        },
      }
    }

    // Read the response body as a buffer
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return {
      ok: true,
      buffer,
      contentType,
    }
  } catch (err) {
    clearTimeout(timeoutId)

    // Handle abort (timeout)
    if (err instanceof Error && err.name === 'AbortError') {
      return {
        ok: false,
        error: {
          type: 'TIMEOUT',
          message: `Request timed out after ${timeout}ms`,
        },
      }
    }

    // Handle other network errors
    const message = err instanceof Error ? err.message : 'Unknown network error'
    return {
      ok: false,
      error: {
        type: 'NETWORK_ERROR',
        message,
      },
    }
  }
}
