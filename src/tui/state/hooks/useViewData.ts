/**
 * Hook for lazy-loading view data.
 * Fetches data when view becomes active and cache is stale.
 */
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { getView } from '../../views/index.js'
import { urlAtom } from '../atoms/url.js'
import { viewStateAtomFamily, setViewStateAtom } from '../atoms/views.js'
import type { ViewState } from '../types.js'

export function useViewData(viewId: string): ViewState {
  const url = useAtomValue(urlAtom)
  const [viewState] = useAtom(viewStateAtomFamily(viewId))
  const setViewStateAction = useSetAtom(setViewStateAtom)

  useEffect(() => {
    // Don't fetch if no URL
    if (!url) return

    // Don't fetch if already fetched for this URL
    if (viewState.fetchedUrl === url && viewState.status !== 'idle') return

    const view = getView(viewId)
    if (!view) return

    const fetchData = async () => {
      setViewStateAction({
        viewId,
        state: { status: 'loading', error: null, fetchedUrl: url },
      })

      try {
        const result = await view.fetch(url)
        setViewStateAction({
          viewId,
          state: { status: 'success', data: result, error: null },
        })
      } catch (err) {
        setViewStateAction({
          viewId,
          state: {
            status: 'error',
            data: null,
            error: err instanceof Error ? err.message : 'Unknown error',
          },
        })
      }
    }

    fetchData()
  }, [viewId, url, viewState.fetchedUrl, viewState.status, setViewStateAction])

  return viewState
}
