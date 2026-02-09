/**
 * Sitemap fetching, parsing, and tree building utilities.
 *
 * Supports both regular sitemaps (<urlset>) and sitemap indexes (<sitemapindex>).
 */
import { Readable } from 'stream'
import { parseSitemap } from 'sitemap'

// ============================================================================
// Types
// ============================================================================

/**
 * Individual URL entry from a sitemap
 */
export interface SitemapUrl {
  /** Full URL */
  loc: string
  /** Last modification date (ISO string) */
  lastmod?: string
  /** Change frequency hint */
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  /** Priority hint (0.0 to 1.0) */
  priority?: number
}

/**
 * Reference to another sitemap (from a sitemap index)
 */
export interface SitemapReference {
  /** URL to the child sitemap */
  loc: string
  /** Last modification date (ISO string) */
  lastmod?: string
}

/**
 * Successfully parsed sitemap result
 */
export interface SitemapResult {
  type: 'sitemap' | 'sitemap-index'
  /** The URL that was fetched */
  sourceUrl: string
  /** URL entries (populated when type is 'sitemap') */
  urls: SitemapUrl[]
  /** Child sitemap references (populated when type is 'sitemap-index') */
  sitemaps: SitemapReference[]
}

/**
 * Error result from sitemap fetch/parse
 */
export interface SitemapError {
  type: 'error'
  /** The URL that was attempted */
  sourceUrl: string
  /** Category of error */
  errorType: 'fetch-error' | 'parse-error' | 'invalid-xml' | 'not-found'
  /** Human-readable error message */
  message: string
}

/**
 * Combined result type for sitemap operations
 */
export type SitemapFetchResult = SitemapResult | SitemapError

/**
 * Tree node for hierarchical URL display
 */
export interface SitemapTreeNode {
  /** Path portion only (e.g., "/blog/post-1" or segment like "blog") */
  path: string
  /** Full URL (empty string for intermediate directory nodes) */
  fullUrl: string
  /** Tree depth (0 = root) */
  depth: number
  /** Child nodes */
  children: SitemapTreeNode[]
  /** Whether this node is expanded in UI (default false) */
  isExpanded: boolean
  /** Count of all descendant leaf URLs */
  urlCount: number
  /** Optional metadata from sitemap */
  metadata?: {
    lastmod?: string
    changefreq?: string
    priority?: number
  }
}

// ============================================================================
// URL Helpers
// ============================================================================

/**
 * Extract the domain URL from any URL (protocol + host)
 * @example extractDomainUrl("https://example.com/page/foo") → "https://example.com"
 */
export function extractDomainUrl(url: string): string {
  try {
    const parsed = new URL(url)
    return `${parsed.protocol}//${parsed.host}`
  } catch {
    return url
  }
}

/**
 * Get the default sitemap URL for a given URL
 * @example getDefaultSitemapUrl("https://example.com/page/foo") → "https://example.com/sitemap.xml"
 */
export function getDefaultSitemapUrl(url: string): string {
  const domain = extractDomainUrl(url)
  return `${domain}/sitemap.xml`
}

/**
 * Check if a URL looks like a sitemap URL.
 * Uses simple pattern matching for "sitemap.xml" in the URL.
 */
export function isSitemapUrl(url: string): boolean {
  return url.toLowerCase().includes('sitemap.xml')
}

/**
 * Extract path from a URL
 */
function extractPath(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.pathname
  } catch {
    return url
  }
}

// ============================================================================
// Sitemap Fetching
// ============================================================================

/**
 * Detect if XML content is a sitemap index (vs regular sitemap)
 */
function isSitemapIndex(xml: string): boolean {
  // Look for <sitemapindex in the XML
  return /<sitemapindex[\s>]/i.test(xml)
}

/**
 * Parse a sitemap index XML string
 */
function parseSitemapIndex(xml: string): SitemapReference[] {
  const sitemaps: SitemapReference[] = []

  // Match <sitemap>...</sitemap> blocks
  const sitemapRegex = /<sitemap>([\s\S]*?)<\/sitemap>/gi
  let match

  while ((match = sitemapRegex.exec(xml)) !== null) {
    const block = match[1]

    // Extract <loc>
    const locMatch = /<loc>\s*([\s\S]*?)\s*<\/loc>/i.exec(block)
    if (locMatch) {
      const ref: SitemapReference = {
        loc: locMatch[1].trim(),
      }

      // Extract optional <lastmod>
      const lastmodMatch = /<lastmod>\s*([\s\S]*?)\s*<\/lastmod>/i.exec(block)
      if (lastmodMatch) {
        ref.lastmod = lastmodMatch[1].trim()
      }

      sitemaps.push(ref)
    }
  }

  return sitemaps
}

/**
 * Fetch and parse a sitemap from a URL.
 *
 * Automatically detects whether the URL points to a sitemap or sitemap index.
 * Does NOT recursively fetch child sitemaps - returns references only.
 */
