/**
 * Structured data extraction using web-auto-extractor.
 *
 * Provides a unified interface for extracting metatags, JSON-LD,
 * microdata, and RDFa from HTML content.
 */
/**
 * Raw structured data extracted from HTML.
 */
export interface StructuredData {
    /** Meta tags as key -> array of values (WAE format) */
    metatags: Record<string, string[]>;
    /** JSON-LD schemas grouped by @type */
    jsonld: Record<string, unknown[]>;
    /** Microdata schemas grouped by itemtype */
    microdata: Record<string, unknown[]>;
    /** RDFa schemas grouped by typeof */
    rdfa: Record<string, unknown[]>;
}
/**
 * Metatags grouped by prefix.
 */
export interface GroupedMetatags {
    /** Open Graph tags (og:*) as normalized key-value pairs */
    openGraph: Record<string, string>;
    /** Twitter Card tags (twitter:*) as normalized key-value pairs */
    twitter: Record<string, string>;
    /** All other metatags as normalized key-value pairs */
    other: Record<string, string>;
}
/**
 * Extract structured data from HTML using web-auto-extractor.
 *
 * This is the single source of truth for metatag extraction across all commands.
 */
export declare function extractStructuredData(html: string): StructuredData;
/**
 * Normalize raw metatags from WAE format (string[]) to single values (string | undefined).
 *
 * Takes the first value for each key, which matches how browsers handle duplicate tags.
 */
export declare function normalizeMetatags(metatags: Record<string, string[]>): Record<string, string | undefined>;
/**
 * Group metatags by prefix into Open Graph, Twitter Cards, and other tags.
 *
 * Returns normalized key-value pairs (first value wins) for each group.
 */
export declare function groupMetatagsByPrefix(metatags: Record<string, string[]>): GroupedMetatags;
//# sourceMappingURL=extractor.d.ts.map