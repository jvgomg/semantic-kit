/**
 * Image URL validation for og:image and twitter:image.
 *
 * Performs async validation by fetching image URLs to verify:
 * - HTTP accessibility (404, timeouts, errors)
 * - Content-Type is an image MIME type
 * - File size is within platform limits
 * - Image format is widely supported
 *
 * @see research/topics/social-metadata/open-graph-validation.md
 */

import {
  type SocialValidationIssue,
  type ValidationSeverity,
  severityToIssue,
} from './types.js'

// ============================================================================
// Constants (from research)
// ============================================================================

/**
 * Supported image MIME types across all major platforms.
 * JPEG, PNG, GIF, WebP are universally supported.
 */
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const

/**
 * Emerging image MIME types with partial platform support.
 * AVIF is not yet universally supported.
 */
export const PARTIAL_SUPPORT_IMAGE_TYPES = ['image/avif'] as const

/**
 * All valid image MIME types (supported + partial).
 */
export const VALID_IMAGE_TYPES = [
  ...SUPPORTED_IMAGE_TYPES,
  ...PARTIAL_SUPPORT_IMAGE_TYPES,
] as const

/**
 * Platform-specific file size limits in bytes.
 * @see research/topics/social-metadata/open-graph-validation.md#image-requirements
 */
export const PLATFORM_SIZE_LIMITS = {
  /** Facebook: 8MB max */
  facebook: 8 * 1024 * 1024,
  /** LinkedIn: 5MB max */
  linkedin: 5 * 1024 * 1024,
  /** Twitter/X: 5MB max */
  twitter: 5 * 1024 * 1024,
} as const

/**
 * Conservative size limit that works across all platforms.
 * Uses LinkedIn/Twitter limit (5MB) as the strictest common denominator.
 */
export const UNIVERSAL_SIZE_LIMIT = Math.min(
  ...Object.values(PLATFORM_SIZE_LIMITS),
)

/**
 * Default timeout for image validation requests (5 seconds).
 */
export const DEFAULT_TIMEOUT_MS = 5000

// ============================================================================
// Types
// ============================================================================

/**
 * Result of validating an image URL.
 */
export interface ImageValidationResult {
  /** The URL that was validated */
  url: string
  /** Whether the image is accessible and valid */
  valid: boolean
  /** HTTP status code (if request completed) */
  statusCode?: number
  /** Content-Type header value */
  contentType?: string
  /** Content-Length in bytes (if available) */
  contentLength?: number
  /** Detected image format based on Content-Type */
  format?: string
  /** Validation issues found */
  issues: SocialValidationIssue[]
  /** Error message if request failed entirely */
  error?: string
}

/**
 * Options for image URL validation.
 */