export async function fetchSitemap(url: string): Promise<SitemapFetchResult> {
  let response: Response
  let xml: string

  // Fetch the XML
  try {
    response = await fetch(url)
  } catch (error) {
    return {
      type: 'error',
      sourceUrl: url,
      errorType: 'fetch-error',
      message: error instanceof Error ? error.message : 'Network error',
    }
  }

  // Check for HTTP errors
  if (!response.ok) {
    if (response.status === 404) {
      return {
        type: 'error',
        sourceUrl: url,
        errorType: 'not-found',
        message: `Sitemap not found (404)`,
      }
    }
    return {
      type: 'error',
      sourceUrl: url,
      errorType: 'fetch-error',
      message: `HTTP ${response.status}: ${response.statusText}`,
    }
  }

  // Read the response body
  try {
    xml = await response.text()
  } catch {
    return {
      type: 'error',
      sourceUrl: url,
      errorType: 'fetch-error',
      message: 'Failed to read response body',
    }
  }

  // Check if it looks like XML
  if (!xml.trim().startsWith('<?xml') && !xml.trim().startsWith('<')) {
    return {
      type: 'error',
      sourceUrl: url,
      errorType: 'invalid-xml',
      message: 'Response is not valid XML',
    }
  }

  // Detect sitemap type and parse
  if (isSitemapIndex(xml)) {
    // Parse as sitemap index
    try {
      const sitemaps = parseSitemapIndex(xml)
      return {
        type: 'sitemap-index',
        sourceUrl: url,
        urls: [],
        sitemaps,
      }
    } catch (error) {
      return {
        type: 'error',
        sourceUrl: url,
        errorType: 'parse-error',
        message: error instanceof Error ? error.message : 'Failed to parse sitemap index',
      }
    }
  }

  // Parse as regular sitemap using sitemap.js
  try {
    const stream = Readable.from([xml])
    const items = await parseSitemap(stream)

    const urls: SitemapUrl[] = items.map((item) => {
      const sitemapUrl: SitemapUrl = {
        loc: item.url,
      }
      if (item.lastmod) {
        sitemapUrl.lastmod = item.lastmod
      }
      if (item.changefreq) {
        sitemapUrl.changefreq = item.changefreq as SitemapUrl['changefreq']
      }
      if (item.priority !== undefined) {
        sitemapUrl.priority = item.priority
      }
      return sitemapUrl
    })

    return {
      type: 'sitemap',
      sourceUrl: url,
      urls,
      sitemaps: [],
    }
  } catch (error) {
    return {
      type: 'error',
      sourceUrl: url,
      errorType: 'parse-error',
      message: error instanceof Error ? error.message : 'Failed to parse sitemap',
    }
  }
}

// ============================================================================
// Tree Building
// ============================================================================

/**
 * Build a hierarchical tree structure from flat sitemap URLs.
 *
 * Groups URLs by path segments and sorts alphabetically at each level.
 * Intermediate directory nodes have empty fullUrl.
 */
export function buildSitemapTree(urls: SitemapUrl[]): SitemapTreeNode[] {
  // Build a map of path segments to nodes
  interface TreeBuildNode {
    segment: string
    fullUrl: string
    children: Map<string, TreeBuildNode>
    metadata?: SitemapTreeNode['metadata']
  }

  const root: Map<string, TreeBuildNode> = new Map()

  for (const url of urls) {
    const path = extractPath(url.loc)
    // Split path into segments, filtering empty strings
    const segments = path.split('/').filter(Boolean)

    let current = root

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      const isLast = i === segments.length - 1

      if (!current.has(segment)) {
        current.set(segment, {
          segment,
          fullUrl: '',
          children: new Map(),
        })
      }

      const node = current.get(segment)!

      // If this is the last segment, set the full URL and metadata
      if (isLast) {
        node.fullUrl = url.loc
        if (url.lastmod || url.changefreq || url.priority !== undefined) {
          node.metadata = {}
          if (url.lastmod) node.metadata.lastmod = url.lastmod
          if (url.changefreq) node.metadata.changefreq = url.changefreq
          if (url.priority !== undefined) node.metadata.priority = url.priority
        }
      }

      current = node.children
    }
  }

  // Convert the map structure to the output format
  function convertNode(
    nodeMap: Map<string, TreeBuildNode>,
    depth: number,
  ): SitemapTreeNode[] {
    const nodes: SitemapTreeNode[] = []

    // Sort keys alphabetically
    const sortedKeys = Array.from(nodeMap.keys()).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true }),
    )

    for (const key of sortedKeys) {
      const buildNode = nodeMap.get(key)!
      const children = convertNode(buildNode.children, depth + 1)

      // Count URLs: if this node has a URL, count 1, plus all descendant URLs
      const childUrlCount = children.reduce((sum, child) => sum + child.urlCount, 0)
      const urlCount = (buildNode.fullUrl ? 1 : 0) + childUrlCount

      nodes.push({
        path: '/' + buildNode.segment,
        fullUrl: buildNode.fullUrl,
        depth,
        children,
        isExpanded: false,
        urlCount,
        metadata: buildNode.metadata,
      })
    }

    return nodes
  }

  return convertNode(root, 0)
}

/**
 * Flatten a tree for display, respecting expanded state.
 * Returns nodes in display order with proper indentation via depth.
 */
export function flattenSitemapTree(
  nodes: SitemapTreeNode[],
  expandedPaths: Set<string> = new Set(),
  parentPath: string = '',
): Array<SitemapTreeNode & { displayPath: string }> {
  const result: Array<SitemapTreeNode & { displayPath: string }> = []

  for (const node of nodes) {
    const displayPath = parentPath + node.path
    result.push({ ...node, displayPath })

    // If this node is expanded and has children, recurse
    if (expandedPaths.has(displayPath) && node.children.length > 0) {
      result.push(...flattenSitemapTree(node.children, expandedPaths, displayPath))
    }
  }

  return result
}

/**
 * Get the total count of URLs in a tree
 */
export function countTreeUrls(nodes: SitemapTreeNode[]): number {
  return nodes.reduce((sum, node) => sum + node.urlCount, 0)
}
