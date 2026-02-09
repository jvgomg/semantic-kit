/**
 * Shared types for TUI state management.
 */

export interface MenuItem {
  id: string
  label: string
}

export type FocusRegion = 'url' | 'menu' | 'main'

export type ModalType = 'help' | 'url-list' | null

export type UrlListTab = 'recent' | 'sitemap'

// Re-export view data types
export type { ViewData, ViewDataStatus } from './view-data/types.js'
