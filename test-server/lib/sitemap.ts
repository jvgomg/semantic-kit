/**
 * Dynamic sitemap generation
 */

import { stat } from 'fs/promises'
import { join } from 'path'
import { Glob } from 'bun'

export interface SitemapConfig {
  fixturesPath: string
  baseUrl: string
}

/**
 * Generate an XML sitemap from fixtures
 */
export async function generateSitemap(config: SitemapConfig): Promise<string> {
  const { fixturesPath, baseUrl } = config
  const glob = new Glob('**/*.html')
  const entries: { loc: string; lastmod: string }[] = []

  for await (const relativePath of glob.scan(fixturesPath)) {
    const filePath = join(fixturesPath, relativePath)
    const fileStat = await stat(filePath)
    const lastmod = fileStat.mtime.toISOString().split('T')[0]

    // Create URL - use the nested path
    const loc = `${baseUrl}/${relativePath}`

    entries.push({ loc, lastmod })
  }

  // Sort by path for consistent output
  entries.sort((a, b) => a.loc.localeCompare(b.loc))

  const urls = entries
    .map(
      (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
  </url>`
    )
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
