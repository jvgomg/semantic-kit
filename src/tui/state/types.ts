/**
 * Shared types for TUI state management.
 */

export interface MenuItem {
  id: string
  label: string
}

export type ViewStatus = 'idle' | 'loading' | 'success' | 'error'

export interface ViewState<T = unknown> {
  status: ViewStatus
  data: T | null
  error: string | null
  /** URL that was fetched for this data */
  fetchedUrl: string | null
  /** Active sub-tab ID (if view has sub-tabs) */
  activeSubTab: string | null
}

export type FocusRegion = 'url' | 'menu' | 'main'

export type ModalType = 'help' | 'url-list' | null

export type UrlListTab = 'recent' | 'sitemap'
