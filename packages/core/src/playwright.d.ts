export interface RenderedHtmlResult {
    html: string;
    timedOut: boolean;
}
/**
 * Fetch rendered HTML using Playwright
 *
 * Launches a headless browser, navigates to the URL, waits for network idle,
 * and returns the rendered HTML content.
 *
 * @param url - The URL to render
 * @param timeoutMs - Maximum time to wait for network idle (default: 5000)
 * @returns The rendered HTML and whether the timeout was reached
 * @throws Error if Playwright is not installed
 */
export declare function fetchRenderedHtml(url: string, timeoutMs?: number): Promise<RenderedHtmlResult>;
export interface AccessibilitySnapshotResult {
    snapshot: string;
    timedOut: boolean;
}
export interface AccessibilitySnapshotOptions {
    javaScriptEnabled?: boolean;
    timeoutMs?: number;
}
/**
 * Fetch accessibility tree snapshot using Playwright
 *
 * Launches a headless browser, navigates to the URL, waits for network idle,
 * and returns the ARIA snapshot of the page.
 *
 * @param url - The URL to analyze
 * @param options - Options including javaScriptEnabled and timeoutMs
 * @returns The ARIA snapshot YAML and whether the timeout was reached
 * @throws Error if Playwright is not installed
 */
export declare function fetchAccessibilitySnapshot(url: string, options?: AccessibilitySnapshotOptions): Promise<AccessibilitySnapshotResult>;
export interface AccessibilityComparisonResult {
    static: AccessibilitySnapshotResult;
    hydrated: AccessibilitySnapshotResult;
}
/**
 * Fetch both static and hydrated accessibility snapshots for comparison
 *
 * Launches a headless browser twice - once with JS disabled (static) and
 * once with JS enabled (hydrated) - to compare accessibility trees.
 *
 * @param url - The URL to analyze
 * @param timeoutMs - Maximum time to wait for network idle (default: 5000)
 * @returns Both snapshots for comparison
 * @throws Error if Playwright is not installed
 */
export declare function fetchAccessibilityComparison(url: string, timeoutMs?: number): Promise<AccessibilityComparisonResult>;
export declare class PlaywrightNotInstalledError extends Error {
    constructor();
    getInstallInstructions(): string;
}
//# sourceMappingURL=playwright.d.ts.map