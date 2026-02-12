/**
 * Dynamic sitemap generation
 */

import { stat } from 'fs/promises'
import { join } from 'path'
import { Glob } from 'bun'

export interface MountInfo {
  /** Mount path prefix (e.g., '/nextjs') */
  path: string
  /** Port the mounted app is running on */
  port: number
}

export interface SitemapConfig {
  fixturesPath: string
  baseUrl: string
  /** Mounted apps to include in sitemap */
  mounts?: MountInfo[]
}

interface SitemapEntry {
  loc: string
  lastmod?: string
}

/**
 * Fetch and parse sitemap from a mounted app, rewriting URLs to use the mount prefix
 */
async function fetchMountedSitemap(
  mount: MountInfo,
  baseUrl: string,
): Promise<SitemapEntry[]> {
  try {
    const response = await fetch(`http://localhost:${mount.port}/sitemap.xml`)
    if (!response.ok) {
      console.warn(
        `[sitemap] Failed to fetch sitemap from mount ${mount.path}: ${response.status}`,
      )
      return []
    }

    const xml = await response.text()
    return parseSitemapXml(xml, mount.path, baseUrl)
  } catch (error) {
    console.warn(
      `[sitemap] Error fetching sitemap from mount ${mount.path}:`,
      error,
    )
    return []
  }
}

/**
 * Parse sitemap XML and rewrite URLs to use the mount prefix
 */
function parseSitemapXml(
  xml: string,
  mountPath: string,
  baseUrl: string,
): SitemapEntry[] {
  const entries: SitemapEntry[] = []

  // Extract <url> blocks
  const urlMatches = xml.matchAll(/<url>([\s\S]*?)<\/url>/g)

  for (const match of urlMatches) {
    const urlBlock = match[1]

    // Extract <loc>
    const locMatch = urlBlock.match(/<loc>([^<]+)<\/loc>/)
    if (!locMatch) continue

    const originalUrl = locMatch[1]

    // Extract <lastmod> if present
    const lastmodMatch = urlBlock.match(/<lastmod>([^<]+)<\/lastmod>/)
    const lastmod = lastmodMatch?.[1]

    // Rewrite URL: replace the original base with our base + mount prefix
    // e.g., http://localhost:3100/article-static -> http://localhost:4000/nextjs/article-static
    const urlObj = new URL(originalUrl)
    const path = urlObj.pathname === '/' ? '' : urlObj.pathname
    const loc = `${baseUrl}${mountPath}${path}`

    entries.push({ loc, lastmod })
  }

  return entries
}

/**
 * Generate an XML sitemap from fixtures and mounted apps
 */
export async function generateSitemap(config: SitemapConfig): Promise<string> {
  const { fixturesPath, baseUrl, mounts = [] } = config
  const glob = new Glob('**/*.html')
  const entries: SitemapEntry[] = []

  // Collect fixture URLs
  for await (const relativePath of glob.scan(fixturesPath)) {
    const filePath = join(fixturesPath, relativePath)
    const fileStat = await stat(filePath)
    const lastmod = fileStat.mtime.toISOString().split('T')[0]

    // Create URL - use the nested path
    const loc = `${baseUrl}/${relativePath}`

    entries.push({ loc, lastmod })
  }

  // Fetch and merge sitemaps from mounted apps
  const mountPromises = mounts.map((mount) =>
    fetchMountedSitemap(mount, baseUrl),
  )
  const mountResults = await Promise.all(mountPromises)
  for (const mountEntries of mountResults) {
    entries.push(...mountEntries)
  }

  // Sort by path for consistent output
  entries.sort((a, b) => a.loc.localeCompare(b.loc))

  const urls = entries
    .map((entry) => {
      const lastmodLine = entry.lastmod
        ? `\n    <lastmod>${entry.lastmod}</lastmod>`
        : ''
      return `  <url>
    <loc>${escapeXml(entry.loc)}</loc>${lastmodLine}
  </url>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
}

/**
 * Escape special characters for XML
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
