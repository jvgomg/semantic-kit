/**
 * Focus state management for OpenTUI.
 *
 * Since OpenTUI doesn't provide Ink-style focus navigation (useFocus/useFocusManager),
 * we implement our own focus tracking using Jotai atoms.
 */
import { atom } from 'jotai'
import type { FocusRegion } from '../types.js'
import { isModalOpenAtom } from './modal.js'

/**
 * The currently focused region.
 * This is the single source of truth for which UI region has focus.
 */
export const focusedRegionAtom = atom<FocusRegion>('url')

/**
 * Whether focus is manually enabled.
 * Components can use disableFocus()/enableFocus() to control this.
 */
export const focusEnabledAtom = atom<boolean>(true)

/**
 * Effective focus enabled state.
 * Automatically disabled when any modal is open, respecting both
 * manual control (focusEnabledAtom) and modal state.
 */
export const effectiveFocusEnabledAtom = atom(
  (get) => get(focusEnabledAtom) && !get(isModalOpenAtom),
)

/**
 * Ordered list of focusable regions for Tab navigation.
 */
export const focusableRegions: readonly FocusRegion[] = ['url', 'menu', 'main']

/**
 * Write-only atom to focus a specific region.
 * Respects effectiveFocusEnabledAtom (won't focus if modal is open).
 */
export const setFocusAtom = atom(null, (get, set, region: FocusRegion) => {
  if (get(effectiveFocusEnabledAtom)) {
    set(focusedRegionAtom, region)
  }
})

/**
 * Write-only atom to focus the next region in the focusable list.
 * Respects effectiveFocusEnabledAtom (won't navigate if modal is open).
 */
export const focusNextAtom = atom(null, (get, set) => {
  if (!get(effectiveFocusEnabledAtom)) return

  const current = get(focusedRegionAtom)
  const currentIndex = focusableRegions.indexOf(current)
  const nextIndex = (currentIndex + 1) % focusableRegions.length
  set(focusedRegionAtom, focusableRegions[nextIndex])
})

/**
 * Write-only atom to focus the previous region in the focusable list.
 * Respects effectiveFocusEnabledAtom (won't navigate if modal is open).
 */
export const focusPreviousAtom = atom(null, (get, set) => {
  if (!get(effectiveFocusEnabledAtom)) return

  const current = get(focusedRegionAtom)
  const currentIndex = focusableRegions.indexOf(current)
  const prevIndex =
    (currentIndex - 1 + focusableRegions.length) % focusableRegions.length
  set(focusedRegionAtom, focusableRegions[prevIndex])
})
