/**
 * TUI State Management
 *
 * Re-exports all atoms, hooks, and types for easy importing.
 */

// Types
export type {
  GroupedMenuItem,
  ViewData,
  ViewDataStatus,
  FocusRegion,
  ModalType,
  UrlListTab,
} from './types.js'

// Tool Navigation (sidebar menu)
export {
  groupedMenuItemsAtom,
  menuWidthAtom,
  activeMenuIndexAtom,
  activeViewIdAtom,
  navigateMenuAtom,
  initializeMenuIndexAtom,
} from './tool-navigation.js'

// View Atoms (combines view definitions with fetched data)
export {
  viewAtomFamily,
  activeViewAtom,
  type View,
} from './view-atoms.js'

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
  urlListHasConfigDataAtom,
  urlListAvailableFocusElementsAtom,
  setUrlListTabAtom,
  urlListFocusNextAtom,
  urlListFocusPrevAtom,
  urlListFocusTreeIfAvailableAtom,
  resetUrlListStateAtom,
  initUrlListSitemapInputAtom,
  // Config
  type ConfigState,
  configStateAtom,
  configSelectedIndexAtom,
  configExpandedGroupsAtom,
  hasConfigAtom,
  configTreeAtom,
  flattenedConfigTreeAtom,
  toggleConfigGroupAtom,
  resetConfigSelectionAtom,
  initConfigStateAtom,
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
