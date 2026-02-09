/**
 * TUI State Management
 *
 * Re-exports all atoms, hooks, and types for easy importing.
 */

// Types
export type {
  MenuItem,
  ViewData,
  ViewDataStatus,
  FocusRegion,
  ModalType,
  UrlListTab,
} from './types.js'

// Atoms
export {
  // Focus
  focusedRegionAtom,
  focusEnabledAtom,
  effectiveFocusEnabledAtom,
  focusableRegions,
  setFocusAtom,
  focusNextAtom,
  focusPreviousAtom,
  // Modal
  activeModalAtom,
  isModalOpenAtom,
  // URL
  urlAtom,
  recentUrlsAtom,
  setUrlAtom,
  // Menu
  menuItemsAtom,
  menuWidthAtom,
  activeMenuIndexAtom,
  activeViewIdAtom,
  navigateMenuAtom,
  // View Data
  viewDataAtomFamily,
  viewDataIdsAtom,
  invalidateAllViewDataAtom,
  setViewDataAtom,
  viewDataFetchEffect,
  // Sitemap
  sitemapCacheAtom,
  sitemapLoadingAtom,
  activeSitemapUrlAtom,
  sitemapSelectedIndexAtom,
  sitemapExpandedPathsAtom,
  fetchSitemapAtom,
  activeSitemapDataAtom,
  resetSitemapSelectionAtom,
  // UrlList
  type UrlListFocusElement,
  urlListActiveTabAtom,
  urlListFocusAtom,
  urlListSitemapInputAtom,
  urlListHasTreeDataAtom,
  urlListAvailableFocusElementsAtom,
  setUrlListTabAtom,
  urlListFocusNextAtom,
  urlListFocusPrevAtom,
  urlListFocusTreeIfAvailableAtom,
  resetUrlListStateAtom,
  initUrlListSitemapInputAtom,
} from './atoms/index.js'

// Hooks
export { useFocus, useFocusManager } from './hooks/index.js'

// View (primitive layer)
export * from './view/index.js'

// Sections
export * from './sections/index.js'

// Store
export { createAppStore, type AppStore } from './store.js'

// Persistence
export {
  createPersistedStore,
  flushPersistedState,
  type PersistedStore,
} from './persistence/index.js'
