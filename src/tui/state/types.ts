/**
 * Shared types for TUI state management.
 */

/**
 * Grouped menu item - either a section header or a selectable view
 */
export type GroupedMenuItem =
  | { type: 'header'; label: string }
  | { type: 'view'; id: string; label: string }

export type FocusRegion = 'url' | 'menu' | 'main'

export type ModalType = 'help' | 'url-list' | 'settings' | null

export type UrlListTab = 'recent' | 'config' | 'sitemap'

// Re-export view data types
export type { ViewData, ViewDataStatus } from './view-data/types.js'
