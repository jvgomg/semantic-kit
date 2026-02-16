/**
 * TUI State Persistence
 *
 * Provides file-based persistence for TUI state with throttled writes.
 * State is keyed by the initial URL passed to startTui.
 *
 * ## Usage
 *
 * In startTui (before mounting):
 * ```ts
 * const store = createPersistedStore(initialUrl)
 * // Pass store to Provider - persistence is automatically activated
 * ```
 *
 * That's it! The atomEffect handles persistence automatically.
 *
 * ## Adding New Persisted State
 *
 * 1. Add field to PersistedState in types.ts
 * 2. Add default value to DEFAULT_PERSISTED_STATE
 * 3. Add restoration logic in store.ts createPersistedStore()
 * 4. Add tracking in effect.ts persistStateEffect (get the atom)
 */

export type { PersistedState, PersistedViewState } from './types.js'
export { PERSISTED_STATE_VERSION, DEFAULT_PERSISTED_STATE } from './types.js'

export { loadPersistedState, flushPersistedState } from './storage.js'

export {
  createPersistedStore,
  type PersistedStore,
  type CreatePersistedStoreOptions,
} from './store.js'

export { persistStateEffect } from './effect.js'
