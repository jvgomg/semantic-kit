/**
 * View state atoms for managing per-view data and loading states.
 */
import { atom } from 'jotai'
import { atomFamily } from 'jotai-family'
import type { ViewState } from '../types.js'

const initialViewState: ViewState = {
  status: 'idle',
  data: null,
  error: null,
  fetchedUrl: null,
  activeSubTab: null,
}

/** Atom family - creates one atom per viewId */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const viewStateAtomFamily = atomFamily((_viewId: string) =>
  atom<ViewState>(initialViewState),
)

/** Track which view IDs have been created (for invalidation) */
export const viewIdsAtom = atom<string[]>([])

/** Write-only atom to invalidate all views (reset to idle) */
export const invalidateAllViewsAtom = atom(null, (get, set) => {
  const viewIds = get(viewIdsAtom)
  for (const id of viewIds) {
    set(viewStateAtomFamily(id), initialViewState)
  }
})

/** Action to update a specific view's state */
export const setViewStateAtom = atom(
  null,
  (
    get,
    set,
    { viewId, state }: { viewId: string; state: Partial<ViewState> },
  ) => {
    const current = get(viewStateAtomFamily(viewId))
    set(viewStateAtomFamily(viewId), { ...current, ...state })

    // Track viewId if not already tracked
    const ids = get(viewIdsAtom)
    if (!ids.includes(viewId)) {
      set(viewIdsAtom, [...ids, viewId])
    }
  },
)

/** Action to set active sub-tab for a view */
export const setActiveSubTabAtom = atom(
  null,
  (get, set, { viewId, subTabId }: { viewId: string; subTabId: string }) => {
    const current = get(viewStateAtomFamily(viewId))
    set(viewStateAtomFamily(viewId), { ...current, activeSubTab: subTabId })
  },
)
