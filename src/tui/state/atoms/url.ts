/**
 * URL-related atoms for managing the current URL and recent URLs history.
 */
import { atom } from 'jotai'
import { viewDataAtomFamily, viewDataIdsAtom, type ViewData } from '../view-data/index.js'

/** The current URL being analyzed */
export const urlAtom = atom('')

/** Recent URLs - will eventually be persisted */
export const recentUrlsAtom = atom([
  'https://example.com',
  'https://developer.mozilla.org',
  'https://github.com',
])

const initialViewData: ViewData = {
  status: 'idle',
  data: null,
  error: null,
  fetchedUrl: null,
}

/** Write-only atom that sets URL and invalidates all views */
export const setUrlAtom = atom(null, (get, set, newUrl: string) => {
  set(urlAtom, newUrl)
  // Invalidate all views - section state (expanded, selection) is preserved
  const viewIds = get(viewDataIdsAtom)
  for (const id of viewIds) {
    set(viewDataAtomFamily(id), initialViewData)
  }
})
