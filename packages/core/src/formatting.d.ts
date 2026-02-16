/**
 * Shared formatting utilities for structure analysis output.
 * Used by structure, structure:js, and structure:compare commands.
 */
import type { LandmarkSkeleton, ElementCount, LandmarkNode, LinkGroup, LinkDetail, HeadingInfo, StructureWarning } from './structure.js';
/**
 * Format landmark skeleton for compact display
 */
export declare function formatLandmarkSkeletonCompact(skeleton: LandmarkSkeleton[]): string;
/**
 * Format landmark skeleton with all roles
 */
export declare function formatLandmarkSkeleton(skeleton: LandmarkSkeleton[]): string[];
/**
 * Format element counts
 */
export declare function formatElements(elements: ElementCount[]): string[];
/**
 * Format outline with indentation
 */
export declare function formatOutline(nodes: LandmarkNode[], indent?: number): string[];
/**
 * Format link attributes as badges
 */
export declare function formatLinkBadges(link: LinkDetail): string;
/**
 * Format link groups for display
 */
export declare function formatLinkGroups(groups: LinkGroup[], showFull: boolean, limit: number, indent: string): {
    lines: string[];
    truncated: number;
};
/**
 * Format heading counts for compact display
 */
export declare function formatHeadingsSummary(counts: Record<string, number>): string;
/**
 * Format content stats as a summary line
 */
export declare function formatContentStats(content: HeadingInfo['content']): string;
/**
 * Format heading hierarchy with indentation and content stats
 */
export declare function formatHeadingTree(headings: HeadingInfo[], indent?: number): string[];
/**
 * Format warnings for compact display (single line summary)
 */
export declare function formatWarningsCompact(warnings: StructureWarning[]): string;
/**
 * Format warnings for expanded display (with details)
 */
export declare function formatWarnings(warnings: StructureWarning[]): string[];
/**
 * Format violations for expanded display (definite failures)
 */
export declare function formatViolations(violations: StructureWarning[]): string[];
/**
 * Format violations compact summary
 */
export declare function formatViolationsCompact(violations: StructureWarning[]): string;
//# sourceMappingURL=formatting.d.ts.map