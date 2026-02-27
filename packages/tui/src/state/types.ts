/**
 * Shared types for TUI state management.
 */

/**
 * Grouped menu item - either a section header or a selectable view
 */
export type GroupedMenuItem =
  | { type: 'header'; label: string }
  | { type: 'view'; id: string; label: string }

// Note: FocusRegion is now defined in focus-scope/types.ts as AppFocusRegion
// and re-exported from state/index.ts as FocusRegion for backward compatibility

// Re-export view data types
export type { ViewData, ViewDataStatus } from './view-data/types.js'
