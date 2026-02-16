import type { HiddenContentAnalysis } from './results.js';
/**
 * Severity level based on hidden content percentage
 */
export type HiddenContentSeverity = 'none' | 'low' | 'high';
/**
 * Framework detector interface.
 * Implementations detect specific frameworks and provide selectors
 * for finding their hidden content patterns.
 */
export interface FrameworkDetector {
    /** Framework name for display */
    name: string;
    /** Check if this framework is present in the document */
    detect: (document: Document) => boolean;
    /** CSS selector for hidden content elements */
    getHiddenContentSelector: () => string;
}
/**
 * Analyze HTML for hidden content patterns.
 *
 * Detects streaming SSR frameworks (Next.js, Remix, etc.) and calculates
 * how much content is hidden vs visible to non-JavaScript crawlers.
 *
 * @param html - Raw HTML string to analyze
 * @param visibleWordCount - Word count of visible/extracted content
 * @returns Hidden content analysis with framework detection and metrics
 */
export declare function analyzeHiddenContent(html: string, visibleWordCount: number): HiddenContentAnalysis;
//# sourceMappingURL=hidden-content.d.ts.map