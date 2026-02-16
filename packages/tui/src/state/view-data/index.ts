/**
 * View data fetching module.
 *
 * Manages the state of fetched data for each view.
 */
export type { ViewData, ViewDataStatus } from './types.js'

export {
  viewDataAtomFamily,
  viewDataIdsAtom,
  invalidateAllViewDataAtom,
  setViewDataAtom,
} from './atoms.js'

export { viewDataFetchEffect } from './effect.js'
