/**
 * Types for view data fetching state.
 */

export type ViewDataStatus = 'idle' | 'loading' | 'success' | 'error'

export interface ViewData<T = unknown> {
  status: ViewDataStatus
  data: T | null
  error: string | null
  /** URL that was fetched for this data */
  fetchedUrl: string | null
}
