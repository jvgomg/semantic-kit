/**
 * Jotai store initialization with pre-loaded persisted state.
 */
import { urlAtom, activeModalAtom } from '../atoms/index.js'
import { sectionsAtomFamily } from '../sections/atoms.js'
import { createAppStore } from '../store.js'
import { activeMenuIndexAtom } from '../tool-navigation.js'
import { persistStateEffect } from './effect.js'
import { loadPersistedState, createPersistedStateWriter } from './storage.js'
import type { PersistedState } from './types.js'

/**
 * Context for persistence - holds the writer function.
 * This is set during store creation and used by the persist effect.
 */
let persistWriter: ((state: PersistedState) => void) | null = null

/**
 * Get the persist writer function.
 * Returns null if persistence hasn't been initialized.
 */
export function getPersistWriter(): ((state: PersistedState) => void) | null {
  return persistWriter
}

/**
 * Create a Jotai store pre-populated with persisted state.
 *
 * @param initialUrl - The URL passed to startTui (used as storage key)
 * @returns Configured Jotai store
 */
export async function createPersistedStore(initialUrl: string | undefined) {
  // Load persisted state from disk
  const persisted = await loadPersistedState(initialUrl)

  // Create the throttled writer
  persistWriter = createPersistedStateWriter(initialUrl)

  // Create store with data fetching effect already subscribed
  const store = createAppStore()

  // Pre-populate with persisted values
  // Only restore URL if it was persisted (not empty) and matches session
  if (persisted.url) {
    store.set(urlAtom, persisted.url)
  }

  store.set(activeMenuIndexAtom, persisted.activeMenuIndex)

  if (persisted.activeModal) {
    store.set(activeModalAtom, persisted.activeModal)
  }

  // Restore per-view section state (only expanded overrides are persisted)
  for (const [viewId, viewState] of Object.entries(persisted.views)) {
    const sectionsAtom = sectionsAtomFamily(viewId)
    const currentState = store.get(sectionsAtom)
    store.set(sectionsAtom, {
      expanded: { ...currentState.expanded, ...viewState.expanded },
    })
  }

  // Subscribe to persist effect - this activates automatic persistence
  // The effect will run whenever any tracked atom changes
  store.sub(persistStateEffect, () => {
    // No-op callback - the effect handles persistence internally
  })

  return store
}

/**
 * Type for the store returned by createPersistedStore.
 */
export type PersistedStore = ReturnType<typeof createPersistedStore>
