/**
 * Fixture discovery and serving
 */

import { join, relative } from 'path'
import { Glob } from 'bun'
import {
  loadMeta,
  parseQueryOverrides,
  mergeMeta,
  type FixtureMeta,
} from './meta'

export interface Fixture {
  path: string
  relativePath: string
  meta: FixtureMeta | null
}

export interface FixturesConfig {
  fixturesPath: string
  verbose?: boolean
}

/**
 * Discover all fixture files in the fixtures directory
 */
export async function discoverFixtures(
  fixturesPath: string,
): Promise<Fixture[]> {
  const glob = new Glob('**/*.html')
  const fixtures: Fixture[] = []

  for await (const relativePath of glob.scan(fixturesPath)) {
    const path = join(fixturesPath, relativePath)
    const meta = await loadMeta(path)
    fixtures.push({ path, relativePath, meta })
  }

  return fixtures.sort((a, b) => a.relativePath.localeCompare(b.relativePath))
}

/**
 * Resolve a URL path to a fixture file
 * Supports both flat (/page.html) and nested (/good/page.html) URLs
 */
export async function resolveFixture(
  urlPath: string,
  fixturesPath: string,
): Promise<string | null> {
  // Remove leading slash
  const cleanPath = urlPath.replace(/^\//, '')

  // Try direct path first
  const directPath = join(fixturesPath, cleanPath)
  if (await Bun.file(directPath).exists()) {
    return directPath
  }

  // For flat URLs, search in subdirectories
  if (!cleanPath.includes('/')) {
    const glob = new Glob(`**/${cleanPath}`)
    for await (const match of glob.scan(fixturesPath)) {
      return join(fixturesPath, match)
    }
  }

  return null
}

/**
 * Get content type for a file based on extension
 */
function getContentType(filePath: string): string {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8'
  if (filePath.endsWith('.xml')) return 'application/xml; charset=utf-8'
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8'
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8'
  if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8'
  return 'application/octet-stream'
}

/**
 * Apply delay if configured
 */
async function applyDelay(delay?: number): Promise<void> {
  if (delay && delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay))
  }
}

export interface ServeFixtureOptions {
  verbose?: boolean
  defaultDelay?: number
}

/**
 * Serve a fixture file with meta configuration applied
 */
export async function serveFixture(
  request: Request,
  fixturesPath: string,
  options: ServeFixtureOptions = {},
): Promise<Response | null> {
  const { verbose, defaultDelay } = options
  const url = new URL(request.url)
  const filePath = await resolveFixture(url.pathname, fixturesPath)

  if (!filePath) {
    return null
  }

  // Load and merge meta with query overrides
  const baseMeta = await loadMeta(filePath)
  const overrides = parseQueryOverrides(url)
  const meta = mergeMeta(baseMeta, overrides)

  // Apply default delay if no delay specified via meta or query param
  if (meta.delay === undefined && defaultDelay !== undefined) {
    meta.delay = defaultDelay
  }

  if (verbose) {
    console.log(
      `[fixture] ${url.pathname} -> ${relative(fixturesPath, filePath)}`,
    )
    if (meta.delay) console.log(`  delay: ${meta.delay}ms`)
    if (meta.status) console.log(`  status: ${meta.status}`)
  }

  // Apply delay
  await applyDelay(meta.delay)

  // Handle redirect
  if (meta.redirect) {
    return Response.redirect(meta.redirect, meta.redirectStatus || 302)
  }

  // Read file content
  const file = Bun.file(filePath)
  const content = await file.text()

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': meta.contentType || getContentType(filePath),
    ...meta.headers,
  }

  return new Response(content, {
    status: meta.status || 200,
    headers,
  })
}