export interface ImageValidationOptions {
  /** Request timeout in milliseconds (default: 5000) */
  timeout?: number
  /** Check file size against platform limits (default: true) */
  checkSize?: boolean
  /** Check if format has universal support (default: true) */
  checkFormat?: boolean
  /** Custom fetch function for testing */
  fetch?: typeof globalThis.fetch
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a SocialValidationIssue for image validation.
 */
function createIssue(
  code: string,
  severity: ValidationSeverity,
  tag: string,
  message: string,
  tip: string,
  extra?: { value?: string; limit?: number; actual?: number },
): SocialValidationIssue {
  const { type, severity: issueSeverity } = severityToIssue(severity)

  return {
    type,
    severity: issueSeverity,
    title: formatIssueTitle(code),
    description: message,
    tip,
    code,
    metadata: {
      tag,
      ...extra,
    },
  }
}

/**
 * Format issue code as a readable title.
 */
function formatIssueTitle(code: string): string {
  const titles: Record<string, string> = {
    'og-image-not-found': 'Image Not Found',
    'og-image-server-error': 'Image Server Error',
    'og-image-fetch-failed': 'Image Fetch Failed',
    'og-image-timeout': 'Image Fetch Timeout',
    'og-image-invalid-content-type': 'Invalid Image Content-Type',
    'og-image-not-image': 'Not an Image',
    'og-image-too-large': 'Image Too Large',
    'og-image-partial-support': 'Image Format Has Limited Support',
    'og-image-redirect': 'Image URL Redirects',
  }
  return titles[code] || code
}

/**
 * Format bytes as human-readable size.
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Extract format name from MIME type.
 */
function extractFormat(contentType: string): string {
  const match = contentType.match(/^image\/(\w+)/)
  return match ? match[1].toUpperCase() : 'unknown'
}

/**
 * Check if Content-Type indicates an image.
 */
function isImageContentType(
  contentType: string | null | undefined,
): boolean {
  if (!contentType) return false
  return contentType.startsWith('image/')
}

/**
 * Check if Content-Type is a universally supported image format.
 */
function isUniversallySupportedFormat(
  contentType: string | null | undefined,
): boolean {
  if (!contentType) return false
  const normalized = contentType.split(';')[0].trim().toLowerCase()
  return (SUPPORTED_IMAGE_TYPES as readonly string[]).includes(normalized)
}

/**
 * Check if Content-Type is a partially supported format (like AVIF).
 */
function isPartiallySupportedFormat(
  contentType: string | null | undefined,
): boolean {
  if (!contentType) return false
  const normalized = contentType.split(';')[0].trim().toLowerCase()
  return (PARTIAL_SUPPORT_IMAGE_TYPES as readonly string[]).includes(normalized)
}

// ============================================================================
// Main Validation Function
// ============================================================================

/**
 * Validate an image URL by fetching it and checking HTTP response.
 *
 * Uses HEAD request by default to avoid downloading the full image.
 * Falls back to GET with abort if HEAD is not supported.
 *
 * @param url - The image URL to validate
 * @param tag - The meta tag this URL belongs to (e.g., 'og:image')
 * @param options - Validation options
 * @returns Validation result with issues found
 */
export async function validateImageUrl(
  url: string,
  tag: string = 'og:image',
  options: ImageValidationOptions = {},
): Promise<ImageValidationResult> {
  const {
    timeout = DEFAULT_TIMEOUT_MS,
    checkSize = true,
    checkFormat = true,
    fetch: customFetch = globalThis.fetch,
  } = options

  const issues: SocialValidationIssue[] = []
  const result: ImageValidationResult = {
    url,
    valid: false,
    issues,
  }

  // Create abort controller for timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    // Try HEAD request first (doesn't download body)
    let response: Response
    try {
      response = await customFetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        redirect: 'follow',
      })
    } catch {
      // Some servers don't support HEAD, try GET with immediate abort
      response = await customFetch(url, {
        method: 'GET',
        signal: controller.signal,
        redirect: 'follow',
      })
    }

    clearTimeout(timeoutId)

    result.statusCode = response.status
    result.contentType = response.headers.get('content-type') || undefined
    const contentLengthHeader = response.headers.get('content-length')
    result.contentLength = contentLengthHeader
      ? parseInt(contentLengthHeader, 10)
      : undefined

    // Check HTTP status
    if (response.status === 404) {
      issues.push(
        createIssue(
          'og-image-not-found',
          'error',
          tag,
          `${tag} URL returned 404 Not Found`,
          'Verify the image URL is correct and the image exists on the server.',
          { value: url },
        ),
      )
      return result
    }

    if (response.status >= 400 && response.status < 500) {
      issues.push(
        createIssue(
          'og-image-not-found',
          'error',
          tag,
          `${tag} URL returned HTTP ${response.status}`,
          'Verify the image URL is accessible. Check for authentication requirements or access restrictions.',
          { value: url },
        ),
      )
      return result
    }

    if (response.status >= 500) {
      issues.push(
        createIssue(
          'og-image-server-error',
          'warning',
          tag,
          `${tag} server returned HTTP ${response.status}`,
          'The image server may be temporarily unavailable. Try again later.',
          { value: url },
        ),
      )
      return result
    }

    if (!response.ok) {
      issues.push(
        createIssue(
          'og-image-fetch-failed',
          'error',
          tag,
          `${tag} URL returned unexpected status ${response.status}`,
          'Verify the image URL returns a successful HTTP response.',
          { value: url },
        ),
      )
      return result
    }

    // Check Content-Type
    const contentType = result.contentType
    if (!isImageContentType(contentType)) {
      issues.push(
        createIssue(
          'og-image-not-image',
          'error',
          tag,
          `${tag} URL does not return an image (Content-Type: ${contentType || 'none'})`,
          'Ensure the URL points to an actual image file, not HTML or other content.',
          { value: contentType || 'none' },
        ),
      )
      return result
    }

    // Extract format from Content-Type
    result.format = extractFormat(contentType!)

    // Check format support
    if (checkFormat) {
      if (isPartiallySupportedFormat(contentType)) {
        issues.push(
          createIssue(
            'og-image-partial-support',
            'warning',
            tag,
            `${tag} format ${result.format} is not universally supported`,
            'Consider using JPEG, PNG, GIF, or WebP for maximum compatibility across all platforms.',
            { value: result.format },
          ),
        )
      } else if (!isUniversallySupportedFormat(contentType)) {
        issues.push(
          createIssue(
            'og-image-invalid-content-type',
            'warning',
            tag,
            `${tag} has unexpected format: ${contentType}`,
            'Use JPEG, PNG, GIF, or WebP for best compatibility across social platforms.',
            { value: contentType || undefined },
          ),
        )
      }
    }

    // Check file size
    if (checkSize && result.contentLength !== undefined) {
      if (result.contentLength > UNIVERSAL_SIZE_LIMIT) {
        const exceedsPlatforms: string[] = []
        for (const [platform, limit] of Object.entries(PLATFORM_SIZE_LIMITS)) {
          if (result.contentLength > limit) {
            exceedsPlatforms.push(platform)
          }
        }

        issues.push(
          createIssue(
            'og-image-too-large',
            'warning',
            tag,
            `${tag} size (${formatBytes(result.contentLength)}) exceeds limits for: ${exceedsPlatforms.join(', ')}`,
            `Reduce image file size to under ${formatBytes(UNIVERSAL_SIZE_LIMIT)} for compatibility with all platforms.`,
            {
              value: formatBytes(result.contentLength),
              limit: UNIVERSAL_SIZE_LIMIT,
              actual: result.contentLength,
            },
          ),
        )
      }
    }

    // If we got here with no errors, the image is valid
    result.valid = issues.filter((i) => i.severity === 'high').length === 0
    return result
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        issues.push(
          createIssue(
            'og-image-timeout',
            'warning',
            tag,
            `${tag} fetch timed out after ${timeout}ms`,
            'The image server is slow to respond. Consider using a faster CDN or optimizing server response time.',
            { value: url },
          ),
        )
        result.error = 'Timeout'
      } else {
        issues.push(
          createIssue(
            'og-image-fetch-failed',
            'error',
            tag,
            `Failed to fetch ${tag}: ${error.message}`,
            'Verify the URL is correct and the server is accessible.',
            { value: url },
          ),
        )
        result.error = error.message
      }
    }

    return result
  }
}

/**
 * Validate multiple image URLs in parallel.
 *
 * @param urls - Map of tag names to URLs (e.g., { 'og:image': 'https://...' })
 * @param options - Validation options
 * @returns Map of tag names to validation results
 */
export async function validateImageUrls(
  urls: Record<string, string | undefined>,
  options: ImageValidationOptions = {},
): Promise<Record<string, ImageValidationResult>> {
  const results: Record<string, ImageValidationResult> = {}

  const validations = Object.entries(urls)
    .filter(([, url]) => url !== undefined)
    .map(async ([tag, url]) => {
      results[tag] = await validateImageUrl(url!, tag, options)
    })

  await Promise.all(validations)
  return results
}
