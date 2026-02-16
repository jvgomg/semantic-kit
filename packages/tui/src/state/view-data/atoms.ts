/**
 * Atoms for view data fetching state.
 */
import { atom } from 'jotai'
import { atomFamily } from 'jotai-family'
import type { ViewData } from './types.js'

const initialViewData: ViewData = {
  status: 'idle',
  data: null,
  error: null,
  fetchedUrl: null,
}

/** Atom family - creates one atom per viewId to store fetched data */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const viewDataAtomFamily = atomFamily((_viewId: string) =>
  atom<ViewData>(initialViewData),
)

/** Track which view IDs have been created (for invalidation) */
export const viewDataIdsAtom = atom<string[]>([])

/** Write-only atom to invalidate all view data (reset to idle) */
export const invalidateAllViewDataAtom = atom(null, (get, set) => {
  const viewIds = get(viewDataIdsAtom)
  for (const id of viewIds) {
    set(viewDataAtomFamily(id), initialViewData)
  }
})

/** Action to update a specific view's data state */
export const setViewDataAtom = atom(
  null,
  (
    get,
    set,
    { viewId, data }: { viewId: string; data: Partial<ViewData> },
  ) => {
    const current = get(viewDataAtomFamily(viewId))
    set(viewDataAtomFamily(viewId), { ...current, ...data })

    // Track viewId if not already tracked
    const ids = get(viewDataIdsAtom)
    if (!ids.includes(viewId)) {
      set(viewDataIdsAtom, [...ids, viewId])
    }
  },
)
