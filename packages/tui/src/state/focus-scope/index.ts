/**
 * Focus Scope Module
 *
 * Stack-based focus management with automatic scope restoration.
 *
 * Key concepts:
 * - Focus Scope: A layer that owns a set of focusable regions (app, dialogs)
 * - Focus Region: A focusable area within a scope (url, menu, main, input, tree)
 * - Scope Stack: Dialogs push scopes; closing pops and restores previous focus
 *
 * @example
 * ```tsx
 * // App.tsx - uses the base app scope
 * function App() {
 *   const { focusNext, focusPrevious } = useFocusNavigation()
 *   // Tab navigates between url, menu, main
 * }
 *
 * // Menu.tsx - a region within the app scope
 * function Menu() {
 *   const { isFocused, isInputActive, focus } = useFocusRegion({ region: 'menu' })
 * }
 *
 * // SitemapDialog.tsx - owns its own scope
 * function SitemapDialog() {
 *   useFocusScope({
 *     id: 'sitemap-dialog',
 *     regions: ['input', 'tree'],
 *     initialRegion: 'input',
 *   })
 *
 *   const { isFocused: inputFocused } = useFocusRegion({
 *     id: 'sitemap-dialog',
 *     region: 'input',
 *   })
 * }
 * ```
 */

// Types
export type {
  FocusScopeConfig,
  FocusScopeEntry,
  AppFocusRegion,
} from './types.js'

export { APP_SCOPE } from './types.js'

// Atoms
export {
  // Core state
  focusScopeStackAtom,
  // Derived (read-only)
  activeScopeAtom,
  focusedRegionAtom,
  isAppScopeActiveAtom,
  getScopeByIdAtom,
  // Actions (write-only)
  pushScopeAtom,
  popScopeAtom,
  setFocusAtom,
  focusNextAtom,
  focusPreviousAtom,
  setFocusInScopeAtom,
} from './atoms.js'

// Hooks
export {
  useFocusScope,
  useFocusRegion,
  useFocusNavigation,
  useIsAppScopeActive,
  // Backward compatibility
  useFocus,
  useFocusManager,
} from './hooks.js'

export type { UseFocusRegionOptions } from './hooks.js'
