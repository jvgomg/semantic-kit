/**
 * React hooks for view UI state management.
 *
 * Provides convenient hooks for components to interact with view UI state.
 */
import { useAtomValue, useSetAtom } from 'jotai'
import {
  decreaseFocusDepthAtom,
  increaseFocusDepthAtom,
  navigateSelectionAtom,
  setFocusDepthAtom,
  setSelectedIndexAtom,
} from './actions.js'
import {
  activeFocusDepthAtom,
  activeSelectedIndexAtom,
  activeViewUIStateAtom,
} from './atoms.js'

/**
 * Hook for view UI state - manages selection and focus depth.
 * Use this for building views that need generic selection/focus behavior.
 */
export function useViewUI() {
  // State - use derived atoms for granular subscriptions
  const state = useAtomValue(activeViewUIStateAtom)
  const focusDepth = useAtomValue(activeFocusDepthAtom)
  const selectedIndex = useAtomValue(activeSelectedIndexAtom)

  // Actions - useSetAtom returns stable functions
  const navigateSelection = useSetAtom(navigateSelectionAtom)
  const setSelectedIndex = useSetAtom(setSelectedIndexAtom)
  const increaseFocusDepth = useSetAtom(increaseFocusDepthAtom)
  const decreaseFocusDepth = useSetAtom(decreaseFocusDepthAtom)
  const setFocusDepth = useSetAtom(setFocusDepthAtom)

  return {
    // State
    focusDepth,
    selectedIndex,

    // Full state object (for cases where you need everything)
    state,

    // Actions
    navigateSelection,
    setSelectedIndex,
    increaseFocusDepth,
    decreaseFocusDepth,
    setFocusDepth,
  }
}
