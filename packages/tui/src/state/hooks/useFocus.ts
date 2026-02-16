/**
 * Focus hooks for OpenTUI.
 *
 * These provide similar functionality to Ink's useFocus and useFocusManager,
 * built on top of Jotai atoms.
 */
import { useAtomValue, useSetAtom } from 'jotai'
import {
  focusedRegionAtom,
  focusEnabledAtom,
  effectiveFocusEnabledAtom,
  setFocusAtom,
  focusNextAtom,
  focusPreviousAtom,
} from '../atoms/focus.js'
import type { FocusRegion } from '../types.js'

/**
 * Hook for components that can receive focus.
 * Returns the focus state for a specific region.
 *
 * @param region - The focus region this component represents
 */
export function useFocus(region: FocusRegion) {
  const focusedRegion = useAtomValue(focusedRegionAtom)
  const effectiveFocusEnabled = useAtomValue(effectiveFocusEnabledAtom)
  const setFocus = useSetAtom(setFocusAtom)

  const isFocused = focusedRegion === region

  return {
    /** Whether this region currently has focus */
    isFocused,
    /** Whether keyboard input should be active (focused and focus enabled) */
    isInputActive: isFocused && effectiveFocusEnabled,
    /** Function to programmatically focus this region */
    focus: () => setFocus(region),
  }
}

/**
 * Hook for managing focus programmatically.
 * Provides functions to navigate focus between regions.
 */
export function useFocusManager() {
  const setFocus = useSetAtom(setFocusAtom)
  const focusNext = useSetAtom(focusNextAtom)
  const focusPrevious = useSetAtom(focusPreviousAtom)
  const focusEnabled = useAtomValue(focusEnabledAtom)
  const setFocusEnabled = useSetAtom(focusEnabledAtom)

  return {
    /** Focus a specific region by ID */
    focus: (region: FocusRegion) => setFocus(region),
    /** Focus the next region in the tab order */
    focusNext,
    /** Focus the previous region in the tab order */
    focusPrevious,
    /** Disable focus navigation (e.g., when modal opens) */
    disableFocus: () => setFocusEnabled(false),
    /** Enable focus navigation */
    enableFocus: () => setFocusEnabled(true),
    /** Whether focus navigation is currently enabled */
    focusEnabled,
  }
}
