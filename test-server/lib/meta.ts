/**
 * Meta file parsing for fixture response configuration
 */

export interface FixtureMeta {
  delay?: number
  status?: number
  headers?: Record<string, string>
  redirect?: string
  redirectStatus?: 301 | 302 | 307 | 308
  contentType?: string
  description?: string
  testCases?: string[]
}

/**
 * Load meta configuration for a fixture file
 * Looks for a .meta.json sidecar file next to the HTML file
 */
export async function loadMeta(filePath: string): Promise<FixtureMeta | null> {
  const metaPath = filePath.replace(/\.[^.]+$/, '.meta.json')
  const file = Bun.file(metaPath)

  if (!(await file.exists())) {
    return null
  }

  try {
    return (await file.json()) as FixtureMeta
  } catch (error) {
    console.error(`Failed to parse meta file: ${metaPath}`, error)
    return null
  }
}

/**
 * Parse query parameters into meta overrides
 * Supports: ?delay=ms, ?status=code, ?header-Name=value, ?redirect=url
 */
export function parseQueryOverrides(url: URL): Partial<FixtureMeta> {
  const overrides: Partial<FixtureMeta> = {}

  const delay = url.searchParams.get('delay')
  if (delay) {
    overrides.delay = parseInt(delay, 10)
  }

  const status = url.searchParams.get('status')
  if (status) {
    overrides.status = parseInt(status, 10)
  }

  const redirect = url.searchParams.get('redirect')
  if (redirect) {
    overrides.redirect = redirect
  }

  const contentType = url.searchParams.get('contentType')
  if (contentType) {
    overrides.contentType = contentType
  }

  // Parse header-* params
  const headers: Record<string, string> = {}
  for (const [key, value] of url.searchParams) {
    if (key.startsWith('header-')) {
      const headerName = key.slice(7)
      headers[headerName] = value
    }
  }
  if (Object.keys(headers).length > 0) {
    overrides.headers = headers
  }

  return overrides
}

/**
 * Merge base meta with query overrides
 */
export function mergeMeta(
  base: FixtureMeta | null,
  overrides: Partial<FixtureMeta>
): FixtureMeta {
  return {
    ...base,
    ...overrides,
    headers: {
      ...base?.headers,
      ...overrides.headers,
    },
  }
}
