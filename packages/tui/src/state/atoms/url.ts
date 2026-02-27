/**
 * URL-related atoms for managing the current URL and recent URLs history.
 */
import { atom } from 'jotai'
import {
  viewDataAtomFamily,
  viewDataIdsAtom,
  type ViewData,
} from '../view-data/index.js'

/** Maximum number of recent URLs to keep */
const MAX_RECENT_URLS = 20

/** The current URL being analyzed */
export const urlAtom = atom('')

/** Recent URLs - persisted to disk */
export const recentUrlsAtom = atom<string[]>([])

/**
 * Write-only atom that adds a URL to the recent URLs list.
 * Deduplicates and prepends to the list, maintaining max size.
 */
export const addRecentUrlAtom = atom(null, (get, set, newUrl: string) => {
  if (!newUrl.trim()) return

  const current = get(recentUrlsAtom)
  // Remove the URL if it already exists (to move it to the front)
  const filtered = current.filter((u) => u !== newUrl)
  // Prepend the new URL and limit to max size
  const updated = [newUrl, ...filtered].slice(0, MAX_RECENT_URLS)
  set(recentUrlsAtom, updated)
})

const initialViewData: ViewData = {
  status: 'idle',
  data: null,
  error: null,
  fetchedUrl: null,
}

/**
 * Write-only atom that sets URL, adds to recent list, and invalidates all views.
 */
export const setUrlAtom = atom(null, (get, set, newUrl: string) => {
  set(urlAtom, newUrl)
  // Add to recent URLs list
  set(addRecentUrlAtom, newUrl)
  // Invalidate all views - section state (expanded, selection) is preserved
  const viewIds = get(viewDataIdsAtom)
  for (const id of viewIds) {
    set(viewDataAtomFamily(id), initialViewData)
  }
})
