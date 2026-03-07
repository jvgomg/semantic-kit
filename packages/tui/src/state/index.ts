/**
 * TUI State Management
 *
 * Re-exports all atoms, hooks, and types for easy importing.
 */

// Types
export type { GroupedMenuItem, ViewData, ViewDataStatus } from './types.js'

// Focus Scope (new system)
export {
  // Types
  type FocusScopeConfig,
  type FocusScopeEntry,
  type AppFocusRegion,
  APP_SCOPE,
  // Atoms
  focusScopeStackAtom,
  activeScopeAtom,
  focusedRegionAtom,
  isAppScopeActiveAtom,
  getScopeByIdAtom,
  pushScopeAtom,
  popScopeAtom,
  setFocusAtom,
  focusNextAtom,
  focusPreviousAtom,
  setFocusInScopeAtom,
  // Hooks
  useFocusScope,
  useFocusRegion,
  useFocusNavigation,
  useIsAppScopeActive,
} from './focus-scope/index.js'

// Re-export AppFocusRegion as FocusRegion for backward compatibility
export type { AppFocusRegion as FocusRegion } from './focus-scope/index.js'

// Tool Navigation (sidebar menu)
export {
  groupedMenuItemsAtom,
  menuWidthAtom,
  activeMenuIndexAtom,
  activeViewIdAtom,
  navigateMenuAtom,
  initializeMenuIndexAtom,
  switchToViewAtom,
} from './tool-navigation.js'

// View Atoms (combines view definitions with fetched data)
export { viewAtomFamily, activeViewAtom, type View } from './view-atoms.js'

// Atoms
export {
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

// Hooks (other than focus - focus hooks are exported from focus-scope above)

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

// Dialog state
export * from './dialog/index.js'
