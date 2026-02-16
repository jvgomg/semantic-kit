/**
 * Effect that fetches view data when the active view changes.
 */
import { atomEffect } from 'jotai-effect'
import { getViewDefinition } from '../../views/registry.js'
import { urlAtom } from '../atoms/url.js'
import { activeViewIdAtom } from '../tool-navigation.js'
import { setViewDataAtom, viewDataAtomFamily } from './atoms.js'

/**
 * Effect that fetches view data when the active view changes.
 *
 * This effect watches the active view and URL, triggering data fetches
 * when needed. It handles:
 * - Skipping fetch if data is already loaded for the current URL
 * - Setting loading state before fetch starts
 * - Updating state with success/error results
 * - Aborting in-flight fetches if dependencies change
 */
export const viewDataFetchEffect = atomEffect((get, set) => {
  const viewId = get(activeViewIdAtom)
  const url = get(urlAtom)

  // Don't fetch if missing dependencies
  if (!viewId || !url) return

  const viewData = get(viewDataAtomFamily(viewId))

  // Don't fetch if already fetched for this URL
  if (viewData.fetchedUrl === url && viewData.status !== 'idle') return

  const view = getViewDefinition(viewId)
  if (!view) return

  // Set up abort controller for cleanup
  const abortController = new AbortController()

  // Set loading state
  set(setViewDataAtom, {
    viewId,
    data: { status: 'loading', error: null, fetchedUrl: url },
  })

  // Perform async fetch
  view
    .fetch(url)
    .then((result) => {
      if (abortController.signal.aborted) return
      set(setViewDataAtom, {
        viewId,
        data: { status: 'success', data: result, error: null },
      })
    })
    .catch((err) => {
      if (abortController.signal.aborted) return
      set(setViewDataAtom, {
        viewId,
        data: {
          status: 'error',
          data: null,
          error: err instanceof Error ? err.message : 'Unknown error',
        },
      })
    })

  // Return cleanup function to abort in-flight requests
  return () => {
    abortController.abort()
  }
})
