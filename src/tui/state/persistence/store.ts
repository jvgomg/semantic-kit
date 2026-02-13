/**
 * Jotai store initialization with pre-loaded persisted state.
 */
import {
  urlAtom,
  activeModalAtom,
  configStateAtom,
  configExpandedGroupsAtom,
  configSelectedIndexAtom,
  urlListActiveTabAtom,
} from '../atoms/index.js'
import { sectionsAtomFamily } from '../sections/atoms.js'
import { createAppStore } from '../store.js'
import { activeMenuIndexAtom } from '../tool-navigation.js'
import { persistStateEffect } from './effect.js'
import {
  loadPersistedState,
  createPersistedStateWriter,
  type StorageKeySource,
} from './storage.js'
import type { PersistedState } from './types.js'
import type { TuiConfig } from '../../../lib/tui-config/index.js'

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
 * Options for creating a persisted store.
 */
export interface CreatePersistedStoreOptions {
  /** Initial URL to analyze */
  initialUrl?: string
  /** Loaded config data (if --config was provided) */
  configData?: { path: string; config: TuiConfig }
}

/**
 * Create a Jotai store pre-populated with persisted state.
 *
 * @param options - Store creation options
 * @returns Configured Jotai store
 */
export async function createPersistedStore(options: CreatePersistedStoreOptions = {}) {
  const { initialUrl, configData } = options

  // Determine storage key source - config takes precedence
  const keySource: StorageKeySource = configData
    ? { type: 'config', value: configData.path }
    : { type: 'url', value: initialUrl }

  // Load persisted state from disk
  const persisted = await loadPersistedState(keySource)

  // Create the throttled writer
  persistWriter = createPersistedStateWriter(keySource)

  // Create store with data fetching effect already subscribed
  const store = createAppStore()

  // Initialize config state if config was provided
  if (configData) {
    store.set(configStateAtom, configData)
  }

  // Pre-populate with persisted values
  // Only restore URL if it was persisted (not empty) and matches session
  if (persisted.url) {
    store.set(urlAtom, persisted.url)
  }

  store.set(activeMenuIndexAtom, persisted.activeMenuIndex)

  if (persisted.activeModal) {
    store.set(activeModalAtom, persisted.activeModal)
  }

  // Restore URL list tab state
  if (persisted.urlListActiveTab) {
    store.set(urlListActiveTabAtom, persisted.urlListActiveTab)
  }

  // Restore config browser state
  if (persisted.configExpandedGroups) {
    store.set(configExpandedGroupsAtom, new Set(persisted.configExpandedGroups))
  }
  if (typeof persisted.configSelectedIndex === 'number') {
    store.set(configSelectedIndexAtom, persisted.configSelectedIndex)
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
