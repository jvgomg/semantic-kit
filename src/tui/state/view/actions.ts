/**
 * Write-only action atoms for view UI state management.
 *
 * All actions automatically use the active view from activeViewIdAtom,
 * so callers don't need to pass viewId.
 */
import { atom } from 'jotai'
import { activeViewIdAtom } from '../atoms/menu.js'
import { viewUIStateAtomFamily } from './atoms.js'

// ============================================================================
// Navigation Actions
// ============================================================================

/**
 * Navigate selection by delta.
 * Wraps around at boundaries.
 */
export const navigateSelectionAtom = atom(
  null,
  (get, set, payload: { delta: number; itemCount: number }) => {
    const viewId = get(activeViewIdAtom)
    if (!viewId) return

    const { delta, itemCount } = payload
    if (itemCount === 0) return

    const viewAtom = viewUIStateAtomFamily(viewId)
    const current = get(viewAtom)

    // Calculate new index with wrapping
    let newIndex = current.selectedIndex + delta
    if (newIndex < 0) {
      newIndex = itemCount - 1
    } else if (newIndex >= itemCount) {
      newIndex = 0
    }

    set(viewAtom, {
      ...current,
      selectedIndex: newIndex,
    })
  },
)

/**
 * Set selected index directly.
 */
export const setSelectedIndexAtom = atom(null, (get, set, index: number) => {
  const viewId = get(activeViewIdAtom)
  if (!viewId) return

  const viewAtom = viewUIStateAtomFamily(viewId)
  const current = get(viewAtom)

  set(viewAtom, {
    ...current,
    selectedIndex: index,
  })
})

// ============================================================================
// Focus Depth Actions
// ============================================================================

/**
 * Increase focus depth (go deeper into content).
 */
export const increaseFocusDepthAtom = atom(null, (get, set) => {
  const viewId = get(activeViewIdAtom)
  if (!viewId) return

  const viewAtom = viewUIStateAtomFamily(viewId)
  const current = get(viewAtom)

  set(viewAtom, {
    ...current,
    focusDepth: current.focusDepth + 1,
  })
})

/**
 * Decrease focus depth (go back up to higher level).
 * Won't go below 0.
 */
export const decreaseFocusDepthAtom = atom(null, (get, set) => {
  const viewId = get(activeViewIdAtom)
  if (!viewId) return

  const viewAtom = viewUIStateAtomFamily(viewId)
  const current = get(viewAtom)

  if (current.focusDepth > 0) {
    set(viewAtom, {
      ...current,
      focusDepth: current.focusDepth - 1,
    })
  }
})

/**
 * Set focus depth directly.
 */
export const setFocusDepthAtom = atom(null, (get, set, depth: number) => {
  const viewId = get(activeViewIdAtom)
  if (!viewId) return

  const viewAtom = viewUIStateAtomFamily(viewId)
  const current = get(viewAtom)

  set(viewAtom, {
    ...current,
    focusDepth: Math.max(0, depth),
  })
})
