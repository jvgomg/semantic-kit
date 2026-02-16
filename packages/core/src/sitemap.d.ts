/**
 * Individual URL entry from a sitemap
 */
export interface SitemapUrl {
    /** Full URL */
    loc: string;
    /** Last modification date (ISO string) */
    lastmod?: string;
    /** Change frequency hint */
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    /** Priority hint (0.0 to 1.0) */
    priority?: number;
}
/**
 * Reference to another sitemap (from a sitemap index)
 */
export interface SitemapReference {
    /** URL to the child sitemap */
    loc: string;
    /** Last modification date (ISO string) */
    lastmod?: string;
}
/**
 * Successfully parsed sitemap result
 */
export interface SitemapResult {
    type: 'sitemap' | 'sitemap-index';
    /** The URL that was fetched */
    sourceUrl: string;
    /** URL entries (populated when type is 'sitemap') */
    urls: SitemapUrl[];
    /** Child sitemap references (populated when type is 'sitemap-index') */
    sitemaps: SitemapReference[];
}
/**
 * Error result from sitemap fetch/parse
 */
export interface SitemapError {
    type: 'error';
    /** The URL that was attempted */
    sourceUrl: string;
    /** Category of error */
    errorType: 'fetch-error' | 'parse-error' | 'invalid-xml' | 'not-found';
    /** Human-readable error message */
    message: string;
}
/**
 * Combined result type for sitemap operations
 */
export type SitemapFetchResult = SitemapResult | SitemapError;
/**
 * Tree node for hierarchical URL display
 */
export interface SitemapTreeNode {
    /** Path portion only (e.g., "/blog/post-1" or segment like "blog") */
    path: string;
    /** Full URL (empty string for intermediate directory nodes) */
    fullUrl: string;
    /** Tree depth (0 = root) */
    depth: number;
    /** Child nodes */
    children: SitemapTreeNode[];
    /** Whether this node is expanded in UI (default false) */
    isExpanded: boolean;
    /** Count of all descendant leaf URLs */
    urlCount: number;
    /** Optional metadata from sitemap */
    metadata?: {
        lastmod?: string;
        changefreq?: string;
        priority?: number;
    };
}
/**
 * Extract the domain URL from any URL (protocol + host)
 * @example extractDomainUrl("https://example.com/page/foo") → "https://example.com"
 */
export declare function extractDomainUrl(url: string): string;
/**
 * Get the default sitemap URL for a given URL
 * @example getDefaultSitemapUrl("https://example.com/page/foo") → "https://example.com/sitemap.xml"
 */
export declare function getDefaultSitemapUrl(url: string): string;
/**
 * Check if a URL looks like a sitemap URL.
 * Uses simple pattern matching for "sitemap.xml" in the URL.
 */
export declare function isSitemapUrl(url: string): boolean;
/**
 * Fetch and parse a sitemap from a URL.
 *
 * Automatically detects whether the URL points to a sitemap or sitemap index.
 * Does NOT recursively fetch child sitemaps - returns references only.
 */
export declare function fetchSitemap(url: string): Promise<SitemapFetchResult>;
/**
 * Build a hierarchical tree structure from flat sitemap URLs.
 *
 * Groups URLs by path segments and sorts alphabetically at each level.
 * Intermediate directory nodes have empty fullUrl.
 */
export declare function buildSitemapTree(urls: SitemapUrl[]): SitemapTreeNode[];
/**
 * Flatten a tree for display, respecting expanded state.
 * Returns nodes in display order with proper indentation via depth.
 */
export declare function flattenSitemapTree(nodes: SitemapTreeNode[], expandedPaths?: Set<string>, parentPath?: string): Array<SitemapTreeNode & {
    displayPath: string;
}>;
/**
 * Get the total count of URLs in a tree
 */
export declare function countTreeUrls(nodes: SitemapTreeNode[]): number;
//# sourceMappingURL=sitemap.d.ts.map