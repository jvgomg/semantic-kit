/**
 * UrlList panel state management.
 *
 * Manages the focus state and active tab for the UrlList panel,
 * which has three tabs (Recent URLs, Config, and Sitemap) with different
 * focusable elements in each.
 */
import { atom } from 'jotai'
import type { UrlListTab } from '../types.js'
import { activeSitemapDataAtom } from './sitemap.js'
import { flattenedConfigTreeAtom } from './config.js'

// ============================================================================
// Types
// ============================================================================

/**
 * Focusable elements within the UrlList panel.
 * - tabs: The tab bar (Recent URLs / Config / Sitemap)
 * - list: The recent URLs select list (Recent tab only)
 * - configTree: The config tree browser (Config tab only)
 * - input: The sitemap URL input field (Sitemap tab only)
 * - tree: The sitemap tree browser (Sitemap tab only, when data is loaded)
 */
export type UrlListFocusElement = 'tabs' | 'list' | 'configTree' | 'input' | 'tree'

// ============================================================================
// Atoms
// ============================================================================

/**
 * The currently active tab in the UrlList panel.
 */
export const urlListActiveTabAtom = atom<UrlListTab>('recent')

/**
 * The currently focused element within the UrlList panel.
 */
export const urlListFocusAtom = atom<UrlListFocusElement>('list')

/**
 * The sitemap input field value.
 */
export const urlListSitemapInputAtom = atom<string>('')

// ============================================================================
// Derived Atoms
// ============================================================================

/**
 * Whether the sitemap tree has data to display.
 */
export const urlListHasTreeDataAtom = atom((get) => {
  const sitemapData = get(activeSitemapDataAtom)
  return (
    sitemapData !== null &&
    sitemapData.type !== 'error' &&
    sitemapData.urls.length > 0
  )
})

/**
 * Whether the config tree has data to display.
 */
export const urlListHasConfigDataAtom = atom((get) => {
  const flattenedTree = get(flattenedConfigTreeAtom)
  return flattenedTree.length > 0
})

/**
 * Available focus elements for the current tab.
 * Recent tab: tabs, list
 * Config tab: tabs, configTree (if data loaded)
 * Sitemap tab: tabs, input, tree (if data loaded)
 */
export const urlListAvailableFocusElementsAtom = atom(
  (get): UrlListFocusElement[] => {
    const activeTab = get(urlListActiveTabAtom)
    const hasTreeData = get(urlListHasTreeDataAtom)
    const hasConfigData = get(urlListHasConfigDataAtom)

    if (activeTab === 'recent') {
      return ['tabs', 'list']
    } else if (activeTab === 'config') {
      return hasConfigData ? ['tabs', 'configTree'] : ['tabs']
    } else {
      return hasTreeData ? ['tabs', 'input', 'tree'] : ['tabs', 'input']
    }
  },
)

// ============================================================================
// Action Atoms
// ============================================================================

/**
 * Set the active tab and update focus to an appropriate element.
 */
export const setUrlListTabAtom = atom(null, (get, set, tab: UrlListTab) => {
  set(urlListActiveTabAtom, tab)

  if (tab === 'recent') {
    set(urlListFocusAtom, 'list')
  } else if (tab === 'config') {
    // Config tab - focus tree if data loaded, otherwise tabs
    const hasConfigData = get(urlListHasConfigDataAtom)
    set(urlListFocusAtom, hasConfigData ? 'configTree' : 'tabs')
  } else {
    // Sitemap tab - focus tree if data loaded, otherwise input
    const hasTreeData = get(urlListHasTreeDataAtom)
    set(urlListFocusAtom, hasTreeData ? 'tree' : 'input')
  }
})

/**
 * Navigate focus to the next element in the cycle.
 */
export const urlListFocusNextAtom = atom(null, (get, set) => {
  const current = get(urlListFocusAtom)
  const available = get(urlListAvailableFocusElementsAtom)
  const currentIndex = available.indexOf(current)
  const nextIndex = (currentIndex + 1) % available.length
  set(urlListFocusAtom, available[nextIndex])
})

/**
 * Navigate focus to the previous element in the cycle.
 */
export const urlListFocusPrevAtom = atom(null, (get, set) => {
  const current = get(urlListFocusAtom)
  const available = get(urlListAvailableFocusElementsAtom)
  const currentIndex = available.indexOf(current)
  const prevIndex = (currentIndex - 1 + available.length) % available.length
  set(urlListFocusAtom, available[prevIndex])
})

/**
 * Focus the tree if it has data (used after sitemap loads).
 */
export const urlListFocusTreeIfAvailableAtom = atom(null, (get, set) => {
  const activeTab = get(urlListActiveTabAtom)
  const hasTreeData = get(urlListHasTreeDataAtom)
  const currentFocus = get(urlListFocusAtom)

  if (activeTab === 'sitemap' && hasTreeData && currentFocus === 'input') {
    set(urlListFocusAtom, 'tree')
  }
})

/**
 * Reset the UrlList state when opening the panel.
 * @param options - Object with startOnSitemap and/or startOnConfig flags
 */
export const resetUrlListStateAtom = atom(
  null,
  (get, set, options: { startOnSitemap?: boolean; startOnConfig?: boolean }) => {
    const { startOnSitemap, startOnConfig } = options
    if (startOnConfig) {
      set(urlListActiveTabAtom, 'config')
      const hasConfigData = get(urlListHasConfigDataAtom)
      set(urlListFocusAtom, hasConfigData ? 'configTree' : 'tabs')
    } else if (startOnSitemap) {
      set(urlListActiveTabAtom, 'sitemap')
      set(urlListFocusAtom, 'input')
    } else {
      set(urlListActiveTabAtom, 'recent')
      set(urlListFocusAtom, 'list')
    }
  },
)

/**
 * Initialize the sitemap input with a default URL.
 */
export const initUrlListSitemapInputAtom = atom(
  null,
  (_get, set, url: string) => {
    set(urlListSitemapInputAtom, url)
  },
)
