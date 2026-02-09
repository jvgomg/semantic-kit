/**
 * Atom-based view access.
 *
 * Provides atoms that combine static view definitions with dynamic view data.
 * Use these atoms to access views with their fetched data.
 */
import { atom } from 'jotai'
import { atomFamily } from 'jotai-family'
import { activeViewIdAtom } from '../state/atoms/menu.js'
import { viewDataAtomFamily, type ViewData } from '../state/view-data/index.js'
import { getViewDefinition } from './registry.js'
import type { ViewDefinition } from './types.js'

/**
 * A view with its fetched data.
 * Combines the static ViewDefinition with the dynamic ViewData.
 */
export interface View<T = unknown> extends ViewDefinition<T> {
  /** The fetched data state */
  data: ViewData<T>
}

/**
 * Atom family that provides a view with its data.
 *
 * @example
 * const view = useAtomValue(viewAtomFamily('ai-view'))
 * if (view?.data.status === 'success') {
 *   console.log(view.data.data) // The fetched data
 * }
 */
export const viewAtomFamily = atomFamily((viewId: string) =>
  atom((get): View | null => {
    const definition = getViewDefinition(viewId)
    if (!definition) return null

    const viewData = get(viewDataAtomFamily(viewId))
    return {
      ...definition,
      data: viewData,
    }
  }),
)

/**
 * Atom that provides the currently active view with its data.
 *
 * @example
 * const view = useAtomValue(activeViewAtom)
 * if (view?.data.status === 'success') {
 *   // Render view content
 * }
 */
export const activeViewAtom = atom((get): View | null => {
  const viewId = get(activeViewIdAtom)
  if (!viewId) return null
  return get(viewAtomFamily(viewId))
})
