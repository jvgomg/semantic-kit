/**
 * Core atoms for view UI state management.
 */
import { atom } from 'jotai'
import { atomFamily } from 'jotai-family'
import { activeViewIdAtom } from '../tool-navigation.js'
import { DEFAULT_VIEW_UI_STATE, type ViewUIState } from './types.js'

/**
 * Per-view UI state atom family.
 * Each view gets its own independent UI state.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const viewUIStateAtomFamily = atomFamily((_viewId: string) =>
  atom<ViewUIState>({ ...DEFAULT_VIEW_UI_STATE }),
)

/**
 * Derived atom that returns the current view's UI state.
 * Automatically tracks the active view from activeViewIdAtom.
 */
export const activeViewUIStateAtom = atom(
  (get) => {
    const viewId = get(activeViewIdAtom)
    if (!viewId) return DEFAULT_VIEW_UI_STATE
    return get(viewUIStateAtomFamily(viewId))
  },
  (get, set, update: ViewUIState | ((prev: ViewUIState) => ViewUIState)) => {
    const viewId = get(activeViewIdAtom)
    if (!viewId) return
    const viewAtom = viewUIStateAtomFamily(viewId)
    if (typeof update === 'function') {
      set(viewAtom, update(get(viewAtom)))
    } else {
      set(viewAtom, update)
    }
  },
)

/**
 * Derived atom for the active view's focus depth.
 */
export const activeFocusDepthAtom = atom((get) => {
  const state = get(activeViewUIStateAtom)
  return state.focusDepth
})

/**
 * Derived atom for the active view's selected index.
 */
export const activeSelectedIndexAtom = atom((get) => {
  const state = get(activeViewUIStateAtom)
  return state.selectedIndex
})
