/**
 * Focus Scope Hooks
 *
 * React hooks for the focus scope system.
 */
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import {
  focusScopeStackAtom,
  activeScopeAtom,
  focusedRegionAtom,
  isAppScopeActiveAtom,
  pushScopeAtom,
  popScopeAtom,
  setFocusAtom,
  focusNextAtom,
  focusPreviousAtom,
  setFocusInScopeAtom,
} from './atoms.js'
import type { FocusScopeConfig } from './types.js'

/**
 * Hook for components that own a focus scope (dialogs).
 *
 * Automatically pushes the scope on mount and pops on unmount.
 * The previous scope's focus state is automatically restored when this scope pops.
 *
 * @example
 * ```tsx
 * function SitemapDialog() {
 *   useFocusScope({
 *     id: 'sitemap-dialog',
 *     regions: ['input', 'tree'],
 *     initialRegion: 'input',
 *   })
 *   // No cleanup needed - automatic
 * }
 * ```
 */
export function useFocusScope(config: FocusScopeConfig): void {
  const pushScope = useSetAtom(pushScopeAtom)
  const popScope = useSetAtom(popScopeAtom)

  useEffect(() => {
    pushScope(config)
    return () => {
      popScope()
    }
    // Config should be stable (defined outside component or memoized)
  }, [config.id, pushScope, popScope])
}

/**
 * Options for useFocusRegion hook.
 */
export interface UseFocusRegionOptions {
  /**
   * Scope ID this region belongs to.
   * Defaults to 'app' for app-level regions.
   */
  id?: string
  /** The region within the scope */
  region: string
}

/**
 * Hook for components that represent a focusable region.
 *
 * For app-level regions (url, menu, main), you can omit the id.
 * For dialog regions, you must specify the scope id.
 *
 * @example
 * ```tsx
 * // App-level region (id defaults to 'app')
 * function Menu() {
 *   const { isFocused, isInputActive, focus } = useFocusRegion({ region: 'menu' })
 * }
 *
 * // Dialog region (must specify scope id)
 * function SitemapInput() {
 *   const { isFocused, isInputActive } = useFocusRegion({
 *     id: 'sitemap-dialog',
 *     region: 'input',
 *   })
 * }
 * ```
 */
export function useFocusRegion(options: UseFocusRegionOptions): {
  /** Whether this region is focused in its scope */
  isFocused: boolean
  /** Whether this region should actively handle keyboard input */
  isInputActive: boolean
  /** Function to focus this region */
  focus: () => void
} {
  const { id = 'app', region } = options

  const stack = useAtomValue(focusScopeStackAtom)
  const activeScope = useAtomValue(activeScopeAtom)
  const setFocus = useSetAtom(setFocusAtom)
  const setFocusInScope = useSetAtom(setFocusInScopeAtom)

  // Find the scope this region belongs to
  const scope = stack.find((entry) => entry.config.id === id)

  // Is this region focused within its scope?
  const isFocused = scope?.focusedRegion === region

  // Is this scope the active scope AND is this region focused?
  // This determines if the region should handle keyboard input
  const isInputActive = activeScope.config.id === id && isFocused

  // Focus function - focuses this region
  // If it's in the active scope, use setFocusAtom
  // Otherwise, use setFocusInScopeAtom
  const focus = () => {
    if (activeScope.config.id === id) {
      setFocus(region)
    } else {
      setFocusInScope({ scopeId: id, region })
    }
  }

  return { isFocused, isInputActive, focus }
}

/**
 * Hook for Tab navigation within the current scope.
 *
 * @example
 * ```tsx
 * function App() {
 *   const { focusNext, focusPrevious, focusedRegion } = useFocusNavigation()
 *
 *   useKeyboard((event) => {
 *     if (event.name === 'tab') {
 *       if (event.shift) {
 *         focusPrevious()
 *       } else {
 *         focusNext()
 *       }
 *     }
 *   })
 * }
 * ```
 */
export function useFocusNavigation(): {
  /** Current focused region in the active scope */
  focusedRegion: string
  /** Focus the next region in tab order (wraps around) */
  focusNext: () => void
  /** Focus the previous region in tab order (wraps around) */
  focusPrevious: () => void
  /** Focus a specific region in the active scope */
  focus: (region: string) => void
} {
  const focusedRegion = useAtomValue(focusedRegionAtom)
  const focusNext = useSetAtom(focusNextAtom)
  const focusPrevious = useSetAtom(focusPreviousAtom)
  const setFocus = useSetAtom(setFocusAtom)

  return {
    focusedRegion,
    focusNext,
    focusPrevious,
    focus: setFocus,
  }
}

/**
 * Hook to check if the app scope is active.
 *
 * Useful for components that need to know if a dialog is open
 * without directly referencing dialog state.
 *
 * @example
 * ```tsx
 * function Menu() {
 *   const isAppActive = useIsAppScopeActive()
 *   // Don't handle keyboard when a dialog is open
 *   if (!isAppActive) return
 * }
 * ```
 */
export function useIsAppScopeActive(): boolean {
  return useAtomValue(isAppScopeActiveAtom)
}

