/**
 * URL-related atoms for managing the current URL and recent URLs history.
 */
import { atom } from 'jotai'
import type { ViewState } from '../types.js'
import { viewIdsAtom, viewStateAtomFamily } from './views.js'

/** The current URL being analyzed */
export const urlAtom = atom('')

/** Recent URLs - will eventually be persisted */
export const recentUrlsAtom = atom([
  'https://example.com',
  'https://developer.mozilla.org',
  'https://github.com',
])

const initialViewState: ViewState = {
  status: 'idle',
  data: null,
  error: null,
  fetchedUrl: null,
  activeSubTab: null,
}

/** Write-only atom that sets URL and invalidates all views */
export const setUrlAtom = atom(null, (get, set, newUrl: string) => {
  set(urlAtom, newUrl)
  // Invalidate all views
  const viewIds = get(viewIdsAtom)
  for (const id of viewIds) {
    set(viewStateAtomFamily(id), initialViewState)
  }
})
