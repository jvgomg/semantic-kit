/**
 * Core structure extraction logic for analyzing page semantic structure.
 * Works with any Document interface (linkedom, browser DOM, Playwright).
 */
export interface LandmarkSkeleton {
    /** Semantic role name (navigation, main, banner, etc.) */
    role: string;
    /** Number of elements with this landmark type */
    count: number;
}
export interface ElementCount {
    /** Element representation (e.g., "<header>" or "<div role=\"navigation\">") */
    element: string;
    /** Number of occurrences */
    count: number;
}
export interface LandmarkNode {
    /** HTML tag name as it appears in the DOM */
    tag: string;
    /** ARIA role attribute if present */
    role?: string;
    /** Child landmarks */
    children: LandmarkNode[];
}
export interface HeadingContentStats {
    /** Word count of content under this heading */
    wordCount: number;
    /** Number of paragraph elements */
    paragraphs: number;
    /** Number of list elements (ul, ol) */
    lists: number;
}
export interface HeadingInfo {
    /** Heading level (1-6) */
    level: number;
    /** Heading text content */
    text: string;
    /** Child headings (for hierarchy) */
    children: HeadingInfo[];
    /** Content statistics for this section */
    content: HeadingContentStats;
}
export interface HeadingAnalysis {
    /** Hierarchical outline of headings */
    outline: HeadingInfo[];
    /** Count of each heading level */
    counts: Record<string, number>;
    /** Total number of headings */
    total: number;
}
export interface LinkDetail {
    /** The full href value */
    href: string;
    /** Link text content */
    text: string;
    /** Whether target="_blank" is set */
    targetBlank: boolean;
    /** Whether rel contains "noopener" */
    noopener: boolean;
    /** Whether rel contains "noreferrer" */
    noreferrer: boolean;
}
export interface LinkGroup {
    /** The destination (path for internal, domain for external) */
    destination: string;
    /** Number of links to this destination */
    count: number;
    /** Individual link details */
    links: LinkDetail[];
}
export interface LinkAnalysis {
    internal: {
        count: number;
        groups: LinkGroup[];
    };
    external: {
        count: number;
        groups: LinkGroup[];
    };
}
export interface SkipLinkInfo {
    /** Link text */
    text: string;
    /** Target ID (e.g., "#main-content") */
    target: string;
}
export interface LandmarkAnalysis {
    /** All landmark roles with counts and warnings */
    skeleton: LandmarkSkeleton[];
    /** Counts of structural HTML elements */
    elements: ElementCount[];
    /** Nested structure showing actual markup */
    outline: LandmarkNode[];
}
export interface StructureWarning {
    /** Warning identifier */
    id: string;
    /** Severity: error for critical issues, warning for recommendations */
    severity: 'error' | 'warning';
    /** Human-readable message */
    message: string;
    /** Optional details or fix suggestion */
    details?: string;
}
export interface StructureAnalysis {
    /** Page title from <title> element */
    title: string | null;
    /** Language from <html lang="..."> */
    language: string | null;
    /** Skip links found at top of page */
    skipLinks: SkipLinkInfo[];
    /** Landmark counts and outline */
    landmarks: LandmarkAnalysis;
    /** Heading hierarchy and counts */
    headings: HeadingAnalysis;
    /** Internal and external links */
    links: LinkAnalysis;
    /** Structural warnings detected */
    warnings: StructureWarning[];
}
/**
 * Extract page title from <title> element
 */
export declare function extractTitle(document: Document): string | null;
/**
 * Extract language from <html lang="..."> attribute
 */
export declare function extractLanguage(document: Document): string | null;
/**
 * Extract skip links from the beginning of the page
 */
export declare function extractSkipLinks(document: Document): SkipLinkInfo[];
/**
 * Extract landmark elements and ARIA landmark roles
 */
export declare function extractLandmarks(document: Document): LandmarkAnalysis;
/**
 * Extract headings with hierarchy, counts, and content stats
 */
export declare function extractHeadings(document: Document): HeadingAnalysis;
/**
 * Extract and classify links as internal or external
 */
export declare function extractLinks(document: Document, baseUrl: string | null): LinkAnalysis;
/**
 * Extract complete page structure analysis.
 *
 * Note: The `warnings` array is populated separately by running axe-core
 * via `runAxeOnStaticHtml()` in the command layer. This keeps the core
 * analysis synchronous while warnings come from an authoritative source.
 */
export declare function analyzeStructure(document: Document, baseUrl: string | null): StructureAnalysis;
export interface LandmarkDiff {
    role: string;
    staticCount: number;
    hydratedCount: number;
    change: number;
}
export interface HeadingDiff {
    level: number;
    text: string;
    status: 'added' | 'removed';
}
export interface LinkDiff {
    internalAdded: number;
    internalRemoved: number;
    externalAdded: number;
    externalRemoved: number;
    newInternalDestinations: string[];
    newExternalDomains: string[];
}
export interface MetadataDiff {
    title: {
        static: string | null;
        hydrated: string | null;
    } | null;
    language: {
        static: string | null;
        hydrated: string | null;
    } | null;
}
export interface StructureComparisonSummary {
    staticLandmarks: number;
    hydratedLandmarks: number;
    staticHeadings: number;
    hydratedHeadings: number;
    staticLinks: number;
    hydratedLinks: number;
}
export interface StructureComparison {
    /** High-level summary counts */
    summary: StructureComparisonSummary;
    /** Whether there are any structural differences */
    hasDifferences: boolean;
    /** Metadata changes (title, language) */
    metadata: MetadataDiff;
    /** Landmarks that changed between static and hydrated */
    landmarks: LandmarkDiff[];
    /** Headings added or removed by JavaScript */
    headings: HeadingDiff[];
    /** Link changes */
    links: LinkDiff;
}
/**
 * Compare two StructureAnalysis objects and return detailed differences
 */
export declare function compareStructures(staticAnalysis: StructureAnalysis, hydratedAnalysis: StructureAnalysis): StructureComparison;
//# sourceMappingURL=structure.d.ts.map