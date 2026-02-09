/**
 * Central store factory for the TUI.
 *
 * Creates a Jotai store with all necessary effects subscribed.
 * This separates core app effects (like data fetching) from
 * optional features (like persistence).
 */
import { createStore as createJotaiStore } from 'jotai'
import { viewDataFetchEffect } from './view-data/index.js'

/**
 * Create the base app store with data fetching effect.
 *
 * This store handles:
 * - View data fetching when active view or URL changes
 *
 * For persistence, use createPersistedStore() which builds on this.
 */
export function createAppStore() {
  const store = createJotaiStore()

  // Subscribe to view data fetch effect - triggers data fetching
  // when the active view or URL changes
  store.sub(viewDataFetchEffect, () => {
    // No-op callback - the effect handles fetching internally
  })

  return store
}

export type AppStore = ReturnType<typeof createAppStore>
