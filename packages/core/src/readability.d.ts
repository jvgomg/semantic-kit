/**
 * Raw extraction result from Readability.
 * This is the direct output before any post-processing.
 */
export interface ReadabilityExtraction {
    /** Page title extracted by Readability */
    title: string | null;
    /** Author/byline */
    byline: string | null;
    /** Brief excerpt */
    excerpt: string | null;
    /** Site name */
    siteName: string | null;
    /** Extracted HTML content */
    html: string;
    /** Text content (for word counting) */
    textContent: string;
    /** Published date (if detected) */
    publishedTime: string | null;
}
/**
 * Metrics about the extraction process.
 */
export interface ReadabilityMetrics {
    /** Word count of extracted content */
    wordCount: number;
    /** Character count of extracted content */
    characterCount: number;
    /** Number of paragraphs in extracted content */
    paragraphCount: number;
    /** Link density (links / total text length) - lower is better */
    linkDensity: number;
    /** Whether Readability considers page suitable for extraction */
    isReaderable: boolean;
}
/**
 * Complete extraction result with content and metrics.
 */
export interface ReadabilityResult {
    /** The extraction data (null if extraction failed) */
    extraction: ReadabilityExtraction | null;
    /** Metrics about the extraction */
    metrics: ReadabilityMetrics;
    /** Extracted content as markdown */
    markdown: string;
}
/**
 * Extract content from HTML using Mozilla Readability.
 * Returns both the extraction result and detailed metrics.
 */
export declare function extractReadability(html: string): ReadabilityResult;
/**
 * Check if HTML document is probably suitable for content extraction.
 */
export declare function checkReaderable(html: string): boolean;
//# sourceMappingURL=readability.d.ts.map