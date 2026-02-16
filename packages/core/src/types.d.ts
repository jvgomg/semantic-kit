/**
 * Shared types for @webspecs/core.
 */
export type IssueType = 'error' | 'warning' | 'info';
export type IssueSeverity = 'low' | 'medium' | 'high';
/**
 * Generic issue type for validation results.
 */
export interface Issue {
    type: IssueType;
    severity: IssueSeverity;
    title: string;
    description: string;
    tip?: string;
}
//# sourceMappingURL=types.d.ts.map