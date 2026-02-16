export interface AriaNode {
    role: string;
    name?: string;
    attributes: Record<string, string | boolean>;
    children: AriaNode[];
}
export interface AriaSnapshotAnalysis {
    nodes: AriaNode[];
    counts: Record<string, number>;
}
/**
 * Parse ARIA snapshot YAML into structured data for analysis
 */
export declare function parseAriaSnapshot(snapshot: string): AriaNode[];
/**
 * Count nodes by role
 */
export declare function countByRole(nodes: AriaNode[]): Record<string, number>;
/**
 * Analyze an ARIA snapshot into nodes and counts
 */
export declare function analyzeAriaSnapshot(snapshot: string): AriaSnapshotAnalysis;
export interface FormatOptions {
    title?: string;
    timedOut?: boolean;
}
/**
 * Format the ARIA snapshot with box-drawing
 */
export declare function formatAriaSnapshot(snapshot: string, url: string, options?: FormatOptions): string;
export interface SnapshotDiff {
    added: string[];
    removed: string[];
    countChanges: {
        role: string;
        static: number;
        hydrated: number;
    }[];
}
/**
 * Compare two ARIA snapshots and return the differences
 */
export declare function compareSnapshots(staticSnapshot: string, hydratedSnapshot: string): SnapshotDiff;
/**
 * Check if two snapshots have differences
 */
export declare function hasDifferences(diff: SnapshotDiff): boolean;
//# sourceMappingURL=aria-snapshot.d.ts.map